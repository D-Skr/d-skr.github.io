# 📱 Build APK & Upload to Google Play Store

## 🔧 Prerequisites

Before building the APK, install the following:

1. **Node.js & npm** (v16 or higher)
   ```bash
   node --version
   npm --version
   ```

2. **Java Development Kit (JDK)** (v17 recommended)
   ```bash
   java --version
   ```

3. **Android Studio** with Android SDK
   - Download from: https://developer.android.com/studio
   - During installation, ensure Android SDK is installed
   - Set ANDROID_HOME environment variable:
     ```bash
     export ANDROID_HOME=$HOME/Android/Sdk
     export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
     ```

4. **Gradle** (usually comes with Android Studio)

---

## 📦 Step 1: Prepare the Project

### 1.1 Create www Directory Structure

The phototool files need to be organized for Capacitor:

```bash
cd /home/user/d-skr.github.io/p_tool

# Create www directory
mkdir -p www/p_tool

# Copy files to www directory
cp ../p_tool.html www/index.html
cp script.js www/p_tool/
cp styles.css www/p_tool/
cp photoSample.png www/p_tool/
```

### 1.2 Update index.html Paths

Edit `www/index.html` to ensure paths are correct (they already are, but verify):
- CSS: `./p_tool/styles.css`
- JS: `./p_tool/script.js`
- Image: `./p_tool/photoSample.png`

### 1.3 Install Dependencies

```bash
cd /home/user/d-skr.github.io/p_tool
npm install
```

---

## 🏗️ Step 2: Initialize Capacitor & Add Android Platform

### 2.1 Initialize Capacitor (if not already done)

```bash
npx cap init "Photo Crop Tool" "com.dskr.phototool" --web-dir=www
```

### 2.2 Add Android Platform

```bash
npx cap add android
```

This creates an `android/` directory with a full Android Studio project.

### 2.3 Sync Web Assets to Android

```bash
npx cap sync android
```

---

## 🔑 Step 3: Generate Signing Key (for Release APK)

For uploading to Google Play Store, you need a signed APK/AAB.

### 3.1 Generate Keystore

```bash
keytool -genkey -v -keystore release-key.keystore -alias photo-crop-key -keyalg RSA -keysize 2048 -validity 10000
```

You'll be asked:
- **Keystore password**: Create a strong password
- **Key password**: Can be same as keystore password
- **Name, Organization, etc.**: Enter your details

**⚠️ IMPORTANT**: Keep this keystore file safe! You'll need it for all future updates.

### 3.2 Update capacitor.config.json

Edit `capacitor.config.json` and update the keystore settings:

```json
"android": {
  "buildOptions": {
    "keystorePath": "/absolute/path/to/release-key.keystore",
    "keystorePassword": "YOUR_KEYSTORE_PASSWORD",
    "keystoreAlias": "photo-crop-key",
    "keystoreAliasPassword": "YOUR_KEY_PASSWORD",
    "releaseType": "APK"
  }
}
```

---

## 🔨 Step 4: Build the APK

### Option A: Build with Android Studio (Recommended)

1. **Open Android Studio**
   ```bash
   npx cap open android
   ```

2. **Wait for Gradle sync** to complete

3. **Build APK**:
   - Go to: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
   - Or for release: **Build** → **Generate Signed Bundle / APK**
   - Select **APK** → **Next**
   - Choose keystore file and enter passwords
   - Select **release** build variant
   - Click **Finish**

4. **Locate APK**:
   - Path: `android/app/build/outputs/apk/release/app-release.apk`

### Option B: Build with Gradle (Command Line)

#### For Debug APK (testing only):
```bash
cd android
./gradlew assembleDebug
# APK location: android/app/build/outputs/apk/debug/app-debug.apk
```

#### For Release APK (Google Play Store):
```bash
cd android
./gradlew assembleRelease
# APK location: android/app/build/outputs/apk/release/app-release.apk
```

**Note**: For release, you must have configured signing in `build.gradle` or use Android Studio.

---

## 📤 Step 5: Upload to Google Play Store

### 5.1 Create Google Play Developer Account

1. Go to: https://play.google.com/console
2. Sign up (one-time fee: $25 USD)
3. Complete account verification

### 5.2 Create a New App

1. In Play Console, click **"Create app"**
2. Fill in:
   - **App name**: Photo Crop Tool
   - **Default language**: English
   - **App type**: Application
   - **Free or Paid**: Free
3. Accept declarations and click **"Create app"**

### 5.3 Prepare Store Listing

Before uploading, prepare:

#### Required Assets:
- **App icon**: 512x512px PNG (high-res icon)
- **Feature graphic**: 1024x500px JPG/PNG
- **Screenshots**: At least 2 screenshots
  - Phone: 320-3840px wide, 16:9 or 9:16 ratio
  - Tablet (optional): 7-10 inch screenshots

#### Store Listing Content:
- **Short description** (max 80 chars):
  ```
  Free photo crop tool for official documents. Perfect 600x600px images.
  ```

- **Full description** (max 4000 chars):
  ```
  Need the perfect 600x600px image for your official documents?

  Whether it's for your Driver's License, ID, Passport, State ID, or government
  forms like I-765, I-589, DV Lottery, Green Card, or Permanent Resident Card,
  this tool has you covered. And it's FREE!

  ✨ FEATURES:
  • Easy photo upload
  • Precise cropping to 600x600px
  • Zoom, rotate, and position controls
  • Touch-friendly interface
  • Instant download
  • No internet required after installation
  • No watermarks
  • Completely free

  📸 SIMPLE 3-STEP PROCESS:
  1. Upload your photo
  2. Adjust and crop to perfection
  3. Save and use for your documents

  Perfect for passport photos, visa applications, government IDs, and more!
  ```

- **App category**: Photography
- **Email**: Your contact email
- **Privacy Policy**: Required (create a simple one or use a generator)

### 5.4 Upload APK/AAB

**⚠️ Note**: Google Play now **requires AAB (Android App Bundle)** for new apps (more efficient than APK).

#### Build AAB instead of APK:
```bash
cd android
./gradlew bundleRelease
# AAB location: android/app/build/outputs/bundle/release/app-release.aab
```

#### Upload Steps:
1. In Play Console, go to **"Production"** → **"Create new release"**
2. Click **"Upload"** and select your AAB file
3. Fill in **"Release name"**: v1.0.0
4. Fill in **"Release notes"**:
   ```
   Initial release
   • Crop photos to 600x600px
   • Perfect for official documents
   • Free and easy to use
   ```
5. Click **"Save"** → **"Review release"**

### 5.5 Complete Content Rating

1. Go to **"Content rating"**
2. Fill out questionnaire (app is likely rated "Everyone")
3. Submit

### 5.6 Set Up Pricing & Distribution

1. Go to **"Pricing & distribution"**
2. Select **"Free"**
3. Select **countries** where app will be available
4. Accept declarations
5. Save

### 5.7 Submit for Review

1. Go to **"Dashboard"**
2. Complete all required sections (green checkmarks)
3. Click **"Send for review"**
4. Review typically takes **1-3 days**

---

## 🔄 Updating Your App

When you make changes:

1. **Update version** in `android/app/build.gradle`:
   ```gradle
   versionCode 2
   versionName "1.0.1"
   ```

2. **Sync changes**:
   ```bash
   npx cap sync android
   ```

3. **Build new AAB**:
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

4. **Upload to Play Console**:
   - Create new release in Production track
   - Upload new AAB
   - Add release notes
   - Submit

---

## 🐛 Troubleshooting

### Issue: "Android SDK not found"
**Solution**: Set ANDROID_HOME environment variable:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
```

### Issue: "Signing key not configured"
**Solution**: Make sure keystore path in `capacitor.config.json` is absolute, not relative.

### Issue: "Build fails with Gradle error"
**Solution**:
```bash
cd android
./gradlew clean
./gradlew build
```

### Issue: "App crashes on launch"
**Solution**: Check that all file paths in `index.html` are correct and files exist in `www/` directory.

---

## 📚 Additional Resources

- **Capacitor Docs**: https://capacitorjs.com/docs
- **Android Developer Guide**: https://developer.android.com/studio/build
- **Google Play Console Help**: https://support.google.com/googleplay/android-developer
- **App Signing**: https://developer.android.com/studio/publish/app-signing

---

## ✅ Checklist

Before uploading to Play Store:

- [ ] App tested on physical Android device
- [ ] All features working (upload, crop, download)
- [ ] App icon created (512x512px)
- [ ] Screenshots taken (at least 2)
- [ ] Feature graphic created (1024x500px)
- [ ] Privacy policy created
- [ ] Store listing text prepared
- [ ] Keystore file backed up safely
- [ ] AAB file generated and signed
- [ ] Version code and version name set correctly

---

## 🎉 You're Done!

Your app should now be on its way to the Google Play Store! 🚀
