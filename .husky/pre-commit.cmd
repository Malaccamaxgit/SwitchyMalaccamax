@echo off
REM Husky pre-commit hook for Windows

echo 🔒 Running pre-commit security checks...

node scripts\pre-commit-security.js
if %errorlevel% neq 0 (
  echo ❌ Pre-commit security checks failed!
  exit /b 1
)

echo ✅ Pre-commit checks passed
exit /b 0
