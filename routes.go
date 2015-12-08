package main

import (
	"database/sql"
	"fmt"
	"github.com/labstack/echo"
	"github.com/thoas/stats"
	//	"gopkg.in/mgutz/dat.v1"
	"log"
	"net/http"
	"reflect"
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

	e.Get("/vendor", queryVendor)
	e.Get("/vendor/:id", getVendor)
	e.Post("/vendor", newVendor)
	e.Put("/vendor/:id", saveVendor)
	e.Delete("/vendor/:id", deleteVendor)

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
	Before   string `db:"before"`
	After    string `db:"after"`
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

func sysLogUpdate(status int, t string, reftype string, ref int, descr string, c *echo.Context, claim map[string]interface{}, before interface{}, after interface{}) {

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

	// Build up the before and after strings
	BeforeString := ""
	AfterString := ""
	recordType := reflect.TypeOf(before)
	//	fmt.Println("Before is of type", recordType)
	beforeValues := reflect.ValueOf(before)
	afterValues := reflect.ValueOf(after)

	for i := 0; i < recordType.NumField(); i++ {
		tt := recordType.Field(i)
		fb := beforeValues.Field(i).Interface()
		fa := afterValues.Field(i).Interface()
		switch reflect.TypeOf(fb).Kind() {
		case reflect.String, reflect.Int, reflect.Float64:
			if fa != fb {
				BeforeString += fmt.Sprintln(tt.Name, ":", fb)
				AfterString += fmt.Sprintln(tt.Name, ":", fa)
			}
		case reflect.Ptr, reflect.Slice, reflect.Struct:
			// Do nothing
		default:
			fmt.Println("What to do with", fb, "??")
		}
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
		Before:   BeforeString,
		After:    AfterString,
	}

	_, err := DB.InsertInto("sys_log").
		Whitelist("status", "type", "ref_type", "ref_id", "ip", "descr", "user_id", "username", "before", "after").
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
		"before", "after",
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
