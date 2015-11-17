package main

import (
	"github.com/labstack/echo"
	mw "github.com/labstack/echo/middleware"
	_ "github.com/lib/pq"
	"github.com/rs/cors"
	"log"
)

var e *echo.Echo

func main() {

	LoadConfig()

	e = echo.New()

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
		Debug:            itrak.Debug,
	})
	e.Use(c.Handler)

	loadHandlers(e)

	// Start the web server
	if Config.Debug {
		log.Printf("Starting Web Server of port %d ...", Config.WebPort)
	}
	e.Run(fmt.Sprintf(":%d", Config.WebPort))
}

/*
// Run the MicroServer
func main() {

	// Connect to the SQLServer
	var err error

	db, err = sql.Open("postgres", itrak.DataSourceName)
	defer db.Close()
	if err != nil {
		log.Fatalln("Exiting ..")
	}

	// Setup the web server
	e := echo.New()

	e.Use(mw.Logger())
	e.Use(mw.Recover())
	e.Use(mw.Gzip())

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "DELETE", "PUT", "PATCH"},
		AllowCredentials: true,
		Debug:            itrak.Debug,
	})
	e.Use(c.Handler)

	loadHandlers(e)

	// Start the web server
	if itrak.Debug {
		log.Printf("Starting Web Server of port %d ...", itrak.WebPort)
	}
	e.Run(fmt.Sprintf(":%d", itrak.WebPort))
}
*/
