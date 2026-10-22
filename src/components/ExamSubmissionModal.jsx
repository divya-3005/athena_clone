// src/components/ExamSubmissionModal.jsx
import React from 'react';
import { X } from 'lucide-react';
import { EXAM_QUESTIONS } from '../data/examQuestions';

export default function ExamSubmissionModal({
    answers,
    flaggedQuestions,
    onConfirmSubmit,
    onClose
}) {
    const totalQuestions = EXAM_QUESTIONS.length;
    const answeredCount = Object.keys(answers).length;
    const unansweredCount = totalQuestions - answeredCount;
    const flaggedCount = flaggedQuestions.size;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>
                        Submit your exam?
                    </h3>
                    <button
                        onClick={onClose}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                        <X size={18} />
                    </button>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5' }}>
                    Once you submit, your answers will be finalized and the exam session will conclude.
                </p>

                {/* Summary boxes */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
                    <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                            {answeredCount}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Answered
                        </div>
                    </div>

                    <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '22px', fontWeight: 700, color: unansweredCount > 0 ? 'var(--warn)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {unansweredCount}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Unanswered
                        </div>
                    </div>

                    <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--warn)', fontFamily: 'var(--font-mono)' }}>
                            {flaggedCount}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Flagged
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={onClose}>
                        Return to exam
                    </button>
                    <button className="btn btn-primary" onClick={onConfirmSubmit}>
                        Yes, submit exam
                    </button>
                </div>
            </div>
        </div>
    );
}
