package main

import (
	"github.com/labstack/echo"
	"log"
	"net/http"
)

///////////////////////////////////////////////////////////////////////
// Sites Maintenance
/*
create table site (
	id serial not null primary key,
	name text not null default '',
	address text not null default '',
	phone text not null default '',
	fax text not null,
	image text not null
);
*/

type DBsite struct {
	ID             int     `db:"id"`
	Name           string  `db:"name"`
	Address        string  `db:"address"`
	Phone          string  `db:"phone"`
	Fax            string  `db:"fax"`
	Image          string  `db:"image"`
	ParentSite     int     `db:"parent_site"`
	ParentSiteName *string `db:"parent_site_name"`
	StockSite      int     `db:"stock_site"`
	StockSiteName  *string `db:"stock_site_name"`
	Notes          string  `db:"notes"`
}

// Return a slice, that contains This SiteID, and all child SiteIDs that have this site as a parent
func getRelatedSites(siteID int) []int {

	var relatedSites []int
	DB.SQL(`select id from site where parent_site=$1`, siteID).QuerySlice(&relatedSites)
	relatedSites = append(relatedSites, siteID)
	return relatedSites
}

// Get a list of all sites, limited to the sites that this user can see !
func querySites(c *echo.Context) error {

	claim, err := securityCheck(c, "readSite")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	Sites := getClaimedSites(claim)
	log.Println("==============", Sites)

	var record []*DBsite
	err = DB.SQL(`select s.*,p.name as parent_site_name,t.name as stock_site_name
		from site s
		left join site p on (p.id=s.parent_site)
		left join site t on (t.id=s.stock_site)
		where s.id in $1
		order by lower(s.name)`, Sites).QueryStructs(&record)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, record)
}

// Get a list of sites that this site supplies
func querySiteSupplies(c *echo.Context) error {

	_, err := securityCheck(c, "readSite")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	siteID := getID(c)

	var record []*DBsite
	err = DB.SQL(`select s.*,p.name as parent_site_name,t.name as stock_site_name
		from site s
		left join site p on (p.id=s.parent_site)
		left join site t on (t.id=s.stock_site)
		where s.stock_site=$1
		order by lower(s.name)`, siteID).QueryStructs(&record)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, record)
}

func querySiteUsers(c *echo.Context) error {

	_, err := securityCheck(c, "readUser")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	siteID := getID(c)

	var users []*DBusers
	//		SQL(`select *,array(select concat(logdate,ip,descr) from user_log where user_id=users.id order by logdate desc) as logs from users`).

	err = DB.SQL(`select 
		u.* from user_site s
		left join users u on u.id = s.user_id
		where s.site_id=$1
		order by lower(username)`, siteID).
		QueryStructs(&users)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, users)
}

func getSite(c *echo.Context) error {

	_, err := securityCheck(c, "readSite")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)
	var record DBsite
	err = DB.SQL(`select s.*,p.name as parent_site_name,t.name as stock_site_name
		from site s 
		left join site p on (p.id=s.parent_site)
		left join site t on (t.id=s.stock_site)
		where s.id=$1`, id).QueryStruct(&record)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, record)
}

func newSite(c *echo.Context) error {

	claim, err := securityCheck(c, "writeSite")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	record := &DBsite{}
	if err := c.Bind(record); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	err = DB.InsertInto("site").
		Whitelist("name", "address", "phone", "fax", "parent_site", "stock_site").
		Record(record).
		Returning("id").
		QueryScalar(&record.ID)

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	// Now log the creation of the new site
	sysLog(1, "Sites", "S", record.ID, "Site Created", c, claim)

	// insert into DB, fill in the ID of the new user
	return c.JSON(http.StatusCreated, record)
}

func saveSite(c *echo.Context) error {

	claim, err := securityCheck(c, "writeSite")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	record := &DBsite{}
	if err = c.Bind(record); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	siteID := getID(c)

	preRecord := &DBsite{}
	DB.Select("id", "name", "address", "phone", "fax", "image", "parent_site", "stock_site", "notes").
		From("site").
		Where("id = $1", siteID).
		QueryStruct(preRecord)

	_, err = DB.Update("site").
		SetWhitelist(record, "name", "address", "phone", "fax", "image", "parent_site", "stock_site", "notes").
		Where("id = $1", siteID).
		Exec()

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	sysLogUpdate(1, "Sites", "S", siteID, "Updated", c, claim, *preRecord, *record)
	return c.JSON(http.StatusOK, siteID)
}

func deleteSite(c *echo.Context) error {

	claim, err := securityCheck(c, "writeSite")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)
	_, err = DB.
		DeleteFrom("site").
		Where("id = $1", id).
		Exec()

	if err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	// Now delete the user_site references
	DB.DeleteFrom("user_site").Where("site_id=$1", id).Exec()

	sysLog(3, "Sites", "S", id, "Site Deleted", c, claim)

	return c.String(http.StatusOK, "Site Deleted")
}
