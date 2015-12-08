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
	Qty               int     `db:"qty"`
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

func queryPartComponents(c *echo.Context) error {

	_, err := securityCheck(c, "readPart")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

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
		where x.part_id=$1`, partID).QueryStructs(&cp)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, cp)
}

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

	sysLog(3, "Parts", "P", id, "Part Deleted", c, claim)

	return c.String(http.StatusOK, "Part Deleted")
}
