// src/components/Header.jsx
import React from 'react';
import { Clock, Shield, AlertCircle } from 'lucide-react';

export default function Header({ 
    stage,
    timer, 
    remainingSeconds, 
    violationCount, 
    onOpenRules, 
    onOpenDiagnostics,
    onOpenSubmitModal
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
                    width: '30px',
                    height: '30px',
                    borderRadius: '6px',
                    background: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                }}>
                    <Shield size={18} />
                </div>
                <div>
                    <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>
                        Athena
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                        {stage === 'readiness_mcq' && "MCQ Readiness Check"}
                        {stage === 'exam_mcq' && "Part 1: Multiple Choice (10 min)"}
                        {stage === 'readiness_coding' && "Coding Readiness Check"}
                        {stage === 'exam_coding' && "Part 2: Python Coding Assessment"}
                        {stage === 'exam_submitted' && "Exam Concluded"}
                    </span>
                </div>
            </div>

            {/* Center Status during exam */}
            {isExamActive ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="badge badge-ready" style={{ padding: '6px 12px' }}>
                        <span className="recording-dot" />
                        <span>Camera Active</span>
                    </div>

                    {stage === 'exam_mcq' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 600 }}>
                            <Clock size={16} color="var(--text-muted)" />
                            <span>{formatTime(remainingSeconds)}</span>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400 }}>remaining</span>
                        </div>
                    )}

                    {violationCount > 0 && (
                        <div className="badge badge-warn" onClick={onOpenDiagnostics} style={{ cursor: 'pointer' }}>
                            <AlertCircle size={14} />
                            <span>{violationCount} Notice{violationCount === 1 ? '' : 's'}</span>
                        </div>
                    )}
                </div>
            ) : <div />}

            {/* Actions */}
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
                        className="btn btn-danger btn-sm"
                        style={{ marginLeft: '4px' }}
                        onClick={onOpenSubmitModal}
                    >
                        Finish MCQs
                    </button>
                )}
            </div>
        </header>
    );
}
