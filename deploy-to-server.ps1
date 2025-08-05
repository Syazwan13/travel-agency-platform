# PowerShell Deployment Script for Travel Agency Platform
# This script deploys the latest changes to your DigitalOcean server

param(
    [string]$ServerIP = "167.172.66.203",
    [string]$Username = "root",
    [string]$ProjectPath = "/var/www/travelagency"
)

Write-Host "🚀 Deploying Travel Agency Platform to Server..." -ForegroundColor Green

# Function to execute remote commands
function Invoke-RemoteCommand {
    param([string]$Command)
    Write-Host "📡 Executing: $Command" -ForegroundColor Yellow
    ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$Username@$ServerIP" $Command
}

# Function to copy files to server
function Copy-ToServer {
    param([string]$LocalPath, [string]$RemotePath)
    Write-Host "📁 Copying $LocalPath to server..." -ForegroundColor Yellow
    scp -o StrictHostKeyChecking=no -r $LocalPath "$Username@$ServerIP`:$RemotePath"
}

try {
    Write-Host "🔍 Checking server connectivity..." -ForegroundColor Blue
    $pingResult = Test-Connection -ComputerName $ServerIP -Count 1 -Quiet
    if (-not $pingResult) {
        throw "Cannot reach server $ServerIP"
    }
    Write-Host "✅ Server is reachable" -ForegroundColor Green

    Write-Host "📥 Pulling latest changes from Git..." -ForegroundColor Blue
    Invoke-RemoteCommand "cd $ProjectPath && git pull origin main"
    
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Blue
    Invoke-RemoteCommand "cd $ProjectPath/backend && npm install --production"
    
    Write-Host "🏗️ Building frontend..." -ForegroundColor Blue
    Invoke-RemoteCommand "cd $ProjectPath/client && npm install && npm run build"
    
    Write-Host "🔄 Restarting backend services..." -ForegroundColor Blue
    Invoke-RemoteCommand "cd $ProjectPath/backend && pm2 restart travelagency-backend"
    
    Write-Host "🔄 Restarting telegram bot..." -ForegroundColor Blue
    Invoke-RemoteCommand "cd $ProjectPath/backend && pm2 restart telegram-bot"
    
    Write-Host "💾 Saving PM2 configuration..." -ForegroundColor Blue
    Invoke-RemoteCommand "pm2 save"
    
    Write-Host "📊 Checking application status..." -ForegroundColor Blue
    Invoke-RemoteCommand "pm2 status"
    
    Write-Host "🔍 Testing static file serving..." -ForegroundColor Blue
    Invoke-RemoteCommand "curl -I http://localhost:5001/images/home/hero-travel.jpg"
    
    Write-Host "🔍 Testing API endpoint..." -ForegroundColor Blue
    Invoke-RemoteCommand "curl http://localhost:5001/test-image"
    
    Write-Host ""
    Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Your application is now running at:" -ForegroundColor Cyan
    Write-Host "   Frontend: http://$ServerIP:3000" -ForegroundColor White
    Write-Host "   Backend API: http://$ServerIP:5001" -ForegroundColor White
    Write-Host "   Test Image: http://$ServerIP:5001/images/home/hero-travel.jpg" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 Useful commands:" -ForegroundColor Yellow
    Write-Host "   View logs: ssh $Username@$ServerIP 'pm2 logs travelagency-backend'" -ForegroundColor Gray
    Write-Host "   Restart: ssh $Username@$ServerIP 'pm2 restart travelagency-backend'" -ForegroundColor Gray
    Write-Host "   Status: ssh $Username@$ServerIP 'pm2 status'" -ForegroundColor Gray

} catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🔧 Troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "1. Check server connectivity: Test-Connection -ComputerName $ServerIP" -ForegroundColor Gray
    Write-Host "2. Verify SSH access: ssh $Username@$ServerIP" -ForegroundColor Gray
    Write-Host "3. Check PM2 status: ssh $Username@$ServerIP 'pm2 status'" -ForegroundColor Gray
    Write-Host "4. View logs: ssh $Username@$ServerIP 'pm2 logs travelagency-backend'" -ForegroundColor Gray
    exit 1
} 