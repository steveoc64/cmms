package main

import (
	"fmt"
	"github.com/labstack/echo"
	"gopkg.in/mgutz/dat.v1"
	"log"
	"net/http"
	"strconv"
	// "time"
)

///////////////////////////////////////////////////////////////////////
// Machine Maintenance

type DBmachine struct {
	ID         int          `db:"id"`
	SiteId     int          `db:"site_id"`
	Name       string       `db:"name"`
	Descr      string       `db:"descr"`
	Make       string       `db:"make"`
	Model      string       `db:"model"`
	Serialnum  string       `db:"serialnum"`
	IsRunning  bool         `db:"is_running"`
	Status     string       `db:"status"`
	Stopped    dat.NullTime `db:"stopped_at"`
	Started    dat.NullTime `db:"started_at"`
	Alert      dat.NullTime `db:"alert_at"`
	Picture    string       `db:"picture"`
	SiteName   *string      `db:"site_name"`
	Notes      string       `db:"notes"`
	Components []*DBcomponent
}

type DBmachineResponse struct {
	ID         int     `db:"id"`
	SiteId     int     `db:"site_id"`
	Name       string  `db:"name"`
	Descr      string  `db:"descr"`
	Make       string  `db:"make"`
	Model      string  `db:"model"`
	Serialnum  string  `db:"serialnum"`
	IsRunning  bool    `db:"is_running"`
	Status     string  `db:"status"`
	Stopped    *string `db:"stopped_at"`
	Started    *string `db:"started_at"`
	Alert      *string `db:"alert_at"`
	Picture    string  `db:"picture"`
	SiteName   *string `db:"site_name"`
	Notes      string  `db:"notes"`
	Components []*DBcomponent
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

func queryMachine(c *echo.Context) error {

	claim, err := securityCheck(c, "readMachine")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	sites := getClaimedSites(claim)

	var record []*DBmachine
	err = DB.SQL(`select m.*,s.name as site_name
		from machine m
		left join site s on (s.id=m.site_id)
		where site_id in $1
		order by lower(m.name)`, sites).QueryStructs(&record)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, record)
}

func queryMachineFull(c *echo.Context) error {

	claim, err := securityCheck(c, "readMachine")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	sites := getClaimedSites(claim)

	var record []*DBmachine
	err = DB.SQL(`select m.*,s.name as site_name
		from machine m
		left join site s on (s.id=m.site_id)
		where site_id in $1
		order by lower(m.name)`, sites).QueryStructs(&record)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}

	// For each machine, fetch all components
	for _, m := range record {

		err = DB.Select("*").
			From("component").
			Where("machine_id = $1", m.ID).
			OrderBy("position,zindex,lower(name)").
			QueryStructs(&m.Components)
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

	/*
		err = DB.SelectDoc("id", "site_id", "name", "descr", "make", "model", "serialnum",
			"is_running", "status", "picture", "notes",
			"to_char(started_at,'DD Mon YYYY HH24:MI:SS pm') as started_at",
			"to_char(stopped_at,'DD Mon YYYY HH24:MI:SS pm') as stopped_at",
			"to_char(alert_at,'DD Mon YYYY HH24:MI:SS pm') as alert_at").
			Many("events", `select type,ref_id,created_by,notes from event where type like 'Machine%' and ref_id=machine.id and completed is null`).
			One("site_name", `select name from site where id=machine.site_id`).
			From("machine").
			Where("id=$1", id).
			QueryStruct(&record)
	*/

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
	publishSocket("machine", record.ID)

	// insert into DB, fill in the ID of the new user
	return c.JSON(http.StatusCreated, record)
}

func saveMachine(c *echo.Context) error {

	claim, err := securityCheck(c, "writeMachine")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	machineID := getID(c)

	preRecord := &DBmachine{}
	postRecord := &DBmachine{}
	DB.Select("id", "site_id", "name", "descr", "make", "model", "serialnum", "picture", "status", "notes").
		From("machine").
		Where("id=$1", machineID).
		QueryStruct(preRecord)

	record := &DBmachineReq{}
	if err = c.Bind(record); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

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

	UID, Username := getClaimedUser(claim)
	evt := &DBevent{
		SiteId:    record.SiteId,
		Type:      fmt.Sprintf("%s", record.Status),
		MachineId: machineID,
		Status:    "Complete",
		ToolId:    0,
		Priority:  1,
		CreatedBy: UID,
		Notes:     fmt.Sprintf("Manually Updated by %s", Username),
	}

	addEvent := false

	// Calculate any deltas to the status
	// And we should also create an event to record the state change
	switch currentStatus {
	default:
		switch record.Status {
		case "Running":
			DB.SQL(`update machine set started_at=localtimestamp,is_running=true where id=$1`, machineID).Exec()
			// Set all components to running as well
			DB.SQL(`update component set status='Running',is_running=true where machine_id=$1`, machineID).Exec()
			addEvent = true
		case "Needs Attention", "Maintenance Pending":
			DB.SQL(`update machine set alert_at=localtimestamp,is_running=true where id=$1`, machineID).Exec()
			addEvent = true
		case "Stopped":
			DB.SQL(`update machine set stopped_at=localtimestamp,is_running=false where id=$1`, machineID).Exec()
			addEvent = true
		}
	case "Running":
		switch record.Status {
		case "Needs Attention", "Maintenance Pending":
			DB.SQL(`update machine set alert_at=localtimestamp,is_running=true where id=$1`, machineID).Exec()
			addEvent = true
		case "Stopped":
			DB.SQL(`update machine set stopped_at=localtimestamp,is_running=false where id=$1`, machineID).Exec()
			addEvent = true
		}
	case "Needs Attention", "Maintenance Pending":
		switch record.Status {
		case "Running":
			DB.SQL(`update machine set started_at=localtimestamp,is_running=true where id=$1`, machineID).Exec()
			// Set all components to running as well
			DB.SQL(`update component set status='Running',is_running=true where machine_id=$1`, machineID).Exec()
			addEvent = true
		case "Stopped":
			DB.SQL(`update machine set stopped_at=localtimestamp,is_running=false where id=$1`, machineID).Exec()
			addEvent = true
		}
	case "Stopped":
		switch record.Status {
		case "Running":
			DB.SQL(`update machine set started_at=localtimestamp,is_running=true where id=$1`, machineID).Exec()
			// Set all components to running as well
			DB.SQL(`update component set status='Running',is_running=true where machine_id=$1`, machineID).Exec()
			addEvent = true
		case "Needs Attention", "Maintenance Pending":
			DB.SQL(`update machine set alert_at=localtimestamp,is_running=true where id=$1`, machineID).Exec()
			addEvent = true
		}
	case "New":
		switch record.Status {
		case "Running":
			DB.SQL(`update machine set started_at=localtimestamp,is_running=true where id=$1`, machineID).Exec()
			// Set all components to running as well
			DB.SQL(`update component set status='Running',is_running=true where machine_id=$1`, machineID).Exec()
			addEvent = true
		case "Needs Attention", "Maintenance Pending":
			DB.SQL(`update machine set alert_at=localtimestamp,is_running=true where id=$1`, machineID).Exec()
			addEvent = true
		case "Stopped":
			DB.SQL(`update machine set stopped_at=localtimestamp,is_running=false where id=$1`, machineID).Exec()
			addEvent = true
		}
	}
	if record.Status == "New" {
		DB.SQL(`update machine set started_at=null,stopped_at=null,alert_at=null,is_running=false where id=$1`, machineID).Exec()
		addEvent = true
	}

	if addEvent {
		DB.InsertInto("event").
			Whitelist("site_id", "type", "machine_id", "priority", "created_by", "notes").
			Record(evt).
			Returning("id").
			QueryScalar(&evt.ID)
	}

	DB.Select("id", "site_id", "name", "descr", "make", "model", "serialnum", "picture", "status", "notes").
		From("machine").
		Where("id=$1", machineID).
		QueryStruct(postRecord)

	sysLogUpdate(1, "Machine", "M", machineID, "Updated", c, claim, *preRecord, *postRecord)
	publishSocket("machine", machineID)
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
	publishSocket("machine", id)

	return c.String(http.StatusOK, "Machine Deleted")
}

// Get a list of all tools / components for the given machine
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
		OrderBy("position,zindex,lower(name)").
		QueryStructs(&components)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, components)
}

type DBmachinePart struct {
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
	Qty               int     `db:"qty"`
	ToolName          string  `db:"tool_name"`
	ToolCode          string  `db:"tool_code"`
}

// Get a list of all parts for the given machine
func queryMachineParts(c *echo.Context) error {

	_, err := securityCheck(c, "readMachine")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	var parts []*DBmachinePart

	machineID := getID(c)
	err = DB.SQL(`
		select p.*,sum(xp.qty) as qty,c.name as tool_name,c.stock_code as tool_code
			from component c
			left join component_part xp on (xp.component_id=c.id)
			left join part p on (p.id=xp.part_id)
		where c.machine_id=$1 and p.id is not null
		group by p.id,c.name,c.stock_code,c.position
		order by c.position,p.stock_code`,
		machineID).
		QueryStructs(&parts)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, parts)
}

// Clear the machine - temp measure to use during testing
// TODO - remove this function later, when the actual workflow allows for the tool to be
// cleared through regular channels
func clearMachine(c *echo.Context) error {

	machineID, _ := strconv.Atoi(c.Param("id"))
	log.Println("Asked to clear machine !", machineID)

	DB.SQL(`update machine set status='Running',started_at=localtimestamp,is_running=true where id=$1`, machineID).Exec()
	DB.SQL(`update component set status='Running',is_running=true where machine_id=$1`, machineID).Exec()

	// Create audit records for the machine and the component ?

	publishSocket("machine", machineID)
	return c.String(http.StatusOK, "Machine Cleared")
}
