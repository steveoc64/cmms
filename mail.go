package main

import (
	"crypto/tls"
	"gopkg.in/gomail.v2"
	"log"
	"time"
)

var MailChannel = make(chan *gomail.Message, 64)

func NewMail() *gomail.Message {

	m := gomail.NewMessage()
	m.SetHeader("From", "cmms-admin@sbsinternational.com.au")
	return m
}

func _initMailer() {
	// queue up a test message to say that we have begun

	go _MailerDaemon()

	m := NewMail()
	m.SetHeader("To", "steveoc64@gmail.com")
	m.SetHeader("Subject", "CMMS has started !")
	m.SetBody("text/html", "The CMMS server has been started")
	MailChannel <- m

}

func _MailerDaemon() {
	d := gomail.NewPlainDialer("mail.cycle2u.com.au", 465, "steve", "unx911zxx")
	// d := gomail.NewPlainDialer("mail.sbsinternational.com.au", 465, "cmms-admin", "M@ch1ne$")
	d.TLSConfig = &tls.Config{InsecureSkipVerify: true}

	var s gomail.SendCloser
	var err error
	open := false
	for {
		select {
		case m, ok := <-MailChannel:
			if !ok {
				return
			}
			if !open {
				if s, err = d.Dial(); err != nil {
					panic(err)
				}
				open = true
			}
			if err := gomail.Send(s, m); err != nil {
				log.Print(err)
			}
		// Close the connection to the SMTP server if no email was sent in
		// the last couple of minutes.
		case <-time.After(120 * time.Second):
			if open {
				if err := s.Close(); err != nil {
					panic(err)
				}
				open = false
			}
		}
	}
}
