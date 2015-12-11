package main

import (
	"database/sql"
	"fmt"
	"github.com/labstack/echo"
	"github.com/thoas/stats"
	//	"gopkg.in/mgutz/dat.v1"
	"errors"
	"io"
	"log"
	"net/http"
	"os"
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
	e.Post("/upload", uploadDocument)
	e.Get("/docs/:type/:id", queryDocs)
	e.Get("/doc/:id", serveDoc)

	e.Get("/users", queryUsers)
	e.Get("/users/skill/:id", queryUsersWithSkill)
	e.Get("/users/:id", getUser)
	e.Post("/users", newUser)
	e.Put("/users/:id", saveUser)
	e.Delete("/users/:id", deleteUser)

	e.Get("/sites", querySites)
	e.Get("/sites/:id", getSite)
	e.Get("/site/supplies/:id", querySiteSupplies)
	e.Get("/site/users/:id", querySiteUsers)
	e.Post("/sites", newSite)
	e.Put("/sites/:id", saveSite)
	e.Delete("/sites/:id", deleteSite)

	e.Get("/skills", querySkills)
	e.Get("/skills/:id", getSkill)
	e.Post("/skills", newSkill)
	e.Put("/skills/:id", saveSkill)
	e.Delete("/skills/:id", deleteSkill)

	e.Get("/parts", queryParts)
	e.Get("/part/components/:id", queryPartComponents)
	e.Get("/part/vendors/:id", queryPartVendors)
	e.Get("/parts/:id", getPart)
	e.Post("/parts", newPart)
	e.Put("/parts/:id", savePart)
	e.Delete("/parts/:id", deletePart)

	e.Get("/machine", queryMachine)
	e.Get("/site/machines/:id", querySiteMachines)
	e.Get("/machine/:id", getMachine)
	e.Post("/machine", newMachine)
	e.Put("/machine/:id", saveMachine)
	e.Delete("/machine/:id", deleteMachine)
	e.Get("/machine/components/:id", queryMachineComponents)
	e.Get("/machine/parts/:id", queryMachineParts)

	e.Get("/component", queryComponents)
	e.Get("/component/:id", getComponent)
	e.Post("/component", newComponent)
	e.Put("/component/:id", saveComponent)
	e.Delete("/component/:id", deleteComponent)
	e.Get("/component/parts/:id", queryComponentParts)

	e.Get("/vendor", queryVendor)
	e.Get("/vendor/part/:id", queryVendorParts)
	e.Get("/vendor/:id", getVendor)
	e.Post("/vendor", newVendor)
	e.Post("/vendor/prices/:id", newVendorPrices)
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

	res := &loginResponse{}
	err = DB.
		Select("u.id,u.username,u.name,u.role,u.site_id,s.name as sitename").
		From(`users u
			left join site s on (s.id = u.site_id)`).
		Where("u.username = $1 and passwd = $2", l.Username, l.Passwd).
		QueryStruct(res)

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

		Sites := getAllowedSites(res.ID, res.Role)

		tokenString, err := generateToken(res.ID, res.Role, l.Username, Sites)
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

type DBuser_site struct {
	UserId int    `db:"user_id"`
	SiteId int    `db:"site_id"`
	Role   string `db:"role"`
}

func getAllowedSites(userID int, role string) []int {

	var Sites []int

	err := errors.New("Sites")

	switch role {
	case "Admin":
		err = DB.SQL(`select id from site`).QuerySlice(&Sites)
	case "Site Manager", "Worker", "Floor", "Service Contractor":
		err = DB.SQL(`select site_id from user_site where user_id=$1`, userID).QuerySlice(&Sites)
	}

	if err != nil {
		log.Println("Getting user sites", err.Error())
		return nil
	}
	log.Println("Allowed sites =", Sites)

	return Sites
}

type DBdoc struct {
	ID         int    `db:"id"`
	Name       string `db:"name"`
	Filename   string `db:"filename"`
	Path       string `db:"path"`
	Worker     bool   `db:"worker"`
	Sitemgr    bool   `db:"sitemgr"`
	Contractor bool   `db:"contractor"`
	Type       string `db:"type"`
	RefId      int    `db:"ref_id"`
	DocFormat  int    `db:"doc_format"`
	Notes      string `db:"notes"`
	Filesize   int64  `db:"filesize"`
	UserId     int    `db:"user_id"`
	LatestRev  int    `db:"latest_rev"`
	Created    string `db:"created"`
}

type DBdocRev struct {
	DocId    int    `db:"doc_id"`
	ID       int    `db:"id"`
	RevDate  string `db:"revdate"` // defaults to localtime, so dont fill it in
	Descr    string `db:"descr"`
	Filename string `db:"filename"`
	Path     string `db:"path"`
	Filesize int64  `db:"filesize"`
	UserId   int    `db:"user_id"`
}

// Upload a file, need to supply the following data with each file upload :
// desc    - description of the file
// type    - entity that the doc is attached to (CamelCased version of the SQL table name)
// refid   - id of the entity that this file is attached to
// rev     - 0 for initial non-zero = docID of the document being revved up
// 3 ACL flags :
// worker     - workers can view this
// sitemgr    - site manager can view this
// contractor - service contractors can view this

func uploadDocument(c *echo.Context) error {

	claim, err := securityCheck(c, "upload")
	if err != nil {
		return c.String(http.StatusUnauthorized, "bye")
	}

	req := c.Request()
	req.ParseMultipartForm(16 << 20) // Max memory 16 MiB

	doc := &DBdoc{}
	doc.ID = 0
	doc.Name = c.Form("desc")
	doc.Type = c.Form("type")
	Rev, _ := strconv.Atoi(c.Form("rev"))
	doc.RefId, _ = strconv.Atoi(c.Form("ref_id"))
	doc.UserId, _ = getClaimedUser(claim)
	log.Println("Passed bools", c.Form("worker"), c.Form("sitemgr"), c.Form("contractor"))
	doc.Worker = (c.Form("worker") == "true")
	doc.Sitemgr = (c.Form("sitemgr") == "true")
	doc.Contractor = (c.Form("contractor") == "true")
	doc.Filesize = 0

	// make upload dir if not already there, ignore errors
	os.Mkdir("uploads", 0666)

	// Read files
	files := req.MultipartForm.File["file"]
	path := ""
	//log.Println("files =", files)
	for _, f := range files {
		doc.Filename = f.Filename

		// Source file
		src, err := f.Open()
		if err != nil {
			return err
		}
		defer src.Close()

		// While filename exists, append a version number to it
		doc.Path = "uploads/" + doc.Filename
		gotFile := false
		revID := 1

		for !gotFile {
			log.Println("Try with path=", doc.Path)
			dst, err := os.OpenFile(doc.Path, os.O_EXCL|os.O_RDWR|os.O_CREATE, 0666)
			if err != nil {
				if os.IsExist(err) {
					log.Println(doc.Path, "already exists")
					doc.Path = fmt.Sprintf("uploads/%s.%d", doc.Filename, revID)
					revID++
					if revID > 999 {
						log.Println("RevID limit exceeded, terminating")
						return c.String(http.StatusBadRequest, doc.Path)
					}
				}
			} else {
				log.Println("Created file", doc.Path)
				gotFile = true
				defer dst.Close()

				if doc.Filesize, err = io.Copy(dst, src); err != nil {
					return err
				}

				// If we get here, then the file transfer is complete

				// If doc does not exist by this filename, create it
				// If doc does exist, create rev, and update header details of doc

				if Rev == 0 {
					// New doc
					err := DB.InsertInto("doc").
						Whitelist("name", "filename", "path", "worker", "sitemgr", "contractor", "type", "ref_id", "filesize", "user_id").
						Record(doc).
						Returning("id").
						QueryScalar(&doc.ID)

					if err != nil {
						log.Println("Inserting Record:", err.Error())
					} else {
						log.Println("Inserted new doc with ID", doc.ID)
					}
				} else {
					// Revision to existing doc
					docRev := &DBdocRev{}
					docRev.Path = doc.Path
					docRev.Filename = doc.Filename
					docRev.Filesize = doc.Filesize
					docRev.DocId = doc.ID
					docRev.ID = Rev
					docRev.Descr = doc.Name
					docRev.UserId = doc.UserId

					_, err := DB.InsertInto("doc_rev").
						Whitelist("doc_id", "id", "descr", "filename", "path", "filesize", "user_id").
						Record(docRev).
						Exec()

					if err != nil {
						log.Println("Inserting revision:", err.Error())
					} else {
						log.Println("Inserted new revision with ID", docRev.ID)
					}

				}

			} // managed to create the new file
		} // loop until we have created a file
	} // foreach file being uploaded this batch

	return c.String(http.StatusOK, path)
}

// Get all documents related to any record
func queryDocs(c *echo.Context) error {

	refID := getID(c)
	docType := c.Param("type")

	docs := &[]DBdoc{}
	err := DB.Select("id", "name", "filename", "filesize", "to_char(created, 'DD-Mon-YYYY HH:MI:SS') as created").
		From("doc").
		Where("type=$1 and ref_id=$2", docType, refID).
		QueryStructs(docs)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	} else {
		return c.JSON(http.StatusOK, docs)
	}
}

// Send the specific document as a file
func serveDoc(c *echo.Context) error {

	docID := getID(c)
	doc := &DBdoc{}
	err := DB.Select("filename", "path").
		From("doc").
		Where("id=$1", docID).
		QueryStruct(doc)
	if err != nil {
		return c.String(http.StatusNotFound, "no file")
	} else {
		log.Println("Sending file", doc.Path, "as", doc.Filename)
		return c.File(doc.Path, doc.Filename, false)
	}
}
