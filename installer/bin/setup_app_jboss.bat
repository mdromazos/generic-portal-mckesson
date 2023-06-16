set CLASSPATH=
set t=""
call "%HUB_HOME%\server\setSiperianEnv.bat"

SET JBS_CLASSPATH=%SIP_HOME%\lib\bcprov-jdk14-124.jar;%JBS_CLASSPATH%

:run
@echo ------------------------------------------------------------------
@echo Hub Home : %HUB_HOME%
@echo Portal Home : %PORTAL_HOME%
@echo Parameters : %PARAM%
@echo JBoss Home : %JBS_HOME%
@echo Siperian Home : %SIP_HOME%
@echo Java Home : %JAVA_HOME%
@echo Classpath : %JBS_CLASSPATH%

@echo %choice%
set t="deploy_generic_portal_ear_PIM"
if "%choice%" == "no" (
  set t="deploy_generic_portal_ear"
)

if  "%redeploy%" == "redeploy" (
  set t="redeploy"  
)

if  "%redeploy%" == "redeployWithPIM" (
  set t="redeployWithPIM"  
)


@echo %t%

:launch
@echo ------------------------------------------------------------------
@echo on
"%JAVA_HOME%\bin\java" %USER_INSTALL_PROP% -Xmx1024m -XX:MaxPermSize=256m -classpath "%JBS_CLASSPATH%;%SIP_HOME%\lib\ant.jar;%SIP_HOME%\lib\ant-launcher.jar;%SIP_HOME%\lib\ant-nodeps.jar;%SIP_HOME%\lib\ojdbc6.jar;%SIP_HOME%\lib\sqljdbc4.jar;%WLS_CLASSPATH%" org.apache.tools.ant.Main -f %PORTAL_HOME%\bin\build_jboss.xml %t% %PARAM%
@set MY_ERRORLEVEL=%ERRORLEVEL%
@echo off

if not "%MY_ERRORLEVEL%" == "0" echo %0: ERRORLEVEL=%MY_ERRORLEVEL% && exit /b %MY_ERRORLEVEL%

goto finish

:finish
@echo SCRIPT FINISHED
@popd
@endlocal

:end
