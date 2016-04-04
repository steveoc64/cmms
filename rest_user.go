package main

import (
	"github.com/labstack/echo"
	//	"gopkg.in/mgutz/dat.v1"
	"fmt"
	"log"
	"net/http"
)

/////////////////////////////////////////////////////////////////////////////////////////////////
// User Functions

/*
	e.Get("/users", queryUsers)
	e.Get("/users/:id", getUser)
	e.Post("/users/:id", newUser)
	e.Patch("/users/:id", saveUser)
	e.Delete("/users/:id", deleteUser)
*/

type DBusers struct {
	ID       int        `db:"id",json:"number"`
	Username string     `db:"username"`
	Passwd   string     `db:"passwd"`
	Name     string     `db:"name"`
	Email    string     `db:"email"`
	Address  string     `db:"address"`
	SMS      string     `db:"sms"`
	SiteId   int        `db:"site_id"`
	SiteName *string    `db."sitename"`
	Role     string     `db:"role"`
	Sites    []*DBsite  `db:"sites"`
	Skills   []*DBskill `db:"skills"`
	Notes    string     `db:"notes"`
}

type DBuserlog struct {
	Type     string  `db:"type"`
	RefID    int     `db:"ref_id"`
	Username *string `db:"username"`
	Logdate  string  `db:"logdate"`
	IP       string  `db:"ip"`
	Descr    *string `db:"descr"`
}

type DBuserSite struct {
	UserID int    `db:"user_id"`
	SiteID int    `db:"site_id"`
	Role   string `db:"role"`
}

type DBuserSkill struct {
	UserID  int `db:"user_id"`
	SkillID int `db:"skill_id"`
}

func queryUsers(c echo.Context) error {

	_, err := securityCheck(c, "readUser")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	var users []*DBusers
	//		SQL(`select *,array(select concat(logdate,ip,descr) from user_log where user_id=users.id order by logdate desc) as logs from users`).

	err = DB.SQL(`select 
		users.*,site.name as sitename
		from users 
		left join site on site.id=users.site_id
		order by lower(username)`).
		QueryStructs(&users)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, users)
}

func queryUsersWithSkill(c echo.Context) error {

	_, err := securityCheck(c, "readUser")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	var users []*DBusers
	//		SQL(`select *,array(select concat(logdate,ip,descr) from user_log where user_id=users.id order by logdate desc) as logs from users`).

	skillID := getID(c)
	err = DB.SQL(`select 
		u.*,t.name as sitename from user_skill s
		left join users u on u.id = s.user_id
		left join site t on t.id = u.site_id
		where s.skill_id=$1
		order by lower(username)`, skillID).
		QueryStructs(&users)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}
	return c.JSON(http.StatusOK, users)
}

func getUser(c echo.Context) error {

	_, err := securityCheck(c, "readUser")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)
	var user DBusers
	err = DB.SQL(`select * from users where id=$1`, id).QueryStruct(&user)

	if err != nil {
		return c.String(http.StatusNoContent, err.Error())
	}

	// Fill in the sites for the user
	DB.SQL(`select 
		s.* 
		from user_site u
		left join site s on s.id=u.site_id 
		where u.user_id=$1`, id).
		QueryStructs(&user.Sites)

	// Fill in the skills for the user
	DB.SQL(`select 
		s.* 
		from user_skill u
		left join skill s on s.id=u.skill_id 
		where u.user_id=$1`, id).
		QueryStructs(&user.Skills)

	// Fill in the site name
	DB.SQL(`select 
		name as sitename from site 
		where id=$1`, user.SiteId).
		QueryScalar(&user.SiteName)

	return c.JSON(http.StatusOK, user)
}

func newUser(c echo.Context) error {

	claim, err := securityCheck(c, "writeUser")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	record := &DBusers{}
	if err := c.Bind(record); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	if len(record.Sites) > 0 {
		record.SiteId = record.Sites[0].ID
	} else {
		record.SiteId = 0
	}

	err = DB.InsertInto("users").
		Whitelist("username", "passwd", "address", "name", "email", "role", "sms", "site_id").
		Record(record).
		Returning("id").
		QueryScalar(&record.ID)

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	// Now create the user_site records
	for _, addSite := range record.Sites {
		userSite := &DBuserSite{
			UserID: record.ID,
			SiteID: addSite.ID,
			Role:   record.Role,
		}
		_, xe := DB.InsertInto("user_site").
			Whitelist("user_id", "site_id", "role").
			Record(userSite).
			Exec()
		if xe != nil {
			log.Println("ERROR inserting user_site", xe.Error())
		}
	}

	// Now create the user_skill recordsd
	for _, addSkill := range record.Skills {
		userSkill := &DBuserSkill{
			UserID:  record.ID,
			SkillID: addSkill.ID,
		}
		_, xe := DB.InsertInto("user_skill").Whitelist("user_id", "skill_id").Record(userSkill).Exec()
		if xe != nil {
			log.Println("ERROR inserting user_skill", xe.Error())
		}
	}

	// Now log the creation of the new user
	sysLog(1, "Users", "U", record.ID, fmt.Sprintf("Account Created - %s", record.Username), c, claim)

	// insert into DB, fill in the ID of the new user
	return c.JSON(http.StatusCreated, record)
}

func saveUser(c echo.Context) error {

	claim, err := securityCheck(c, "writeUser")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	userID := getID(c)

	preRecord := &DBusers{}
	DB.Select("id", "username", "name", "passwd", "email", "address", "sms", "role", "site_id", "notes").
		From("users").
		Where("id=$1", userID).
		QueryStruct(preRecord)

	record := &DBusers{}
	if err = c.Bind(record); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	// Get the first site from the list of sites added
	if len(record.Sites) > 0 {
		record.SiteId = record.Sites[0].ID
	} else {
		record.SiteId = 0
	}

	_, err = DB.Update("users").
		Set("username", record.Username).
		Set("name", record.Name).
		Set("passwd", record.Passwd).
		Set("email", record.Email).
		Set("address", record.Address).
		Set("sms", record.SMS).
		Set("role", record.Role).
		Set("site_id", record.SiteId).
		Set("notes", record.Notes).
		Where("id = $1", userID).
		Exec()

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	// Now create the user_site records
	DB.DeleteFrom("user_site").Where("user_id=$1", userID).Exec()

	for _, addSite := range record.Sites {
		userSite := &DBuserSite{
			UserID: userID,
			SiteID: addSite.ID,
			Role:   record.Role,
		}
		DB.InsertInto("user_site").
			Whitelist("user_id", "site_id", "role").
			Record(userSite).
			Exec()
	}

	// Now create the user_skill recordsd
	DB.DeleteFrom("user_skill").Where("user_id=$1", userID).Exec()
	for _, addSkill := range record.Skills {
		userSkill := &DBuserSkill{
			UserID:  userID,
			SkillID: addSkill.ID,
		}
		DB.InsertInto("user_skill").Whitelist("user_id", "skill_id").Record(userSkill).Exec()
	}

	sysLogUpdate(1, "Users", "U", userID, "User Updated", c, claim, *preRecord, *record)
	return c.JSON(http.StatusOK, record)
}

func deleteUser(c echo.Context) error {

	claim, err := securityCheck(c, "writeUser")
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	id := getID(c)
	_, err = DB.
		DeleteFrom("users").
		Where("id = $1", id).
		Exec()

	if err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	// Now delete the user_site and user_skill references
	DB.DeleteFrom("user_site").Where("user_id=$1", id).Exec()
	DB.DeleteFrom("user_skill").Where("user_id=$1", id).Exec()

	sysLog(3, "Users", "U", id, "User Deleted", c, claim)

	return c.String(http.StatusOK, "User Deleted")
}
