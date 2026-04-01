@echo off
SETLOCAL

echo.
echo   +-----------------------------------+
echo   ^|   url4fun -- URL Shortener CLI   ^|
echo   +-----------------------------------+
echo.

WHERE npm >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
    echo   npm found -- installing url4fun globally via npm...
    npm install -g github:pulkitrais/url4fun
    IF %ERRORLEVEL% EQU 0 (
        echo.
        echo   Installation complete. Run 'url4fun --help' to get started.
    ) ELSE (
        echo.
        echo   Installation failed. Please check your npm configuration.
        EXIT /B 1
    )
) ELSE (
    echo   npm not found.
    echo.
    echo   Please install Node.js from https://nodejs.org and then run:
    echo     npm install -g github:pulkitrais/url4fun
    EXIT /B 1
)

ENDLOCAL
