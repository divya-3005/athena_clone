// src/components/ReadinessCheck.jsx
import React, { useState } from 'react';
import { Camera, Maximize, Check, ChevronDown, Folder, FileText } from 'lucide-react';

export default function ReadinessCheck({
    title = "Exam readiness check",
    subtitle = "Camera and full screen must be turned on before the exam can begin.",
    buttonLabel = "Begin exam",
    badgeLabel = "Readiness Check",
    cameraEnabled,
    fullScreen,
    onGetCameraAccess,
    onEnableFullScreen,
    onStartExam,
    onManualSnapshot
}) {
    const [showTools, setShowTools] = useState(false);
    const allChecksReady = cameraEnabled && fullScreen;

    return (
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '56px 20px 48px' }}>
            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
                <div style={{ marginBottom: '8px' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '12px' }}>
                        {badgeLabel}
                    </span>
                </div>
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
                    {title}
                </h1>
                <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    {subtitle}
                </p>
            </div>

            {/* Checklist Card */}
            <div className="card" style={{ padding: '8px 24px', marginBottom: '28px' }}>
                {/* 1. Camera */}
                <div style={{ display: 'flex', gap: '16px', padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: cameraEnabled ? 'var(--success-bg)' : '#f1f5f9',
                        color: cameraEnabled ? 'var(--success)' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <Camera size={20} />
                    </div>

                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                            Camera
                        </h3>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                            Used to verify your identity during the assessment.
                        </p>

                        <div>
                            {cameraEnabled ? (
                                <span className="badge badge-ready">
                                    <Check size={14} /> Camera connected
                                </span>
                            ) : (
                                <button className="btn btn-primary" onClick={onGetCameraAccess}>
                                    Allow camera access
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Fullscreen */}
                <div style={{ display: 'flex', gap: '16px', padding: '24px 0' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: fullScreen ? 'var(--success-bg)' : '#f1f5f9',
                        color: fullScreen ? 'var(--success)' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <Maximize size={20} />
                    </div>

                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                            Full screen
                        </h3>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                            Stays on for the entire session to minimize distractions.
                        </p>

                        <div>
                            {fullScreen ? (
                                <span className="badge badge-ready">
                                    <Check size={14} /> Full screen locked in
                                </span>
                            ) : (
                                <button className="btn btn-primary" onClick={onEnableFullScreen}>
                                    Switch to full screen
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Begin Exam Button */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                <button
                    className="btn btn-primary"
                    disabled={!allChecksReady}
                    onClick={onStartExam}
                    style={{
                        padding: '13px 36px',
                        fontSize: '15px',
                        fontWeight: 600,
                        width: '100%',
                        maxWidth: '300px'
                    }}
                >
                    {buttonLabel}
                </button>

                {!allChecksReady && (
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        Turn on both camera and full screen to proceed
                    </span>
                )}
            </div>

            {/* Troubleshooting & tools */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <div 
                    onClick={() => setShowTools(!showTools)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        fontSize: '13px',
                        userSelect: 'none'
                    }}
                >
                    <span>Troubleshooting &amp; manual tools</span>
                    <ChevronDown size={14} style={{ transform: showTools ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
                </div>

                {showTools && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={onManualSnapshot}>
                            <Camera size={13} /> Save screenshot now
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => window.athena?.showRules()}>
                            <FileText size={13} /> Show rules dialog
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => window.athena?.selectFolder()}>
                            <Folder size={13} /> Select folder
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
