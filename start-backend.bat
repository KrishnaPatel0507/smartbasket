@echo off
title SmartBasket Backend Server
cd /d "%~dp0\backend"
echo ===================================================
echo Starting SmartBasket Backend API Server on Port 5000
echo ===================================================
npm run dev
pause
