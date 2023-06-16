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
export wl_password=""
export choice=""
export startTime=`date '+%m-%d-%Y %H:%M:%S'`

export ws_password=""

export redeployWithPIMBool=yes
export redeploy=redeployWithPIM

read -p "Enter path to Hub Install Directory :" hubHome
read -p "Enter path to Portal Install Directory :" portalHome
read -p "Enter type of app server (weblogic, jboss, websphere):" appServer
read -p "ReDeploy with PIM  (yes, no):" redeployWithPIMBool

if [ "$redeployWithPIMBool" != "yes" ]; then
	redeploy=redeploy
fi

if [ "$hubHome" != "" ]; then
	HUB_HOME=$hubHome
fi

if [ "$portalHome" != "" ]; then
	PORTAL_HOME=$portalHome
fi



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
