package main

import (
	"github.com/labstack/echo"
	"net/http"
)

///////////////////////////////////////////////////////////////////////
// Component Maintenance

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

func saveComponent(c *echo.Context) error {

	claim, err := securityCheck(c, "writePart")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	record := &DBcomponent{}
	if err = c.Bind(record); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	componentID := getID(c)
	_, err = DB.Update("component").
		SetWhitelist(record, "name", "position", "site_id", "descr", "make", "model", "qty", "stock_code", "serialnum").
		Where("id = $1", componentID).
		Exec()

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	sysLog(1, "Tools", "T", componentID, "Updated", c, claim)
	return c.JSON(http.StatusOK, componentID)
}

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
