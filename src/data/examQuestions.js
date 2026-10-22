// src/data/examQuestions.js

export const EXAM_METADATA = {
    title: "Athena Proctored Engineering Assessment",
    code: "CS-ATHENA-804",
    durationMinutes: 10,
    totalQuestions: 12,
    passingScore: 70
};

export const EXAM_SECTIONS = [
    { id: "sec-1", name: "Architecture & Systems", questionCount: 4 },
    { id: "sec-2", name: "JavaScript & Electron Runtimes", questionCount: 4 },
    { id: "sec-3", name: "Algorithms & Security", questionCount: 4 }
];

export const EXAM_QUESTIONS = [
    {
        id: 1,
        sectionId: "sec-1",
        sectionName: "Architecture & Systems",
        title: "IPC Architecture in Electron",
        prompt: "In Electron desktop architectures, what is the primary security advantage of using `contextBridge.exposeInMainWorld` instead of setting `nodeIntegration: true` in the renderer process?",
        codeSnippet: `// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('secureAPI', {
    fetchToken: () => ipcRenderer.invoke('get-auth-token')
});`,
        options: [
            { id: "A", text: "It executes renderer JavaScript directly on the V8 engine without needing IPC serialization." },
            { id: "B", text: "It prevents arbitrary Node.js APIs (such as fs and child_process) from being exploited via Cross-Site Scripting (XSS) in untrusted web content." },
            { id: "C", text: "It doubles renderer frame rates by disabling Chromium sandbox restrictions." },
            { id: "D", text: "It automatically encrypts all WebSocket traffic at the OS kernel level." }
        ],
        correctAnswer: "B"
    },
    {
        id: 2,
        sectionId: "sec-1",
        sectionName: "Architecture & Systems",
        title: "Display Media Stream Negotiation",
        prompt: "When capturing desktop display streams using Electron's `desktopCapturer` and `session.setDisplayMediaRequestHandler`, which source types should be inspected to provide window-level or full-screen capture?",
        codeSnippet: `desktopCapturer.getSources({ types: ['screen', 'window'] })
  .then(sources => {
      // Stream handler resolution
  });`,
        options: [
            { id: "A", text: "types: ['screen', 'window']" },
            { id: "B", text: "types: ['dom', 'canvas']" },
            { id: "C", text: "types: ['usb', 'hdmi']" },
            { id: "D", text: "types: ['gpu', 'vram']" }
        ],
        correctAnswer: "A"
    },
    {
        id: 3,
        sectionId: "sec-1",
        sectionName: "Architecture & Systems",
        title: "Process Model Isolation",
        prompt: "Which Electron process is responsible for managing native operating system menus, window creation, and clipboard event interception (`before-input-event`)?",
        codeSnippet: `electronWindow.webContents.on('before-input-event', (event, input) => {
    // Intercept native keystrokes
});`,
        options: [
            { id: "A", text: "Renderer Process (Chromium)" },
            { id: "B", text: "Main Process (Node.js runtime)" },
            { id: "C", text: "Service Worker Cache Process" },
            { id: "D", text: "Audio Output Daemon" }
        ],
        correctAnswer: "B"
    },
    {
        id: 4,
        sectionId: "sec-1",
        sectionName: "Architecture & Systems",
        title: "Concurrency in Automated Proctoring",
        prompt: "Consider a proctoring app that periodically performs both screen capture (`desktopCapturer`) and requests a camera snap from the live video feed. Why is `Promise.all` advantageous for initiating these dual operations?",
        codeSnippet: `Promise.all([
    electronWindow.webContents.send('camera-shot'),
    takeScreenShot()
]);`,
        options: [
            { id: "A", text: "It prevents the CPU from clocking higher than 1.2 GHz." },
            { id: "B", text: "It executes both captures asynchronously in parallel, minimizing latency skew between face and screen states." },
            { id: "C", text: "It forces the operating system to pause all background network packets." },
            { id: "D", text: "It converts both frames into SVG vectors synchronously." }
        ],
        correctAnswer: "B"
    },
    {
        id: 5,
        sectionId: "sec-2",
        sectionName: "JavaScript & Electron Runtimes",
        title: "Event Loop & Non-Blocking File I/O",
        prompt: "In a continuous proctoring loop saving snapshots every 5 seconds, which Node.js mechanism guarantees that writing camera frames to disk does not freeze the Electron UI thread?",
        options: [
            { id: "A", text: "Using `fs.promises.writeFile` or asynchronous streaming buffers instead of blocking `fs.writeFileSync` in latency-sensitive paths." },
            { id: "B", text: "Using `while(true)` busy-waits with `process.exit()`." },
            { id: "C", text: "Running Node.js in single-threaded synchronous simulation mode." },
            { id: "D", text: "Disabling garbage collection on the V8 heap." }
        ],
        correctAnswer: "A"
    },
    {
        id: 6,
        sectionId: "sec-2",
        sectionName: "JavaScript & Electron Runtimes",
        title: "ImageCapture API in Browser MediaStreams",
        prompt: "When obtaining still camera frames from a live WebRTC `MediaStreamTrack`, what is the standard modern Web API used to extract a full-resolution JPEG `Blob`?",
        codeSnippet: `const track = videoRef.current.srcObject.getVideoTracks()[0];
const imageCapture = new ImageCapture(track);
const blob = await imageCapture.takePhoto();`,
        options: [
            { id: "A", text: "ImageCapture.takePhoto()" },
            { id: "B", text: "document.createSnapshot()" },
            { id: "C", text: "window.captureStream()" },
            { id: "D", text: "navigator.renderBitmap()" }
        ],
        correctAnswer: "A"
    },
    {
        id: 7,
        sectionId: "sec-2",
        sectionName: "JavaScript & Electron Runtimes",
        title: "Window Focus & Blur Monitoring",
        prompt: "To detect if an exam candidate switches application focus away from the Athena assessment window, which browser window event should the client monitor?",
        codeSnippet: `window.addEventListener('blur', () => {
    // Flag candidate attention lapse
});`,
        options: [
            { id: "A", text: "The 'resize' event" },
            { id: "B", text: "The 'blur' (loss of window focus) event" },
            { id: "C", text: "The 'DOMContentLoaded' event" },
            { id: "D", text: "The 'transitionend' event" }
        ],
        correctAnswer: "B"
    },
    {
        id: 8,
        sectionId: "sec-2",
        sectionName: "JavaScript & Electron Runtimes",
        title: "React 19 Cleanups & IPC Listeners",
        prompt: "Why must IPC event listeners registered in a React `useEffect` hook return a cleanup function?",
        codeSnippet: `useEffect(() => {
    const unsubscribe = window.athena.registerListenerForTimerTickFromMain(setTimer);
    return () => unsubscribe();
}, []);`,
        options: [
            { id: "A", text: "To prevent memory leaks and duplicate handler invocations upon component re-renders or hot module replacement." },
            { id: "B", text: "Because React crashes if any function returns undefined." },
            { id: "C", text: "To inform the operating system kernel to flush DNS records." },
            { id: "D", text: "It is required solely for CSS animation triggers." }
        ],
        correctAnswer: "A"
    },
    {
        id: 9,
        sectionId: "sec-3",
        sectionName: "Algorithms & Security",
        title: "Time Complexity of LRU Cache",
        prompt: "In a real-time proctoring telemetry aggregator caching the last K candidate incident timestamps, what is the optimal time complexity for both `get` and `put` operations when using a Doubly Linked List with a Hash Map (LRU Cache)?",
        options: [
            { id: "A", text: "O(log N)" },
            { id: "B", text: "O(1) constant time" },
            { id: "C", text: "O(N)" },
            { id: "D", text: "O(N log N)" }
        ],
        correctAnswer: "B"
    },
    {
        id: 10,
        sectionId: "sec-3",
        sectionName: "Algorithms & Security",
        title: "Cryptographic Tamper-Proof Audit Logs",
        prompt: "Which data structure is typically utilized to ensure that continuous proctoring snapshots and incident telemetry cannot be altered retroactively without invalidating the root verification hash?",
        options: [
            { id: "A", text: "Merkle Tree (Cryptographic Hash Tree)" },
            { id: "B", text: "Min-Heap Priority Queue" },
            { id: "C", text: "Unweighted Adjacency Matrix" },
            { id: "D", text: "Red-Black Balanced Tree without hashes" }
        ],
        correctAnswer: "A"
    },
    {
        id: 11,
        sectionId: "sec-3",
        sectionName: "Algorithms & Security",
        title: "Full-Screen Lockout Security",
        prompt: "When `document.documentElement.requestFullscreen()` is invoked during assessment mode, which browser security policy prevents arbitrary websites from locking users into full screen without prior direct user interaction?",
        options: [
            { id: "A", text: "User Activation (Transient Activation Gate) requirement" },
            { id: "B", text: "Cross-Origin Resource Sharing (CORS)" },
            { id: "C", text: "Same-Site Cookie Policy" },
            { id: "D", text: "Content Security Policy connect-src directive" }
        ],
        correctAnswer: "A"
    },
    {
        id: 12,
        sectionId: "sec-3",
        sectionName: "Algorithms & Security",
        title: "Perceptual Hashing for Screen Similarity",
        prompt: "To automatically detect if a candidate's shared screen content is mirroring unauthorized secondary browser tabs without storing uncompressed raw video, what computational technique generates a resilient fingerprint of images?",
        options: [
            { id: "A", text: "Perceptual Hash (pHash / dHash based on Discrete Cosine Transform)" },
            { id: "B", text: "MD5 cryptographic checksum" },
            { id: "C", text: "Base64 encoding length check" },
            { id: "D", text: "Run-Length Encoding count" }
        ],
        correctAnswer: "A"
    }
];

export const CODING_PROBLEM = {
    id: "py-101",
    title: "Palindrome String Checker",
    functionName: "is_palindrome",
    description: "Write a function `is_palindrome(s)` that determines whether a given string `s` is a palindrome. A palindrome reads identically forwards and backwards. Your solution should be case-insensitive and ignore non-alphanumeric characters (such as punctuation and spaces).",
    inputDescription: "A string `s` (1 <= len(s) <= 10^5)",
    outputDescription: "Return `True` if `s` is a palindrome, otherwise return `False`.",
    defaultCode: `def is_palindrome(s: str) -> bool:
    # Write your solution here
    pass
`,
    starterCode: `def is_palindrome(s: str) -> bool:
    # Example helper logic:
    cleaned = "".join(c.lower() for c in s if c.isalnum())
    return cleaned == cleaned[::-1]
`,
    examples: [
        {
            input: '"racecar"',
            output: "True",
            explanation: '"racecar" reads the same forward and backward.'
        },
        {
            input: '"hello"',
            output: "False",
            explanation: '"hello" backwards is "olleh", which does not match.'
        },
        {
            input: '"Madam, I\'m Adam"',
            output: "True",
            explanation: 'Ignoring punctuation, spaces, and casing results in "madamimadam", which is a palindrome.'
        }
    ],
    sampleTests: [
        { id: 1, input: "racecar", expected: true },
        { id: 2, input: "hello", expected: false },
        { id: 3, input: "Madam, I'm Adam", expected: true }
    ],
    allTests: [
        { id: 1, input: "racecar", expected: true },
        { id: 2, input: "hello", expected: false },
        { id: 3, input: "Madam, I'm Adam", expected: true },
        { id: 4, input: "12321", expected: true },
        { id: 5, input: "python", expected: false },
        { id: 6, input: "Was it a car or a cat I saw?", expected: true }
    ]
};
