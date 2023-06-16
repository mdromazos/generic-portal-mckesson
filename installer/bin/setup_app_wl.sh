export CLASSPATH=

. "$HUB_HOME/server/setSiperianEnv.sh"

echo ------------------------------------------------------------------
echo Hub Home : $HUB_HOME
echo App Home : $APP_HOME
echo Parameters : $PARAM
echo WebLogic Version : $WLS_VERSION
echo WebLogic Home : $WLS_HOME
echo Siperian Home : $SIP_HOME
echo Java Home : $JAVA_HOME
echo Classpath : $WLS_CLASSPATH

if [ -z "$JAVA_HOME" ]; then
  echo "The JAVA_HOME environment variable is not defined"
  echo "This environment variable is needed to run this program"
  echo SCRIPT FAILED
  exit 101
fi


export target=""


if [ "$choice" == "no" ]; then
  target="deploy_generic_portal_ear"  
else
  target="deploy_generic_portal_ear_PIM"
fi

if [ "$redeploy" == "redeploy" ]; then
  target="redeploy"  
fi

if [ "$redeploy" == "redeployWithPIM" ]; then
  target="redeployWithPIM"  
fi

echo " ------------------------------------------------------------------"
$JAVA_HOME/jre/bin/java \
$USER_INSTALL_PROP \
-Xmx2048m -XX:MaxPermSize=256m \
-classpath \
$SIP_HOME/lib/bcprov-jdk14-124.jar:\
$SIP_HOME/lib/ant.jar:\
$SIP_HOME/lib/ant-launcher.jar:\
$SIP_HOME/lib/ant-nodeps.jar:\
$SIP_HOME/lib/ojdbc6.jar:\
$SIP_HOME/lib/sqljdbc4.jar:\
$WLS_CLASSPATH \
org.apache.tools.ant.Main -f $PORTAL_HOME/bin/linux/build_wl.xml $target \
$PARAM \
$@

exit $?
