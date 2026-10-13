@echo off
cd /d "%~dp0"
echo.
echo Pushing to https://github.com/wael-osama-mersvo/wedding-invitation.git
echo You must be logged in as wael-osama-mersvo (Windows Credential Manager / GitHub).
echo.
git push -u origin main
if errorlevel 1 (
  echo.
  echo Push failed. Clear old GitHub credentials, then sign in as wael-osama-mersvo:
  echo   1. Windows Settings -^> Accounts -^> Email ^& accounts / Credential Manager
  echo   2. Remove github.com entries for wael-elashry
  echo   3. Run this script again and sign in when prompted
  pause
  exit /b 1
)
echo.
echo After push: Repo Settings -^> Pages -^> Source = GitHub Actions
echo Site: https://wael-osama-mersvo.github.io/wedding-invitation/
pause
