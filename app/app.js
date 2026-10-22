// app/app.js
import { app, BrowserWindow, ipcMain, dialog, Menu, desktopCapturer, session } from "electron";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";

let electronWindow = null;
let startTimestamp = null;
let timerInterval = null;
let captureInterval = null;
let cameraShotPath = null;
const sessionViolations = [];

// Feature: Screen Preview Capture + Camera Snap — output folders
const CAMERA_SNAP_DIR = path.join(import.meta.dirname, "user-camera-snap");
const SCREEN_SNAP_DIR = path.join(import.meta.dirname, "user-screen-snap");

for (const dir of [CAMERA_SNAP_DIR, SCREEN_SNAP_DIR]) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function createWindow() {
    electronWindow = new BrowserWindow({
        height: 950,
        width: 1300,
        minWidth: 1024,
        minHeight: 720,
        title: "Athena | Secure Proctoring Desktop Environment",
        backgroundColor: "#f8fafc",
        webPreferences: {
            devTools: true,
            preload: path.join(import.meta.dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
            webSecurity: false
        }
    });

    electronWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
        console.error(`[Athena Main] did-fail-load: ${validatedURL} [${errorCode}] ${errorDescription}`);
        const distPath = path.join(import.meta.dirname, "../dist/index.html");
        if (validatedURL.startsWith("http://") && fs.existsSync(distPath)) {
            console.log("[Athena Main] Falling back to local dist/index.html");
            electronWindow.loadFile(distPath);
        }
    });

    electronWindow.webContents.on('console-message', (_event, _level, message) => {
        console.log(`[Athena Renderer]: ${message}`);
    });

    session.defaultSession.setDisplayMediaRequestHandler(
        (request, callback) => {
            desktopCapturer.getSources({ types: ['screen', 'window'] }).then((sources) => {
                if (sources.length > 0) {
                    callback({ video: sources[0], audio: 'loopback' });
                } else {
                    callback({});
                }
            }).catch((err) => {
                console.error("Display media request handler error:", err);
                callback({});
            });
        },
        { useSystemPicker: true }
    );

    // Try loading Vite dev server first; fall back to dist/index.html if offline/packaged
    const devServerUrl = "http://localhost:5173";
    const distPath = path.join(import.meta.dirname, "../dist/index.html");
    fetch(devServerUrl, { signal: AbortSignal.timeout(1200) })
        .then(() => {
            electronWindow.loadURL(devServerUrl);
        })
        .catch(() => {
            if (fs.existsSync(distPath)) {
                electronWindow.loadFile(distPath);
            } else {
                electronWindow.loadURL(devServerUrl);
            }
        });

    // Feature: Disable Ctrl/Cmd + C and intercept shortcuts with native warning
    electronWindow.webContents.on("before-input-event", (event, input) => {
        if (input.type !== "keyDown") return;

        const isCtrlOrCmd = input.control || input.meta;
        const isCKey = input.key.toLowerCase() === "c";
        const isVKey = input.key.toLowerCase() === "v";

        if (isCtrlOrCmd && isCKey) {
            event.preventDefault();

            sessionViolations.push({
                type: "CLIPBOARD_COPY_ATTEMPT",
                timestamp: new Date().toISOString(),
                detail: "Candidate pressed Ctrl/Cmd + C shortcut"
            });

            if (electronWindow && !electronWindow.isDestroyed()) {
                electronWindow.webContents.send("proctoring-violation", {
                    type: "COPY_BLOCKED",
                    message: "Copying exam content is strictly forbidden and has been logged."
                });

                dialog.showMessageBox(electronWindow, {
                    type: "warning",
                    title: "Security Action Blocked",
                    message: "Copying is disabled during the Athena exam.",
                    detail: "Attempting to copy exam content violates examination policy and this incident has been logged for proctor review."
                });
            }
        }

        if (isCtrlOrCmd && isVKey) {
            event.preventDefault();

            sessionViolations.push({
                type: "CLIPBOARD_PASTE_ATTEMPT",
                timestamp: new Date().toISOString(),
                detail: "Candidate pressed Ctrl/Cmd + V shortcut"
            });

            if (electronWindow && !electronWindow.isDestroyed()) {
                dialog.showMessageBox(electronWindow, {
                    type: "warning",
                    title: "Action Blocked",
                    message: "Pasting is disabled during the exam.",
                    detail: "Pasting external content into the assessment is prohibited."
                });
            }
        }
    });

    // Disable right-click context menu (prevents right-click Copy/Paste)
    electronWindow.webContents.on("context-menu", (e) => {
        e.preventDefault();
    });

    electronWindow.on("closed", () => {
        electronWindow = null;
        if (timerInterval) clearInterval(timerInterval);
        if (captureInterval) clearInterval(captureInterval);
    });
}

// Feature: Application Menu (top menu bar — File / Edit / View / Window / Help)
function createApplicationMenu() {
    const isMac = process.platform === "darwin";

    const template = [
        ...(isMac ? [{ label: app.name, submenu: [{ role: "about" }, { role: "quit" }] }] : []),

        {
            label: "File",
            submenu: [
                {
                    label: "Exit Exam",
                    accelerator: "CmdOrCtrl+Q",
                    click: () => {
                        if (electronWindow) {
                            dialog.showMessageBox(electronWindow, {
                                type: "question",
                                buttons: ["Cancel", "Confirm Exit"],
                                defaultId: 0,
                                cancelId: 0,
                                title: "Exit Athena Assessment",
                                message: "Are you sure you want to terminate the exam session?",
                                detail: "Exiting now will forfeit your remaining exam time and auto-submit your current progress."
                            }).then(({ response }) => {
                                if (response === 1) {
                                    app.quit();
                                }
                            });
                        } else {
                            app.quit();
                        }
                    }
                }
            ]
        },
        {
            label: "Edit",
            submenu: [{ role: "cut" }, { role: "copy" }, { role: "paste" }, { role: "selectAll" }]
        },
        {
            label: "View",
            submenu: [
                { role: "reload" },
                { role: "forceReload" },
                { type: "separator" },
                { role: "togglefullscreen" }
            ]
        },
        {
            label: "Window",
            submenu: [{ role: "minimize" }, { role: "zoom" }]
        },
        {
            label: "Help",
            submenu: [
                {
                    label: "Show Athena Exam Rules",
                    click: () => {
                        showExamRulesDialog();
                    }
                },
                {
                    label: "Athena System Diagnostics",
                    click: () => {
                        if (electronWindow) {
                            electronWindow.webContents.send("open-diagnostics");
                        }
                    }
                }
            ]
        }
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function showExamRulesDialog() {
    if (!electronWindow) return;
    dialog.showMessageBox(electronWindow, {
        type: "info",
        title: "Athena Official Exam Rules & Regulations",
        message: "Proctored Examination Code of Conduct",
        detail:
            "1. Continuous Camera Monitoring: Your face must remain centered and clearly visible throughout the entire exam.\n\n" +
            "2. Screen Sharing Required: The entire desktop display must be shared; running unauthorized third-party apps is flagged.\n\n" +
            "3. Full Screen Mode Enforced: Exiting full-screen mode or switching windows triggers immediate incident flags.\n\n" +
            "4. Zero Tolerance for Copy/Paste: Clipboard manipulation and developer shortcuts are intercepted and logged.\n\n" +
            "5. Surveillance Snapshots: Dual automated snapshots (camera feed + screen capture) are archived to disk every 5 seconds.\n\n" +
            "6. Submission: Once submitted, the exam session lock closes permanently."
    });
}

// Feature: Screen Preview Capture with graceful macOS permission fallback
async function takeScreenShot() {
    try {
        const sources = await desktopCapturer.getSources({
            types: ["screen"],
            thumbnailSize: { width: 1280, height: 720 }
        });

        if (sources && sources.length > 0) {
            const primaryScreen = sources[0];
            const pngBuffer = primaryScreen.thumbnail.toPNG();

            const fileName = `screen-${Date.now()}.png`;
            const filePath = path.join(SCREEN_SNAP_DIR, fileName);
            fs.writeFileSync(filePath, pngBuffer);

            return { fileName, filePath, timestamp: Date.now(), source: "desktopCapturer" };
        }
    } catch (error) {
        // Expected on macOS when Terminal/Electron has not been granted Screen Recording in System Settings
    }

    // High-fidelity fallback: window capturePage (requires zero OS permissions and always succeeds)
    try {
        if (electronWindow && !electronWindow.isDestroyed()) {
            const image = await electronWindow.capturePage();
            const pngBuffer = image.toPNG();

            const fileName = `screen-${Date.now()}.png`;
            const filePath = path.join(SCREEN_SNAP_DIR, fileName);
            fs.writeFileSync(filePath, pngBuffer);

            return { fileName, filePath, timestamp: Date.now(), source: "capturePage" };
        }
    } catch (fallbackError) {
        console.error("Fallback screen capture failed:", fallbackError);
    }

    return null;
}

// Start proctoring timer and periodic snapshots
ipcMain.handle("start-timer", () => {
    startTimestamp = Date.now();

    if (timerInterval) clearInterval(timerInterval);
    if (captureInterval) clearInterval(captureInterval);

    // Timer tick every second
    timerInterval = setInterval(() => {
        if (electronWindow && !electronWindow.isDestroyed()) {
            const elapsed = (Date.now() - startTimestamp) / 1000;
            electronWindow.webContents.send("timer", elapsed);
        }
    }, 1000);

    // Feature: Parallel Save (camera photo + screen preview together every 5s)
    captureInterval = setInterval(() => {
        if (!electronWindow || electronWindow.isDestroyed()) return;

        Promise.all([
            Promise.resolve(electronWindow.webContents.send("camera-shot")),
            takeScreenShot()
        ]).then(([, screenResult]) => {
            if (screenResult && electronWindow && !electronWindow.isDestroyed()) {
                electronWindow.webContents.send("screen-captured", screenResult);
            }
        }).catch((error) => {
            console.error("Parallel save error:", error);
        });
    }, 5000);

    return { success: true, startTime: startTimestamp };
});

ipcMain.handle("stop-timer", () => {
    if (timerInterval) clearInterval(timerInterval);
    if (captureInterval) clearInterval(captureInterval);
    timerInterval = null;
    captureInterval = null;
    return { success: true };
});

ipcMain.handle("store-camera-snap-image-on-disk", (_event, data) => {
    try {
        const fileName = `${Date.now()}.jpg`;
        let filePath = path.join(CAMERA_SNAP_DIR, fileName);

        if (cameraShotPath) {
            filePath = cameraShotPath;
        }
        fs.writeFileSync(filePath, Buffer.from(data));

        if (electronWindow && !electronWindow.isDestroyed()) {
            electronWindow.webContents.send("camera-captured", {
                fileName,
                filePath,
                timestamp: Date.now()
            });
        }
        return { success: true, fileName };
    } catch (err) {
        console.error("Failed to write camera snap:", err);
        return { success: false, error: err.message };
    }
});

// Feature: Return disk snapshot catalog for proctor inspector
ipcMain.handle("get-saved-snapshots", () => {
    try {
        const cameraFiles = fs.readdirSync(CAMERA_SNAP_DIR)
            .filter(f => f.endsWith(".jpg") || f.endsWith(".png"))
            .map(f => ({
                name: f,
                type: "camera",
                path: path.join(CAMERA_SNAP_DIR, f),
                time: fs.statSync(path.join(CAMERA_SNAP_DIR, f)).mtimeMs
            }))
            .sort((a, b) => b.time - a.time);

        const screenFiles = fs.readdirSync(SCREEN_SNAP_DIR)
            .filter(f => f.endsWith(".png") || f.endsWith(".jpg"))
            .map(f => ({
                name: f,
                type: "screen",
                path: path.join(SCREEN_SNAP_DIR, f),
                time: fs.statSync(path.join(SCREEN_SNAP_DIR, f)).mtimeMs
            }))
            .sort((a, b) => b.time - a.time);

        return { cameraSnaps: cameraFiles, screenSnaps: screenFiles };
    } catch (err) {
        console.error("Error reading snapshots:", err);
        return { cameraSnaps: [], screenSnaps: [] };
    }
});

ipcMain.on("show-rules", () => {
    showExamRulesDialog();
});

ipcMain.handle("showMessageBox", async () => {
    if (!electronWindow) return null;
    const data = await dialog.showMessageBox(electronWindow, {
        type: "info",
        title: "Guidelines & Academic Honesty Pledge",
        message:
            "Athena Automated Proctoring System Guidelines\n\n" +
            "• We securely record and archive biometric webcam and screen snapshots every 5 seconds.\n" +
            "• Any unauthorized aids, browser tabs, or communication tools will invalidate your exam.\n" +
            "• Your session integrity telemetry is audited in real-time.",
        buttons: ["I Understand & Agree", "Review Rules Again"],
        checkboxChecked: true,
        checkboxLabel: "I certify that I will abide by the Athena Academic Integrity Charter"
    });
    return data;
});

ipcMain.handle("selectFile", async () => {
    if (!electronWindow) return null;
    const response = await dialog.showOpenDialog(electronWindow, {
        title: "Select Reference Attachment or Code Submission",
        properties: ["openFile"],
        filters: [
            { name: "Code & Documents", extensions: ["js", "jsx", "ts", "tsx", "py", "java", "cpp", "json", "pdf", "txt"] },
            { name: "All files", extensions: ["*"] }
        ]
    });
    return response;
});

ipcMain.handle("selectFolder", async () => {
    if (!electronWindow) return null;
    const response = await dialog.showOpenDialog(electronWindow, {
        title: "Select Output Audit Directory",
        buttonLabel: "Select Directory",
        properties: ["openDirectory"],
        defaultPath: CAMERA_SNAP_DIR
    });
    return response;
});

ipcMain.handle("showSaveDialogBox", async (_event, defaultFileName) => {
    if (!electronWindow) return null;
    const response = await dialog.showSaveDialog(electronWindow, {
        title: "Export Athena Exam & Proctoring Audit Log",
        message: "Choose location to save session audit report",
        buttonLabel: "Export Report",
        defaultPath: defaultFileName || `athena-audit-report-${Date.now()}.json`
    });
    return response;
});

ipcMain.handle("write-audit-file", async (_event, { filePath, content }) => {
    try {
        fs.writeFileSync(filePath, typeof content === 'string' ? content : JSON.stringify(content, null, 2));
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle("exit-app", () => {
    if (timerInterval) clearInterval(timerInterval);
    if (captureInterval) clearInterval(captureInterval);
    app.quit();
});

// Feature: Python Code Runner with timeout, multi-arg support, and print capture
ipcMain.handle("run-python-code", async (_event, { code, testCases, functionName = "is_palindrome" }) => {
    return new Promise((resolve) => {
        const runnerScript = `
import json, sys, io

code_str = json.loads(${JSON.stringify(JSON.stringify(code))})
tests = json.loads(${JSON.stringify(JSON.stringify(testCases || []))})
fn_name = json.loads(${JSON.stringify(JSON.stringify(functionName))})

user_out = io.StringIO()
orig_out = sys.stdout
sys.stdout = user_out

results = []
err_msg = None

try:
    namespace = {}
    exec(code_str, namespace)
    fn = namespace.get(fn_name)
    if not fn or not callable(fn):
        err_msg = f"Function '{fn_name}' was not found. Please define def {fn_name}(...):"
    else:
        for t in tests:
            inp = t.get("input")
            exp = t.get("expected")
            try:
                if isinstance(inp, (list, tuple)):
                    actual = fn(*inp)
                else:
                    actual = fn(inp)
                passed = (actual == exp)
                results.append({
                    "id": t.get("id"),
                    "input": str(inp),
                    "expected": str(exp),
                    "actual": str(actual),
                    "passed": passed
                })
            except Exception as call_err:
                results.append({
                    "id": t.get("id"),
                    "input": str(inp),
                    "expected": str(exp),
                    "actual": f"Error: {call_err}",
                    "passed": False,
                    "error": str(call_err)
                })
except SyntaxError as syn_err:
    err_msg = f"SyntaxError at line {syn_err.lineno}: {syn_err.msg}"
except Exception as gen_err:
    err_msg = f"Runtime error: {gen_err}"

sys.stdout = orig_out
user_logs = user_out.getvalue()

output_obj = {
    "error": err_msg,
    "results": results,
    "allPassed": bool(results and all(r["passed"] for r in results)),
    "logs": user_logs
}
print("<<<ATHENA_START>>>" + json.dumps(output_obj) + "<<<ATHENA_END>>>")
`;

        const pyProcess = spawn("python3", ["-c", runnerScript]);
        let stdout = "";
        let stderr = "";

        const timer = setTimeout(() => {
            pyProcess.kill("SIGKILL");
            resolve({ error: "Execution Timed Out (5s limit). Please check for infinite loops." });
        }, 5000);

        pyProcess.stdout.on("data", (data) => {
            stdout += data.toString();
        });

        pyProcess.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        pyProcess.on("close", (exitCode) => {
            clearTimeout(timer);
            try {
                const startMarker = "<<<ATHENA_START>>>";
                const endMarker = "<<<ATHENA_END>>>";
                if (stdout.includes(startMarker) && stdout.includes(endMarker)) {
                    const startIdx = stdout.indexOf(startMarker) + startMarker.length;
                    const endIdx = stdout.indexOf(endMarker);
                    const jsonStr = stdout.slice(startIdx, endIdx);
                    const parsed = JSON.parse(jsonStr);
                    resolve(parsed);
                } else if (stdout.trim()) {
                    try {
                        const parsed = JSON.parse(stdout.trim());
                        resolve(parsed);
                    } catch (_) {
                        resolve({ error: stdout.trim() });
                    }
                } else if (stderr.trim()) {
                    resolve({ error: stderr.trim() });
                } else {
                    resolve({ error: `Process exited with code ${exitCode}` });
                }
            } catch (parseErr) {
                resolve({ error: stdout || stderr || "Failed to parse Python output." });
            }
        });
    });
});

ipcMain.handle("log-violation-to-main", (_event, violation) => {
    sessionViolations.push({
        ...violation,
        loggedAt: new Date().toISOString()
    });
    console.warn("[ATHENA PROCTORING VIOLATION]:", violation);
    return { count: sessionViolations.length };
});

app.whenReady().then(() => {
    createApplicationMenu();
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
