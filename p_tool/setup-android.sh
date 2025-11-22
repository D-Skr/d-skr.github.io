#!/bin/bash

# Photo Crop Tool - Android Setup Script
# This script automates the setup process for building Android APK

set -e  # Exit on error

echo "📱 Photo Crop Tool - Android Setup"
echo "===================================="
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16+ from https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi
echo "✅ npm $(npm --version)"

# Check Java
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed. Please install JDK 17+ from https://www.oracle.com/java/technologies/downloads/"
    exit 1
fi
echo "✅ Java $(java --version | head -n1)"

# Check Android SDK (optional, will be set up by Android Studio)
if [ -z "$ANDROID_HOME" ]; then
    echo "⚠️  ANDROID_HOME not set. You'll need to install Android Studio and set this variable."
else
    echo "✅ ANDROID_HOME: $ANDROID_HOME"
fi

echo ""
echo "🔧 Setting up project structure..."

# Create www directory structure
mkdir -p www/p_tool

# Copy files
echo "📁 Copying web files to www directory..."
cp ../p_tool.html www/index.html
cp script.js www/p_tool/
cp styles.css www/p_tool/
cp photoSample.png www/p_tool/

echo "✅ Files copied successfully"

# Install npm dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🏗️  Initializing Capacitor..."
npx cap init "Photo Crop Tool" "com.dskr.phototool" --web-dir=www

echo ""
echo "📱 Adding Android platform..."
npx cap add android

echo ""
echo "🔄 Syncing web assets..."
npx cap sync android

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Generate signing key: keytool -genkey -v -keystore release-key.keystore -alias photo-crop-key -keyalg RSA -keysize 2048 -validity 10000"
echo "  2. Update capacitor.config.json with keystore info"
echo "  3. Open Android Studio: npx cap open android"
echo "  4. Build APK: Build → Generate Signed Bundle / APK"
echo ""
echo "📖 For detailed instructions, see: BUILD_APK_INSTRUCTIONS.md"
echo ""
