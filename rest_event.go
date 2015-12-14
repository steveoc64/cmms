package main

import (
	"fmt"
	"github.com/labstack/echo"
	"gopkg.in/mgutz/dat.v1"
	"log"
	"net/http"
	"strconv"
)

///////////////////////////////////////////////////////////////////////
//       Generated By codegen from SQL table event
//        Event REST Functions

type DBevent struct {
	ID           int          `db:"id"`
	SiteId       int          `db:"site_id"`
	Type         string       `db:"type"`
	RefId        int          `db:"ref_id"`
	Priority     int          `db:"priority"`
	Startdate    dat.NullTime `db:"startdate"`
	ParentEvent  int          `db:"parent_event"`
	CreatedBy    int          `db:"created_by"`
	AllocatedBy  int          `db:"allocated_by"`
	AllocatedTo  int          `db:"allocated_to"`
	Completed    dat.NullTime `db:"completed"`
	LabourCost   float64      `db:"labour_cost"`
	MaterialCost float64      `db:"material_cost"`
	OtherCost    float64      `db:"other_cost"`
	Notes        string       `db:"notes"`
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
		Type:      fmt.Sprintf("Machine: %s", req.Action),
		RefId:     machineId,
		Priority:  1,
		CreatedBy: UID,
		Notes:     req.Descr,
	}
	DB.InsertInto("event").
		Whitelist("site_id", "type", "ref_id", "priority", "created_by", "notes").
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
	return c.String(http.StatusOK, "Event Raised on the Machine")
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

	// Create 2 event records
	evt := &DBevent{
		SiteId:    siteId,
		Type:      fmt.Sprintf("Tool: %s", req.Action),
		RefId:     toolId,
		Priority:  1,
		CreatedBy: UID,
		Notes:     req.Descr,
	}
	DB.InsertInto("event").
		Whitelist("site_id", "type", "ref_id", "priority", "created_by", "notes").
		Record(evt).
		Returning("id").
		QueryScalar(&evt.ID)

	evt.RefId = machineId
	evt.Type = fmt.Sprintf("Machine: %s", req.Action)
	evt.Notes = fmt.Sprintf("%s on Tool %s", req.Action, toolName)
	DB.InsertInto("event").
		Whitelist("site_id", "type", "ref_id", "priority", "created_by", "notes").
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

	log.Println("Raising Tool Event", evt.ID, evt, "User:", Username)
	return c.String(http.StatusOK, "Event Raised on the Tool & Machine")
}