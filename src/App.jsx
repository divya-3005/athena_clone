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
import ExitModal from './components/ExitModal';
import { EXAM_METADATA } from './data/examQuestions';

export default function App() {
    // Stage: 'readiness_home' | 'exam_mcq' | 'readiness_coding' | 'exam_coding' | 'exam_submitted'
    const [stage, setStage] = useState('readiness_home');
    const [selectedFirstSection, setSelectedFirstSection] = useState('mcq'); // 'mcq' | 'coding'
    const [completedSections, setCompletedSections] = useState(new Set());

    // 10-Minute Timer (600s) — reliable countdown state
    const [remainingSeconds, setRemainingSeconds] = useState(EXAM_METADATA.durationMinutes * 60);

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
    const [showExitModal, setShowExitModal] = useState(false);

    // Hidden camera feed ref (never visible on screen)
    const cameraVideoRef = useRef(null);
    const cameraStreamRef = useRef(null);

    const recordViolation = useCallback((violation) => {
        const item = {
            ...violation,
            timestamp: new Date().toISOString()
        };
        setViolations(prev => [item, ...prev]);
        window.athena?.logViolation?.(item);
    }, []);

    // Feature: Periodic still snapshot from candidate camera (background processing)
    const saveVideoScreenShots = useCallback(async () => {
        // Only capture when actively inside an exam workspace
        const isExamActive = stage === 'exam_mcq' || stage === 'exam_coding';
        if (!isExamActive) return;

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
    }, [stage]);
    
    // Ensure proctoring captures are idle on initial landing screen
    useEffect(() => {
        if (window.athena?.stopTimerOnMain) {
            window.athena.stopTimerOnMain();
        }
    }, []);

    // IPC event bindings from Electron main
    useEffect(() => {
        if (!window.athena) return;

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
            removeCameraSnap?.();
            removeScreenSnap?.();
            removeCameraCaptured?.();
            removeViolationListener?.();
            removeDiagnosticsListener?.();
        };
    }, [saveVideoScreenShots, recordViolation]);

    // Live 10-Minute Countdown Timer shown while questions are being done
    useEffect(() => {
        const isExamActive = stage === 'exam_mcq' || stage === 'exam_coding';
        if (!isExamActive) return;

        const interval = setInterval(() => {
            setRemainingSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    if (stage === 'exam_mcq') {
                        handleFinishMcq();
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [stage]);

    // Transition from MCQ to next part (or finish)
    function handleFinishMcq() {
        setShowSubmitModal(false);
        setCompletedSections(prev => new Set(prev).add('mcq'));

        if (!completedSections.has('coding') && selectedFirstSection === 'mcq') {
            // Stop captures while on landing screen for Part 2 Coding
            if (window.athena?.stopTimerOnMain) {
                window.athena.stopTimerOnMain();
            }
            setStage('readiness_coding');
        } else {
            // Both finished
            if (window.athena?.stopTimerOnMain) {
                window.athena.stopTimerOnMain();
            }
            setStage('exam_submitted');
        }
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

    // Start whatever section candidate chose first
    async function handleStartChosenSection() {
        try {
            if (window.athena?.startTimerOnMain) {
                await window.athena.startTimerOnMain();
            }
        } catch (e) {
            // non-fatal
        }

        if (selectedFirstSection === 'mcq') {
            setStage('exam_mcq');
        } else {
            setStage('exam_coding');
        }
    }

    // Start Coding Section
    async function handleStartCoding() {
        try {
            if (window.athena?.startTimerOnMain) {
                await window.athena.startTimerOnMain();
            }
        } catch (e) {
            // non-fatal
        }
        setStage('exam_coding');
    }

    // Submit Coding problem
    function handleSubmitCoding(result) {
        setCodingSubmission(result);
        setCompletedSections(prev => new Set(prev).add('coding'));

        if (!completedSections.has('mcq') && selectedFirstSection === 'coding') {
            // If they did coding first, stop timer and return to home screen for MCQs
            if (window.athena?.stopTimerOnMain) {
                window.athena.stopTimerOnMain();
            }
            setStage('readiness_home');
            setSelectedFirstSection('mcq');
        } else {
            // Both finished
            setStage('exam_submitted');
            if (window.athena?.stopTimerOnMain) {
                window.athena.stopTimerOnMain();
            }
        }
    }

    // User chooses to exit app immediately
    function handleConfirmExit() {
        setShowExitModal(false);
        if (window.athena?.exitApp) {
            window.athena.exitApp();
        } else {
            window.close();
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

            {/* Clean Light Header with Timer and Exit Exam Option */}
            <Header
                stage={stage}
                remainingSeconds={remainingSeconds}
                violationCount={violations.length}
                onOpenRules={() => window.athena?.showRules?.()}
                onOpenDiagnostics={() => setShowDiagnosticsModal(true)}
                onOpenSubmitModal={() => setShowSubmitModal(true)}
                onOpenExitModal={() => setShowExitModal(true)}
            />

            {/* View 1: Home Readiness Screen (Choose which part to do first + Permissions) */}
            {stage === 'readiness_home' && (
                <ReadinessCheck
                    cameraEnabled={cameraEnabled}
                    fullScreen={fullScreen}
                    selectedSection={selectedFirstSection}
                    onSelectSection={(sec) => setSelectedFirstSection(sec)}
                    onGetCameraAccess={getCameraAccess}
                    onEnableFullScreen={enableFullScreen}
                    onStartExam={handleStartChosenSection}
                    onManualSnapshot={saveVideoScreenShots}
                />
            )}

            {/* View 2: Active MCQs Workspace with Live Timer on Question & Top Question Selector */}
            {stage === 'exam_mcq' && (
                <ExamWorkspace
                    answers={answers}
                    setAnswers={setAnswers}
                    flaggedQuestions={flaggedQuestions}
                    setFlaggedQuestions={setFlaggedQuestions}
                    remainingSeconds={remainingSeconds}
                    onOpenSubmitModal={() => setShowSubmitModal(true)}
                />
            )}

            {/* View 3: Back to Home Screen with Permissions for Part 2 Coding */}
            {stage === 'readiness_coding' && (
                <ReadinessCheck
                    cameraEnabled={cameraEnabled}
                    fullScreen={fullScreen}
                    selectedSection="coding"
                    onSelectSection={() => {}}
                    onGetCameraAccess={getCameraAccess}
                    onEnableFullScreen={enableFullScreen}
                    onStartExam={handleStartCoding}
                    onManualSnapshot={saveVideoScreenShots}
                />
            )}

            {/* View 4: Python Coding Problem Workspace with Live Timer */}
            {stage === 'exam_coding' && (
                <CodingWorkspace
                    remainingSeconds={remainingSeconds}
                    onSubmitCoding={handleSubmitCoding}
                    onOpenRules={() => window.athena?.showRules?.()}
                    onOpenDiagnostics={() => setShowDiagnosticsModal(true)}
                />
            )}

            {/* View 5: Post-Submission with 3-second auto-exit */}
            {stage === 'exam_submitted' && (
                <ExamSubmissionResult
                    answers={answers}
                    codingSubmission={codingSubmission}
                    elapsedSeconds={600 - remainingSeconds}
                />
            )}

            {/* Exit Confirmation Modal */}
            {showExitModal && (
                <ExitModal
                    onConfirmExit={handleConfirmExit}
                    onClose={() => setShowExitModal(false)}
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
                    onConfirmSubmit={handleFinishMcq}
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
