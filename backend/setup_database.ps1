# SAGE Database Setup Script
# This script creates the PostgreSQL database and runs the schema

$PGBIN = "C:\Program Files\PostgreSQL\17\bin"
$PSQL = "$PGBIN\psql.exe"
$DB_NAME = "sage_db"
$DB_USER = "sage_user"
$DB_PASSWORD = "235162"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "SAGE Database Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Set environment variable for password
$env:PGPASSWORD = $DB_PASSWORD

# Create database if it doesn't exist
Write-Host "Creating database if it doesn't exist..." -ForegroundColor Yellow
&amp; $PSQL -U postgres -c "CREATE DATABASE $DB_NAME;"

# Create user if it doesn't exist
Write-Host "Creating user if it doesn't exist..." -ForegroundColor Yellow
&amp; $PSQL -U postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"

# Grant privileges
Write-Host "Granting privileges..." -ForegroundColor Yellow
&amp; $PSQL -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# Run the schema file
Write-Host "Running database schema..." -ForegroundColor Yellow
&amp; $PSQL -U $DB_USER -d $DB_NAME -f "sage_database_schema.sql"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "Database setup complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Clean up
$env:PGPASSWORD = $null
