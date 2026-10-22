// src/components/FullscreenWarningModal.jsx
import React from 'react';
import { Maximize, AlertCircle } from 'lucide-react';

export default function FullscreenWarningModal({ onReenterFullscreen }) {
    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ padding: '28px', textAlign: 'center', maxWidth: '460px' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--warn-bg)',
                    color: 'var(--warn)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                }}>
                    <AlertCircle size={24} />
                </div>

                <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
                    Full screen mode exited
                </h2>

                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px' }}>
                    Please return to full-screen mode to continue your exam.
                </p>

                <button
                    className="btn btn-primary"
                    onClick={onReenterFullscreen}
                    style={{ width: '100%', padding: '12px' }}
                >
                    <Maximize size={16} /> Return to full screen
                </button>
            </div>
        </div>
    );
}
