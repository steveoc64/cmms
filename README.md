# CMMS

V.2 of itrak.cmms


# Architecture

- [Go at the backend](http://golang.org/)
- [Lumx / angular / material design front end](https://github.com/lumapps/lumX)

## SQL Database

- Postgres, using [DAT toolkit for postgres](https://github.com/mgutz/dat) to keep the backend short & easy to read.

## WebApp

- Single Page App, with JWT login validation, using [https://github.com/dgrijalva/jwt-go](https://github.com/dgrijalva/jwt-go)

## Server

- Lightweight server (golang) to provide REST services to the SPA
