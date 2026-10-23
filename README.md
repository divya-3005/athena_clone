# Athena | Secure Proctoring Desktop Application

A modern, high-integrity assessment desktop application built with **Electron**, **React 19**, and **Vite**, featuring automated proctoring, synchronized multi-part assessments (MCQs and Python coding), and anti-cheating protections.

---

## 🌟 Key Features

### 1. Pre-Exam Readiness & Permissions
- **Streamlined Setup**: Only requires **Camera** and **Fullscreen** permissions before starting.
- **Privacy-First Monitoring**: The webcam operates invisibly in the background for surveillance snapshots without displaying a running video feed on the screen.
- **Section Selection**: Candidates can choose whether to begin with **Part 1 (MCQs)** or **Part 2 (Python Coding)**.

### 2. Part 1: Multiple Choice Questions (MCQs)
- **12 Curated Technical Questions**: Covering architecture, runtime models, algorithms, and security.
- **Question Matrix & Quick Selector**: Jump directly to any question; questions can be answered in any order.
- **Live Countdown Badge**: A dedicated timer (`⏱️ mm:ss left`) is displayed directly on the question card and top header.
- **Palette Tracking**: Real-time status for Answered, Flagged, and Unvisited questions.

### 3. Part 2: Python Coding Workspace
- **2 Python Problems with Question Chooser**:
  1. `is_palindrome(s)`: Palindrome String Checker
  2. `sum_of_two_numbers(a, b)`: Numerical Summation
- **Interactive Question Tabs**: Freely toggle between both problems to solve in preferred order.
- **Independent State**: Code, test results, and console logs are preserved across problem switches.
- **Test Runner & Harness**:
  - **Run**: Evaluates code against sample test cases.
  - **Submit**: Evaluates code against hidden test cases.
  - **Reset**: Restores starter function templates.
  - **Print Logs Capture**: Automatically captures and displays candidate `print(...)` statements without corrupting execution results.

### 4. Automated Proctoring & Anti-Cheating
- **Active-Only Surveillance**: Camera and desktop screen snapshots are archived to `~/Desktop/Athena_Proctoring_Data/` (`user-camera-snap/` and `user-screen-snap/`) **only while actively taking an exam** (with candidate consent)—zero unnecessary data on landing screens.
- **Keystroke & Shortcut Interception**: Intercepts `Ctrl+C` and `Cmd+C` with native Electron dialog warnings and logs violation telemetry. `Ctrl/Cmd+V` paste is disabled.
- **Context Menu Lockdown**: Right-click context menu is disabled across the entire window.
- **Fullscreen Departure Guard**: Exiting fullscreen triggers a modal alert and violation flag.
- **Window Blur Tracking**: Detects when focus leaves the application.
- **Proctor Inspector**: Built-in inspector modal to review disk snapshots and violation logs.

### 5. Exam Lifecycle & Controls
- **Exit Exam Option**: Prominently accessible button and menu option to safely terminate the exam with confirmation.
- **3-Second Auto-Quit**: Final submission displays scores and cleanly terminates the desktop app after a 3-second countdown.

---

## 🛠️ Project Structure

```
athena_clone/
├── app/
│   ├── app.js               # Electron main process (lifecycle, IPC, Python runner, anti-cheat)
│   └── preload.js           # Secure contextBridge API bridge (window.athena)
├── src/
│   ├── components/
│   │   ├── Header.jsx               # Top navigation bar with timer and exit button
│   │   ├── ReadinessCheck.jsx       # Camera & fullscreen check with section chooser
│   │   ├── ExamWorkspace.jsx        # MCQ workspace with question palette & timer
│   │   ├── CodingWorkspace.jsx      # Python editor, test runner, and question tabs
│   │   ├── ExamSubmissionModal.jsx  # Pre-submission confirmation summary
│   │   ├── ExamSubmissionResult.jsx # Final scorecard with 3s auto-exit countdown
│   │   ├── FullscreenWarningModal.jsx# Fullscreen departure alert
│   │   ├── ProctorInspectorModal.jsx# Disk snapshot and diagnostics browser
│   │   └── ExitModal.jsx            # Exit confirmation dialog
│   ├── data/
│   │   └── examQuestions.js # Question bank and Python coding problem definitions
│   ├── App.jsx              # Main application coordinator
│   ├── index.css            # Clean, pleasant light theme design system
│   └── main.jsx             # React root with ErrorBoundary protection
├── dist/                    # Compiled production assets
├── index.html               # Main HTML entrypoint
├── package.json             # Scripts and dependencies
└── vite.config.js           # Vite configuration
```

---

## 🚀 Getting Started

### Option 1: Instant Launch (Zero Setup Required)
For immediate evaluation without installing Node dependencies or manually configuring permissions:

- **Via Finder**: Double-click [run_athena.command](file:///Users/divyasingh1/athena_clone/run_athena.command). It automatically removes macOS Gatekeeper quarantine and launches Athena directly.
- **Via Terminal**:
  ```bash
  ./run_athena.command
  ```

---

### Option 2: Running from the Standalone Executable DMG (`Athena.dmg`)
The standalone offline disk image is located in `release/Athena.dmg` (**93 MB**, containing the full self-contained 239 MB `Athena.app` with embedded Chromium and Node runtime):

```bash
# Clear Gatekeeper quarantine and launch in one step:
xattr -cr release/Athena.dmg
hdiutil attach release/Athena.dmg && open "/Volumes/Athena/Athena.app"
```

If `Athena.app` is dragged to `/Applications`:
```bash
xattr -cr /Applications/Athena.app && open /Applications/Athena.app
```

---

### Option 3: Developer Setup (From Source)

```bash
# 1. Install dependencies
npm install

# 2. Run in development mode (launches Vite + Electron)
npm start

# 3. Build the production DMG installer
npm run dist
```

---

## 📸 Proctoring Photos & Privacy Control
- **User Consent Checkbox**: On the initial setup screen, the candidate is explicitly asked: *"Save proctoring snapshots to this computer"*.
  - If **Checked**: Webcam photos (`.jpg`) and screen captures (`.png`) are archived to `~/Desktop/Athena_Proctoring_Data/` so the evaluator can easily review them. When the exam finishes, the folder automatically opens in macOS Finder.
  - If **Unchecked**: Zero pictures or files are stored on the candidate's laptop (operates completely in-memory).

---

## 📋 Evaluation Notes
- **Python Runtime**: Uses the native system `python3` to execute candidate code with a 5-second timeout safeguard to protect against infinite loops.
- **Clean Light Theme**: Distraction-free, pleasant styling focused on clarity and usability.
