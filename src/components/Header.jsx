// src/components/Header.jsx
import React from 'react';
import { Clock, Shield, AlertCircle, LogOut } from 'lucide-react';

export default function Header({ 
    stage,
    remainingSeconds, 
    violationCount, 
    onOpenRules, 
    onOpenDiagnostics,
    onOpenSubmitModal,
    onOpenExitModal
}) {
    const isExamActive = stage === 'exam_mcq' || stage === 'exam_coding';

    function formatTime(totalSeconds) {
        const secs = Math.max(0, Math.floor(totalSeconds || 0));
        const mm = String(Math.floor(secs / 60)).padStart(2, '0');
        const ss = String(secs % 60).padStart(2, '0');
        return `${mm}:${ss}`;
    }

    return (
        <header className="header">
            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                }}>
                    <Shield size={18} />
                </div>
                <div>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>
                        Athena
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                        {stage === 'readiness_home' && "Assessment Setup & Readiness"}
                        {stage === 'exam_mcq' && "Part 1: Multiple Choice"}
                        {stage === 'readiness_coding' && "Coding Readiness Check"}
                        {stage === 'exam_coding' && "Part 2: Python Coding"}
                        {stage === 'exam_submitted' && "Exam Concluded"}
                    </span>
                </div>
            </div>

            {/* Center Status & Timer during exam */}
            {isExamActive ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="badge badge-ready" style={{ padding: '6px 12px' }}>
                        <span className="recording-dot" />
                        <span>Camera Active</span>
                    </div>

                    {/* Prominent Header Timer */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: remainingSeconds < 120 ? 'var(--danger-bg)' : '#f1f5f9',
                        border: `1px solid ${remainingSeconds < 120 ? 'var(--danger-border)' : 'var(--border)'}`,
                        borderRadius: '8px',
                        padding: '6px 14px'
                    }}>
                        <Clock size={16} color={remainingSeconds < 120 ? 'var(--danger)' : 'var(--primary)'} />
                        <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '16px',
                            fontWeight: 700,
                            color: remainingSeconds < 120 ? 'var(--danger)' : 'var(--text)'
                        }}>
                            {formatTime(remainingSeconds)}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>left</span>
                    </div>

                    {violationCount > 0 && (
                        <div className="badge badge-warn" onClick={onOpenDiagnostics} style={{ cursor: 'pointer' }}>
                            <AlertCircle size={14} />
                            <span>{violationCount} Notice{violationCount === 1 ? '' : 's'}</span>
                        </div>
                    )}
                </div>
            ) : <div />}

            {/* Actions: Rules, Inspector, Finish, and Exit */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                    className="btn btn-secondary btn-sm"
                    onClick={onOpenRules}
                >
                    Exam Rules
                </button>

                <button 
                    className="btn btn-secondary btn-sm"
                    onClick={onOpenDiagnostics}
                >
                    Inspector
                </button>

                {stage === 'exam_mcq' && (
                    <button 
                        className="btn btn-primary btn-sm"
                        onClick={onOpenSubmitModal}
                    >
                        Finish MCQs
                    </button>
                )}

                {/* Permanent visible Exit Exam button */}
                <button 
                    className="btn btn-secondary btn-sm"
                    onClick={onOpenExitModal}
                    style={{ color: 'var(--danger)', borderColor: 'var(--danger-border)', background: 'var(--danger-bg)' }}
                    title="Exit exam and quit application"
                >
                    <LogOut size={13} /> Exit Exam
                </button>
            </div>
        </header>
    );
}
