// src/components/ProctorInspectorModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Camera, RefreshCw } from 'lucide-react';

export default function ProctorInspectorModal({ 
    violations, 
    onClose,
    onManualSnapshot
}) {
    const [savedSnapshots, setSavedSnapshots] = useState({ cameraSnaps: [], screenSnaps: [] });
    const [loadingSnaps, setLoadingSnaps] = useState(false);

    async function loadDiskSnapshots() {
        setLoadingSnaps(true);
        try {
            if (window.athena?.getSavedSnapshots) {
                const data = await window.athena.getSavedSnapshots();
                setSavedSnapshots(data || { cameraSnaps: [], screenSnaps: [] });
            }
        } catch (err) {
            console.error("Failed to load snapshots:", err);
        } finally {
            setLoadingSnaps(false);
        }
    }

    useEffect(() => {
        loadDiskSnapshots();
    }, []);

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>
                        Saved Snapshots &amp; Diagnostics
                    </h3>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '20px 24px', overflowY: 'auto', maxHeight: '420px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            Snapshots saved to <code style={{ color: 'var(--primary)', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>user-camera-snap/</code>
                        </span>
                        <button className="btn btn-secondary btn-sm" onClick={loadDiskSnapshots}>
                            <RefreshCw size={12} /> Refresh
                        </button>
                    </div>

                    {/* Snapshot list */}
                    <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', minHeight: '140px', maxHeight: '200px', overflowY: 'auto' }}>
                        {savedSnapshots.cameraSnaps.length === 0 ? (
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '30px 0' }}>
                                No snapshots saved yet. Snapshots are captured automatically every 5s during the exam.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {savedSnapshots.cameraSnaps.map((snap, i) => (
                                    <div key={i} style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                                        <span>📷 {snap.name}</span>
                                        <span>{new Date(snap.time).toLocaleTimeString()}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                        <button className="btn btn-secondary btn-sm" onClick={onManualSnapshot}>
                            <Camera size={13} /> Take snapshot now
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => window.athena?.showRules()}>
                            Show rules dialog
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => window.athena?.selectFolder()}>
                            Select folder
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary btn-sm" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
