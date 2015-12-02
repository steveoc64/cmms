///////////////////////////////////////////////////////////////////////////////////////////
//  SMT - We have multi cores, lets use them !

package main

import (
	"fmt"
	"runtime"
)

func _initSMT() {

	numCores := runtime.NumCPU()

	useCores := numCores
	// If we are on a REAL machine, then dont get too greedy - leave one core alone
	if numCores > 2 {
		useCores--
	}

	fmt.Println("CMMS server: - running on", useCores, "of", numCores, "CPU Cores")

	runtime.GOMAXPROCS(useCores)

}
