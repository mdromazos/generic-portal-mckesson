@REM Copyright Informatica
@echo off
@setlocal

SET PARAM=%*

pushd ..\..\..
SET INFA_ROOT=%cd%
popd

SET HUB_HOME=%INFA_ROOT%\hub\
SET PORTAL_HOME=%INFA_ROOT%\app\portal\

set hubHome = ""
set portalHome = ""
set appServer = ""
set choice=""
set startTime=%date:~4% %time:~0,8%

set redeployWithPIMBool=yes
set redeploy=redeployWithPIM
set ws_password=""

set /p hubHome=Enter path to Hub Install Directory (default : %HUB_HOME%):
set /p portalHome=Enter path to Portal Install Directory (default : %PORTAL_HOME%):
set /p appServer=Enter type of app server (weblogic, jboss, websphere):
set /p redeployWithPIMBool=ReDeploy with PIM  (yes, no):


if NOT "%redeployWithPIMBool%"=="yes" (
  set redeploy=redeploy
)

if NOT "%hubHome%"=="" (
  set HUB_HOME=%hubHome%
)
if NOT "%portalHome%"=="" (
  set PORTAL_HOME=%portalHome%
)

    
if "%appServer%"=="weblogic" (
  @echo Appserver is weblogic
   set /p wl_password=Enter Weblogic administrator password :
  
    call "%PORTAL_HOME%bin\setup_app_wl.bat"
  
) else (
  if "%appServer%"=="jboss" (
    @echo Appserver is jboss
      
      call "%PORTAL_HOME%bin\setup_app_jboss.bat"
  
    
  ) else (
    if "%appServer%"=="websphere" (
      @echo Appserver is websphere

      set /p ws_password=Enter the password for websphere:
      set PARAM=-Dwebsphere.password=%ws_password%
    
      call "%PORTAL_HOME%bin\setup_app_ws.bat"
  
    
    )
  )
)