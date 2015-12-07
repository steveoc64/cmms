package main

import (
	"database/sql"
	"fmt"
	"github.com/labstack/echo"
	"github.com/thoas/stats"
	"gopkg.in/mgutz/dat.v1"
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
	e.Get("/users_skill/:id", queryUsersWithSkill)
	e.Get("/users/:id", getUser)
	e.Post("/users", newUser)
	e.Put("/users/:id", saveUser)
	e.Delete("/users/:id", deleteUser)

	e.Get("/sites", querySites)
	e.Get("/sites/:id", getSite)
	e.Get("/siteusers/:id", querySiteUsers)
	e.Post("/sites", newSite)
	e.Put("/sites/:id", saveSite)
	e.Delete("/sites/:id", deleteSite)

	e.Get("/skills", querySkills)
	e.Get("/skills/:id", getSkill)
	e.Post("/skills", newSkill)
	e.Put("/skills/:id", saveSkill)
	e.Delete("/skills/:id", deleteSkill)

	e.Get("/parts", queryParts)
	e.Get("/partcomponents/:id", queryPartComponents)
	e.Get("/componentparts/:id", queryComponentParts)
	e.Get("/parts/:id", getPart)
	e.Post("/parts", newPart)
	e.Put("/parts/:id", savePart)
	e.Delete("/parts/:id", deletePart)

	e.Get("/machine", queryMachine)
	e.Get("/sitemachines/:id", querySiteMachines)
	e.Get("/machine/:id", getMachine)
	e.Post("/machine", newMachine)
	e.Put("/machine/:id", saveMachine)
	e.Delete("/machine/:id", deleteMachine)
	e.Get("/machine/components/:id", queryMachineComponents)

	e.Get("/component", queryComponents)
	e.Get("/component/:id", getComponent)
	e.Post("/component", newComponent)
	e.Put("/component/:id", saveComponent)
	e.Delete("/component/:id", deleteComponent)

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
	ip := req.Header.Get("X-Real-Ip")
	if len(ip) < 1 {
		ip = req.RemoteAddr
	}

	Username := ""
	UserID := 0
	if claim != nil {
		UserID, Username = getClaimedUser(claim)
	}

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

	_, err := DB.InsertInto("sys_log").
		Whitelist("status", "type", "ref_type", "ref_id", "ip", "descr", "user_id", "username").
		Record(l).
		Exec()

	if err != nil {
		log.Println("SysLog error", err.Error())
	}
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
	if req.UserID != "" {

		// Grab any log records created by this specific user
		// And any log records of type U related to this specific user
		query.Where("user_id = $1 or (ref_type = 'U' and ref_id=$1)", req.UserID, req.UserID)

	} else {
		if req.RefType != "" {
			query.Where("ref_type = $1", req.RefType)
		}

		if req.RefID != "" {
			query.Where("ref_id = $1", req.RefID)
		}
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
		From(`users u
			left join site s on (s.id = u.site_id)`).
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

		tokenString, err := generateToken(res.ID, res.Role, l.Username)
		if err != nil {
			return c.String(http.StatusInternalServerError, err.Error())
		}

		res.Token = tokenString
		log.Println("New Login:", l.Username)
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
	ID       int        `db:"id",json:"number"`
	Username string     `db:"username"`
	Passwd   string     `db:"passwd"`
	Name     string     `db:"name"`
	Email    string     `db:"email"`
	Address  string     `db:"address"`
	SMS      string     `db:"sms"`
	SiteId   int        `db:"site_id"`
	SiteName *string    `db."sitename"`
	Role     string     `db:"role"`
	Sites    []*DBsite  `db:"sites"`
	Skills   []*DBskill `db:"skills"`
	Notes    string     `db:"notes"`
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

type DBuserSkill struct {
	UserID  int `db:"user_id"`
	SkillID int `db:"skill_id"`
}

func queryUsers(c *echo.Context) error {

	_, err := securityCheck(c, "readUser")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	var users []*DBusers
	//		SQL(`select *,array(select concat(logdate,ip,descr) from user_log where user_id=users.id order by logdate desc) as logs from users`).

	err = DB.SQL(`select 
		users.*,site.name as sitename
		from users 
		left join site on site.id=users.site_id
		order by lower(username)`).
		QueryStructs(&users)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, users)
}

func queryUsersWithSkill(c *echo.Context) error {

	_, err := securityCheck(c, "readUser")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	var users []*DBusers
	//		SQL(`select *,array(select concat(logdate,ip,descr) from user_log where user_id=users.id order by logdate desc) as logs from users`).

	skillID := getID(c)
	err = DB.SQL(`select 
		u.*,t.name as sitename from user_skill s
		left join users u on u.id = s.user_id
		left join site t on t.id = u.site_id
		where s.skill_id=$1
		order by lower(username)`, skillID).
		QueryStructs(&users)

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

	// Fill in the sites for the user
	DB.SQL(`select 
		s.* 
		from user_site u
		left join site s on s.id=u.site_id 
		where u.user_id=$1`, id).
		QueryStructs(&user.Sites)

	// Fill in the skills for the user
	DB.SQL(`select 
		s.* 
		from user_skill u
		left join skill s on s.id=u.skill_id 
		where u.user_id=$1`, id).
		QueryStructs(&user.Skills)

	// Fill in the site name
	DB.SQL(`select 
		name as sitename from site 
		where id=$1`, user.SiteId).
		QueryScalar(&user.SiteName)

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

	if len(record.Sites) > 0 {
		record.SiteId = record.Sites[0].ID
	} else {
		record.SiteId = 0
	}

	err = DB.InsertInto("users").
		Whitelist("username", "passwd", "address", "name", "email", "role", "sms", "site_id").
		Record(record).
		Returning("id").
		QueryScalar(&record.ID)

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	// Now create the user_site records
	for _, addSite := range record.Sites {
		userSite := &DBuserSite{
			UserID: record.ID,
			SiteID: addSite.ID,
			Role:   record.Role,
		}
		_, xe := DB.InsertInto("user_site").
			Whitelist("user_id", "site_id", "role").
			Record(userSite).
			Exec()
		if xe != nil {
			log.Println("ERROR inserting user_site", xe.Error())
		}
	}

	// Now create the user_skill recordsd
	for _, addSkill := range record.Skills {
		userSkill := &DBuserSkill{
			UserID:  record.ID,
			SkillID: addSkill.ID,
		}
		_, xe := DB.InsertInto("user_skill").Whitelist("user_id", "skill_id").Record(userSkill).Exec()
		if xe != nil {
			log.Println("ERROR inserting user_skill", xe.Error())
		}
	}

	// Now log the creation of the new user
	sysLog(1, "Users", "U", record.ID, fmt.Sprintf("Account Created - %s", record.Username), c, claim)

	// insert into DB, fill in the ID of the new user
	return c.JSON(http.StatusCreated, record)
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
		Set("username", record.Username).
		Set("name", record.Name).
		Set("passwd", record.Passwd).
		Set("email", record.Email).
		Set("address", record.Address).
		Set("sms", record.SMS).
		Set("role", record.Role).
		Set("site_id", record.SiteId).
		Set("notes", record.Notes).
		Where("id = $1", userID).
		Exec()

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	// Now create the user_site records
	DB.DeleteFrom("user_site").Where("user_id=$1", userID).Exec()

	for _, addSite := range record.Sites {
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

	// Now create the user_skill recordsd
	DB.DeleteFrom("user_skill").Where("user_id=$1", userID).Exec()
	for _, addSkill := range record.Skills {
		userSkill := &DBuserSkill{
			UserID:  userID,
			SkillID: addSkill.ID,
		}
		DB.InsertInto("user_skill").Whitelist("user_id", "skill_id").Record(userSkill).Exec()
	}

	sysLog(1, "Users", "U", userID, "User Updated", c, claim)
	return c.JSON(http.StatusOK, record)
}

func deleteUser(c *echo.Context) error {

	claim, err := securityCheck(c, "writeUser")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)
	_, err = DB.
		DeleteFrom("users").
		Where("id = $1", id).
		Exec()

	if err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	// Now delete the user_site and user_skill references
	DB.DeleteFrom("user_site").Where("user_id=$1", id).Exec()
	DB.DeleteFrom("user_skill").Where("user_id=$1", id).Exec()

	sysLog(3, "Users", "U", id, "User Deleted", c, claim)

	return c.String(http.StatusOK, "User Deleted")
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
	ID             int     `db:"id"`
	Name           string  `db:"name"`
	Address        string  `db:"address"`
	Phone          string  `db:"phone"`
	Fax            string  `db:"fax"`
	Image          string  `db:"image"`
	ParentSite     int     `db:"parent_site"`
	ParentSiteName *string `db:"parent_site_name"`
	StockSite      int     `db:"stock_site"`
	StockSiteName  *string `db:"stock_site_name"`
	Notes          string  `db:"notes"`
}

// Return a slice, that contains This SiteID, and all child SiteIDs that have this site as a parent
func getRelatedSites(siteID int) []int {

	var relatedSites []int
	DB.SQL(`select id from site where parent_site=$1`, siteID).QuerySlice(&relatedSites)
	relatedSites = append(relatedSites, siteID)
	return relatedSites
}

func querySites(c *echo.Context) error {

	_, err := securityCheck(c, "readSite")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	var record []*DBsite
	err = DB.SQL(`select s.*,p.name as parent_site_name,t.name as stock_site_name
		from site s
		left join site p on (p.id=s.parent_site)
		left join site t on (t.id=s.stock_site)
		order by lower(s.name)`).QueryStructs(&record)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, record)
}

func querySiteUsers(c *echo.Context) error {

	_, err := securityCheck(c, "readUser")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	var users []*DBusers
	//		SQL(`select *,array(select concat(logdate,ip,descr) from user_log where user_id=users.id order by logdate desc) as logs from users`).

	siteID := getID(c)
	err = DB.SQL(`select 
		u.* from user_site s
		left join users u on u.id = s.user_id
		where s.site_id=$1
		order by lower(username)`, siteID).
		QueryStructs(&users)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, users)
}

func getSite(c *echo.Context) error {

	_, err := securityCheck(c, "readSite")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)
	var record DBsite
	err = DB.SQL(`select s.*,p.name as parent_site_name,t.name as stock_site_name
		from site s 
		left join site p on (p.id=s.parent_site)
		left join site t on (t.id=s.stock_site)
		where s.id=$1`, id).QueryStruct(&record)

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

	err = DB.InsertInto("site").
		Whitelist("name", "address", "phone", "fax", "parent_site", "stock_site").
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
		SetWhitelist(record, "name", "address", "phone", "fax", "image", "parent_site", "stock_site", "notes").
		Where("id = $1", siteID).
		Exec()

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	sysLog(1, "Sites", "S", siteID, "Updated", c, claim)
	return c.JSON(http.StatusOK, siteID)
}

func deleteSite(c *echo.Context) error {

	claim, err := securityCheck(c, "writeSite")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)
	_, err = DB.
		DeleteFrom("site").
		Where("id = $1", id).
		Exec()

	if err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	// Now delete the user_site references
	DB.DeleteFrom("user_site").Where("site_id=$1", id).Exec()

	sysLog(3, "Sites", "S", id, "Site Deleted", c, claim)

	return c.String(http.StatusOK, "Site Deleted")
}

///////////////////////////////////////////////////////////////////////
// Skills Maintenance
/*
create table skill (
	id serial not null primary key,
	name text not null
);

*/

type DBskill struct {
	ID    int    `db:"id"`
	Name  string `db:"name"`
	Notes string `db:"notes"`
}

func querySkills(c *echo.Context) error {

	_, err := securityCheck(c, "readSkill")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	var record []*DBskill
	err = DB.SQL(`select * from skill order by lower(name)`).QueryStructs(&record)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, record)
}

func getSkill(c *echo.Context) error {

	_, err := securityCheck(c, "readSkill")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)
	var record DBskill
	err = DB.SQL(`select * from skill where id=$1`, id).QueryStruct(&record)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, record)
}

func newSkill(c *echo.Context) error {

	claim, err := securityCheck(c, "writeSkill")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	record := &DBskill{}
	if err := c.Bind(record); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	err = DB.InsertInto("skill").
		Whitelist("name").
		Record(record).
		Returning("id").
		QueryScalar(&record.ID)

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	// Now log the creation of the new site
	sysLog(1, "Skills", "s", record.ID, "Skill Created", c, claim)

	// insert into DB, fill in the ID of the new user
	return c.JSON(http.StatusCreated, record)
}

func saveSkill(c *echo.Context) error {

	claim, err := securityCheck(c, "writeSkill")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	record := &DBskill{}
	if err = c.Bind(record); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	skillID := getID(c)

	_, err = DB.Update("skill").
		SetWhitelist(record, "name", "notes").
		Where("id = $1", skillID).
		Exec()

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	sysLog(1, "Skills", "s", skillID, "Updated", c, claim)
	return c.JSON(http.StatusOK, skillID)
}

func deleteSkill(c *echo.Context) error {

	claim, err := securityCheck(c, "writeSkill")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)
	_, err = DB.
		DeleteFrom("skill").
		Where("id = $1", id).
		Exec()

	if err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	// Now delete the user_skill references
	DB.DeleteFrom("user_skill").Where("skill_id=$1", id).Exec()

	sysLog(3, "Skills", "s", id, "Skill Deleted", c, claim)

	return c.String(http.StatusOK, "Skill Deleted")
}

///////////////////////////////////////////////////////////////////////
// Parts Maintenance
/*

create table part (
	id serial not null primary key,
	name text not null,
	descr text not null,
	stock_code text not null,
	reorder_stocklevel numeric(12,2) not null,
	reorder_qty numeric(12,2) not null,
	latest_price numeric(12,2) not null,
	qty_type text not null,
	picture text not null
);

*/

type DBpart struct {
	ID                int     `db:"id"`
	Name              string  `db:"name"`
	Descr             string  `db:"descr"`
	StockCode         string  `db:"stock_code"`
	ReorderStocklevel float64 `db:"reorder_stocklevel"`
	ReorderQty        float64 `db:"reorder_qty"`
	LatestPrice       float64 `db:"latest_price"`
	QtyType           string  `db:"qty_type"`
	Picture           string  `db:"picture"`
	Notes             string  `db:"notes"`
}

type DBpartComponents struct {
	ComponentID int    `db:"component_id"`
	PartID      int    `db:"part_id"`
	Qty         int    `db:"qty"`
	StockCode   string `db:"stock_code"` // component stock code and name
	Name        string `db:"name"`
	MachineName string `db:"machine_name"`
	SiteName    string `db:"site_name"`
	MachineID   int    `db:"machine_id"`
	SiteID      int    `db:"site_id"`
}

func queryParts(c *echo.Context) error {

	_, err := securityCheck(c, "readPart")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	var record []*DBpart
	err = DB.SQL(`select * from part order by lower(stock_code)`).QueryStructs(&record)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, record)
}

func queryPartComponents(c *echo.Context) error {

	_, err := securityCheck(c, "readPart")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	var cp []*DBpartComponents

	partID := getID(c)
	err = DB.SQL(`select 
		x.component_id,x.qty,c.stock_code,c.name,
		m.name as machine_name,m.id as machine_id,
		s.name as site_name,s.id as site_id
		from component_part x
		left join component c on (c.id=x.component_id)
		left join machine m on (m.id=c.machine_id)
		left join site s on (s.id=c.site_id)
		where x.part_id=$1`, partID).QueryStructs(&cp)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, cp)
}

func queryComponentParts(c *echo.Context) error {

	_, err := securityCheck(c, "readPart")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	var cp []*DBpartComponents

	partID := getID(c)
	err = DB.SQL(`select 
		x.component_id,x.qty,p.stock_code,p.name
		from component_part x
		left join part p on (p.id=x.component_id)
		where x.component_id=$1`, partID).QueryStructs(&cp)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, cp)
}

func getPart(c *echo.Context) error {

	_, err := securityCheck(c, "readPart")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)
	var record DBpart
	err = DB.SQL(`select * from part where id=$1`, id).QueryStruct(&record)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, record)
}

func newPart(c *echo.Context) error {

	claim, err := securityCheck(c, "writePart")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	record := &DBpart{}
	if err := c.Bind(record); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	err = DB.InsertInto("part").
		Whitelist("name", "descr", "stock_code", "reorder_stocklevel", "reorder_qty", "latest_price", "qty_type").
		Record(record).
		Returning("id").
		QueryScalar(&record.ID)

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	// Now log the creation of the new site
	sysLog(1, "Parts", "P", record.ID, "Part Created", c, claim)

	// insert into DB, fill in the ID of the new user
	return c.JSON(http.StatusCreated, record)
}

func savePart(c *echo.Context) error {

	claim, err := securityCheck(c, "writePart")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	record := &DBpart{}
	if err = c.Bind(record); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	partID := getID(c)

	_, err = DB.Update("part").
		SetWhitelist(record, "name", "descr", "stock_code", "reorder_stock_level", "reorder_qty", "latest_price", "qty_type", "notes").
		Where("id = $1", partID).
		Exec()

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	sysLog(1, "Parts", "P", partID, "Updated", c, claim)
	return c.JSON(http.StatusOK, partID)
}

func deletePart(c *echo.Context) error {

	claim, err := securityCheck(c, "writePart")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)
	_, err = DB.
		DeleteFrom("part").
		Where("id = $1", id).
		Exec()

	if err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	sysLog(3, "Parts", "P", id, "Part Deleted", c, claim)

	return c.String(http.StatusOK, "Part Deleted")
}

///////////////////////////////////////////////////////////////////////
// Machine Maintenance
/*

create table machine (
	id serial not null primary key,
	site_id int not null,
	name text not null,
	descr text not null,
	make text not null,
	model text not null,
	serialnum text not null,
	is_running boolean not null,
	stopped_at timestamp,
	started_at timestamp,
	picture text not null
);

drop table if exists component;
create table component (
	machine_id int not null,
	id serial not null,
	site_id int not null,
	name text not null,
	descr text not null,
	make text not null,
	model text not null,
	picture text not null
);

*/

type DBmachine struct {
	ID        int          `db:"id"`
	SiteId    int          `db:"site_id"`
	Name      string       `db:"name"`
	Descr     string       `db:"descr"`
	Make      string       `db:"make"`
	Model     string       `db:"model"`
	Serialnum string       `db:"serialnum"`
	IsRunning bool         `db:"is_running"`
	Status    string       `db:"status"`
	Stopped   dat.NullTime `db:"stopped_at"`
	Started   dat.NullTime `db:"started_at"`
	Alert     dat.NullTime `db:"alert_at"`
	Picture   string       `db:"picture"`
	SiteName  *string      `db:"site_name"`
	Notes     string       `db:"notes"`
}

type DBmachineResponse struct {
	ID        int     `db:"id"`
	SiteId    int     `db:"site_id"`
	Name      string  `db:"name"`
	Descr     string  `db:"descr"`
	Make      string  `db:"make"`
	Model     string  `db:"model"`
	Serialnum string  `db:"serialnum"`
	IsRunning bool    `db:"is_running"`
	Status    string  `db:"status"`
	Stopped   *string `db:"stopped_at"`
	Started   *string `db:"started_at"`
	Alert     *string `db:"alert_at"`
	Picture   string  `db:"picture"`
	SiteName  *string `db:"site_name"`
	Notes     string  `db:"notes"`
}

type DBmachineReq struct {
	ID        int    `db:"id"`
	SiteId    int    `db:"site_id"`
	Name      string `db:"name"`
	Descr     string `db:"descr"`
	Make      string `db:"make"`
	Model     string `db:"model"`
	Serialnum string `db:"serialnum"`
	Status    string `db:"status"`
	Picture   string `db:"picture"`
	Notes     string `db:"notes"`
}

type DBcomponent struct {
	MachineID   int    `db:"machine_id"`
	Position    int    `db:"position"`
	ID          int    `db:"id"`
	SiteId      int    `db:"site_id"`
	Name        string `db:"name"`
	Descr       string `db:"descr"`
	Make        string `db:"make"`
	Model       string `db:"model"`
	Qty         int    `db:"qty"`
	StockCode   string `db:"stock_code"`
	Serialnum   string `db:"serialnum"`
	Picture     string `db:"picture"`
	Notes       string `db:"notes"`
	SiteName    string `db:"site_name"`
	MachineName string `db:"machine_name"`
}

func queryMachine(c *echo.Context) error {

	_, err := securityCheck(c, "readMachine")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	var record []*DBmachine
	err = DB.SQL(`select m.*,s.name as site_name
		from machine m
		left join site s on (s.id=m.site_id)
		order by lower(m.name)`).QueryStructs(&record)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, record)
}

func querySiteMachines(c *echo.Context) error {

	_, err := securityCheck(c, "readMachine")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	siteID := getID(c)
	siteIDs := getRelatedSites(siteID)

	// Get a list of site_ids that are relevant for this site

	var record []*DBmachine
	err = DB.SQL(`select m.*,s.name as site_name
		from machine m 
		left join site s on (s.id=m.site_id) 
		where m.site_id in $1
		order by lower(m.name)`, siteIDs).QueryStructs(&record)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, record)
}

func getMachine(c *echo.Context) error {

	_, err := securityCheck(c, "readMachine")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)
	var record DBmachineResponse
	err = DB.SQL(`select m.id,m.site_id,m.name,m.descr,m.make,m.model,m.serialnum,
		m.is_running,m.status,m.picture,m.notes,
		to_char(m.started_at,'DD Mon YYYY HH24:MI:SS pm') as started_at,
		to_char(m.stopped_at,'DD Mon YYYY HH24:MI:SS pm') as stopped_at,
		to_char(m.alert_at,'DD Mon YYYY HH24:MI:SS pm') as alert_at,
		s.name as site_name
	  from machine m 
	  left join site s on (s.id=m.site_id)
	  where m.id=$1`, id).QueryStruct(&record)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, record)
}

func newMachine(c *echo.Context) error {

	claim, err := securityCheck(c, "writeMachine")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	record := &DBmachineReq{}
	if err := c.Bind(record); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	// Create a machine, default to 'Not Running'
	err = DB.InsertInto("machine").
		Whitelist("site_id", "name", "descr", "make", "model", "serialnum", "status").
		Record(record).
		Returning("id").
		QueryScalar(&record.ID)

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	// Now log the creation of the new site
	sysLog(1, "Machine", "M", record.ID, "Machine Created", c, claim)

	// insert into DB, fill in the ID of the new user
	return c.JSON(http.StatusCreated, record)
}

func saveMachine(c *echo.Context) error {

	claim, err := securityCheck(c, "writeMachine")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	record := &DBmachineReq{}
	if err = c.Bind(record); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	machineID := getID(c)

	// get the existing status of the machine
	var currentStatus string
	DB.SQL(`select status from machine where id=$1`, machineID).QueryScalar(&currentStatus)

	_, err = DB.Update("machine").
		SetWhitelist(record, "site_id", "name", "descr", "make", "model", "serialnum", "picture", "status", "notes").
		Where("id = $1", machineID).
		Exec()

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	sysLog(1, "Machine", "M", machineID, "Updated", c, claim)

	// Calculate any deltas to the status
	// And we should also create an event to record the state change
	switch currentStatus {
	default:
		switch record.Status {
		case "Running":
			DB.SQL(`update machine set started_at=localtimestamp,is_running=true where id=$1`, machineID).Exec()
		case "Needs Attention", "Maintenance Pending":
			DB.SQL(`update machine set alert_at=localtimestamp,is_running=true where id=$1`, machineID).Exec()
		case "Stopped":
			DB.SQL(`update machine set stopped_at=localtimestamp,is_running=false where id=$1`, machineID).Exec()
		}
	case "Running":
		switch record.Status {
		case "Needs Attention", "Maintenance Pending":
			DB.SQL(`update machine set alert_at=localtimestamp,is_running=true where id=$1`, machineID).Exec()
		case "Stopped":
			DB.SQL(`update machine set stopped_at=localtimestamp,is_running=false where id=$1`, machineID).Exec()
		}
	case "Needs Attention", "Maintenance Pending":
		switch record.Status {
		case "Running":
			DB.SQL(`update machine set started_at=localtimestamp,is_running=true where id=$1`, machineID).Exec()
		case "Stopped":
			DB.SQL(`update machine set stopped_at=localtimestamp,is_running=false where id=$1`, machineID).Exec()
		}
	case "Stopped":
		switch record.Status {
		case "Running":
			DB.SQL(`update machine set started_at=localtimestamp,is_running=true where id=$1`, machineID).Exec()
		case "Needs Attention", "Maintenance Pending":
			DB.SQL(`update machine set alert_at=localtimestamp,is_running=true where id=$1`, machineID).Exec()
		}
	case "New":
		switch record.Status {
		case "Running":
			DB.SQL(`update machine set started_at=localtimestamp,is_running=true where id=$1`, machineID).Exec()
		case "Needs Attention", "Maintenance Pending":
			DB.SQL(`update machine set alert_at=localtimestamp,is_running=true where id=$1`, machineID).Exec()
		case "Stopped":
			DB.SQL(`update machine set stopped_at=localtimestamp,is_running=false where id=$1`, machineID).Exec()
		}
	}
	if record.Status == "New" {
		DB.SQL(`update machine set started_at=null,stopped_at=null,alert_at=null,is_running=false where id=$1`, machineID).Exec()
	}

	return c.JSON(http.StatusOK, machineID)
}

func deleteMachine(c *echo.Context) error {

	claim, err := securityCheck(c, "writeMachine")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)
	_, err = DB.
		DeleteFrom("machine").
		Where("id = $1", id).
		Exec()

	if err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	sysLog(3, "Machine", "M", id, "Machine Deleted", c, claim)

	return c.String(http.StatusOK, "Machine Deleted")
}

func queryMachineComponents(c *echo.Context) error {

	_, err := securityCheck(c, "readMachine")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	var components []*DBcomponent
	//		SQL(`select *,array(select concat(logdate,ip,descr) from user_log where user_id=users.id order by logdate desc) as logs from users`).

	machineID := getID(c)
	err = DB.Select("*").
		From("component").
		Where("machine_id = $1", machineID).
		OrderBy("position,lower(name)").
		QueryStructs(&components)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, components)
}
