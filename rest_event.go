package main

import (
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strconv"

	"github.com/labstack/echo"
	"gopkg.in/guregu/null.v3"
	"gopkg.in/mgutz/dat.v1"
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
	ToolType     string       `db:"tool_type"`
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
	MachineID int    `json:"machineID"`
	ToolID    int    `json:"toolID"`
	Descr     string `json:"descr"`
	Action    string `json:"action"`
	Type      string `json:"type"`
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

// TODO - bring this code into line with the tool event, as this is the entry point for
// raising events from the machine list screen now

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

	log.Println("Machine Request:", req)

	// Lookup the machine
	var siteId int
	// var machineId int
	// machineId, err = strconv.Atoi(req.MachineID)
	// if err != nil {
	// return c.String(http.StatusBadRequest, fmt.Sprintf("Invalid Machine ID %s", req.MachineID))
	// }

	var machineName string
	err = DB.SQL(`select site_id,name from machine where id=$1`, req.MachineID).QueryScalar(&siteId, &machineName)
	if err != nil {
		return c.String(http.StatusBadRequest, fmt.Sprintf("Invalid Site ID for Machine %d: %s", req.MachineID, err.Error()))
	}

	UID, Username := getClaimedUser(claim)

	// Create the event record
	evt := &DBevent{
		SiteId:    siteId,
		Type:      fmt.Sprintf("%s", req.Action),
		MachineId: req.MachineID,
		ToolId:    req.ToolID,
		ToolType:  req.Type,
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
			req.MachineID,
			`Needs Attention`).
			Exec()
	case "Halt":
		_, err = DB.SQL(`update machine 
			set stopped_at=localtimestamp, status=$2, is_running=false
			where id=$1`,
			req.MachineID,
			`Stopped`).
			Exec()
	}

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	log.Println("Raising Event", evt.ID, evt, "User:", Username)
	publishSocket("machine", req.MachineID)
	publishSocket("event", evt.ID)

	// send SMS to all people on the distribution list for this site
	// which at the moment, will hard code to Shane's number
	err = SendSMS("0417824950",
		fmt.Sprintf("%s on Machine %s %s", req.Action, machineName, req.Descr),
		fmt.Sprintf("%d", evt.ID))

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
	var machineName string
	toolId, err = strconv.Atoi(req.Tool)
	if err != nil {
		return c.String(http.StatusBadRequest, fmt.Sprintf("Invalid Tool ID %s", req.Tool))
	}

	err = DB.SQL(`
		select 
		c.site_id,c.machine_id,m.name,c.name 
		from component c
		left join machine m on (m.id = c.machine_id) 
		where c.id=$1`, toolId).
		QueryScalar(&siteId, &machineId, &machineName, &toolName)
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
		ToolType:  "Tool",
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
	case "Pending":
		_, err = DB.SQL(`update machine 
			set alert_at=localtimestamp, status=$2 
			where id=$1`,
			machineId,
			`Maintenance Pending`).
			Exec()

		_, err = DB.SQL(`update component
			set status='Maintenance Pending'
			where id=$1`, toolId).
			Exec()
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

	// Now, if any docs were attached to the event, they have a ref_id of tool_id, and a
	// ref type of "temptoolevent"
	// These are temporary references to store the doc until the event id is known
	// So, now we need to stamp them with the correct ref_id and the correct description

	log.Printf("update doc set ref_id=%d, name='%s' where type='temptoolevent' and ref_id=%d\n", evt.ID, evt.Notes, toolId)

	_, err = DB.SQL(`update doc
		set ref_id=$1, name=$3, type='toolevent'
		where type='temptoolevent' and ref_id=$2
		`, evt.ID, toolId,
		evt.Notes).Exec()

	if err != nil {
		log.Println("Problem registering the document to the event")
	}

	log.Println("Raising Tool Event", evt.ID, evt, "User:", Username)
	publishSocket("machine", machineId)
	publishSocket("tool", toolId)
	publishSocket("event", evt.ID)

	// send SMS to Shane
	// TODO - include everyone elso on the distro list
	err = SendSMS("0417824950",
		fmt.Sprintf("%s on Tool %s/%s %s", req.Action, machineName, toolName, req.Descr),
		fmt.Sprintf("%d", evt.ID))

	// TODO - audit records for both the machine and tool

	return c.String(http.StatusOK, "Event Raised on the Tool & Machine")
}

func clearTempEventTool(c *echo.Context) error {

	_, err := securityCheck(c, "writeEvent")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)
	log.Println("clearing temp docs for event", id)

	DB.SQL(`delete from doc where ref_id=$1 and type='temptoolevent'`, id).Exec()

	return c.String(http.StatusOK, "Cleared temp docs")
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

	// Use this with newer versions of postgres (9.2+)
	////////////////////////////////////////////////////////////////
	// err = DB.SelectDoc("id", "to_char(startdate,'DD-Mon-YYYY HH24:MI') as startdate", "est_duration", "descr", "status").
	// 	Many("assignees", `select
	// 		x.user_id as id, u.name as name, u.username as username
	// 		from wo_assignee x
	// 		left join users u on (u.id=x.user_id)
	// 		where x.id = workorder.id`).
	// 	From("workorder").
	// 	QueryStructs(&record)

	// if err != nil {
	// 	return c.String(http.StatusNoContent, err.Error())
	// }
	// End of code for newer version of Postgres
	////////////////////////////////////////////////////////////////

	// Use this with older versions of Postgres
	////////////////////////////////////////////////////////////////
	err = DB.Select("workorder.id",
		"to_char(workorder.startdate,'DD-Mon-YYYY HH24:MI') as startdate",
		"workorder.est_duration as est_duration",
		"workorder.descr as descr",
		"workorder.status as status",
		"event.site_id as site_id",
		"site.name as site_name",
		"event.machine_id as machine_id",
		"machine.name as machine_name",
		"event.tool_id as tool_id",
		"component.name as tool_name").
		From(`
			workorder
			left join event on (event.id = workorder.event_id)
			left join site on (site.id = event.site_id)
			left join machine on (machine.id = event.machine_id)
			left join component on (component.id = event.tool_id)
		`).
		OrderBy("workorder.startdate").
		QueryStructs(&record)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}

	for _, v := range record {
		err = DB.SQL(`select
			x.user_id as id, u.name as name, u.username as username
			from wo_assignee x
			left join users u on (u.id=x.user_id)
			where x.id = $1`, v.ID).
			QueryStructs(&v.Assignees)
		// log.Println("got assignees for", v)
	}

	////////////////////////////////////////////////////////////////

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
	StartDate   string
	Descr       string
	EstDuration int
	Notes       string
	Assignees   []Assignee
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
	Skills         []WOSkill  `db:"skills"`
	// derived fields off the event, machine, site, etc
	SiteID      int    `db:"site_id"`
	SiteName    string `db:"site_name"`
	MachineID   int    `db:"machine_id"`
	MachineName string `db:"machine_name"`
	ToolID      int    `db:"tool_id"`
	ToolName    string `db:"tool_name"`
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
		StartDate:   req.StartDate,
		Descr:       req.Descr,
		EstDuration: req.EstDuration,
		Status:      `Assigned`,
		Notes:       req.Notes,
	}
	log.Println("passed in workorder", wo)

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

	// read the date back in a sane format
	theDate := ""
	err = DB.SQL(`select to_char(startdate, 'DD-Mon-YYYY HH:MI AM') from workorder where id=$1`, wo.ID).QueryScalar(&theDate)

	googleMapUrl, _ := UrlEncoded(eNotes.SiteAddress)

	// create the email body to be sent to each assignee
	emailBody := fmt.Sprintf(`
		<h1>Maintenance WorkOrder %06d</h1>
		%s for the %s tool on the %s machine, at %s 

		<ul>
			<li>Start Date: %s
			<li>Est Duration: %d mins
			<li>Notes: %s
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
		theDate,
		wo.EstDuration,
		wo.Notes,
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

	// include the event level docs
	type eventDocType struct {
		ID       int
		Name     string
		Filename string
		Filesize int
	}
	var eventDocs []eventDocType
	err = DB.SQL(`select id,name,filename,filesize from doc where type='toolevent' and ref_id=$1`, req.EventID).QueryStructs(&eventDocs)
	if err != nil {
		log.Println("Problem reading event level docs", err.Error())
	}

	// populate the docs
	if len(req.Documents) > 0 {
		emailBody += fmt.Sprintf("Attached Documents:<ul>")
		for _idx, theDoc := range req.Documents {
			log.Println("Attaching document", _idx, theDoc)
			DB.SQL(`insert into wo_docs (id,doc_id) values ($1,$2)`, wo.ID, theDoc.ID).Exec()
			emailBody += fmt.Sprintf("<li> %s (%d kB)\n", theDoc.Name, theDoc.Filesize/1024)
		}
		for _, evtDoc := range eventDocs {
			DB.SQL(`insert into wo_docs (id,doc_id) values ($1,$2)`, wo.ID, evtDoc.ID).Exec()
			emailBody += fmt.Sprintf("<li> %s (%d kB)\n", evtDoc.Name, evtDoc.Filesize/1024)
		}

		emailBody += fmt.Sprintf("</ul>\n")
	}

	// populate the assignee, and send them an email with the workorder
	var emailAddr string
	for _, assignee := range req.Assignees {
		log.Println("Attaching assignee", assignee)
		DB.SQL(`insert into wo_assignee (id,user_id) values ($1,$2)`, wo.ID, assignee.ID).Exec()

		// get the assignee's email address
		DB.SQL(`select email from users where id=$1`, assignee.ID).QueryScalar(&emailAddr)

		m := NewMail()
		//m.SetHeader("To", "steveoc64@gmail.com", "steve.oconnor@sbsinternational.com.au", "cmms-admin@sbsinternational.com.au")
		m.SetHeader("To", "steveoc64@gmail.com", "steve.oconnor@sbsinternational.com.au")
		// m.SetHeader("To", "steve.oconnor@sbsinternational.com.au")
		m.SetHeader("Subject", fmt.Sprintf("Maintenance WorkOrder %06d", wo.ID))
		m.SetBody("text/html", "To:"+emailAddr+"<p>"+emailBody)
		// attach any docs to the email
		for _, theDoc := range req.Documents {
			m.Attach("uploads/" + theDoc.Filename)
		}
		// include event level docs as well
		for _, evtDoc := range eventDocs {
			m.Attach("uploads/" + evtDoc.Filename)
		}

		MailChannel <- m
	}

	return c.JSON(http.StatusOK, wo)
}

func updateWorkOrder(c *echo.Context) error {

	// TODO - a number of possible actions, including re-issuing the workorder
	_, err := securityCheck(c, "readEvent")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)
	record := &DBworkorder{}
	if err = c.Bind(record); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	//var record DBworkorder
	DB.Update("workorder").
		SetWhitelist(record, "notes").
		Where("id = $1", id).
		Exec()

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
	// Newer versions of Postgres (9.2+), use this:
	//////////////////////////////////////////////////
	// err = DB.SelectDoc("id", "to_char(startdate,'DD-Mon-YYYY HH24:MI') as startdate", "est_duration", "descr", "status").
	// 	Many("assignees", `select
	// 		x.user_id as id, u.name as name, u.username as username
	// 		from wo_assignee x
	// 		left join users u on (u.id=x.user_id)
	// 		where x.id = workorder.id
	// 		order by workorder.startdate desc`).
	// 	From("workorder").
	// 	Where("event_id=$1", id).
	// 	QueryStructs(&record)
	///////////////////////////////////////////////////

	// Earlier versions of Postgres, use this instead:
	////////////////////////////////////////////////////
	err = DB.Select("id",
		"to_char(startdate,'DD-Mon-YYYY HH24:MI') as startdate",
		"est_duration",
		"descr",
		"status").
		From("workorder").
		Where("event_id=$1", id).
		QueryStructs(&record)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}

	// for each workorder record found, manually fill in the assignee block
	for _, v := range record {
		// log.Println("getting assingnees for workorder", v)
		DB.SQL(`select 
			x.user_id as id, u.name as name, u.username as username
			from wo_assignee x
			left join users u on (u.id=x.user_id)
			where x.id = $1`, v.ID).
			QueryStructs(&v.Assignees)
		// log.Println("got", v.Assignees)
	}

	// End of block for the older Postgres server
	///////////////////////////////////////////////////

	return c.JSON(http.StatusOK, record)
}

func getWorkOrder(c *echo.Context) error {

	_, err := securityCheck(c, "readEvent")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)

	var record DBworkorder
	// Newer versions of Postgres (9.2+), use this:
	//////////////////////////////////////////////////
	// as below, but use the dat.selectdoc method
	///////////////////////////////////////////////////

	// Earlier versions of Postgres, use this instead:
	////////////////////////////////////////////////////
	err = DB.Select("workorder.id",
		"to_char(workorder.startdate,'YYYY-MM-DD HH24:MI') as startdate",
		"workorder.est_duration as est_duration",
		"workorder.descr as descr",
		"workorder.status as status",
		"event.site_id as site_id",
		"site.name as site_name",
		"event.machine_id as machine_id",
		"machine.name as machine_name",
		"event.tool_id as tool_id",
		"component.name as tool_name").
		From(`
			workorder
			left join event on (event.id = workorder.event_id)
			left join site on (site.id = event.site_id)
			left join machine on (machine.id = event.machine_id)
			left join component on (component.id = event.tool_id)
		`).
		Where("workorder.id=$1", id).
		QueryStruct(&record)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}

	// get the assignee array
	log.Println("getting assignees for workorder", record)
	DB.SQL(`select 
			x.user_id as id, u.name as name, u.username as username
			from wo_assignee x
			left join users u on (u.id=x.user_id)
			where x.id = $1`, id).
		QueryStructs(&record.Assignees)
	log.Println("got", record.Assignees)

	// get the skills array
	DB.SQL(`select s.id, s.name 
		from wo_skills x
		left join skill s on (s.id=x.skill_id)
		where x.id=$1`, id).
		QueryStructs(&record.Skills)

	// End of block for the older Postgres server
	///////////////////////////////////////////////////

	return c.JSON(http.StatusOK, record)
}
