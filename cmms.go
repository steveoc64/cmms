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

	"github.com/facebookgo/grace/gracehttp"
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

	// Define all the Routes
	e = echo.New()

	// e.Group("html/*", middleware.Static("build/html"))
	// e.Group("img/*", middleware.Static("build/img"))
	// e.Group("fonts/*", middleware.Static("build/fonts"))
	// e.Group("css/*", middleware.Static("build/css"))
	// e.Group("js/*", middleware.Static("build/js"))
	// e.Use(middleware.Static("build"))
	// e.Index("./build/index.html")
	// e.ServeDir("/", "./build")

	_initRoutes()
	e.Static("/", "build")
	// e.File("/", "build/index.html")

	// e.Use(fasthttp.WrapHandler(middleware.Logger()))
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.Gzip())
	if Config.Debug {
		e.SetDebug(true)
	}

	echocors.Init(e, Config.Debug)

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
	std := standard.New(fmt.Sprintf(":%d", Config.WebPort))
	std.SetHandler(e)
	gracehttp.Serve(std.Server)
}

func pinger() {
	ticker := time.NewTicker(time.Second * 50) // just under the 1 min mark for nginx default timeouts
	for range ticker.C {
		pingSockets()
	}
}
