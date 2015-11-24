echo Run this from the base directory
echo
echo You are currently in 
pwd
echo 
cd $GOPATH/src/github.com/steveoc64/cmms
go get gopkg.in/mgutz/dat.v1
go get gopkg.in/mgutz/dat.v1/sqlx-runner
go build
bower install
npm install
gulp dist
ls -l
echo Root from here
echo ... Hit any key
read something
sudo adduser cmms
sudo addgrp cmms
echo Add users to cmms group
echo .. Hit any key
read something
sudo vi /etc/group
sudo mkdir /var/run/cmms
sudo chown cmms /var/run/cmms
sudo chgrp cmms /var/run/cmms
sudo chmod a+w /var/run/cmms
echo Setup run directory in /var/run/cmms
echo Owned by cmms user, with write access to anyone in the cmms group
echo .. Hit any key
read something
cp cmms /var/run/cmms
cp config-template.json /var/run/cmms/config.json
vi /var/run/cmms/config.json
echo About to copy the build directory to production
echo .. Hit any key
read something
df -k /var/run
du -k build
echo Will that fit ?
read something
cp -r build /var/run/cmms/build
chown -r cmms /var/run/cmms
chgrp -r cmms /var/run/cmms
sudo cp initscripts/cmms.sh /etc/init.d/cmms
chmod a+x /etc/init.d/cmms
sudo mkdir /var/log/cmms
sudo chown cmms /var/log/cmms
sudo chgrp adm /var/log/cmms

echo Installed the init script for CMMS in /etc/init.d
echo 
echo Run service start cmms to kick it off !
echo
echo .. done installing

