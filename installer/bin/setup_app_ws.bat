set CLASSPATH=
set target=""
call "%HUB_HOME%\server\setSiperianEnv.bat"

SET WAS_CLASSPATH=%WAS_CLASSPATH%;%WAS_HOME%\runtimes\com.ibm.ws.admin.client_8.5.0.jar;%WAS_HOME%\plugins\com.ibm.ws.security.crypto.jar;%WAS_HOME%\plugins\com.ibm.ws.runtime.jar

:run
@echo ------------------------------------------------------------------
@echo Hub Home : %HUB_HOME%
@echo App Home : %APP_HOME%
@echo Parameters : %PARAM%
@echo WebSphere Home : %WAS_HOME%
@echo Sipeian Home : %SIP_HOME%
@echo Java Home : %JAVA_HOME%
@echo Classpath : %WAS_CLASSPATH%

set target="deploy_generic_portal_ear_PIM"
if "%choice%" == "no" (
  set target="deploy_generic_portal_ear"  
)

if  "%redeploy%" == "redeploy" (
  set target="redeploy"  
)

if  "%redeploy%" == "redeployWithPIM" (
  set target="redeployWithPIM"  
)

:launch
@echo ------------------------------------------------------------------
@echo on
"%JAVA_HOME%\bin\java" %USER_INSTALL_PROP% -Xmx1024m -XX:MaxPermSize=256m -classpath "%WAS_CLASSPATH%;%SIP_HOME%\lib\ant.jar;%SIP_HOME%\lib\ant-launcher.jar;%SIP_HOME%\lib\siperian-common.jar;%SIP_HOME%\lib\siperian-server.jar;%SIP_HOME%\lib\ProductVersion.jar;%SIP_HOME%\lib\ojdbc6.jar;%SIP_HOME%\lib\db2jcc.jar;%SIP_HOME%\lib\sqljdbc4.jar;%SIP_HOME%\lib\db2jcc_license_cu.jar" org.apache.tools.ant.Main -f %PORTAL_HOME%\bin\build_ws.xml %target% %PARAM%
@set MY_ERRORLEVEL=%ERRORLEVEL%
@echo off

if not "%MY_ERRORLEVEL%" == "0" echo %0: ERRORLEVEL=%MY_ERRORLEVEL% && exit /b %MY_ERRORLEVEL%

goto finish

:finish
@echo SCRIPT FINISHED
@popd
@endlocal

:end
