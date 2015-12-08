package main

import (
	"github.com/labstack/echo"
	"gopkg.in/mgutz/dat.v1"
	"net/http"
)

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

	DB.Select("id", "site_id", "name", "descr", "make", "model", "serialnum", "picture", "status", "notes").
		From("machine").
		Where("id=$1", machineID).
		QueryStruct(postRecord)

	sysLogUpdate(1, "Machine", "M", machineID, "Updated", c, claim, *preRecord, *postRecord)

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
		OrderBy("position,lower(name)").
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
