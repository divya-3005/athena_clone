// src/components/ReadinessCheck.jsx
import React, { useState } from 'react';
import { Camera, Maximize, Check, ChevronDown, Folder, FileText, CheckCircle2, Code2, BookOpen } from 'lucide-react';

export default function ReadinessCheck({
    cameraEnabled,
    fullScreen,
    selectedSection = 'mcq',
    onSelectSection,
    onGetCameraAccess,
    onEnableFullScreen,
    onStartExam,
    onManualSnapshot
}) {
    const [showTools, setShowTools] = useState(false);
    const [saveLocally, setSaveLocally] = useState(true);
    const allChecksReady = cameraEnabled && fullScreen;

    return (
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 20px 48px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
                    Exam readiness &amp; section choice
                </h1>
                <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    Verify camera and full screen, then choose which section you want to do first.
                </p>
            </div>

            {/* Feature: Choose what you want to do first */}
            <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '12px' }}>
                    Choose which part to do first:
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {/* Option A: MCQs */}
                    <div
                        onClick={() => onSelectSection && onSelectSection('mcq')}
                        style={{
                            padding: '16px',
                            borderRadius: '8px',
                            border: `2px solid ${selectedSection === 'mcq' ? 'var(--primary)' : 'var(--border)'}`,
                            background: selectedSection === 'mcq' ? 'var(--primary-bg)' : '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px', color: selectedSection === 'mcq' ? 'var(--primary)' : 'var(--text)' }}>
                                <BookOpen size={16} />
                                Part 1: MCQs
                            </div>
                            {selectedSection === 'mcq' && (
                                <CheckCircle2 size={16} color="var(--primary)" />
                            )}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            12 Multiple Choice Questions (10-minute timer). Choose any question to start with.
                        </div>
                    </div>

                    {/* Option B: Python Coding */}
                    <div
                        onClick={() => onSelectSection && onSelectSection('coding')}
                        style={{
                            padding: '16px',
                            borderRadius: '8px',
                            border: `2px solid ${selectedSection === 'coding' ? 'var(--primary)' : 'var(--border)'}`,
                            background: selectedSection === 'coding' ? 'var(--primary-bg)' : '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px', color: selectedSection === 'coding' ? 'var(--primary)' : 'var(--text)' }}>
                                <Code2 size={16} />
                                Part 2: Python Coding
                            </div>
                            {selectedSection === 'coding' && (
                                <CheckCircle2 size={16} color="var(--primary)" />
                            )}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            2 Python coding problems (Palindrome Checker &amp; Sum of Two Numbers) with question chooser, Run, and Submit.
                        </div>
                    </div>
                </div>
            </div>

            {/* Checklist Card */}
            <div className="card" style={{ padding: '8px 24px', marginBottom: '24px' }}>
                {/* 1. Camera */}
                <div style={{ display: 'flex', gap: '16px', padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
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
                        <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '2px' }}>
                            Camera
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                            Used to verify identity during the assessment.
                        </p>

                        <div>
                            {cameraEnabled ? (
                                <span className="badge badge-ready">
                                    <Check size={14} /> Camera connected
                                </span>
                            ) : (
                                <button className="btn btn-primary btn-sm" onClick={onGetCameraAccess}>
                                    Allow camera access
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Fullscreen */}
                <div style={{ display: 'flex', gap: '16px', padding: '20px 0' }}>
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
                        <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '2px' }}>
                            Full screen
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                            Stays on for the entire session to minimize distractions.
                        </p>

                        <div>
                            {fullScreen ? (
                                <span className="badge badge-ready">
                                    <Check size={14} /> Full screen locked in
                                </span>
                            ) : (
                                <button className="btn btn-primary btn-sm" onClick={onEnableFullScreen}>
                                    Switch to full screen
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Ask candidate if they want to save pictures on their laptop */}
            <div 
                onClick={() => setSaveLocally(!saveLocally)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 18px',
                    borderRadius: '8px',
                    border: `1.5px solid ${saveLocally ? 'var(--primary)' : 'var(--border)'}`,
                    background: saveLocally ? 'var(--primary-bg)' : '#ffffff',
                    marginBottom: '20px',
                    cursor: 'pointer',
                    userSelect: 'none'
                }}
            >
                <input 
                    type="checkbox" 
                    checked={saveLocally} 
                    onChange={(e) => setSaveLocally(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>
                        Save proctoring snapshots to this computer
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {saveLocally 
                            ? 'Photos and screen captures will be archived to Desktop/Athena_Proctoring_Data for evaluator review.' 
                            : 'No files or photos will be saved to your laptop.'}
                    </div>
                </div>
            </div>

            {/* Begin Exam Button */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
                <button
                    className="btn btn-primary"
                    disabled={!allChecksReady}
                    onClick={() => onStartExam && onStartExam(saveLocally)}
                    style={{
                        padding: '13px 36px',
                        fontSize: '15px',
                        fontWeight: 600,
                        width: '100%',
                        maxWidth: '320px'
                    }}
                >
                    {selectedSection === 'mcq' ? "Begin with MCQs (10 mins)" : "Begin with Python Coding (2 Problems)"}
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
