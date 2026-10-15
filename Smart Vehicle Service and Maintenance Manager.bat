@echo off
title Smart Vehicle Service and Maintenance App Manager

echo =========================================
echo       Smart Vehicle Service and Maintenance Manager
echo =========================================
echo.
echo Cleaning up old processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
echo.

echo Starting Java Backend (Port 8080)...
cd /d "%~dp0"
if exist mvnw.cmd (
    start /b "" cmd /c "mvnw.cmd spring-boot:run"
) else (
    start /b "" cmd /c "mvn spring-boot:run"
)

echo Starting Python ALPR Scanner (Port 8000)...
if exist "%~dp0alpr-engine" (
    cd /d "%~dp0alpr-engine"
    start /b "" cmd /c "python -m uvicorn main:app --port 8000"
)

echo Starting React Frontend (Port 3000)...
if exist "%~dp0frontend" (
    cd /d "%~dp0frontend"
    start /b "" cmd /c "npm start"
)

echo.
echo ======================================================================
echo  SYSTEM ONLINE: ALL LIVE LOGS WILL STREAM BELOW.
echo.
echo  Access URLs:
echo  - React App:   http://localhost:3000
echo  - Spring Boot: http://localhost:8080
echo.
echo  *** PRESS THE 'X' KEY ON YOUR KEYBOARD TO STOP ALL SERVICES ***
echo ======================================================================
choice /C X /N
echo.
echo ----------------------------------------------------------------------
echo Stopping all services safely...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
echo.
echo All services stopped successfully! Goodbye.
timeout /t 3 >nul
