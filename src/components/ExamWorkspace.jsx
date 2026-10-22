// src/components/ExamWorkspace.jsx
import React, { useState } from 'react';
import { Bookmark, ChevronLeft, ChevronRight, Check, Clock, ListOrdered } from 'lucide-react';
import { EXAM_QUESTIONS } from '../data/examQuestions';

export default function ExamWorkspace({
    answers,
    setAnswers,
    flaggedQuestions,
    setFlaggedQuestions,
    remainingSeconds = 600,
    onOpenSubmitModal
}) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const currentQuestion = EXAM_QUESTIONS[currentQuestionIndex];
    const totalQuestions = EXAM_QUESTIONS.length;

    function formatTime(totalSeconds) {
        const secs = Math.max(0, Math.floor(totalSeconds || 0));
        const mm = String(Math.floor(secs / 60)).padStart(2, '0');
        const ss = String(secs % 60).padStart(2, '0');
        return `${mm}:${ss}`;
    }

    function selectAnswer(optionId) {
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: optionId
        }));
    }

    function toggleFlag() {
        setFlaggedQuestions(prev => {
            const next = new Set(prev);
            if (next.has(currentQuestion.id)) {
                next.delete(currentQuestion.id);
            } else {
                next.add(currentQuestion.id);
            }
            return next;
        });
    }

    function clearSelection() {
        setAnswers(prev => {
            const next = { ...prev };
            delete next[currentQuestion.id];
            return next;
        });
    }

    function goToPrev() {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    }

    function goToNext() {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    }

    const answeredCount = Object.keys(answers).length;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', minHeight: 'calc(100vh - 60px)', background: 'var(--bg)' }}>
            {/* Main Question View */}
            <main style={{ padding: '28px 36px', overflowY: 'auto' }}>
                {/* Feature: Choose question you want to do first (Top Quick-Select Bar) */}
                <div className="card" style={{ padding: '14px 18px', marginBottom: '20px', background: '#ffffff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ListOrdered size={15} color="var(--primary)" />
                            Choose any question to start with:
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            Question <strong>{currentQuestionIndex + 1}</strong> of {totalQuestions} selected
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {EXAM_QUESTIONS.map((q, idx) => {
                            const isAnswered = !!answers[q.id];
                            const isFlagged = flaggedQuestions.has(q.id);
                            const isCurrent = idx === currentQuestionIndex;

                            let bg = '#ffffff';
                            let color = 'var(--text)';
                            let border = '1px solid var(--border)';

                            if (isCurrent) {
                                bg = '#1e293b';
                                color = '#ffffff';
                                border = '1px solid #0f172a';
                            } else if (isAnswered) {
                                bg = 'var(--success-bg)';
                                color = 'var(--success)';
                                border = '1px solid var(--success-border)';
                            } else if (isFlagged) {
                                bg = 'var(--warn-bg)';
                                color = 'var(--warn)';
                                border = '1px solid var(--warn-border)';
                            }

                            return (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentQuestionIndex(idx)}
                                    title={`Go to Question ${idx + 1}`}
                                    style={{
                                        minWidth: '36px',
                                        height: '36px',
                                        padding: '0 8px',
                                        borderRadius: '6px',
                                        background: bg,
                                        color: color,
                                        border: border,
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease'
                                    }}
                                >
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Question Card */}
                <div className="card" style={{ padding: '30px', marginBottom: '24px' }}>
                    {/* Header info with LIVE TIMER displayed while question is being done */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
                                Question {currentQuestionIndex + 1}
                            </span>

                            {/* Prominent Live Timer shown while answering */}
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: remainingSeconds < 120 ? 'var(--danger-bg)' : 'var(--primary-bg)',
                                color: remainingSeconds < 120 ? 'var(--danger)' : 'var(--primary)',
                                border: `1px solid ${remainingSeconds < 120 ? 'var(--danger-border)' : 'var(--primary-border)'}`,
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: 700
                            }}>
                                <Clock size={14} />
                                <span>{formatTime(remainingSeconds)} left</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                                onClick={toggleFlag}
                                className="btn btn-secondary btn-sm"
                                style={{
                                    color: flaggedQuestions.has(currentQuestion.id) ? 'var(--warn)' : 'var(--text-muted)',
                                    borderColor: flaggedQuestions.has(currentQuestion.id) ? 'var(--warn-border)' : 'var(--border)',
                                    background: flaggedQuestions.has(currentQuestion.id) ? 'var(--warn-bg)' : '#ffffff'
                                }}
                            >
                                <Bookmark size={13} fill={flaggedQuestions.has(currentQuestion.id) ? 'currentColor' : 'none'} />
                                <span>{flaggedQuestions.has(currentQuestion.id) ? 'Flagged' : 'Flag'}</span>
                            </button>

                            {answers[currentQuestion.id] && (
                                <button
                                    onClick={clearSelection}
                                    className="btn btn-secondary btn-sm"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Question prompt */}
                    <h2 style={{ fontSize: '17px', fontWeight: 600, lineHeight: '1.5', marginBottom: '20px', color: 'var(--text)' }}>
                        {currentQuestion.prompt}
                    </h2>

                    {/* Code snippet if present */}
                    {currentQuestion.codeSnippet && (
                        <div style={{
                            background: '#f1f5f9',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            padding: '14px 18px',
                            marginBottom: '20px'
                        }}>
                            <pre style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '13px',
                                color: '#1e293b',
                                overflowX: 'auto',
                                lineHeight: '1.45'
                            }}>
                                <code>{currentQuestion.codeSnippet}</code>
                            </pre>
                        </div>
                    )}

                    {/* Options list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {currentQuestion.options.map((opt) => {
                            const isSelected = answers[currentQuestion.id] === opt.id;
                            return (
                                <div
                                    key={opt.id}
                                    onClick={() => selectAnswer(opt.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '12px',
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        background: isSelected ? 'var(--primary-bg)' : '#ffffff',
                                        border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                                        cursor: 'pointer',
                                        transition: 'all 0.1s ease'
                                    }}
                                >
                                    <div style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: isSelected ? 'var(--primary)' : '#f8fafc',
                                        border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: isSelected ? '#ffffff' : 'var(--text-muted)',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        flexShrink: 0
                                    }}>
                                        {opt.id}
                                    </div>
                                    <div style={{ flex: 1, fontSize: '14px', color: 'var(--text)', lineHeight: '1.5', paddingTop: '2px' }}>
                                        {opt.text}
                                    </div>
                                    {isSelected && (
                                        <Check size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '4px' }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Navigation */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button
                        className="btn btn-secondary"
                        disabled={currentQuestionIndex === 0}
                        onClick={goToPrev}
                    >
                        <ChevronLeft size={16} /> Previous
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {currentQuestionIndex < totalQuestions - 1 ? (
                            <button
                                className="btn btn-primary"
                                onClick={goToNext}
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button
                                className="btn btn-success"
                                onClick={onOpenSubmitModal}
                            >
                                Finish MCQs
                            </button>
                        )}
                    </div>
                </div>
            </main>

            {/* Sidebar with Question Matrix */}
            <aside style={{
                background: '#ffffff',
                borderLeft: '1px solid var(--border)',
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            }}>
                {/* Live Timer Widget in Sidebar */}
                <div className="card" style={{ padding: '14px', textAlign: 'center', background: '#f8fafc' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        Time Remaining
                    </div>
                    <div style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        color: remainingSeconds < 120 ? 'var(--danger)' : 'var(--primary)'
                    }}>
                        {formatTime(remainingSeconds)}
                    </div>
                </div>

                {/* Questions Palette Matrix */}
                <div className="card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                            Question Palette
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {answeredCount}/{totalQuestions} Answered
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px' }}>
                        {EXAM_QUESTIONS.map((q, idx) => {
                            const isAnswered = !!answers[q.id];
                            const isFlagged = flaggedQuestions.has(q.id);
                            const isCurrent = idx === currentQuestionIndex;

                            let bg = '#ffffff';
                            let color = 'var(--text-muted)';
                            let border = '1px solid var(--border)';

                            if (isCurrent) {
                                bg = '#1e293b';
                                color = '#ffffff';
                                border = '2px solid #0f172a';
                            } else if (isAnswered) {
                                bg = 'var(--success-bg)';
                                color = 'var(--success)';
                                border = '1px solid var(--success-border)';
                            } else if (isFlagged) {
                                bg = 'var(--warn-bg)';
                                color = 'var(--warn)';
                                border = '1px solid var(--warn-border)';
                            }

                            return (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentQuestionIndex(idx)}
                                    title={`Click to answer Question ${idx + 1}`}
                                    style={{
                                        width: '100%',
                                        aspectRatio: '1',
                                        borderRadius: '6px',
                                        background: bg,
                                        color: color,
                                        border: border,
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.15s ease'
                                    }}
                                >
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--success-bg)', border: '1px solid var(--success-border)' }} />
                            <span>Answered ({answeredCount})</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--warn-bg)', border: '1px solid var(--warn-border)' }} />
                            <span>Flagged ({flaggedQuestions.size})</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#1e293b' }} />
                            <span>Current</span>
                        </div>
                    </div>
                </div>

                {/* Finish MCQs button */}
                <button
                    className="btn btn-secondary"
                    onClick={onOpenSubmitModal}
                    style={{ marginTop: 'auto' }}
                >
                    Finish MCQs &amp; Proceed
                </button>
            </aside>
        </div>
    );
}
