package main

import (
	"fmt"
	"github.com/labstack/echo"
	"gopkg.in/guregu/null.v3"
	"gopkg.in/mgutz/dat.v1"
	"log"
	"net/http"
	"net/url"
	"strconv"
)

///////////////////////////////////////////////////////////////////////
//       Generated By codegen from SQL table event
//        Event REST Functions

type DBevent struct {
	ID           int          `db:"id"`
	SiteId       int          `db:"site_id"`
	Type         string       `db:"type"`
	MachineId    int          `db:"machine_id"`
	ToolId       int          `db:"tool_id"`
	Priority     int          `db:"priority"`
	StartDate    dat.NullTime `db:"startdate"`
	CreatedBy    int          `db:"created_by"`
	AllocatedBy  int          `db:"allocated_by"`
	AllocatedTo  int          `db:"allocated_to"`
	Completed    dat.NullTime `db:"completed"`
	LabourCost   float64      `db:"labour_cost"`
	MaterialCost float64      `db:"material_cost"`
	OtherCost    float64      `db:"other_cost"`
	Notes        string       `db:"notes"`
	Status       string       `db:"status"`
}

type DBeventResponse struct {
	ID              int         `db:"id"`
	SiteId          int         `db:"site_id"`
	Type            string      `db:"type"`
	MachineId       int         `db:"machine_id"`
	MachineName     null.String `db:"machine_name"`
	SiteName        null.String `db:"site_name"`
	ToolId          int         `db:"tool_id"`
	ToolName        null.String `db:"tool_name"`
	Priority        int         `db:"priority"`
	StartDate       string      `db:"startdate"`
	CreatedBy       int         `db:"created_by"`
	Username        string      `db:"username"`
	AllocatedBy     int         `db:"allocated_by"`
	AllocatedByUser null.String `db:"allocated_by_user"`
	AllocatedTo     int         `db:"allocated_to"`
	AllocatedToUser null.String `db:"allocated_to_user"`
	Completed       null.String `db:"completed"`
	LabourCost      null.String `db:"labour_cost"`
	MaterialCost    null.String `db:"material_cost"`
	OtherCost       null.String `db:"other_cost"`
	Notes           string      `db:"notes"`
	Status          string      `db:"status"`
}

type MachineEventRequest struct {
	Machine string `json:"machine"`
	Descr   string `json:"descr"`
	Action  string `json:"action"`
}

type ToolEventRequest struct {
	Tool   string `json:"tool"`
	Descr  string `json:"descr"`
	Action string `json:"action"`
}

func queryMachineEvents(c *echo.Context) error {

	_, err := securityCheck(c, "readEvent")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)
	var record []*DBeventResponse
	err = DB.SQL(`select e.id,
		e.site_id,e.type,e.machine_id,e.tool_id,e.notes,
		to_char(e.startdate,'DD Mon YYYY HH24:MI:SS pm') as startdate,
		e.labour_cost, e.material_cost,e.other_cost,
		u1.username as username, 
		u2.username as allocated_by_user, 
		u3.username as allocated_to_user,
		m.name as machine_name,
		t.name as tool_name,
		s.name as site_name		
		from event e
		left join users u1 on (u1.id=e.created_by) 
		left join users u2 on (u2.id=e.allocated_by) 
		left join users u3 on (u3.id=e.allocated_to) 
		left join machine m on (m.id=e.machine_id)
		left join component t on (t.id=e.tool_id)
		left join site s on (s.id=m.site_id)
		where e.machine_id=$1
		order by e.startdate desc`, id).QueryStructs(&record)

	log.Println("Completed machine event query", len(record))

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, record)
}

func queryEvents(c *echo.Context) error {

	claim, err := securityCheck(c, "readEvent")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	sites := getClaimedSites(claim)
	log.Println(sites)
	var record []*DBeventResponse
	err = DB.SQL(`select e.id,
		e.site_id,e.type,e.machine_id,e.tool_id,e.notes,
		to_char(e.startdate,'DD Mon YY HH24:MI') as startdate,
		e.labour_cost, e.material_cost,e.other_cost,
		u1.username as username, 
		u2.username as allocated_by_user, 
		u3.username as allocated_to_user,
		m.name as machine_name,
		t.name as tool_name,
		s.name as site_name
		from event e
		left join users u1 on (u1.id=e.created_by) 
		left join users u2 on (u2.id=e.allocated_by) 
		left join users u3 on (u3.id=e.allocated_to) 
		left join machine m on (m.id=e.machine_id)
		left join component t on (t.id=e.tool_id)
		left join site s on (s.id=m.site_id)
		where e.site_id in $1
		order by e.startdate desc`, sites).QueryStructs(&record)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}

	return c.JSON(http.StatusOK, record)
}

func getEvent(c *echo.Context) error {

	_, err := securityCheck(c, "readEvent")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)
	var record DBeventResponse
	err = DB.SQL(`select e.id,
		e.site_id,e.type,e.machine_id,e.tool_id,e.notes,
		to_char(e.startdate,'DD Mon YYYY HH24:MI:SS') as startdate,
		e.labour_cost, e.material_cost,e.other_cost,
		e.created_by as created_by,
		e.allocated_by as allocated_by,
		e.allocated_to as allocated_to,
		u1.username as username, 
		u2.username as allocated_by_user, 
		u3.username as allocated_to_user,
		m.name as machine_name,
		t.name as tool_name,
		s.name as site_name
		from event e
		left join users u1 on (u1.id=e.created_by) 
		left join users u2 on (u2.id=e.allocated_by) 
		left join users u3 on (u3.id=e.allocated_to) 
		left join machine m on (m.id=e.machine_id)
		left join component t on (t.id=e.tool_id)
		left join site s on (s.id=m.site_id)
		where e.id=$1`, id).QueryStruct(&record)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}

	return c.JSON(http.StatusOK, record)
}

type EventUpdate struct {
	Notes string `db:"notes"`
}

// All this saves is the notes field
func saveEvent(c *echo.Context) error {

	_, err := securityCheck(c, "writeEvent")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)

	record := &EventUpdate{}
	if err = c.Bind(record); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	_, err = DB.Update("event").
		SetWhitelist(record, "notes").
		Where("id = $1", id).
		Exec()

	if err != nil {
		return c.String(http.StatusNotModified, err.Error())
	}

	return c.JSON(http.StatusOK, id)
}

func queryToolEvents(c *echo.Context) error {

	_, err := securityCheck(c, "readEvent")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)
	var record []*DBeventResponse
	err = DB.SQL(`select e.id,
		e.site_id,e.type,e.machine_id,e.tool_id,e.notes,
		to_char(e.startdate,'DD Mon YYYY HH24:MI:SS pm') as startdate,
		e.labour_cost, e.material_cost,e.other_cost,
		u1.username as username, 
		u2.username as allocated_by_user, 
		u3.username as allocated_to_user,
		m.name as machine_name,
		t.name as tool_name
		from event e
		left join users u1 on (u1.id=e.created_by) 
		left join users u2 on (u2.id=e.allocated_by) 
		left join users u3 on (u3.id=e.allocated_to) 
		left join component t on (t.id=e.tool_id)
		left join machine m on (m.id=e.machine_id)
		where e.tool_id=$1
		order by e.startdate desc`, id).QueryStructs(&record)

	log.Println("Completed tool event query", len(record))

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, record)
}

func raiseEventMachine(c *echo.Context) error {

	claim, err := securityCheck(c, "writeEvent")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	req := &MachineEventRequest{}
	err = c.Bind(req)
	if err != nil {
		log.Println("Binding:", err.Error())
		return c.String(http.StatusBadRequest, err.Error())
	}

	log.Println("Request:", req)

	// Lookup the machine
	var siteId int
	var machineId int
	machineId, err = strconv.Atoi(req.Machine)
	if err != nil {
		return c.String(http.StatusBadRequest, fmt.Sprintf("Invalid Machine ID %s", req.Machine))
	}

	err = DB.SQL(`select site_id from machine where id=$1`, machineId).QueryScalar(&siteId)
	if err != nil {
		return c.String(http.StatusBadRequest, fmt.Sprintf("Invalid Site ID for Machine %d: %s", machineId, err.Error()))
	}

	UID, Username := getClaimedUser(claim)

	// Create the event record
	evt := &DBevent{
		SiteId:    siteId,
		Type:      fmt.Sprintf("%s", req.Action),
		MachineId: machineId,
		ToolId:    0,
		Priority:  1,
		CreatedBy: UID,
		Notes:     req.Descr,
	}
	DB.InsertInto("event").
		Whitelist("site_id", "type", "machine_id", "priority", "created_by", "notes").
		Record(evt).
		Returning("id").
		QueryScalar(&evt.ID)

	// Update the machine record
	switch req.Action {
	case "Alert":
		_, err = DB.SQL(`update machine 
			set alert_at=localtimestamp, status=$2 
			where id=$1`,
			machineId,
			`Needs Attention`).
			Exec()
	case "Halt":
		_, err = DB.SQL(`update machine 
			set stopped_at=localtimestamp, status=$2, is_running=false
			where id=$1`,
			machineId,
			`Stopped`).
			Exec()
	}

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	log.Println("Raising Event", evt.ID, evt, "User:", Username)
	publishSocket("machine", machineId)
	publishSocket("event", evt.ID)
	return c.String(http.StatusOK, "Event Raised on the Machine")

	// TODO - add a mega amount of auditing to the machine and event records
}

func raiseEventTool(c *echo.Context) error {

	claim, err := securityCheck(c, "writeEvent")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	req := &ToolEventRequest{}
	err = c.Bind(req)
	if err != nil {
		log.Println("Binding:", err.Error())
		return c.String(http.StatusBadRequest, err.Error())
	}

	log.Println("Request:", req)

	// Lookup the machine
	var siteId int
	var machineId int
	var toolId int
	var toolName string
	toolId, err = strconv.Atoi(req.Tool)
	if err != nil {
		return c.String(http.StatusBadRequest, fmt.Sprintf("Invalid Tool ID %s", req.Tool))
	}

	err = DB.SQL(`
		select 
		site_id,machine_id,name 
		from component 
		where id=$1`, toolId).
		QueryScalar(&siteId, &machineId, &toolName)
	if err != nil {
		return c.String(http.StatusBadRequest, fmt.Sprintf("Invalid Site ID for Tool (%d): %s", toolId, err.Error()))
	}

	UID, Username := getClaimedUser(claim)

	// Create 1 event record - which includes details of both tool and machine
	evt := &DBevent{
		SiteId:    siteId,
		Type:      fmt.Sprintf("%s", req.Action),
		MachineId: machineId,
		ToolId:    toolId,
		Priority:  1,
		CreatedBy: UID,
		Notes:     req.Descr,
	}
	DB.InsertInto("event").
		Whitelist("site_id", "type", "machine_id", "tool_id", "priority", "created_by", "notes").
		Record(evt).
		Returning("id").
		QueryScalar(&evt.ID)

	// Update the machine record and the tool record
	switch req.Action {
	case "Alert":
		_, err = DB.SQL(`update machine 
			set alert_at=localtimestamp, status=$2 
			where id=$1`,
			machineId,
			`Needs Attention`).
			Exec()

		_, err = DB.SQL(`update component
			set status='Needs Attention'
			where id=$1`, toolId).
			Exec()
	case "Halt":
		_, err = DB.SQL(`update machine 
			set stopped_at=localtimestamp, status=$2, is_running=false
			where id=$1`,
			machineId,
			`Stopped`).
			Exec()
		_, err = DB.SQL(`update component
			set status='Stopped', is_running=false
			where id=$1`, toolId).
			Exec()
	case "Clear":
		_, err = DB.SQL(`update machine 
			set started_at=localtimestamp, status=$2, is_running=true
			where id=$1`,
			machineId,
			`Running`).
			Exec()
		_, err = DB.SQL(`update component
			set status='Running', is_running=true
			where machine_id=$1`, machineId).
			Exec()
	}

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	log.Println("Raising Tool Event", evt.ID, evt, "User:", Username)
	publishSocket("machine", machineId)
	publishSocket("tool", toolId)
	publishSocket("event", evt.ID)

	// TODO - audit records for both the machine and tool

	return c.String(http.StatusOK, "Event Raised on the Tool & Machine")
}

type EventCost struct {
	Id           string `json:"id"`
	Descr        string
	LabourCost   float64
	MaterialCost float64
	OtherCost    float64
}

func addCostToEvent(c *echo.Context) error {

	_, err := securityCheck(c, "writeEvent")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	req := &EventCost{}
	err = c.Bind(req)
	if err != nil {
		log.Println("Binding:", err.Error())
		return c.String(http.StatusBadRequest, err.Error())
	}

	id, err := strconv.Atoi(req.Id)
	if err != nil {
		return c.String(http.StatusBadRequest, "Invalid Event ID "+err.Error())
	}

	addNotes := fmt.Sprintf("\n<br>\n<br>\n<b><u>Added Costs :</u></b><br>\n %s\n", req.Descr)
	if req.LabourCost != 0.0 {
		addNotes += fmt.Sprintf("<br>Labour Costs: $%0.2f\n", req.LabourCost)
	}
	if req.MaterialCost != 0.0 {
		addNotes += fmt.Sprintf("<br>Material Costs: $%0.2f\n", req.MaterialCost)
	}
	if req.OtherCost != 0.0 {
		addNotes += fmt.Sprintf("<br>Other Costs: $%0.2f\n", req.OtherCost)
	}
	log.Println("Request:", req)
	_, err = DB.SQL(`update event set 
		labour_cost = labour_cost::numeric + $3,
		material_cost = material_cost::numeric + $4,
		other_cost = other_cost::numeric + $5,
		notes = concat(notes, $2)
		where id=$1`,
		id,
		addNotes,
		req.LabourCost,
		req.MaterialCost,
		req.OtherCost).Exec()

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}
	return c.String(http.StatusOK, "added costs")
}

func queryEventDocs(c *echo.Context) error {

	_, err := securityCheck(c, "writeEvent")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	refID := getID(c)

	// Get the event record
	myEvent := &DBeventResponse{}
	err = DB.SQL(`select id,site_id,machine_id,tool_id from event where id=$1`, refID).QueryStruct(myEvent)
	log.Println("Got event", myEvent)

	// Get docs for this event
	docs := &[]DBdoc{}
	err = DB.Select("id", "name", "filename", "filesize", "to_char(created, 'DD-Mon-YYYY HH:MI:SS') as created").
		From("doc").
		Where("type='event' and ref_id=$1", refID).
		QueryStructs(docs)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	// Now get docs for the site
	err = DB.Select("id", "name", "filename", "filesize", "to_char(created, 'DD-Mon-YYYY HH:MI:SS') as created").
		From("doc").
		Where("type='site' and ref_id=$1", myEvent.SiteId).
		QueryStructs(docs)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	// Now get docs for the tool
	err = DB.Select("id", "name", "filename", "filesize", "to_char(created, 'DD-Mon-YYYY HH:MI:SS') as created").
		From("doc").
		Where("type='tool' and ref_id=$1", myEvent.ToolId).
		QueryStructs(docs)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	// Now get docs for the machine
	err = DB.Select("id", "name", "filename", "filesize", "to_char(created, 'DD-Mon-YYYY HH:MI:SS') as created").
		From("doc").
		Where("type='machine' and ref_id=$1", myEvent.MachineId).
		QueryStructs(docs)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, docs)
}

func queryWorkOrders(c *echo.Context) error {

	_, err := securityCheck(c, "readEvent")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	var record []*DBworkorder
	err = DB.SelectDoc("id", "to_char(startdate,'DD-Mon-YYYY HH24:MI') as startdate", "est_duration", "descr", "status").
		Many("assignees", `select 
			x.user_id as id, u.name as name, u.username as username 
			from wo_assignee x 
			left join users u on (u.id=x.user_id)
			where x.id = workorder.id
			order by startdate desc`).
		From("workorder").
		QueryStructs(&record)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}

	return c.JSON(http.StatusOK, record)
}

type Assignee struct {
	ID       int
	Name     string
	Username string
}

type WOSkill struct {
	ID   int
	Name string
}

type WODocs struct {
	ID       int
	Name     string
	Filename string
	Filesize int
}

type WorkOrderRequest struct {
	EventID     string
	Date        string
	Descr       string
	EstDuration int
	AssignTo    []Assignee
	Skills      []WOSkill
	Documents   []WODocs
}

type DBworkorder struct {
	ID             int        `db:"id"`
	EventID        string     `db:"event_id"`
	StartDate      string     `db:"startdate"`
	EstDuration    int        `db:"est_duration"`
	ActualDuration int        `db:"actual_duration"`
	Descr          string     `db:"descr"`
	Status         string     `db:"status"`
	Notes          string     `db:"notes"`
	Assignees      []Assignee `db:"assignees"`
}

type DBwo_skills struct {
	ID      int `db:"id"`
	SkillId int `db:"skill_id"`
}

type DBwo_assignee struct {
	ID     int `db:"id"`
	UserId int `db:"user_id"`
}

type DBwo_docs struct {
	ID    int `db:"id"`
	DocId int `db:"doc_id"`
}

type EventNotes struct {
	MachineName  string `db:"machine_name"`
	MachineNotes string `db:"machine_notes"`
	ToolName     string `db:"tool_name"`
	ToolNotes    string `db:"tool_notes"`
	SiteName     string `db:"site_name"`
	SiteAddress  string `db:"site_address"`
	SiteNotes    string `db:"site_notes"`
}

func newWorkOrder(c *echo.Context) error {

	log.Println(`adding new workorder`)

	_, err := securityCheck(c, "writeEvent")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	req := &WorkOrderRequest{}
	err = c.Bind(req)
	if err != nil {
		log.Println("Binding:", err.Error())
		return c.String(http.StatusBadRequest, err.Error())
	}
	//log.Println("Request:", req)

	id, err := strconv.Atoi(req.EventID)
	if err != nil {
		return c.String(http.StatusBadRequest, "Invalid Event ID "+err.Error())
	}
	log.Println("EventID=", id)

	wo := DBworkorder{
		EventID:     req.EventID,
		StartDate:   req.Date,
		Descr:       req.Descr,
		EstDuration: req.EstDuration,
		Status:      `Assigned`,
		Notes:       ``,
	}

	// Make up the notes field based on the notes for the machine and the tool
	eNotes := &EventNotes{}
	err = DB.SQL(`select
		m.name as machine_name,
		m.notes as machine_notes,
		s.name as site_name,
		s.address as site_address,
		s.notes as site_notes,
		t.name as tool_name,
		t.notes as tool_notes
		from event e
		left join site s on s.id=e.site_id
		left join machine m on m.id=e.machine_id
		left join component t on t.id=e.tool_id
		where e.id=$1`, wo.EventID).QueryStruct(eNotes)
	if err != nil {
		return c.String(http.StatusNotFound, err.Error())
	}

	err = DB.InsertInto("workorder").
		Columns("event_id", "est_duration", "descr", "status", "startdate", "notes").
		Record(wo).
		Returning("id").
		QueryScalar(&wo.ID)

	googleMapUrl, _ := UrlEncoded(eNotes.SiteAddress)

	// create the email body to be sent to each assignee
	emailBody := fmt.Sprintf(`
		<h1>Maintenance WorkOrder %06d</h1>
		%s for the %s tool on the %s machine, at %s 

		%s 

		<ul>
			<li>Start Date: %s
			<li>Est Duration: %d mins
		</ul>
		<hr>
	
		<h2>Site Details: %s</h2>
		Map: http://www.google.com/maps?q=%s
		<p>
		%s
		<p>
		%s
		<hr>
		<h2>Machine: %s</h2>
		  %s
		<hr>
		<h2>Tool: %s</h2>
		  %s
		<hr>
		<h3>Skill Requirements:</h3>
		<ul>`,
		wo.ID,
		wo.Descr,
		eNotes.ToolName,
		eNotes.MachineName,
		eNotes.SiteName,
		wo.Notes,
		wo.StartDate[:10],
		wo.EstDuration,
		eNotes.SiteName,
		googleMapUrl,
		eNotes.SiteAddress,
		eNotes.SiteNotes,
		eNotes.MachineName,
		eNotes.MachineNotes,
		eNotes.ToolName,
		eNotes.ToolNotes)

	// populate the skills, adding each one to the emal body
	for _, skill := range req.Skills {
		log.Println("Attaching skill", skill)
		DB.SQL(`insert into wo_skills (id,skill_id) values ($1,$2)`, wo.ID, skill.ID).Exec()
		emailBody += fmt.Sprintf("<li> %s\n", skill.Name)
	}
	emailBody += fmt.Sprintf("</ul>\n")

	// populate the docs
	if len(req.Documents) > 0 {
		emailBody += fmt.Sprintf("Attached Documents:<ul>")
		for _idx, theDoc := range req.Documents {
			log.Println("Attaching document", _idx, theDoc)
			DB.SQL(`insert into wo_docs (id,doc_id) values ($1,$2)`, wo.ID, theDoc.ID).Exec()
			emailBody += fmt.Sprintf("<li> %s (%d kB)\n", theDoc.Name, theDoc.Filesize/1024)
		}
		emailBody += fmt.Sprintf("</ul>\n")
	}

	// populate the assignee, and send them an email with the workorder
	var emailAddr string
	for _, assignee := range req.AssignTo {
		log.Println("Attaching assignee", assignee)
		DB.SQL(`insert into wo_assignee (id,user_id) values ($1,$2)`, wo.ID, assignee.ID).Exec()

		// get the assignee's email address
		DB.SQL(`select email from users where id=$1`, assignee.ID).QueryScalar(&emailAddr)

		m := NewMail()
		// m.SetHeader("To", "steveoc64@gmail.com")
		m.SetHeader("To", "steve.oconnor@sbsinternational.com.au")
		m.SetHeader("Subject", fmt.Sprintf("Maintenance WorkOrder %06d", wo.ID))
		m.SetBody("text/html", "To:"+emailAddr+"<p>"+emailBody)
		// attach any docs to the email
		for _, theDoc := range req.Documents {
			m.Attach("uploads/" + theDoc.Filename)
		}

		MailChannel <- m
	}

	return c.JSON(http.StatusOK, wo)
}

func updateWorkOrder(c *echo.Context) error {

	return c.JSON(http.StatusOK, "update workorder")
}

// UrlEncoded encodes a string like Javascript's encodeURIComponent()
func UrlEncoded(str string) (string, error) {
	u, err := url.Parse(str)
	if err != nil {
		return "", err
	}
	return u.String(), nil
}

func queryEventWorkorders(c *echo.Context) error {

	_, err := securityCheck(c, "readEvent")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)

	var record []*DBworkorder
	err = DB.SelectDoc("id", "to_char(startdate,'DD-Mon-YYYY HH24:MI') as startdate", "est_duration", "descr", "status").
		Many("assignees", `select 
			x.user_id as id, u.name as name, u.username as username 
			from wo_assignee x 
			left join users u on (u.id=x.user_id)
			where x.id = workorder.id
			order by workorder.startdate desc`).
		From("workorder").
		Where("event_id=$1", id).
		QueryStructs(&record)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}

	// for each

	return c.JSON(http.StatusOK, record)
}
