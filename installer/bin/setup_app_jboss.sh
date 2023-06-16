export CLASSPATH=

. "$HUB_HOME/server/setSiperianEnv.sh"

echo " ------------------------------------------------------------------"
echo " Hub Home : $HUB_HOME"
echo " Portal Home : $PORTAL_HOME"
echo " Parameters : $PARAM"
echo " JBoss Home : $JBS_HOME"
echo " Siperian Home : $SIP_HOME"
echo " Java Home : $JAVA_HOME"
echo " Classpath : $JBS_CLASSPATH"

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
$JAVA_HOME/bin/java \
$USER_INSTALL_PROP \
-Xms128m -Xmx1024m -XX:MaxPermSize=256m \
-classpath \
$SIP_HOME/lib/bcprov-jdk14-124.jar:\
$JBS_CLASSPATH:\
$SIP_HOME/lib/ant-launcher.jar:\
$SIP_HOME/lib/ojdbc6.jar:\
$SIP_HOME/lib/db2jcc.jar:\
$SIP_HOME/lib/db2jcc_license_cu.jar:\
$SIP_HOME/lib/sqljdbc4.jar \
org.apache.tools.ant.Main -f $PORTAL_HOME/bin/linux/build_jboss.xml $target \
$PARAM \
$@


exit $?
