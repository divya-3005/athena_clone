// app/preload.js
const { contextBridge, ipcRenderer } = require("electron");

// Preload script exposing secure Athena proctoring APIs to the renderer
contextBridge.exposeInMainWorld("athena", {
    // Timer tick from main (fired every 1 second)
    registerListenerForTimerTickFromMain: (callback) => {
        const fn = (_event, message) => {
            callback(message);
        };

        ipcRenderer.on("timer", fn);

        return () => {
            ipcRenderer.removeListener("timer", fn);
        };
    },

    startTimerOnMain: () => {
        try {
            return ipcRenderer.invoke("start-timer");
        } catch (error) {
            console.error("Failed to invoke start-timer:", error);
            throw error;
        }
    },

    stopTimerOnMain: () => {
        return ipcRenderer.invoke("stop-timer");
    },

    // Parallel Save: triggered every 5s from main to snap camera frame
    registerListenerForCameraSnapFromMain: (callback) => {
        const fn = (_event) => {
            callback();
        };

        ipcRenderer.on("camera-shot", fn);

        return () => {
            ipcRenderer.removeListener("camera-shot", fn);
        };
    },

    storeCameraSnapImageOnDisk: (data) => {
        return ipcRenderer.invoke("store-camera-snap-image-on-disk", data);
    },

    // Listeners for confirmed snapshot saves
    registerListenerForScreenCaptured: (callback) => {
        const fn = (_event, data) => callback(data);
        ipcRenderer.on("screen-captured", fn);
        return () => ipcRenderer.removeListener("screen-captured", fn);
    },

    registerListenerForCameraCaptured: (callback) => {
        const fn = (_event, data) => callback(data);
        ipcRenderer.on("camera-captured", fn);
        return () => ipcRenderer.removeListener("camera-captured", fn);
    },

    // Security violation events intercepted by main (e.g. Cmd+C copy attempt)
    registerListenerForViolation: (callback) => {
        const fn = (_event, violation) => callback(violation);
        ipcRenderer.on("proctoring-violation", fn);
        return () => ipcRenderer.removeListener("proctoring-violation", fn);
    },

    registerListenerForDiagnostics: (callback) => {
        const fn = (_event) => callback();
        ipcRenderer.on("open-diagnostics", fn);
        return () => ipcRenderer.removeListener("open-diagnostics", fn);
    },

    // Contest Rules in native Electron Dialog
    showRules: () => {
        ipcRenderer.send("show-rules");
    },

    showMessageBox: () => {
        return ipcRenderer.invoke("showMessageBox");
    },

    selectFile: () => {
        return ipcRenderer.invoke("selectFile");
    },

    selectFolder: () => {
        return ipcRenderer.invoke("selectFolder");
    },

    showSaveDialogBox: (defaultName) => {
        return ipcRenderer.invoke("showSaveDialogBox", defaultName);
    },

    writeAuditFile: (filePath, content) => {
        return ipcRenderer.invoke("write-audit-file", { filePath, content });
    },

    getSavedSnapshots: () => {
        return ipcRenderer.invoke("get-saved-snapshots");
    },

    logViolation: (violation) => {
        return ipcRenderer.invoke("log-violation-to-main", violation);
    },

    exitApp: () => {
        return ipcRenderer.invoke("exit-app");
    },

    runPythonCode: ({ code, testCases, functionName }) => {
        return ipcRenderer.invoke("run-python-code", { code, testCases, functionName });
    }
});
