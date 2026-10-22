// src/App.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Header from './components/Header';
import ReadinessCheck from './components/ReadinessCheck';
import ExamWorkspace from './components/ExamWorkspace';
import CodingWorkspace from './components/CodingWorkspace';
import ExamSubmissionModal from './components/ExamSubmissionModal';
import ExamSubmissionResult from './components/ExamSubmissionResult';
import FullscreenWarningModal from './components/FullscreenWarningModal';
import ProctorInspectorModal from './components/ProctorInspectorModal';
import { EXAM_METADATA } from './data/examQuestions';

export default function App() {
    // Stage: 'readiness_mcq' | 'exam_mcq' | 'readiness_coding' | 'exam_coding' | 'exam_submitted'
    const [stage, setStage] = useState('readiness_mcq');
    const [timer, setTimer] = useState(0);

    // Readiness: Only Camera and Fullscreen
    const [cameraEnabled, setCameraEnabled] = useState(false);
    const [fullScreen, setFullScreen] = useState(false);

    // Assessment answers & bookmarks
    const [answers, setAnswers] = useState({});
    const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
    const [codingSubmission, setCodingSubmission] = useState(null);

    // Proctoring telemetry
    const [violations, setViolations] = useState([]);
    const [snapshotStats, setSnapshotStats] = useState({ cameraCount: 0, screenCount: 0 });

    // Modals
    const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);

    // Hidden camera feed ref (never visible on screen)
    const cameraVideoRef = useRef(null);
    const cameraStreamRef = useRef(null);

    // 10-minute timer for MCQs (600 seconds)
    const mcqLimitSeconds = EXAM_METADATA.durationMinutes * 60; // 600s
    const remainingSeconds = Math.max(0, mcqLimitSeconds - Math.floor(timer));

    const recordViolation = useCallback((violation) => {
        const item = {
            ...violation,
            timestamp: new Date().toISOString()
        };
        setViolations(prev => [item, ...prev]);
        window.athena?.logViolation?.(item);
    }, []);

    // Periodic still snapshot from candidate camera (background processing)
    const saveVideoScreenShots = useCallback(async () => {
        const stream = cameraStreamRef.current;
        if (!stream) return;

        try {
            const track = stream.getVideoTracks()[0];
            if (!track) return;

            let arrayBuffer = null;

            if (typeof window.ImageCapture === 'function') {
                try {
                    const imageCapture = new ImageCapture(track);
                    const blob = await imageCapture.takePhoto();
                    arrayBuffer = await blob.arrayBuffer();
                } catch (icErr) {
                    // Fall back to Canvas
                }
            }

            const video = cameraVideoRef.current;
            if (!arrayBuffer && video && video.videoWidth > 0 && video.videoHeight > 0) {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
                if (blob) {
                    arrayBuffer = await blob.arrayBuffer();
                }
            }

            if (arrayBuffer && window.athena?.storeCameraSnapImageOnDisk) {
                await window.athena.storeCameraSnapImageOnDisk(arrayBuffer);
                setSnapshotStats(prev => ({ ...prev, cameraCount: prev.cameraCount + 1 }));
            }
        } catch (error) {
            console.error("Camera snapshot error:", error);
        }
    }, []);

    // IPC event bindings from Electron main
    useEffect(() => {
        if (!window.athena) return;

        const removeTimerTick = window.athena.registerListenerForTimerTickFromMain((time) => {
            setTimer(time);
        });

        const removeCameraSnap = window.athena.registerListenerForCameraSnapFromMain(() => {
            saveVideoScreenShots();
        });

        const removeScreenSnap = window.athena.registerListenerForScreenCaptured?.(() => {
            setSnapshotStats(prev => ({ ...prev, screenCount: prev.screenCount + 1 }));
        });

        const removeCameraCaptured = window.athena.registerListenerForCameraCaptured?.(() => {
            setSnapshotStats(prev => ({ ...prev, cameraCount: prev.cameraCount + 1 }));
        });

        const removeViolationListener = window.athena.registerListenerForViolation?.((violation) => {
            recordViolation({
                type: "COPY_BLOCKED",
                detail: violation?.message || "Copying is disabled during the exam."
            });
        });

        const removeDiagnosticsListener = window.athena.registerListenerForDiagnostics?.(() => {
            setShowDiagnosticsModal(true);
        });

        return () => {
            removeTimerTick?.();
            removeCameraSnap?.();
            removeScreenSnap?.();
            removeCameraCaptured?.();
            removeViolationListener?.();
            removeDiagnosticsListener?.();
        };
    }, [saveVideoScreenShots, recordViolation]);

    // 10 minutes MCQ automatic timeout: ends on its own and returns to home screen for coding
    useEffect(() => {
        if (stage === 'exam_mcq' && timer >= mcqLimitSeconds) {
            transitionFromMcqToCoding();
        }
    }, [stage, timer, mcqLimitSeconds]);

    // Helper: Transition from MCQ to Home Screen for Part 2 Coding
    function transitionFromMcqToCoding() {
        setShowSubmitModal(false);
        setStage('readiness_coding');
    }

    // Fullscreen and focus detection
    useEffect(() => {
        const isExamActive = stage === 'exam_mcq' || stage === 'exam_coding';

        function handleFullscreenChange() {
            const isFull = !!document.fullscreenElement;
            setFullScreen(isFull);

            if (!isFull && isExamActive) {
                setShowFullscreenWarning(true);
                recordViolation({
                    type: "FULLSCREEN_EXITED",
                    detail: "Full screen mode was exited during the exam."
                });
            }
        }

        function handleWindowBlur() {
            if (isExamActive) {
                recordViolation({
                    type: "WINDOW_BLUR",
                    detail: "Window lost focus."
                });
            }
        }

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        window.addEventListener("blur", handleWindowBlur);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            window.removeEventListener("blur", handleWindowBlur);
        };
    }, [stage, recordViolation]);

    // Camera access
    async function getCameraAccess() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            cameraStreamRef.current = stream;

            if (cameraVideoRef.current) {
                cameraVideoRef.current.srcObject = stream;
            }
            setCameraEnabled(true);
        } catch (error) {
            alert("Cannot access camera. Please allow camera permissions and try again.");
        }
    }

    // Full-screen switch
    async function enableFullScreen() {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            }
            setFullScreen(true);
            setShowFullscreenWarning(false);
        } catch (error) {
            alert("Cannot switch to full screen.");
        }
    }

    // Begin Part 1: MCQs
    async function startMcqExam() {
        try {
            if (window.athena?.startTimerOnMain) {
                await window.athena.startTimerOnMain();
            }
            setStage('exam_mcq');
        } catch (error) {
            setStage('exam_mcq');
        }
    }

    // Begin Part 2: Coding Problem
    function startCodingExam() {
        setStage('exam_coding');
    }

    // Submit Final Coding Problem
    function handleSubmitCoding(result) {
        setCodingSubmission(result);
        setStage('exam_submitted');
        if (window.athena?.stopTimerOnMain) {
            window.athena.stopTimerOnMain();
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Hidden video element: keeps camera active for background snapshots without displaying video to user */}
            <video
                ref={cameraVideoRef}
                autoPlay
                playsInline
                muted
                style={{ display: 'none' }}
            />

            {/* Clean Light Header */}
            <Header
                stage={stage}
                timer={timer}
                remainingSeconds={remainingSeconds}
                violationCount={violations.length}
                onOpenRules={() => window.athena?.showRules?.()}
                onOpenDiagnostics={() => setShowDiagnosticsModal(true)}
                onOpenSubmitModal={() => setShowSubmitModal(true)}
            />

            {/* View 1: Readiness Check for Part 1 (MCQs) */}
            {stage === 'readiness_mcq' && (
                <ReadinessCheck
                    title="Part 1: Multiple Choice Questions"
                    subtitle="10 minutes timed assessment. Camera and full screen must be turned on to begin."
                    badgeLabel="Section 1 Readiness"
                    buttonLabel="Begin MCQs (10 mins)"
                    cameraEnabled={cameraEnabled}
                    fullScreen={fullScreen}
                    onGetCameraAccess={getCameraAccess}
                    onEnableFullScreen={enableFullScreen}
                    onStartExam={startMcqExam}
                    onManualSnapshot={saveVideoScreenShots}
                />
            )}

            {/* View 2: Active 10-Minute MCQs Workspace */}
            {stage === 'exam_mcq' && (
                <ExamWorkspace
                    answers={answers}
                    setAnswers={setAnswers}
                    flaggedQuestions={flaggedQuestions}
                    setFlaggedQuestions={setFlaggedQuestions}
                    snapshotStats={snapshotStats}
                    onOpenSubmitModal={() => setShowSubmitModal(true)}
                />
            )}

            {/* View 3: Back to Home Screen with Permissions for Part 2 Coding */}
            {stage === 'readiness_coding' && (
                <ReadinessCheck
                    title="Part 2: Python Coding Assessment"
                    subtitle="Please re-verify your camera and full screen before proceeding to the coding question."
                    badgeLabel="Section 2 Readiness"
                    buttonLabel="Begin Coding Assessment"
                    cameraEnabled={cameraEnabled}
                    fullScreen={fullScreen}
                    onGetCameraAccess={getCameraAccess}
                    onEnableFullScreen={enableFullScreen}
                    onStartExam={startCodingExam}
                    onManualSnapshot={saveVideoScreenShots}
                />
            )}

            {/* View 4: Python Coding Problem Workspace */}
            {stage === 'exam_coding' && (
                <CodingWorkspace
                    onSubmitCoding={handleSubmitCoding}
                    onOpenRules={() => window.athena?.showRules?.()}
                    onOpenDiagnostics={() => setShowDiagnosticsModal(true)}
                />
            )}

            {/* View 5: Post-Submission with 3-second auto-exit */}
            {stage === 'exam_submitted' && (
                <ExamSubmissionResult
                    answers={answers}
                    elapsedSeconds={timer}
                />
            )}

            {/* Fullscreen Return Warning */}
            {showFullscreenWarning && (
                <FullscreenWarningModal
                    onReenterFullscreen={enableFullScreen}
                />
            )}

            {/* MCQ Submission Confirmation Modal */}
            {showSubmitModal && (
                <ExamSubmissionModal
                    answers={answers}
                    flaggedQuestions={flaggedQuestions}
                    onConfirmSubmit={transitionFromMcqToCoding}
                    onClose={() => setShowSubmitModal(false)}
                />
            )}

            {/* Diagnostics / Snapshots Modal */}
            {showDiagnosticsModal && (
                <ProctorInspectorModal
                    violations={violations}
                    onClose={() => setShowDiagnosticsModal(false)}
                    onManualSnapshot={saveVideoScreenShots}
                />
            )}
        </div>
    );
}
