// src/components/ExamSubmissionResult.jsx
import React, { useState, useEffect } from 'react';
import { CheckCircle2, LogOut } from 'lucide-react';
import { EXAM_QUESTIONS } from '../data/examQuestions';

export default function ExamSubmissionResult({
    answers = {},
    codingSubmission = null,
    elapsedSeconds = 0
}) {
    const [secondsLeft, setSecondsLeft] = useState(3);

    let correctCount = 0;
    EXAM_QUESTIONS.forEach(q => {
        if (answers[q.id] === q.correctAnswer) {
            correctCount++;
        }
    });

    const scorePercentage = Math.round((correctCount / EXAM_QUESTIONS.length) * 100);
    const solvedCodingCount = codingSubmission?.solvedCount ?? 0;
    const totalCodingCount = codingSubmission?.totalCount ?? 2;

    // 3-second countdown to exit app automatically
    useEffect(() => {
        const interval = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    // Trigger exit
                    if (window.athena?.exitApp) {
                        window.athena.exitApp();
                    } else {
                        window.close();
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    function handleExitNow() {
        if (window.athena?.exitApp) {
            window.athena.exitApp();
        } else {
            window.close();
        }
    }

    return (
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '80px 20px', textAlign: 'center' }}>
            <div className="card" style={{ padding: '40px 32px' }}>
                {/* Success Icon */}
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'var(--success-bg)',
                    color: 'var(--success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px'
                }}>
                    <CheckCircle2 size={36} />
                </div>

                <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
                    Exam Submitted
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '14px' }}>
                    Your responses have been recorded successfully.
                </p>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }}>
                    <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 16px', fontSize: '13px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>MCQ Score:</span> <strong>{scorePercentage}%</strong> ({correctCount}/{EXAM_QUESTIONS.length})
                    </div>
                    <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 16px', fontSize: '13px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Coding:</span> <strong>{solvedCodingCount}/{totalCodingCount} Solved</strong>
                    </div>
                </div>

                {/* 3-Second Exit Countdown Notice */}
                <div style={{
                    background: '#f8fafc',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '24px'
                }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                        Closing application automatically in
                    </div>
                    <div style={{
                        fontSize: '32px',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--primary)'
                    }}>
                        {secondsLeft}s
                    </div>
                </div>

                {/* Manual Exit button */}
                <button
                    className="btn btn-secondary"
                    onClick={handleExitNow}
                    style={{ width: '100%', padding: '11px' }}
                >
                    <LogOut size={15} /> Exit Now
                </button>
            </div>
        </div>
    );
}
