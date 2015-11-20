package main

import (
	"github.com/labstack/echo"
	"github.com/thoas/stats"
	"gopkg.in/mgutz/dat.v1"
	//	"gopkg.in/mgutz/dat.v1/sqlx-runner"
	"log"
	"net/http"
	//"time"
	"database/sql"
	"fmt"
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
// UserLog

type userLog struct {
	UserId  int          `db:"user_id"`
	LogDate dat.NullTime `db:"logdate"`
	IP      string       `db:"ip"`
	Descr   string       `db:"descr"`
}

func logUser(id int, status string, c *echo.Context) {

	req := c.Request()
	ulog := &userLog{
		UserId: id,
		Descr:  status,
		IP:     req.RemoteAddr,
	}
	DB.InsertInto("user_log").
		Whitelist("user_id", "ip", "descr").
		Record(ulog).
		Exec() /*.
		Returning("logdate").
		QueryStruct(&ulog)


	log.Println("Log Record", ulog) */
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
		logUser(res.ID, fmt.Sprintf("Failed Login %s:%s  (%s)", l.Username, l.Passwd, err.Error()), c)
		log.Println("Login Failed:", err.Error())
		return c.String(http.StatusUnauthorized, "invalid")
	} else {
		logUser(res.ID, fmt.Sprintf("Login %s", l.Username), c)
		log.Println(res)
		res.Token = "a new token generated here"
		return c.JSON(http.StatusOK, res)
	}
}

func logout(c *echo.Context) error {
	id := c.Param("id")
	i, err := strconv.Atoi(id)
	if err != nil {
		i = 0
	}
	logUser(i, fmt.Sprintf("Logout %s", id), c)
	return c.String(http.StatusOK, "bye")
}
