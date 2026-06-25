# Firebase Deployment Guide for Vibasa

Since CLI authentication is having issues, here's how to deploy manually:

## Step 1: Build the Project ✅ (Already Done)
The Next.js build is complete. The output is in `.next/` directory.

## Step 2: Manual Deployment via Firebase Console

### Option A: Using Firebase Console (Easiest)
1. Go to: https://console.firebase.google.com
2. Select project: **vibasa**
3. Click **Hosting** in left sidebar
4. Click **"Get Started"** or **"Upload Files"**
5. Drag and drop the `.next/standalone/public` folder
6. Click **"Deploy"**

### Option B: Using Service Account Key (Recommended for CI/CD)
1. Go to Firebase Console → Settings ⚙️ → **Service Accounts**
2. Click **"Generate New Private Key"**
3. Save the JSON file as `serviceAccountKey.json`
4. Run in PowerShell:
   ```powershell
   $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\serviceAccountKey.json"
   firebase deploy --project vibasa
   ```

### Option C: Using GitHub Actions (Automatic Deployment)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_VIBASA }}'
          projectId: vibasa
```

## Recommended: Use Console Upload (Step 2, Option A)

It's the fastest way to test your deployment right now.

## Your Firebase Hosting URL
After deployment, your app will be available at:
```
https://vibasa.firebaseapp.com
```

---

**What to Deploy:**
- Source: `c:\Users\kutha\Downloads\Private_Project-main\Private_Project-main\.next\standalone\public`
- Destination: Firebase Hosting for project "vibasa"
