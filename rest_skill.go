package main

import (
	"github.com/labstack/echo"
	//	"gopkg.in/mgutz/dat.v1"
	"net/http"
)

///////////////////////////////////////////////////////////////////////
// Skills Maintenance
/*
create table skill (
	id serial not null primary key,
	name text not null
);

*/

type DBskill struct {
	ID    int    `db:"id"`
	Name  string `db:"name"`
	Notes string `db:"notes"`
}

func querySkills(c *echo.Context) error {

	_, err := securityCheck(c, "readSkill")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	var record []*DBskill
	err = DB.SQL(`select * from skill order by lower(name)`).QueryStructs(&record)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, record)
}

func getSkill(c *echo.Context) error {

	_, err := securityCheck(c, "readSkill")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)
	var record DBskill
	err = DB.SQL(`select * from skill where id=$1`, id).QueryStruct(&record)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, record)
}

func newSkill(c *echo.Context) error {

	claim, err := securityCheck(c, "writeSkill")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	record := &DBskill{}
	if err := c.Bind(record); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	err = DB.InsertInto("skill").
		Whitelist("name").
		Record(record).
		Returning("id").
		QueryScalar(&record.ID)

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	// Now log the creation of the new site
	sysLog(1, "Skills", "s", record.ID, "Skill Created", c, claim)

	// insert into DB, fill in the ID of the new user
	return c.JSON(http.StatusCreated, record)
}

func saveSkill(c *echo.Context) error {

	claim, err := securityCheck(c, "writeSkill")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	skillID := getID(c)

	preRecord := &DBskill{}
	DB.Select("id", "name", "notes").
		From("skill").
		Where("id=$1", skillID).
		QueryStruct(preRecord)

	record := &DBskill{}
	if err = c.Bind(record); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	_, err = DB.Update("skill").
		SetWhitelist(record, "name", "notes").
		Where("id = $1", skillID).
		Exec()

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	sysLogUpdate(1, "Skills", "s", skillID, "Updated", c, claim, *preRecord, *record)
	return c.JSON(http.StatusOK, skillID)
}

func deleteSkill(c *echo.Context) error {

	claim, err := securityCheck(c, "writeSkill")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)
	_, err = DB.
		DeleteFrom("skill").
		Where("id = $1", id).
		Exec()

	if err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	// Now delete the user_skill references
	DB.DeleteFrom("user_skill").Where("skill_id=$1", id).Exec()

	sysLog(3, "Skills", "s", id, "Skill Deleted", c, claim)

	return c.String(http.StatusOK, "Skill Deleted")
}
