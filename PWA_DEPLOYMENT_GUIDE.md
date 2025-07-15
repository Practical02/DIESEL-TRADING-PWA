# 📱 Sigma Accounts PWA Deployment Guide

## 🚀 Quick Deploy Options

### Option 1: Deploy to Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Follow the prompts:**
   - Link to existing project? `N`
   - Project name: `sigma-accounts`
   - Directory: `./` (current directory)
   - Auto-deploy? `Y`

### Option 2: Deploy to Netlify

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build and deploy:**
   ```bash
   npm run build
   netlify deploy --prod --dir=.next
   ```

### Option 3: Deploy to Railway

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy:**
   ```bash
   railway login
   railway init
   railway up
   ```

## 📱 Installing as PWA on Android

### Method 1: Chrome Browser
1. Open your deployed app URL in Chrome
2. Tap the menu (⋮) button
3. Select "Install app" or "Add to Home screen"
4. Confirm installation

### Method 2: Edge Browser
1. Open your deployed app URL in Edge
2. Tap the menu (⋮) button
3. Select "Install app"
4. Confirm installation

## ✅ PWA Features Available

- ✅ **Offline Support**: Basic caching of pages
- ✅ **Install Prompt**: Users can install like a native app
- ✅ **App Icons**: Custom Sigma Accounts branding
- ✅ **Full Screen**: Runs without browser UI
- ✅ **Home Screen**: Appears like a native app
- ✅ **Background Sync**: Service worker handles updates

## 🔧 Environment Setup

Make sure your `.env` file is properly configured:

```env
DATABASE_URL="your_database_url_here"
DIRECT_URL="your_direct_database_url_here"
```

## 📋 Pre-deployment Checklist

- [ ] Database is accessible from production
- [ ] Environment variables are set
- [ ] Icons are properly sized (192x192, 512x512)
- [ ] Service worker is registered
- [ ] App builds successfully (`npm run build`)
- [ ] All features work in production mode

## 🎯 App Store Alternative

If you want to distribute through Google Play Store instead:

1. **Use Capacitor:**
   ```bash
   npm run build
   npx cap sync android
   npx cap open android
   ```

2. **Build APK in Android Studio**
3. **Upload to Google Play Console**

## 🔍 Testing PWA

1. **Lighthouse Audit:**
   - Open Chrome DevTools
   - Go to Lighthouse tab
   - Run PWA audit
   - Score should be 90+ for PWA features

2. **Manual Testing:**
   - Install from browser
   - Test offline functionality
   - Check icon appears correctly
   - Verify full-screen experience

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify service worker is registered
3. Ensure HTTPS is enabled (required for PWA)
4. Test on different Android devices

---

**Your Sigma Accounts PWA is ready for deployment! 🎉** 