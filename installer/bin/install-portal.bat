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
set avosUsername= ""
set avosPassword = ""
set choice=
set startTime=%date:~4% %time:~0,8%

set urnWithPim=""
set urnWithPortal=""
set urnPimAdminUser=""

set urnPIMUrl=""
set urnHubAdminUser=""
set urnHubAdminUserUrl=""
set forgotPasswordUrl=""
set redeploy="no"
set ws_password=""

set /p hubHome=Enter the path to the MDM Hub installation directory (default : %HUB_HOME%):
set /p portalHome=Enter the location to install the Portal Configuration tool (default : %PORTAL_HOME%):
set /p appServer=Enter the type of application server (weblogic, jboss, websphere):
set /p forgotPasswordUrl=Enter the URL to access portal:
set /p urnHubAdminUser=Enter the user name with administrative privileges to access the MDM Hub:

set /p avosUsername=Enter the user name with administrative privileges to access the ActiveVOS Console:
set /p avosPassword=Enter the password of the ActiveVOS Console administrative user:

set /p choice=Do you want to integrate with MDM - Product 360 (yes, no):


 if "%choice%"=="yes" (
  set /p urnPIMUrl=Enter the URL to access the Product 360 Supplier Portal:
  set /p urnPimAdminUser=Enter the user name with administrative privileges to access the Product 360 Supplier Portal:
  set urnWithPim=true
  set urnWithPortal=true
 )

if "%choice%" == "no" (
  set urnWithPim=false
  set urnWithPortal=true
)

if NOT "%hubHome%"=="" (
  set HUB_HOME=%hubHome%
)
if NOT "%portalHome%"=="" (
  set PORTAL_HOME=%portalHome%
)

set "urnHubAdminUserUrl=portal://%urnHubAdminUser%"
set "urnWithPim=portal://%urnWithPim%"
set "urnWithPortal=portal://%urnWithPortal%"
set "urnPimAdminUser=portal://%urnPimAdminUser%"
    
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