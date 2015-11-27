package main

import (
	"database/sql"
	"fmt"
	"github.com/labstack/echo"
	"github.com/thoas/stats"
	//	"gopkg.in/mgutz/dat.v1"
	"log"
	"net/http"
	"strconv"
	"strings"
)

var server_stats = stats.New()

/////////////////////////////////////////////////////////////////////////////////////////////////
// Define Routes for the Server

func _initRoutes() {
	e.Use(server_stats.Handler)

	e.Get("/stats", func(c *echo.Context) error {
		return c.JSON(http.StatusOK, server_stats.Data())
	})

	e.Post("/login", login)
	e.Get("/logout", logout)

	e.Post("/syslog", querySyslog)

	e.Get("/users", queryUsers)
	e.Get("/users/:id", getUser)
	e.Post("/users", newUser)
	e.Put("/users/:id", saveUser)
	e.Delete("/users/:id", deleteUser)

	e.Get("/sites", querySites)
	e.Get("/sites/:id", getSite)
	e.Post("/sites", newSite)
	e.Put("/sites/:id", saveSite)
	e.Delete("/sites/:id", deleteSite)

}

/////////////////////////////////////////////////////////////////////////////////////////////////
// Helper Functions

type NullString struct {
	sql.NullString
}

func (s *NullString) UnmarshalJSON(data []byte) error {
	s.String = strings.Trim(string(data), `"`)
	s.Valid = true
	return nil
}

func getID(c *echo.Context) int {
	id := c.Param("id")
	i, err := strconv.Atoi(id)
	if err != nil {
		// Invalid number
		return 0
	}
	return i
}

/////////////////////////////////////////////////////////////////////////////////////////////////
// System Log

type DBsyslog struct {
	ID       int    `db:"id"`
	Status   int    `db:"status"`
	Type     string `db:"type"`
	RefType  string `db:"ref_type"`
	RefID    int    `db:"ref_id"`
	Logdate  string `db:"logdate"`
	IP       string `db:"ip"`
	Descr    string `db:"descr"`
	UserID   int    `db:"user_id"`
	Username string `db:"username"`
}

type SysLogRequest struct {
	RefType string
	RefID   string
	UserID  string
	Limit   uint64
}

func sysLog(status int, t string, reftype string, ref int, descr string, c *echo.Context, claim map[string]interface{}) {

	req := c.Request()
	ip := req.RemoteAddr
	UserID := 0
	Username := ""
	if claim != nil {
		UserID, Username = getClaimedUser(claim)
	}
	log.Println("syslog", UserID, Username)

	l := &DBsyslog{
		Status:   status,
		Type:     t,
		RefType:  reftype,
		RefID:    ref,
		Descr:    descr,
		IP:       ip,
		UserID:   UserID,
		Username: Username,
	}
	DB.InsertInto("sys_log").
		Whitelist("status", "type", "ref_type", "ref_id", "ip", "descr", "user_id", "username").
		Record(l).
		Exec()
}

func querySyslog(c *echo.Context) error {

	_, err := securityCheck(c, "log")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	req := &SysLogRequest{}
	if err := c.Bind(req); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}
	log.Println("Syslog request", req)

	if req.Limit < 20 {
		req.Limit = 20
	}
	if req.Limit > 100 {
		req.Limit = 100
	}

	query := DB.Select("status",
		"type", "ref_type", "ref_id",
		"ip", "descr",
		"user_id", "username",
		"to_char(l.logdate,'Dy DD-Mon-YY HH24:MI:SS') as logdate").
		From("sys_log l").
		OrderBy("l.logdate desc").
		Limit(req.Limit)

	// Add extra options to the SQL query
	if req.RefType != "" {
		query.Where("ref_type = $1", req.RefType)
	}

	if req.RefID != "" {
		query.Where("ref_id = $1", req.RefID)
	}

	if req.UserID != "" {
		// Grab any log records created by this specific user
		query.Where("user_id = $1", req.UserID)
		// And any log records of type U related to this specific user
		query.Where("ref_type = 'U' and ref_id=$1", req.UserID)
	}

	var record []*DBsyslog
	err = query.QueryStructs(&record)

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, record)
}

/////////////////////////////////////////////////////////////////////////////////////////////////
// Login / Logout

type loginCreds struct {
	Username string `db:"username"`
	Passwd   string `db:"passwd"`
}

type loginResponse struct {
	ID       int        `db:"id"`
	Username string     `db:"username"`
	Name     string     `db:"name"`
	Role     string     `db:"role"`
	Site_ID  int        `db:"site_id"`
	SiteName NullString `db:"sitename"`
	Token    string     `db:"token"`
}

func login(c *echo.Context) error {
	l := new(loginCreds)
	err := c.Bind(&l)
	if err != nil {
		log.Println("BAD_REQUEST:", err.Error())
	}

	var res loginResponse
	err = DB.
		Select("u.id,u.username,u.name,u.role,u.site_id,s.name as sitename").
		From(`
			users u
			left join site s on (s.id = u.site_id)
		`).
		Where("u.username = $1 and passwd = $2", l.Username, l.Passwd).
		QueryStruct(&res)

	if err != nil {
		log.Println("Login Failed:", err.Error())
		sysLog(3, "Login", "U", res.ID, fmt.Sprintf("Failed Login (%s:%s)", l.Username, l.Passwd), c, nil)
		return c.String(http.StatusUnauthorized, "invalid")
	} else {
		claim := map[string]interface{}{
			"ID":       float64(res.ID),
			"Username": res.Username,
		}
		sysLog(0, "Login", "U", res.ID, "Login OK", c, claim)
		//		log.Println(res)

		tokenString, err := generateToken(res.ID, res.Role, l.Username)
		if err != nil {
			log.Println(`Generating Token`, err.Error())
			return c.String(http.StatusInternalServerError, err.Error())
		}

		res.Token = tokenString
		return c.JSON(http.StatusOK, res)
	}
}

func logout(c *echo.Context) error {

	claim, err := securityCheck(c, "*")
	if err != nil {
		return c.String(http.StatusUnauthorized, "bye")
	}

	UserID, Username := getClaimedUser(claim)
	log.Println("Logout:", UserID, Username)
	sysLog(0, "Logout", "U", UserID, "Logout", c, claim)
	return c.String(http.StatusOK, "bye")
}

/////////////////////////////////////////////////////////////////////////////////////////////////
// User Functions

/*
	e.Get("/users", queryUsers)
	e.Get("/users/:id", getUser)
	e.Post("/users/:id", newUser)
	e.Patch("/users/:id", saveUser)
	e.Delete("/users/:id", deleteUser)
*/

type DBusers struct {
	ID       int       `db:"id",json:"number"`
	Username string    `db:"username"`
	Passwd   string    `db:"passwd"`
	Name     string    `db:"name"`
	Email    string    `db:"email"`
	Address  string    `db:"address"`
	SMS      string    `db:"sms"`
	SiteId   int       `db:"site_id"`
	Role     string    `db:"role"`
	Sites    []*DBsite `db:"sites"`
}

type DBuserlog struct {
	Type     string  `db:"type"`
	RefID    int     `db:"ref_id"`
	Username *string `db:"username"`
	Logdate  string  `db:"logdate"`
	IP       string  `db:"ip"`
	Descr    *string `db:"descr"`
}

type DBuserSite struct {
	UserID int    `db:"user_id"`
	SiteID int    `db:"site_id"`
	Role   string `db:"role"`
}

func queryUsers(c *echo.Context) error {

	_, err := securityCheck(c, "readUser")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	var users []*DBusers
	//		SQL(`select *,array(select concat(logdate,ip,descr) from user_log where user_id=users.id order by logdate desc) as logs from users`).

	err = DB.SQL(`select * from users order by lower(username)`).QueryStructs(&users)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, users)
}

func getUser(c *echo.Context) error {

	_, err := securityCheck(c, "readUser")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)
	var user DBusers
	err = DB.SQL(`select * from users where id=$1`, id).QueryStruct(&user)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, user)
}

func newUser(c *echo.Context) error {

	claim, err := securityCheck(c, "writeUser")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	record := &DBusers{}
	if err := c.Bind(record); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	err = DB.InsertInto("users").
		Whitelist("username", "passwd", "address", "name", "email", "role", "sms").
		Record(record).
		Returning("id").
		QueryScalar(&record.ID)

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	// Now log the creation of the new user
	sysLog(1, "Users", "U", record.ID, fmt.Sprintf("Account Created - %s", record.Username), c, claim)

	// insert into DB, fill in the ID of the new user
	return c.JSON(http.StatusCreated, newUser)
}

func saveUser(c *echo.Context) error {

	claim, err := securityCheck(c, "writeUser")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	record := &DBusers{}
	if err = c.Bind(record); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	userID := getID(c)

	// Get the first site from the list of sites added
	if len(record.Sites) > 0 {
		record.SiteId = record.Sites[0].ID
	} else {
		record.SiteId = 0
	}

	_, err = DB.Update("users").
		SetWhitelist(record, "username", "name", "passwd", "email", "address", "sms", "role", "site_id").
		Where("id = $1", userID).
		Exec()

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	// Now create the user_site records
	DB.DeleteFrom("user_site").
		Where("user_id=$1", userID).
		Exec()

	log.Println("Sites = ", record.Sites)
	for _, addSite := range record.Sites {
		log.Println("Attach user", userID, "to site", addSite.ID, "name", addSite.Name)

		userSite := &DBuserSite{
			UserID: userID,
			SiteID: addSite.ID,
			Role:   record.Role,
		}
		DB.InsertInto("user_site").
			Whitelist("user_id", "site_id", "role").
			Record(userSite).
			Exec()
	}

	sysLog(1, "Users", "U", userID, "User Updated", c, claim)
	return c.JSON(http.StatusOK, record)
}

func deleteUser(c *echo.Context) error {
	//var user DBusers
	//id := getID(c)

	return c.String(http.StatusOK, `TODO - delete the user`)
}

///////////////////////////////////////////////////////////////////////
// Sites Maintenance
/*
create table site (
	id serial not null primary key,
	name text not null default '',
	address text not null default '',
	phone text not null default '',
	fax text not null,
	image text not null
);
*/

type DBsite struct {
	ID      int    `db:"id"`
	Name    string `db:"name"`
	Address string `db:"address"`
	Phone   string `db:"phone"`
	Fax     string `db:"fax"`
	Image   string `db:"image"`
}

func querySites(c *echo.Context) error {

	_, err := securityCheck(c, "readSite")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	var record []*DBsite
	err = DB.SQL(`select * from site order by lower(name)`).QueryStructs(&record)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, record)
}

func getSite(c *echo.Context) error {

	_, err := securityCheck(c, "readSite")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)
	var record DBsite
	err = DB.SQL(`select * from site where id=$1`, id).QueryStruct(&record)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, record)
}

func newSite(c *echo.Context) error {

	claim, err := securityCheck(c, "writeSite")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	record := &DBsite{}
	if err := c.Bind(record); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}
	log.Println("Received site", record)

	err = DB.InsertInto("site").
		Whitelist("name", "address", "phone", "fax").
		Record(record).
		Returning("id").
		QueryScalar(&record.ID)

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	// Now log the creation of the new site
	sysLog(1, "Sites", "S", record.ID, "Site Created", c, claim)

	// insert into DB, fill in the ID of the new user
	return c.JSON(http.StatusCreated, record)
}

func saveSite(c *echo.Context) error {

	claim, err := securityCheck(c, "writeSite")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	record := &DBsite{}
	if err = c.Bind(record); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	siteID := getID(c)

	_, err = DB.Update("site").
		SetWhitelist(record, "name", "address", "phone", "fax", "image").
		Where("id = $1", siteID).
		Exec()

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	sysLog(1, "Sites", "S", siteID, "Updated", c, claim)
	return c.JSON(http.StatusOK, siteID)
}

func deleteSite(c *echo.Context) error {

	return c.String(http.StatusOK, "TODO delete site")
}

func querySitelog(c *echo.Context) error {

	_, err := securityCheck(c, "readSite")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)
	var record []*DBuserlog
	err = DB.SQL(`
		select type,ref_id,to_char(logdate,'Dy DD-Mon-YY HH24:MI:SS') as logdate,ip,descr,username
		from sys_log l
		where ref=$1 and ref_type='S' 
		order by l.logdate desc
		limit 20`, id).
		QueryStructs(&record)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, record)
}

func querySitelogs(c *echo.Context) error {

	_, err := securityCheck(c, "readSite")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	var record []*DBuserlog
	err = DB.SQL(`
		select type,ref_id,to_char(logdate,'Dy DD-Mon-YY HH24:MI:SS') as logdate,ip,descr,username
		from sys_log l 
		where ref_type='S' 
		order by l.logdate desc
		limit 50`).
		QueryStructs(&record)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, record)
}
