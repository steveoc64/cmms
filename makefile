all: clean run

clean:		
	terminate.bat

dist: 
	go build

run: dist
	###################################################################################################
	#  !!! All code passed compile and build stage !!!
	###################################################################################################
	./cmms
