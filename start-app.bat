@echo off
title SmartBasket Application Launcher
echo ============================================================
echo SmartBasket - AI-Powered Smart Grocery Store & Automation
echo ============================================================
echo Starting Backend Server on port 5000...
start "SmartBasket Backend" cmd /k "cd /d %~dp0\backend && npm run dev"
timeout /t 3 /nobreak >nul
echo Starting Frontend Client on port 3000...
start "SmartBasket Frontend" cmd /k "cd /d %~dp0\frontend && npm run dev"
timeout /t 2 /nobreak >nul
echo Opening Web Browser at http://localhost:3000...
start http://localhost:3000
echo SmartBasket is running! Press any key to exit this launcher window.
pause
