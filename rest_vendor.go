package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/labstack/echo"
)

///////////////////////////////////////////////////////////////////////
//       Generated By codegen from SQL table vendor
//        Vendor REST Functions

type DBvendor struct {
	ID           int    `db:"id"`
	Name         string `db:"name"`
	Descr        string `db:"descr"`
	Address      string `db:"address"`
	Phone        string `db:"phone"`
	Fax          string `db:"fax"`
	ContactName  string `db:"contact_name"`
	ContactEmail string `db:"contact_email"`
	OrdersEmail  string `db:"orders_email"`
	Rating       string `db:"rating"`
	Notes        string `db:"notes"`
}

type DBpartVendor struct {
	PartId      int     `db:"part_id"`
	VendorId    int     `db:"vendor_id"`
	VendorCode  string  `db:"vendor_code"`
	LatestPrice float64 `db:"latest_price"`
}

type DBvendorPrice struct {
	PartId   int     `db:"part_id"`
	VendorId int     `db:"vendor_id"`
	Datefrom string  `db:"datefrom"`
	Price    float64 `db:"price"`
	MinQty   float64 `db:"min_qty"`
	Notes    string  `db:"notes"`
}

// Get a list of vendors
func queryVendor(c echo.Context) error {

	_, err := securityCheck(c, "readVendor")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	var records []*DBvendor
	err = DB.
		Select("id", "name", "descr", "address", "phone", "fax", "contact_name", "contact_email", "orders_email", "rating", "notes").
		From("vendor").
		QueryStructs(&records)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, records)
}

type DBvendorParts struct {
	PartId      int     `db:"part_id"`
	Name        string  `db:"name"`
	Descr       string  `db:"descr"`
	StockCode   string  `db:"stock_code"`
	QtyType     string  `db:"qty_type"`
	VendorCode  string  `db:"vendor_code"`
	LatestPrice float64 `db:"latest_price"`
}

// Get a list of parts provided by this vendor
func queryVendorParts(c echo.Context) error {

	_, err := securityCheck(c, "readVendor")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)
	var records []*DBvendorParts
	err = DB.SQL(`
		select
		p.id as part_id, p.name as name, p.descr as descr, p.stock_code as stock_code,
		x.latest_price as latest_price, p.qty_type as qty_type, 
		x.vendor_code as vendor_code
		from part_vendor x
		left join part p on (p.id=x.part_id)
		where x.vendor_id=$1`,
		id).
		QueryStructs(&records)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, records)
}

// Get a specific vendor
func getVendor(c echo.Context) error {

	_, err := securityCheck(c, "readVendor")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)
	var record DBvendor
	err = DB.
		Select("id", "name", "descr", "address", "phone", "fax", "contact_name", "contact_email", "orders_email", "rating", "notes").
		From("vendor").
		Where("id = $1", id).
		QueryStruct(&record)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, record)
}

type NewItemPrice struct {
	PartID     int
	NewPrice   float64
	MinQty     float64
	VendorCode string
}

type NewPriceList struct {
	VendorID      int
	NewPriceArray []NewItemPrice
}

// Receive a new PriceList from the front end, and dynamically
// Create the XRef records from vendor to part
func newVendorPrices(c echo.Context) error {

	claim, err := securityCheck(c, "writeVendor")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)
	log.Println("State param of", id)

	// Bind the input params to our structure
	record := &NewPriceList{}
	if err := c.Bind(record); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	// place
	partVendor := &DBpartVendor{}
	vendorPrice := &DBvendorPrice{}

	for k, v := range record.NewPriceArray {
		log.Println("Item", k, "Part ID:", v.PartID, "Price:", v.NewPrice, "Qty:", v.MinQty, "Code:", v.VendorCode)

		// Update or Insert part_vendor
		partVendor.PartId = v.PartID
		partVendor.VendorId = id
		partVendor.VendorCode = v.VendorCode
		partVendor.LatestPrice = v.NewPrice
		_, err := DB.
			Upsert("part_vendor").
			Columns("part_id", "vendor_id", "vendor_code", "latest_price").
			Record(partVendor).
			Where("part_id=$1 and vendor_id=$2", v.PartID, id).
			Exec()
		if err != nil {
			log.Println("PartVendor:", err.Error())
		}

		// Create a new vendor_price record
		vendorPrice.VendorId = id
		vendorPrice.PartId = v.PartID
		vendorPrice.Price = v.NewPrice
		vendorPrice.MinQty = v.MinQty
		_, err = DB.
			InsertInto("vendor_price").
			Whitelist("vendor_id", "part_id", "price", "min_qty").
			Record(vendorPrice).
			Exec()

		if err != nil {
			log.Println("VendorPrice:", err.Error())
		}

		// Update the part to have a new 'latest price'
		_, err = DB.SQL(`update part set latest_price=$1 where id=$2`, v.NewPrice, v.PartID).Exec()
		if err != nil {
			log.Println("Part:", err.Error())
		}

		// Now log the creation of the new price
		sysLog(1, "Vendor", "p", id, fmt.Sprintf("New Price $%0.2f for part %d", v.NewPrice, v.PartID), c, claim)
	}

	return c.String(http.StatusCreated, "Added Prices")
}

// Create a new vendor
func newVendor(c echo.Context) error {

	claim, err := securityCheck(c, "writeVendor")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	record := &DBvendor{}
	if err := c.Bind(record); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	err = DB.InsertInto("vendor").
		Whitelist("name", "descr", "address", "phone", "fax", "contact_name", "contact_email", "orders_email", "rating", "notes").
		Record(record).
		Returning("id").
		QueryScalar(&record.ID)

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	// Now log the creation of the new vendor
	sysLog(1, "Vendor", "V", record.ID, "Vendor Created", c, claim)

	// insert into DB, fill in the ID of the new vendor
	return c.JSON(http.StatusCreated, record)
}

// Update an existing vendor
func saveVendor(c echo.Context) error {

	claim, err := securityCheck(c, "writeVendor")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)

	preRecord := &DBvendor{}
	DB.Select("id", "name", "descr", "address", "phone", "fax", "contact_name", "contact_email", "orders_email", "rating", "notes").
		From("vendor").
		Where("id=$1", id).
		QueryStruct(preRecord)

	record := &DBvendor{}
	if err = c.Bind(record); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	_, err = DB.Update("vendor").
		SetWhitelist(record, "name", "descr", "address", "phone", "fax", "contact_name", "contact_email", "orders_email", "rating", "notes").
		Where("id = $1", id).
		Exec()

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	sysLogUpdate(1, "Vendor", "V", id, "Updated", c, claim, *preRecord, *record)
	return c.JSON(http.StatusOK, id)
}

// Delete an existing vendor
func deleteVendor(c echo.Context) error {

	claim, err := securityCheck(c, "writeVendor")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)
	_, err = DB.
		DeleteFrom("vendor").
		Where("id = $1", id).
		Exec()

	if err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	DB.SQL(`delete from part_vendor where vendor_id=$1`, id)
	DB.SQL(`delete from vendor_price where vendor_id=$1`, id)

	sysLog(3, "Vendor", "V", id, "Vendor Deleted", c, claim)

	return c.String(http.StatusOK, "Vendor Deleted")
}
