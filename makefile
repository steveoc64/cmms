all: clean run

clean:		
	./terminate

dist: 
	gulp build
	go build
	mplayer ../go-cmms/audio/camera.oga >/dev/null 2>/dev/null &

run: dist
	###################################################################################################
	#  !!! All code passed compile and build stage !!!
	###################################################################################################
	./cmms
