package main

import (
	"encoding/json"
	"flag"
	"log"
	"os"
)

// Runtime variables, held in external file config.json
type ConfigType struct {
	Installation   string
	Debug          bool
	DataSourceName string
	WebPort        int
	MailServer     string
	MailUser       string
	MailPasswd     string
	MailPort       int
	MailSender     string
}

var Config ConfigType

// Load the config.json file, and override with runtime flags
func _loadConfig() {
	cf, err := os.Open("config.json")
	if err != nil {
		log.Println("Could not open config.json :", err.Error())
	}

	data := json.NewDecoder(cf)
	if err = data.Decode(&Config); err != nil {
		log.Fatalln("Failed to load config.json :", err.Error())
	}

	flag.BoolVar(&Config.Debug, "debug", Config.Debug, "Enable Debugging")
	flag.StringVar(&Config.DataSourceName, "", Config.DataSourceName, "DataSourceName for SQLServer")
	flag.IntVar(&Config.WebPort, "webport", Config.WebPort, "Port Number for Web Server")
	flag.StringVar(&Config.MailServer, "mailserver", Config.MailServer, "Address of the Mailserver")
	flag.IntVar(&Config.MailPort, "mailport", Config.MailPort, "Mailserver Port")
	flag.StringVar(&Config.MailUser, "mailuser", Config.MailUser, "Mailserver UserName")
	flag.StringVar(&Config.MailPasswd, "mailpasswd", Config.MailPasswd, "Mailserver Passwd")
	flag.StringVar(&Config.MailSender, "mailsender", Config.MailSender, "Send Emails as")

	flag.Parse()

	log.Printf("Starting\n\tInstallation: \t%s\n\tDebug: \t\t%t\n\tSQLServer: \t%s\n\tWeb Port: \t%d\n",
		Config.Installation,
		Config.Debug,
		Config.DataSourceName,
		Config.WebPort)
}
