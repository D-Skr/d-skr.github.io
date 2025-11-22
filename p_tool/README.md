# 📷✂️ Photo Crop Tool

A free, easy-to-use photo cropping tool for creating perfect **600x600px** images for official documents.

## 🎯 Purpose

Perfect for creating photos for:
- 🪪 Driver's License & State IDs
- 🛂 Passports
- 📄 Government forms (I-765, I-589, DV Lottery, Green Card)
- 🆔 Official identification documents

## ✨ Features

- 📤 **Easy Upload**: Choose any image from your device
- ✂️ **Precise Cropping**: Automatic 600x600px output
- 🔄 **Transform Controls**:
  - Pan/drag to position
  - Pinch to zoom (mobile) or scroll wheel (desktop)
  - Two-finger rotation (mobile) or arrow keys (desktop)
- 📱 **Responsive**: Works on desktop, tablet, and mobile
- 💾 **Instant Download**: Save your cropped photo immediately
- 🎨 **Grid Overlay**: Visual guides for perfect alignment
- 🖼️ **Photo Sample**: See an example before uploading

## 🚀 Quick Start

### Web Version (Instant Use)
Simply open `p_tool.html` in your browser - no installation needed!

### Android APK Build
See **[BUILD_APK_INSTRUCTIONS.md](BUILD_APK_INSTRUCTIONS.md)** for detailed steps.

**Quick setup:**
```bash
cd /home/user/d-skr.github.io/p_tool
./setup-android.sh
```

## 📁 Project Structure

```
p_tool/
├── script.js              # Main JavaScript logic
├── styles.css             # iOS-inspired styling
├── photoSample.png        # Sample photo for demonstration
├── package.json           # npm dependencies (for Android build)
├── capacitor.config.json  # Capacitor configuration
├── setup-android.sh       # Automated setup script
├── BUILD_APK_INSTRUCTIONS.md  # Comprehensive build guide
└── README.md              # This file

../p_tool.html             # Main HTML file (in root directory)
```

## 🎮 How to Use

1. **Upload Photo**
   - Click "Choose Photo" or "Photo Sample"
   - Select an image from your device

2. **Adjust Position**
   - **Desktop**: Click and drag to move, scroll to zoom, arrow keys to rotate
   - **Mobile**: Drag with one finger, pinch to zoom, two fingers to rotate

3. **Download**
   - Click "Save" button
   - Your cropped 600x600px image will download automatically

## 🛠️ Technologies Used

- **HTML5**: Canvas API for image manipulation
- **CSS3**: Modern iOS-inspired design
- **Vanilla JavaScript**: No frameworks, pure JS
- **Font Awesome**: Icons
- **Capacitor** (for Android): Web-to-native wrapper

## 🐛 Bug Fixes Applied

- ✅ Removed unused rotate button references
- ✅ Enabled boundary constraints to keep image in frame
- ✅ Removed obsolete dropdown toggle code
- ✅ Cleaned up unused DOM element references

## 📱 Building for Android

### Prerequisites
- Node.js v16+
- Java JDK 17+
- Android Studio with Android SDK

### Build Steps

1. **Run setup script**:
   ```bash
   ./setup-android.sh
   ```

2. **Generate signing key**:
   ```bash
   keytool -genkey -v -keystore release-key.keystore \
     -alias photo-crop-key -keyalg RSA -keysize 2048 -validity 10000
   ```

3. **Build APK**:
   ```bash
   npx cap open android
   # In Android Studio: Build → Generate Signed Bundle / APK
   ```

**For complete instructions**: See [BUILD_APK_INSTRUCTIONS.md](BUILD_APK_INSTRUCTIONS.md)

## 📤 Google Play Store Upload

See detailed instructions in [BUILD_APK_INSTRUCTIONS.md](BUILD_APK_INSTRUCTIONS.md#-step-5-upload-to-google-play-store)

**Quick checklist:**
- [ ] Create Google Play Developer account ($25)
- [ ] Prepare app assets (icon, screenshots, feature graphic)
- [ ] Build signed AAB file
- [ ] Complete store listing
- [ ] Submit for review

## 🤝 Support

If you find this tool useful, consider supporting the project:
https://coindrop.to/dmitrii

## 📄 License

MIT License - Free to use and modify

## 👨‍💻 Author

D-Skr

---

**Made with ❤️ for everyone who needs perfect document photos**
