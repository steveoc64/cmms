package main

import (
	"github.com/labstack/echo"
	//	"gopkg.in/mgutz/dat.v1"
	"net/http"
)

///////////////////////////////////////////////////////////////////////
// Parts Maintenance
/*

create table part (
	id serial not null primary key,
	name text not null,
	descr text not null,
	stock_code text not null,
	reorder_stocklevel numeric(12,2) not null,
	reorder_qty numeric(12,2) not null,
	latest_price numeric(12,2) not null,
	qty_type text not null,
	picture text not null
);

*/

type DBpart struct {
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
}

type DBpartComponents struct {
	ComponentID int     `db:"component_id"`
	PartID      int     `db:"part_id"`
	Qty         int     `db:"qty"`
	StockCode   *string `db:"stock_code"` // component stock code and name
	Name        *string `db:"name"`
	MachineName string  `db:"machine_name"`
	SiteName    string  `db:"site_name"`
	MachineID   int     `db:"machine_id"`
	SiteID      int     `db:"site_id"`
}

type DBpartVendors struct {
	VendorId    int     `db:"vendor_id"`
	Name        string  `db:"name"`
	Descr       string  `db:"descr"`
	Address     string  `db:"address"`
	VendorCode  string  `db:"vendor_code"`
	LatestPrice float64 `db:"latest_price"`
}

// Get a list of all parts
func queryParts(c *echo.Context) error {

	_, err := securityCheck(c, "readPart")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	var record []*DBpart
	err = DB.SQL(`select * from part order by lower(stock_code)`).QueryStructs(&record)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, record)
}

// Get a list of components / tools that use this part
func queryPartComponents(c *echo.Context) error {

	claim, err := securityCheck(c, "readPart")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	Sites := getClaimedSites(claim)

	var cp []*DBpartComponents

	partID := getID(c)
	err = DB.SQL(`select 
		x.component_id,x.qty,c.stock_code,c.name,
		m.name as machine_name,m.id as machine_id,
		s.name as site_name,s.id as site_id
		from component_part x
		left join component c on (c.id=x.component_id)
		left join machine m on (m.id=c.machine_id)
		left join site s on (s.id=c.site_id)
		where x.part_id=$1
		and c.site_id in $2`,
		partID, Sites).QueryStructs(&cp)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, cp)
}

// Get a list of vendors that supply this part
func queryPartVendors(c *echo.Context) error {

	_, err := securityCheck(c, "readPart")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	var records []*DBpartVendors

	partID := getID(c)
	err = DB.SQL(`
		select
		v.id as vendor_id, v.name as name, v.descr as descr, v.address as address,
		x.latest_price as latest_price, 
		x.vendor_code as vendor_code
		from part_vendor x
		left join vendor v on (v.id=x.vendor_id)
		where x.part_id=$1`,
		partID).
		QueryStructs(&records)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, records)
}

// Get a specific part
func getPart(c *echo.Context) error {

	_, err := securityCheck(c, "readPart")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)
	var record DBpart
	err = DB.SQL(`select * from part where id=$1`, id).QueryStruct(&record)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, record)
}

// Create a new part
func newPart(c *echo.Context) error {

	claim, err := securityCheck(c, "writePart")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	record := &DBpart{}
	if err := c.Bind(record); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	err = DB.InsertInto("part").
		Whitelist("name", "descr", "stock_code", "reorder_stocklevel", "reorder_qty", "latest_price", "qty_type").
		Record(record).
		Returning("id").
		QueryScalar(&record.ID)

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	// Now log the creation of the new site
	sysLog(1, "Parts", "P", record.ID, "Part Created", c, claim)

	// insert into DB, fill in the ID of the new user
	return c.JSON(http.StatusCreated, record)
}

// Update an existing part
func savePart(c *echo.Context) error {

	claim, err := securityCheck(c, "writePart")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	partID := getID(c)

	preRecord := &DBpart{}
	DB.Select("id", "name", "descr", "stock_code", "reorder_stocklevel", "reorder_qty", "latest_price", "qty_type", "notes").
		From("part").
		Where("id=$1", partID).
		QueryStruct(preRecord)

	record := &DBpart{}
	if err = c.Bind(record); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	_, err = DB.Update("part").
		SetWhitelist(record, "name", "descr", "stock_code", "reorder_stocklevel", "reorder_qty", "latest_price", "qty_type", "notes").
		Where("id = $1", partID).
		Exec()

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	sysLogUpdate(1, "Parts", "P", partID, "Updated", c, claim, *preRecord, *record)
	return c.JSON(http.StatusOK, partID)
}

// Delete an existing part
func deletePart(c *echo.Context) error {

	claim, err := securityCheck(c, "writePart")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)
	_, err = DB.
		DeleteFrom("part").
		Where("id = $1", id).
		Exec()

	if err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	// Clean up vendor parts, comp parts
	DB.SQL(`delete from component_part where part_id=$1`, id).Exec()
	DB.SQL(`delete from part_vendor where part_id=$1`, id).Exec()
	DB.SQL(`delete from vendor_price where part_id=$1`, id).Exec()
	DB.SQL(`delete from stock_level where part_id=$1`, id).Exec()

	sysLog(3, "Parts", "P", id, "Part Deleted", c, claim)

	return c.String(http.StatusOK, "Part Deleted")
}
