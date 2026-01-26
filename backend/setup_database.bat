@echo off
REM SAGE Database Setup Script
REM This script creates the PostgreSQL database and runs the schema

SET PGBIN=C:\Program Files\PostgreSQL\17\bin
SET PSQL=%PGBIN%\psql.exe
SET DB_NAME=sage_db
SET DB_USER=sage_user
SET PGPASSWORD=235162

echo =====================================
echo SAGE Database Setup
echo =====================================
echo.

echo Running database schema...
echo.

"%PSQL%" -U %DB_USER% -d %DB_NAME% -f sage_database_schema.sql

echo.
echo =====================================
echo Database setup complete!
echo =====================================

SET PGPASSWORD=
pause
