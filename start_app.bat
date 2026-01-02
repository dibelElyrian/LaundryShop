@echo off
echo Starting Laundry Shop Manager...
cd /d "%~dp0"
start http://localhost:5173
npm run dev
pause
