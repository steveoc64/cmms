package main

import (
	"fmt"
	"github.com/labstack/echo"
	mw "github.com/labstack/echo/middleware"
	_ "github.com/lib/pq"
	"github.com/rs/cors"
	"log"
	"time"
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

	e = echo.New()
	e.Index("./build/index.html")
	e.ServeDir("/", "./build")

	e.Use(mw.Logger())
	e.Use(mw.Recover())
	e.Use(mw.Gzip())
	if Config.Debug {
		e.SetDebug(true)
	}

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "DELETE", "PUT", "PATCH"},
		AllowCredentials: true,
		Debug:            Config.Debug,
	})
	e.Use(c.Handler)

	// Define all the Routes
	_initRoutes()

	// Connect to the DB
	_initDB()

	// Start the mail server
	// _initMailer(fmt.Sprintf("Remaining SMS Balance = %d", smsbal))
	_initMailer("mailer")

	// Start the socket monitor
	go pinger()

	// Start the web server
	if Config.Debug {
		log.Printf("... Starting Web Server on port %d", Config.WebPort)
	}
	e.Run(fmt.Sprintf(":%d", Config.WebPort))
}

func pinger() {
	ticker := time.NewTicker(time.Second * 50) // just under the 1 min mark for nginx default timeouts
	for range ticker.C {
		pingSockets()
	}
}
