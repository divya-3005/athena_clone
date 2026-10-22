// src/components/ExitModal.jsx
import React from 'react';
import { LogOut, AlertTriangle, X } from 'lucide-react';

export default function ExitModal({ onConfirmExit, onClose }) {
    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '440px', padding: '28px', textAlign: 'center' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--danger-bg)',
                    color: 'var(--danger)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                }}>
                    <AlertTriangle size={24} />
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
                    Exit Exam &amp; Quit Application?
                </h3>

                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px' }}>
                    Are you sure you want to exit? Your current exam session will be terminated and the application will close.
                </p>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
                        Cancel
                    </button>
                    <button className="btn btn-danger" onClick={onConfirmExit} style={{ flex: 1 }}>
                        <LogOut size={15} /> Yes, Exit Now
                    </button>
                </div>
            </div>
        </div>
    );
}
