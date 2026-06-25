$jsonPath = "c:\Users\kutha\Downloads\vibasa-5ac30-firebase-adminsdk-fbsvc-e418a45214.json"
$secretName = "FIREBASE_SERVICE_ACCOUNT_VIBASA_5AC30"
$repo = "nehayadav-0612/vibasa"

# Read the JSON file
$secretValue = Get-Content -Path $jsonPath -Raw

# Add the secret using GitHub CLI
& "C:\Program Files\GitHub CLI\gh.exe" secret set $secretName --body "$secretValue" --repo $repo

Write-Host "✅ Secret added successfully!"
