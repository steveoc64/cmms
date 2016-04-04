package main

import (
	"fmt"
	"log"
	"time"

	"github.com/labstack/echo"
	"github.com/labstack/echo/engine/standard"
	"github.com/labstack/echo/middleware"
	_ "github.com/lib/pq"
	"github.com/steveoc64/godev/echocors"
)

var e *echo.Echo

func main() {

	_initSMT()
	_loadConfig()
	_initJWT()

	// Make sure the SMS stuff is all working before we go too far
	if Config.SMSOn {
		smsbal, smserr := GetSMSBalance()
		if smserr != nil {
			log.Fatal("Cannot retrieve SMS account info", smserr.Error())
		}
		log.Println("... Remaining SMS Balance =", smsbal)
	}

	// DefaultStaticConfig = StaticConfig{
	//   Root:   "",
	//   Index:  []string{"index.html"},
	//   Browse: false,
	// }
	e = echo.New()
	e.Use(middleware.Static("build"))
	e.Group("html/*", middleware.Static("build"))
	e.Group("img/*", middleware.Static("build"))
	e.Group("fonts/*", middleware.Static("build"))
	e.Group("css/*", middleware.Static("build"))
	e.Group("js/*", middleware.Static("build"))
	// e.Index("./build/index.html")
	// e.ServeDir("/", "./build")

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.Gzip())
	if Config.Debug {
		e.SetDebug(true)
	}

	echocors.Init(e, Config.Debug)

	// Define all the Routes
	_initRoutes()

	// Connect to the DB
	_initDB()

	// Start the mail server
	// _initMailer(fmt.Sprintf("Remaining SMS Balance = %d", smsbal))
	_initMailer("mailer")

	// Start the socket monitor
	// go pinger()

	// Start the web server
	if Config.Debug {
		log.Printf("... Starting Web Server on port %d", Config.WebPort)
	}
	e.Run(standard.New(fmt.Sprintf(":%d", Config.WebPort)))
}

func pinger() {
	ticker := time.NewTicker(time.Second * 50) // just under the 1 min mark for nginx default timeouts
	for range ticker.C {
		pingSockets()
	}
}
