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
	m.SetHeader("From", Config.MailSender)
	m.SetHeader("To", "steveoc64@gmail.com, steve.oconnor@sbsinternational.com.au")
	m.SetHeader("Subject", "CMMS has started on "+Config.Installation)
	m.SetBody("text/html", "The CMMS server has been started @"+Config.Installation+":"+Config.MailServer+"\n"+msg)
	MailChannel <- m

}

func _MailerDaemon() {

	d := gomail.NewDialer(Config.MailServer, Config.MailPort, Config.MailUser, Config.MailPasswd)
	d.TLSConfig = &tls.Config{InsecureSkipVerify: true}
	// d := gomail.Dialer{
	// 	Host: Config.MailServer,
	// 	Port: Config.MailPort,
	// 	SSL:  false,
	// 	Auth: smtp.PlainAuth("", Config.MailUser, Config.MailPasswd, Config.MailServer),
	// }

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
					log.Println("Dialling Error:", err, ",Skipping message:", m.GetHeader("Subject"))
					return
				}
				open = true
			}
			m.SetHeader("From", Config.MailSender)
			if err := gomail.Send(s, m); err != nil {
				log.Print("Sending Error:", err)
			}
		// Close the connection to the SMTP server if no email was sent in
		// the last couple of minutes.
		case <-time.After(120 * time.Second):
			if open {
				if err := s.Close(); err != nil {
					log.Println("Inactive Shutdown:", err)
					return

				}
				open = false
			}
		}
	}
}
