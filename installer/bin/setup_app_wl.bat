set CLASSPATH=
set target=""
call "%HUB_HOME%\server\setSiperianEnv.bat"

SET WLS_CLASSPATH=%SIP_HOME%\lib\bcprov-jdk14-124.jar;%WLS_CLASSPATH%

:run
@echo ------------------------------------------------------------------
@echo Hub Home : %HUB_HOME%
@echo App Home : %APP_HOME%
@echo Parameters : %PARAM%
@echo WebLogic Version : %WLS_VERSION%
@echo WebLogic Home : %WLS_HOME%
@echo Siperian Home : %SIP_HOME%
@echo Java Home : %JAVA_HOME%
@echo Classpath : %WLS_CLASSPATH%

SET target="deploy_generic_portal_ear_PIM"
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
"%JAVA_HOME%\bin\java" %USER_INSTALL_PROP% -Xmx1024m -XX:MaxPermSize=256m -classpath "%SIP_HOME%\lib\weblogic.jar;%SIP_HOME%\lib\ant.jar;%SIP_HOME%\lib\ant-launcher.jar;%SIP_HOME%\lib\ant-nodeps.jar;%SIP_HOME%\lib\ojdbc6.jar;%SIP_HOME%\lib\sqljdbc4.jar;%WLS_CLASSPATH%" org.apache.tools.ant.Main -f %PORTAL_HOME%\bin\build_wl.xml %target% %PARAM%
@set MY_ERRORLEVEL=%ERRORLEVEL%
@echo off

if not "%MY_ERRORLEVEL%" == "0" echo %0: ERRORLEVEL=%MY_ERRORLEVEL% && exit /b %MY_ERRORLEVEL%

goto finish

:finish
@echo SCRIPT FINISHED
@popd
@endlocal

:end
