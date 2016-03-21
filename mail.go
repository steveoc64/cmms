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
	m.SetHeader("From", Config.MailSender)
	return m
}

func _initMailer(msg string) {
	// queue up a test message to say that we have begun

	go _MailerDaemon()
	// return

	m := NewMail()
	m.SetHeader("To", "steve.oconnor@sbsinternational.com.au")
	// m.SetHeader("To", "steveoc64@gmail.com")
	m.SetHeader("Subject", "CMMS has started on "+Config.Installation)
	m.SetBody("text/html", "The CMMS server has been started @"+Config.Installation+":"+Config.MailServer+"\n"+msg)
	MailChannel <- m

}

func _MailerDaemon() {
	d := gomail.NewPlainDialer(Config.MailServer, Config.MailPort, Config.MailUser, Config.MailPasswd)
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
