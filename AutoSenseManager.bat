@echo off
title AutoSense App Manager

:MENU
cls
echo =========================================
echo       AutoSense Application Manager
echo =========================================
echo 1. Start Application (Frontend + Backend)
echo 2. Stop Application
echo 3. Restart Application
echo 4. Exit
echo =========================================
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto START_APP
if "%choice%"=="2" goto STOP_APP
if "%choice%"=="3" goto RESTART_APP
if "%choice%"=="4" exit
goto MENU

:START_APP
echo.
echo Starting Backend (Spring Boot on Port 8080)...
cd /d "C:\Users\mysel\Documents\smart-vehicle-manager"
start "AutoSense Backend" cmd /c "mvn spring-boot:run"

echo Starting Frontend (React on Port 3000)...
cd /d "C:\Users\mysel\Documents\smart-vehicle-manager\frontend"
start "AutoSense Frontend" cmd /c "npm start"

echo.
echo Application started! Please wait a moment for the servers to initialize.
timeout /t 3 >nul
goto MENU

:STOP_APP
echo.
echo Stopping services on Port 8080 (Backend)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul

echo Stopping services on Port 3000 (Frontend)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul

echo.
echo Application stopped successfully.
timeout /t 2 >nul
goto MENU

:RESTART_APP
echo.
echo Stopping services...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul

echo Starting Backend...
cd /d "C:\Users\mysel\Documents\smart-vehicle-manager"
start "AutoSense Backend" cmd /c "mvn spring-boot:run"

echo Starting Frontend...
cd /d "C:\Users\mysel\Documents\smart-vehicle-manager\frontend"
start "AutoSense Frontend" cmd /c "npm start"

echo.
echo Application Restarted!
timeout /t 3 >nul
goto MENU
