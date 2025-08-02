# Travel Agency Approval System Setup
Write-Host "Setting up Travel Agency Approval System..." -ForegroundColor Green

# Navigate to backend directory
Set-Location "c:\Users\acer\Documents\fyptravelagency\travelagencyprojectfinal95\backend"

Write-Host "Running database migration for user status..." -ForegroundColor Yellow
node scripts/migrateUserStatus.js

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 What was implemented:" -ForegroundColor Cyan
Write-Host "  • Travel agencies now require admin approval" -ForegroundColor White
Write-Host "  • Admin dashboard has new approval interface" -ForegroundColor White
Write-Host "  • Pending users see dedicated approval page" -ForegroundColor White
Write-Host "  • Enhanced security with status validation" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Start the backend: npm start" -ForegroundColor White
Write-Host "  2. Start the frontend: cd ../client && npm run dev" -ForegroundColor White
Write-Host "  3. Login as admin to approve pending agencies" -ForegroundColor White
Write-Host ""
Write-Host "📍 Key URLs:" -ForegroundColor Cyan
Write-Host "  • Admin Dashboard: http://localhost:5173/dashboard/admin" -ForegroundColor White
Write-Host "  • Travel Agency Registration: http://localhost:5173/register/travel_agency" -ForegroundColor White
Write-Host "  • Pending Approval Page: http://localhost:5173/pending-approval" -ForegroundColor White
