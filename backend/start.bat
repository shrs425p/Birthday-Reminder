@echo off
echo Starting Birthday Reminder Server...
cd /d "%~dp0\backend"
node server.js
pause
