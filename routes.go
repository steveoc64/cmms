package main

import (
	//"database/sql"
	"github.com/labstack/echo"
	"github.com/thoas/stats"
	//"log"
	"net/http"
	//"strconv"
)

var server_stats = stats.New()

/////////////////////////////////////////////////////////////////////////////////////////////////
// Define Routes for the Server

func _initRoutes() {
	e.Use(server_stats.Handler)

	e.Get("/stats", func(c *echo.Context) error {
		return c.JSON(http.StatusOK, server_stats.Data())
	})

}
