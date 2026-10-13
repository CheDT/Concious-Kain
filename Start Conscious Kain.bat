@echo off
setlocal
cd /d "%~dp0"
title Conscious Kain - Local Server
chcp 65001 >nul
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is needed to run the local server.
  echo Install Node.js, then double-click this file again.
  pause
  exit /b 1
)
echo Starting Conscious Kain...
echo A QR code will appear here. The app will open in your browser.
echo Connect your phone and computer to the same Wi-Fi, then scan the QR.
echo If Windows asks, allow Node.js on private networks.
echo Keep this window open while testing on your phone.
node server.mjs --open
if errorlevel 1 pause
endlocal
