# Deploy Code.gs to Google Apps Script via API
# Set these environment variables before running:
#   GOOGLE_SCRIPT_ID
#   GOOGLE_ACCESS_TOKEN

$scriptId = $env:GOOGLE_SCRIPT_ID
$accessToken = $env:GOOGLE_ACCESS_TOKEN

if ([string]::IsNullOrEmpty($scriptId) -or [string]::IsNullOrEmpty($accessToken)) {
    Write-Host "Error: Set GOOGLE_SCRIPT_ID and GOOGLE_ACCESS_TOKEN environment variables"
    exit 1
}

# Read Code.gs
$codeContent = Get-Content -Path "Code.gs" -Raw

# Create payload - update source code
$payload = @{
    files = @(
        @{
            name = "Code"
            source = $codeContent
            type = "SERVER_JS"
        }
    )
} | ConvertTo-Json -Depth 10

Write-Host "Enviando codigo a Google Apps Script..."

# Call API to update source code
$response = Invoke-WebRequest -Uri "https://script.googleapis.com/v1/projects/$scriptId/content" `
    -Method PUT `
    -Headers @{
        "Authorization" = "Bearer $accessToken"
        "Content-Type" = "application/json"
    } `
    -Body $payload

Write-Host "Response: $response"
Write-Host "Status: $($response.StatusCode)"

# Create a new deployment
Write-Host "`nCreando nuevo deployment..."

$deployPayload = @{
    versionNumber = 1
    description = "Latest version"
} | ConvertTo-Json

$deployResponse = Invoke-WebRequest -Uri "https://script.googleapis.com/v1/projects/$scriptId/deployments" `
    -Method POST `
    -Headers @{
        "Authorization" = "Bearer $accessToken"
        "Content-Type" = "application/json"
    } `
    -Body $deployPayload

Write-Host "Deployment Response: $deployResponse"
Write-Host "Status: $($deployResponse.StatusCode)"
Write-Host "`n✅ Deploy completado!"
