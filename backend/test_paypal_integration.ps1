# 1. Login to get a token (Using default seed credentials)
$loginParams = @{
    email = "john@client.com"
    password = "client123"
}

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -Body ($loginParams | ConvertTo-Json) -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "✅ Login Successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Login Failed: Check if you ran 'npm run seed'" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit
}

# 2. Test PayPal Create Order
# Note: You need an existing orderId. You can get one from the db or frontend.
$orderId = "6989b69bdf88a8df3229e424" 

if ($orderId -eq "REPLACE_WITH_REAL_ORDER_ID") {
    Write-Host "⚠️  Please edit this script and replace 'REPLACE_WITH_REAL_ORDER_ID' with a real ID from your 'orders' collection." -ForegroundColor Yellow
    exit
}

try {
    $createResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/paypal/create-order" -Method Post -Headers @{
        Authorization = "Bearer $token"
    } -Body (@{
        orderId = $orderId
    } | ConvertTo-Json) -ContentType "application/json"

    Write-Host "✅ PayPal Create Order Response:" -ForegroundColor Green
    $createResponse | ConvertTo-Json
} catch {
    Write-Host "❌ Create Order Failed" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
