#!/bin/bash

echod() {
	echo "`date '+%F %T'` $me: $@"
}

die() {
	echod "$@"
	exit 1
}

export PARAM=$*

export INFA_ROOT="$THISFOLDER/../../../"

export HUB_HOME=$INFA_ROOT/hub/
export PORTAL_HOME=$INFA_ROOT/app/portal/

export hubHome=""
export portalHome=""
export appServer=""
export avosUsername=""
export avosPassword=""
export wl_password=""
export choice=""
export startTime=`date '+%m-%d-%Y %H:%M:%S'`

export urnWithPim=""
export urnWithPortal=""
export urnPimAdminUser=""

export urnPortalUrl=""
export urnMDMUrl=""
export urnPIMUrl=""
export urnMDMCSUrl=""

export urnHubAdminUser=""
export urnHubAdminUserUrl=""
export forgotPasswordUrl=""

export redeploy="no"
export ws_password=""

read -p "Enter the path to the MDM Hub installation directory :" hubHome
read -p "Enter the location to install the Portal Configuration tool :" portalHome
read -p "Enter the type of application server (weblogic, jboss, websphere):" appServer

read -p "Enter the user name with administrative privileges to access the MDM Hub :" urnHubAdminUser
read -p "Enter the url for forgot password link :" forgotPasswordUrl
read -p "Enter the user name with administrative privileges to access the ActiveVOS Console:" avosUsername
read -p "Enter the password of the ActiveVOS Console administrative user:" avosPassword

read -p "Do you want to deploy Generic Portal with PIM  : (yes, no) " choice

if [ "$choice" == "yes" ]; then
	read -p "Enter the URL to access the Product 360 Supplier Portal :" urnPIMUrl
	read -p "Enter the user name with administrative privileges to access the Product 360 Supplier Portal:" urnPimAdminUser
	urnWithPim=true
	urnWithPortal=true
fi

if [ "$hubHome" != "" ]; then
	HUB_HOME=$hubHome
fi

if [ "$portalHome" != "" ]; then
	PORTAL_HOME=$portalHome
fi

if [ "$choice" == "no" ]; then
	urnWithPim=false
	urnWithPortal=true
fi

urnHubAdminUserUrl="portal://$urnHubAdminUser"
urnWithPim="portal://$urnWithPim"
urnWithPortal="portal://$urnWithPortal"
urnPimAdminUser="portal://$urnPimAdminUser"


if [ "$appServer" == "weblogic" ]; then
	echo "Appserver is weblogic"
	export wl_password=""

    read -p "Enter Weblogic administrator password :" wl_password

	./setup_app_wl.sh
else 
	if [ "$appServer" == "jboss" ]; then
			echo "Appserver is jboss"
			./setup_app_jboss.sh
		 else 
			if [ "$appServer" == "websphere" ]; then
				echo "Appserver is websphere"
				read -p "Enter Websphere administrator password :" ws_password
				PARAM=-Dwebsphere.password=$ws_password
				./setup_app_ws.sh
			fi
	fi
fi

exit $?
