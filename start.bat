@echo off
title CineVault — Developer Suite
echo ===================================================
echo   🎬 CineVault — Starting Developer Servers
echo ===================================================
echo.

:: Get directory script is located in
cd /d "%~dp0"

:: Start concurrently dev and admin servers in a separate persistent window
echo [1/3] Launching Node backend and Vite dev server...
start "CineVault Live Servers" cmd /k "npm start"

:: Wait 3 seconds for local hosts to bind ports
echo [2/3] Waiting for servers to bind ports (3s)...
timeout /t 3 /nobreak >nul

:: Open browser tabs for main page and admin dashboard
echo [3/3] Launching web browser...
start "" "http://localhost:5173"
start "" "http://localhost:5173/admin"

echo.
echo ===================================================
echo   🎉 CineVault started successfully!
echo   Keep the separate log terminal window open.
echo ===================================================
echo.
timeout /t 5 >nul
exit
