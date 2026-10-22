# Athena | Secure Proctoring Desktop Application

A modern, high-integrity proctoring and assessment desktop application built with **Electron**, **React 19**, and **Vite**, based on the conventions and architecture of the Athena proctoring tool.

---

## 🌟 Features Overview

### 1. Pre-Exam Readiness & Biometric Verification
- **Webcam Feed Verification**: Candidate identity check requesting live camera access (`navigator.mediaDevices.getUserMedia`) with real-time video preview.
- **Desktop Screen Sharing**: System screen stream capture (`navigator.mediaDevices.getDisplayMedia` and Electron `session.setDisplayMediaRequestHandler`) with dedicated display monitor preview.
- **Full-Screen Enforcement**: Locks candidate into full-screen mode (`document.documentElement.requestFullscreen`) before exam initiation.
- **Microphone & Ambient Audio Check**: Audio meter with Web Audio API `AudioContext` & `AnalyserNode` frequency analyzer.
- **Candidate Verification Details**: Form for candidate identification (Name, Roll Number / ID, Academic Integrity honor pledge).
- **Prerequisite Gate**: "Begin Exam" CTA is strictly locked until all hardware and integrity checks pass.

### 2. Dual Surveillance Engine ("Parallel Save")
- **Synchronized 5s Snapshots**:
  - **Camera Snapshot**: Renderer captures candidate facial still frame from the live video track using `ImageCapture` / Canvas fallback, serializes it to an `ArrayBuffer`, and writes a timestamped JPEG to `app/user-camera-snap/`.
  - **Screen Preview Capture**: Electron main process uses `desktopCapturer.getSources({ types: ['screen'] })` to take a full-resolution PNG capture of the desktop display and saves it to `app/user-screen-snap/`.
- **1-Second Timer Heartbeat**: Synchronized IPC timer dispatching `timer` events from the main process to the renderer every second.

### 3. Anti-Cheating & Lockdown Security
- **Native Shortcut & Clipboard Interception**:
  - Electron `webContents.on("before-input-event")` intercepts `Ctrl+C` and `Cmd+C` at the OS level, cancels the event (`preventDefault()`), and displays a native Electron warning dialog (`dialog.showMessageBox`).
  - Intercepts and logs copy and paste shortcuts.
- **Fullscreen Departure Guard**:
  - Listens to `fullscreenchange`. If the candidate attempts to minimize or exit full screen during the exam, an alert modal blocks the screen and requires re-entering full screen.
- **Window Focus / Tab Departure Monitor**:
  - Listens to `window.onblur`. If the candidate switches windows, apps, or clicks away, a violation incident is logged and counted.
- **Application Menu Security**:
  - Custom macOS and Windows menu bar with protected Exit Exam confirmation dialog, rules viewer, and diagnostic launcher.

### 4. Interactive Exam Assessment Workspace
- **Multi-Section Question Bank**: Questions categorized across Distributed Systems, JavaScript Runtimes, and Algorithms & Security.
- **Interactive Question Palette**: 1-12 matrix indicator showing questions marked as Answered, Flagged for Review, and Unvisited.
- **Real-Time Proctoring HUD**:
  - Picture-in-Picture (PiP) live candidate webcam stream with pulsating red recording dot (`REC 5s`).
  - Active snapshot counter (camera snaps saved, screen snaps saved).
  - Security lock indicators (Clipboard lock, Fullscreen lock, Focus monitor).
  - Time remaining countdown and elapsed timer.
- **Review & Submission Flow**:
  - Pre-submission confirmation modal showing total answered, unanswered, and flagged questions.
  - Final exam scorecard with performance percentage, passing status, and complete proctoring audit log.
  - **Export Audit Report**: Native `showSaveDialogBox` to export a verifiable JSON session transcript to disk.

### 5. Proctoring Inspector & Diagnostic Tools
- Built-in inspector to browse archived webcam snapshots and screen snapshots on disk.
- Demonstration controls for native Electron dialogs (`showRules`, `showMessageBox`, `selectFolder`, `selectFile`).
- Live incident stream monitor.

---

## 🛠️ Project Structure & Architecture

```
athena_clone/
├── app/                        # Electron Main & Preload Scripts
│   ├── app.js                  # Main Process: Window, Menus, desktopCapturer, IPC, Anti-Cheat
│   ├── preload.js              # Preload Script: Secure contextBridge exposing window.athena
│   ├── user-camera-snap/       # Archived webcam snapshot JPEGs (auto-generated)
│   └── user-screen-snap/       # Archived desktop screen PNGs (auto-generated)
├── src/                        # React 19 Frontend Renderer
│   ├── components/
│   │   ├── Header.jsx          # Top Proctoring Telemetry HUD & Controls
│   │   ├── ReadinessCheck.jsx  # Hardware verification & pre-exam checklist
│   │   ├── ExamWorkspace.jsx   # Assessment questions, palette, and live PiP HUD
│   │   ├── ExamSubmissionModal.jsx   # Pre-submission confirmation summary
│   │   ├── ExamSubmissionResult.jsx  # Scorecard and proctoring audit report exporter
│   │   ├── FullscreenWarningModal.jsx# Fullscreen breach interceptor
│   │   └── ProctorInspectorModal.jsx # Real-time disk snapshot and diagnostics browser
│   ├── data/
│   │   └── examQuestions.js    # Comprehensive assessment question bank
│   ├── App.jsx                 # Main state coordinator & IPC event wiring
│   ├── index.css               # Design system & dark proctoring theme tokens
│   └── main.jsx                # Application root mount
├── dist/                       # Vite production bundle
├── index.html                  # HTML entrypoint with Inter & JetBrains Mono typography
├── package.json                # Dependencies, Electron, and Vite scripts
└── vite.config.js              # Vite bundler configuration
```

---

## 🚀 Running the Desktop App

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Both Vite & Electron (One-Step Development)
```bash
npm start
# or
npm run app
```
This runs Vite dev server on `http://localhost:5173` and automatically opens the Electron desktop window once the dev server is ready.

### 3. Alternative: Run In Separate Terminals
**Terminal 1 (Vite Dev Server):**
```bash
npm run dev
```

**Terminal 2 (Electron Desktop Application):**
```bash
npm run electron
```

### 4. Build Production Bundle
```bash
npm run build
```
When built, Electron automatically falls back to loading `dist/index.html` via `loadFile` if the Vite dev server is offline.
