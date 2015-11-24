package main

import (
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"io/ioutil"
	"log"
	"net/http"
	"runtime"
	"time"
)

// location of the files used for signing and verification
const (
	privKeyPath = "keys/cmms.rsa"     // openssl genrsa -out app.rsa keysize
	pubKeyPath  = "keys/cmms.rsa.pub" // openssl rsa -in app.rsa -pubout > app.rsa.pub
)

// keys are held in global variables
// i havn't seen a memory corruption/info leakage in go yet
// but maybe it's a better idea, just to store the public key in ram?
// and load the signKey on every signing request? depends on your usage i guess
var (
	verifyKey, signKey []byte
)

// read the JWT key files before starting http handlers
func _initJWT() {
	var err error

	signKey, err = ioutil.ReadFile(privKeyPath)
	if err != nil {
		log.Fatal("Error reading private key")
		return
	}

	verifyKey, err = ioutil.ReadFile(pubKeyPath)
	if err != nil {
		log.Fatal("Error reading public key")
		return
	}
	log.Println("... loaded RSA Keys")
}

// Catch fatal conditions, and print a stack trace
func catchPanic(err *error, functionName string) {
	if r := recover(); r != nil {
		fmt.Printf("%s : PANIC Defered : %v\n", functionName, r)

		// Capture the stack trace
		buf := make([]byte, 10000)
		runtime.Stack(buf, false)

		fmt.Printf("%s : Stack Trace : %s", functionName, string(buf))

		if err != nil {
			*err = fmt.Errorf("%v", r)
		}
	} else if err != nil && *err != nil {
		fmt.Printf("%s : ERROR : %v\n", functionName, *err)

		// Capture the stack trace
		buf := make([]byte, 10000)
		runtime.Stack(buf, false)

		fmt.Printf("%s : Stack Trace : %s", functionName, string(buf))
	}
}

// Get the MD5 hash of a string, in HEX format
func GetMD5HexHash(text string) string {
	hash := md5.Sum([]byte(text))
	return hex.EncodeToString(hash[:])
}

// Validate the received security token
// If good, return the UserID
func securityCheck(passedToken string) (int, string) {
	// validate the token

	//log.Println("Security Check:", passedToken)
	token, err := jwt.Parse(passedToken, func(token *jwt.Token) (interface{}, error) {
		// since we only use the one private key to sign the tokens,
		// we also only use its public counter part to verify
		return signKey, nil
	})

	// branch out into the possible error from signing
	switch err.(type) {

	case nil: // no error

		if !token.Valid { // but may still be invalid
			log.Println("Invalid Token", passedToken)
			return http.StatusUnauthorized, err.Error()
		}

		log.Printf("Token OK:%+v\n", token.Claims)
		return http.StatusOK, "Token Valid"

	case *jwt.ValidationError: // something was wrong during the validation
		vErr := err.(*jwt.ValidationError)

		switch vErr.Errors {
		case jwt.ValidationErrorExpired:
			return http.StatusUnauthorized, err.Error()

		default:
			return http.StatusUnauthorized, "Invalid Token!"
		}

	default: // something else went wrong
		log.Printf("Token parse error: %v\n", err)
		return http.StatusUnauthorized, "Invalid Token!"
	}
}

func generateToken(ID int, Role string) (string, error) {
	// create a signer for rsa 256
	t := jwt.New(jwt.GetSigningMethod("HS256"))

	// set our claims
	t.Claims["ID"] = ID
	t.Claims["Role"] = Role

	// set the expire time for 30 days
	// see http://tools.ietf.org/html/draft-ietf-oauth-json-web-token-20#section-4.1.4
	t.Claims["exp"] = time.Now().Add(time.Hour * 24 * 30).Unix()

	tokenString, err := t.SignedString(signKey)
	return tokenString, err
}
