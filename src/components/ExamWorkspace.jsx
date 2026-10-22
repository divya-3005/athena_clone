// src/components/ExamWorkspace.jsx
import React, { useState } from 'react';
import { Bookmark, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { EXAM_QUESTIONS } from '../data/examQuestions';

export default function ExamWorkspace({
    answers,
    setAnswers,
    flaggedQuestions,
    setFlaggedQuestions,
    onOpenSubmitModal
}) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const currentQuestion = EXAM_QUESTIONS[currentQuestionIndex];
    const totalQuestions = EXAM_QUESTIONS.length;

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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', minHeight: 'calc(100vh - 60px)', background: 'var(--bg)' }}>
            {/* Main Question View */}
            <main style={{ padding: '32px 40px', overflowY: 'auto' }}>
                {/* Question Card */}
                <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
                    {/* Header info */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                            Question {currentQuestionIndex + 1} of {totalQuestions}
                        </span>

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

                    {/* Question text */}
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

                    {/* Options */}
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
                                Submit Exam
                            </button>
                        )}
                    </div>
                </div>
            </main>

            {/* Sidebar without running video */}
            <aside style={{
                background: '#ffffff',
                borderLeft: '1px solid var(--border)',
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            }}>
                {/* Questions Palette */}
                <div className="card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                            Questions
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {answeredCount} of {totalQuestions} answered
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px' }}>
                        {EXAM_QUESTIONS.map((q, idx) => {
                            const isAnswered = !!answers[q.id];
                            const isFlagged = flaggedQuestions.has(q.id);
                            const isCurrent = idx === currentQuestionIndex;

                            let bg = '#f8fafc';
                            let color = 'var(--text-muted)';
                            let border = '1px solid var(--border)';

                            if (isAnswered) {
                                bg = 'var(--primary)';
                                color = '#ffffff';
                                border = '1px solid var(--primary)';
                            }
                            if (isFlagged) {
                                bg = 'var(--warn-bg)';
                                color = 'var(--warn)';
                                border = '1px solid var(--warn-border)';
                            }
                            if (isCurrent) {
                                border = '2px solid var(--text)';
                            }

                            return (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentQuestionIndex(idx)}
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
                                        justifyContent: 'center'
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
                            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--primary)' }} />
                            <span>Answered</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--warn-bg)', border: '1px solid var(--warn-border)' }} />
                            <span>Flagged for review</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#f8fafc', border: '1px solid var(--border)' }} />
                            <span>Unvisited</span>
                        </div>
                    </div>
                </div>

                {/* Submit button */}
                <button
                    className="btn btn-secondary"
                    onClick={onOpenSubmitModal}
                    style={{ marginTop: 'auto' }}
                >
                    Submit Exam
                </button>
            </aside>
        </div>
    );
}
