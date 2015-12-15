package main

import (
	"github.com/labstack/echo"
	"net/http"
)

///////////////////////////////////////////////////////////////////////
// Component Maintenance

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

// Get a list of all tools
func queryComponents(c *echo.Context) error {

	_, err := securityCheck(c, "readPart")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	var record []*DBcomponent
	err = DB.SQL(`select c.*,s.name as site_name,m.name as machine_name
		from component c
		left join site s on (s.id=c.site_id)
		left join machine m on (m.id=c.machine_id)
		order by lower(c.stock_code)`).QueryStructs(&record)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, record)
}

// Get a list of parts used by this tool
func queryComponentParts(c *echo.Context) error {

	_, err := securityCheck(c, "readPart")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	var cp []*DBpartComponents

	partID := getID(c)
	err = DB.SQL(`select 
		x.component_id,x.qty,p.stock_code,p.name,p.id as part_id
		from component_part x
		left join part p on (p.id=x.part_id)
		where x.component_id=$1`, partID).QueryStructs(&cp)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, cp)
}

// Get a specific tool
func getComponent(c *echo.Context) error {

	_, err := securityCheck(c, "readPart")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)
	var record DBcomponent
	err = DB.SQL(`select c.*,m.name as machine_name,s.name as site_name
	 from component c
	 left join site s on (s.id=c.site_id)
	 left join machine m on (m.id=c.machine_id)
	 where c.id=$1`, id).QueryStruct(&record)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, record)
}

// Get the machine associated with this tool
func getComponentMachine(c *echo.Context) error {

	_, err := securityCheck(c, "readMachine")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)
	var record DBmachine
	err = DB.SQL(`select m.*	 
	 from component c
	 left join machine m on (m.id=c.machine_id)
	 where c.id=$1`, id).QueryStruct(&record)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, record)
}

// create a new tool
func newComponent(c *echo.Context) error {

	claim, err := securityCheck(c, "writePart")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	record := &DBcomponent{}
	if err := c.Bind(record); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	err = DB.InsertInto("component").
		Whitelist("machine_id", "position", "site_id", "name", "descr", "make", "model", "stock_code", "serialnum").
		Record(record).
		Returning("id").
		QueryScalar(&record.ID)

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	// Now log the creation of the new site
	sysLog(1, "Tools", "T", record.ID, "Tool Created", c, claim)

	// insert into DB, fill in the ID of the new user
	return c.JSON(http.StatusCreated, record)
}

// Update an existing tool
func saveComponent(c *echo.Context) error {

	claim, err := securityCheck(c, "writePart")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	componentID := getID(c)

	preRecord := &DBcomponent{}

	DB.SQL(`
		select 
		c.id,c.name,c.position,c.site_id,c.descr,c.make,c.model,c.qty,c.stock_code,c.serialnum,c.machine_id,s.name as site_name,m.name as machine_name
		from component c
		left join machine m on (m.id=c.machine_id)
		left join site s on (s.id=c.site_id)
		where c.id=$1`, componentID).
		QueryStruct(preRecord)

	record := &DBcomponent{}
	if err = c.Bind(record); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	_, err = DB.Update("component").
		SetWhitelist(record, "name", "position", "site_id", "descr", "make", "model", "qty", "stock_code", "serialnum").
		Where("id = $1", componentID).
		Exec()

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	sysLogUpdate(1, "Tools", "T", componentID, "Updated", c, claim, *preRecord, *record)
	return c.JSON(http.StatusOK, componentID)
}

// Delete and existing tool
func deleteComponent(c *echo.Context) error {

	claim, err := securityCheck(c, "writePart")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)
	_, err = DB.
		DeleteFrom("component").
		Where("id = $1", id).
		Exec()

	if err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	// Now delete the part references
	DB.DeleteFrom("component_part").Where("component_id=$1", id).Exec()

	sysLog(3, "Tools", "T", id, "Tool Deleted", c, claim)

	return c.String(http.StatusOK, "Component Deleted")
}
