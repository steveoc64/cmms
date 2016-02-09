package main

import (
	"errors"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"strconv"
)

func GetSMSBalance() (int, error) {
	resp, err := http.PostForm(
		Config.SMSServer,
		url.Values{
			"username": {Config.SMSUser},
			"password": {Config.SMSPasswd},
			"action":   {"balance"},
		})

	if err != nil {
		log.Println("HTTP Post Error", err.Error())
		return 0, err
	}

	/*	log.Println(resp)
		log.Println("status", resp.Status)
		log.Println("status code", resp.StatusCode)
		log.Println("proto", resp.Proto)
		log.Println("major", resp.ProtoMajor)
		log.Println("minor", resp.ProtoMinor)
		log.Println("header", resp.Header)
		log.Println("content length", resp.ContentLength)
		log.Println("transfer", resp.TransferEncoding)
		log.Println("trailer", resp.Trailer)
		log.Println("close", resp.Close)
		log.Println("req", resp.Request)
		log.Println("tls", resp.TLS)
		log.Println("body", resp.Body)
	*/

	// read the response
	body, err := ioutil.ReadAll(resp.Body)
	resp.Body.Close()

	if err != nil {
		log.Println(err.Error())
		return 0, err
	}
	isok := string(body[:3])
	if isok != "OK:" {
		return 0, errors.New("Status Code is" + isok)
	}
	s := string(body[3:])
	return strconv.Atoi(s)
}
