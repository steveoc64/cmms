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
	e.Delete("/login/:id", logout)

	e.Get("/users", queryUsers)
	e.Get("/users/:id", getUser)
	e.Post("/users", newUser)
	e.Put("/users/:id", saveUser)
	e.Delete("/users/:id", deleteUser)
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

type SysLog struct {
	Type    string `db:"type"`
	RefType string `db:"ref_type"`
	Ref     int    `db:"ref"`
	IP      string `db:"ip"`
	Descr   string `db:"descr"`
}

func sysLog(t string, reftype string, ref int, descr string, c *echo.Context) {

	req := c.Request()
	l := &SysLog{
		Type:    t,
		RefType: reftype,
		Ref:     ref,
		Descr:   descr,
		IP:      req.RemoteAddr,
	}
	DB.InsertInto("sys_log").
		Whitelist("type", "ref_type", "ref", "ip", "descr").
		Record(l).
		Exec()
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
		sysLog("LognFail", "U", res.ID, fmt.Sprintf("Failed Login %s:%s  (%s)", l.Username, l.Passwd, err.Error()), c)
		log.Println("Login Failed:", err.Error())
		return c.String(http.StatusUnauthorized, "invalid")
	} else {
		sysLog("Login", "U", res.ID, fmt.Sprintf("Login %s", l.Username), c)
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
	id := c.Param("id")
	i, err := strconv.Atoi(id)
	if err != nil {
		i = 0
	}
	sysLog("Logout", "U", i, fmt.Sprintf("Logout %s", id), c)
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
	ID       int           `db:"id",json:"number"`
	Username string        `db:"username"`
	Passwd   string        `db:"passwd"`
	Name     string        `db:"name"`
	Email    string        `db:"email"`
	Address  string        `db:"address"`
	SMS      string        `db:"sms"`
	SiteId   int           `db:"site_id"`
	Role     string        `db:"role"`
	Logs     []interface{} `db:"logs"`
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
	var user DBusers

	_, err := securityCheck(c, "readUser")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)
	err = DB.
		SelectDoc(`*`).
		From(`users`).
		Many(`logs`, `select * from sys_log where ref_type='U' and ref=$1 order by logdate desc limit 12`, id).
		Where(`id = $1`, id).
		QueryStruct(&user)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, user)
}

func newUser(c *echo.Context) error {
	//var user DBusers

	claim, err := securityCheck(c, "writeUser")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	newUser := &DBusers{}
	if err := c.Bind(newUser); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	err = DB.InsertInto("users").
		Columns("username", "passwd", "address", "name", "email", "role", "sms").
		Record(newUser).
		Returning("id").
		QueryScalar(&newUser.ID)

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	// Now log the creation of the new user
	sysLog("NewUser", "U", getUID(claim), fmt.Sprintf("Added User (%d) %s", newUser.ID, newUser.Username), c)
	sysLog("NewUser", "U", newUser.ID, fmt.Sprintf("Account Created by %s", claim["Username"].(string)), c)

	// insert into DB, fill in the ID of the new user
	return c.JSON(http.StatusCreated, newUser)
}

func saveUser(c *echo.Context) error {

	claim, err := securityCheck(c, "writeUser")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	updateUser := &DBusers{}
	if err = c.Bind(updateUser); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	userID := getID(c)

	_, err = DB.Update("users").
		SetWhitelist(updateUser, "username", "name", "passwd", "email", "address", "sms", "role").
		Where("id = $1", userID).
		Exec()

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	sysLog("UserMod", "U", userID, fmt.Sprintf("Details updated by %s", claim["Username"].(string)), c)
	return c.JSON(http.StatusOK, updateUser)
}

func deleteUser(c *echo.Context) error {
	//var user DBusers
	//id := getID(c)

	return c.String(http.StatusOK, `TODO - delete the user`)
}
