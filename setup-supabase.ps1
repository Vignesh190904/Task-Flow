# TaskFlow Supabase Setup Script
# This script will execute the SQL setup to create all required tables

$supabaseUrl = "https://vawdncuhvfjfdzxgykhs.supabase.co"
$supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhd2RuY3VodmZqZmR6eGd5a2hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMjEwNjAsImV4cCI6MjA2OTY5NzA2MH0.2kcH_UXuFrlP4JzluKuRKi0K28hArqTvXpGVz7W286A"

# Read the SQL file
$sqlContent = Get-Content "supabase-complete-setup.sql" -Raw

Write-Host "🚀 Setting up TaskFlow database in Supabase..." -ForegroundColor Green
Write-Host "URL: $supabaseUrl" -ForegroundColor Yellow

# Execute the SQL using Supabase REST API
try {
    $headers = @{
        "apikey" = $supabaseAnonKey
        "Authorization" = "Bearer $supabaseAnonKey"
        "Content-Type" = "application/json"
        "Prefer" = "return=minimal"
    }

    $body = @{
        query = $sqlContent
    } | ConvertTo-Json -Depth 10

    $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/rpc/exec_sql" -Method POST -Headers $headers -Body $body

    Write-Host "✅ Database setup completed successfully!" -ForegroundColor Green
    Write-Host "Tables created: profiles, tasks" -ForegroundColor Cyan
    Write-Host "RLS policies enabled" -ForegroundColor Cyan
    Write-Host "Triggers configured" -ForegroundColor Cyan

} catch {
    Write-Host "❌ Error executing SQL: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please run the SQL manually in your Supabase SQL Editor:" -ForegroundColor Yellow
    Write-Host "1. Go to your Supabase dashboard" -ForegroundColor White
    Write-Host "2. Open SQL Editor" -ForegroundColor White
    Write-Host "3. Copy and paste the contents of supabase-complete-setup.sql" -ForegroundColor White
    Write-Host "4. Click Run" -ForegroundColor White
}

Write-Host "`n📋 Next steps:" -ForegroundColor Green
Write-Host "1. Test your application" -ForegroundColor White
Write-Host "2. Try registering a new user" -ForegroundColor White
Write-Host "3. Try logging in with existing user" -ForegroundColor White 