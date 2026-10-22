#!/bin/bash
# ==============================================================================
# Athena Proctoring Platform - Instant Launcher & Gatekeeper Bypass
# ==============================================================================
# This script eliminates all macOS setup steps, quarantine blocks, and developer
# verification warnings. It launches Athena immediately in one click.
# ==============================================================================

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
APP_IN_RELEASE="$DIR/release/mac-arm64/Athena.app"
APP_IN_DIR="$DIR/Athena.app"
APP_IN_APPLICATIONS="/Applications/Athena.app"
DMG_PATH="$DIR/release/Athena.dmg"
DMG_LOCAL="$DIR/Athena.dmg"

echo "========================================================"
echo "  🚀 Starting Athena Proctoring Desktop Application...  "
echo "========================================================"

TARGET_APP=""

# Case 1: Check if standalone Athena.app is already unpacked in release/
if [ -d "$APP_IN_RELEASE" ]; then
    TARGET_APP="$APP_IN_RELEASE"
# Case 2: Check if Athena.app is in current folder
elif [ -d "$APP_IN_DIR" ]; then
    TARGET_APP="$APP_IN_DIR"
# Case 3: Check if Athena is already installed in /Applications
elif [ -d "$APP_IN_APPLICATIONS" ]; then
    TARGET_APP="$APP_IN_APPLICATIONS"
# Case 4: Check if Athena is in Downloads folder
elif [ -d "$HOME/Downloads/Athena.app" ]; then
    TARGET_APP="$HOME/Downloads/Athena.app"
# Case 5: Mount DMG directly if app not unpacked yet
elif [ -f "$DMG_PATH" ] || [ -f "$DMG_LOCAL" ]; then
    CHOSEN_DMG="$DMG_PATH"
    if [ ! -f "$CHOSEN_DMG" ]; then
        CHOSEN_DMG="$DMG_LOCAL"
    fi
    echo "📦 Mounting Athena Disk Image ($CHOSEN_DMG)..."
    hdiutil attach "$CHOSEN_DMG" -nobrowse -quiet || true
    TARGET_APP="/Volumes/Athena/Athena.app"
    if [ ! -d "$TARGET_APP" ]; then
        TARGET_APP="/Volumes/Athena Proctoring Platform/Athena.app"
    fi
fi

if [ -z "$TARGET_APP" ] || [ ! -d "$TARGET_APP" ]; then
    echo "❌ Error: Could not locate Athena.app or Athena-1.0.0-arm64.dmg."
    echo "Please ensure the DMG or Athena.app is in this folder."
    exit 1
fi

echo "🔓 Removing macOS quarantine flags to bypass Gatekeeper..."
# Strips com.apple.quarantine so macOS never blocks the app
xattr -cr "$TARGET_APP" 2>/dev/null || true

echo "✨ Launching Athena..."
open "$TARGET_APP"

echo "========================================================"
echo "  ✅ Athena is now running! You can close this window.  "
echo "========================================================"
exit 0
