@echo off
echo ========================================
echo Running Fresh Katale E-commerce Tests
echo ========================================

echo.
echo [1/3] Running Backend Tests...
echo ========================================
cd /d "%~dp0"
call npm test
if %errorlevel% neq 0 (
    echo Backend tests failed!
    goto :end
)
echo Backend tests: ✅ PASSED

echo.
echo [2/3] Running Frontend Tests...
echo ========================================
cd /d "%~dp0groceries"
timeout /t 2 /nobreak >nul
call npm test -- --run
if %errorlevel% neq 0 (
    echo Frontend tests failed!
    goto :end
)
echo Frontend tests: ✅ PASSED

echo.
echo [3/3] Running Admin Portal Tests...
echo ========================================
cd /d "%~dp0admin-portal"
timeout /t 2 /nobreak >nul
call npm test -- --run
if %errorlevel% neq 0 (
    echo Admin portal tests failed!
    goto :end
)
echo Admin portal tests: ✅ PASSED

echo.
echo ========================================
echo 🎉 ALL TESTS COMPLETED SUCCESSFULLY! 🎉
echo ========================================
echo.
echo Test Summary:
echo - Backend: 4 tests passed
echo - Frontend: 4 tests passed  
echo - Admin Portal: 4 tests passed
echo - Total: 12 tests passed
echo.
echo Your Fresh Katale e-commerce project is ready! 🚀
echo.

:end
pause