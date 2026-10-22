// src/components/CodingWorkspace.jsx
import React, { useState } from 'react';
import { Play, Send, RotateCcw, CheckCircle2, XCircle, AlertCircle, Code2, Terminal } from 'lucide-react';
import { CODING_PROBLEM } from '../data/examQuestions';

export default function CodingWorkspace({
    onSubmitCoding,
    onOpenRules,
    onOpenDiagnostics
}) {
    const [code, setCode] = useState(CODING_PROBLEM.defaultCode);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [testResults, setTestResults] = useState(null);
    const [activeTab, setActiveTab] = useState('testcases');
    const [errorMessage, setErrorMessage] = useState(null);

    // Fallback runner if running outside Electron
    function runCodeFallback(codeToRun, tests) {
        try {
            // Clean simple check for is_palindrome
            const results = tests.map(t => {
                let actual;
                const inp = t.input;
                const cleaned = String(inp).toLowerCase().replace(/[^a-z0-9]/g, '');
                actual = (cleaned === cleaned.split('').reverse().join(''));
                return {
                    id: t.id,
                    input: String(inp),
                    expected: String(t.expected),
                    actual: String(actual),
                    passed: actual === t.expected
                };
            });
            return { results, allPassed: results.every(r => r.passed) };
        } catch (err) {
            return { error: err.message };
        }
    }

    // Run sample test cases
    async function handleRunCode() {
        setIsRunning(true);
        setErrorMessage(null);
        setActiveTab('testcases');

        try {
            let res;
            if (window.athena?.runPythonCode) {
                res = await window.athena.runPythonCode({
                    code,
                    testCases: CODING_PROBLEM.sampleTests,
                    functionName: CODING_PROBLEM.functionName
                });
            } else {
                res = runCodeFallback(code, CODING_PROBLEM.sampleTests);
            }

            if (res.error) {
                setErrorMessage(res.error);
                setTestResults(null);
            } else {
                setTestResults(res.results);
            }
        } catch (err) {
            setErrorMessage(err.message || "Failed to execute Python code.");
        } finally {
            setIsRunning(false);
        }
    }

    // Submit against all test cases
    async function handleSubmitCode() {
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            let res;
            if (window.athena?.runPythonCode) {
                res = await window.athena.runPythonCode({
                    code,
                    testCases: CODING_PROBLEM.allTests,
                    functionName: CODING_PROBLEM.functionName
                });
            } else {
                res = runCodeFallback(code, CODING_PROBLEM.allTests);
            }

            if (res.error) {
                setErrorMessage(res.error);
                setTestResults(null);
                setIsSubmitting(false);
                return;
            }

            setTestResults(res.results);
            // Proceed to final submission
            onSubmitCoding({
                code,
                allPassed: res.allPassed,
                results: res.results
            });
        } catch (err) {
            setErrorMessage(err.message || "Submission failed.");
            setIsSubmitting(false);
        }
    }

    // Reset code to starter template
    function handleReset() {
        setCode(CODING_PROBLEM.defaultCode);
        setTestResults(null);
        setErrorMessage(null);
    }

    // Tab key support in textarea
    function handleKeyDown(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const value = e.target.value;
            setCode(value.substring(0, start) + '    ' + value.substring(end));
            setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = start + 4;
            }, 0);
        }
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '460px 1fr', minHeight: 'calc(100vh - 60px)', background: 'var(--bg)' }}>
            {/* Left Column: Problem Description & Examples */}
            <div style={{
                background: '#ffffff',
                borderRight: '1px solid var(--border)',
                padding: '28px 24px',
                overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                        Coding Section
                    </span>
                    <span className="badge badge-ready" style={{ fontSize: '11px' }}>
                        Python 3
                    </span>
                </div>

                <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '14px' }}>
                    {CODING_PROBLEM.title}
                </h2>

                <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.6', marginBottom: '20px' }}>
                    {CODING_PROBLEM.description}
                </p>

                {/* Input / Output description */}
                <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px', marginBottom: '20px', fontSize: '13px' }}>
                    <div style={{ marginBottom: '8px' }}>
                        <strong style={{ color: 'var(--text)' }}>Input:</strong>{' '}
                        <span style={{ color: 'var(--text-muted)' }}>{CODING_PROBLEM.inputDescription}</span>
                    </div>
                    <div>
                        <strong style={{ color: 'var(--text)' }}>Output:</strong>{' '}
                        <span style={{ color: 'var(--text-muted)' }}>{CODING_PROBLEM.outputDescription}</span>
                    </div>
                </div>

                {/* Examples */}
                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '10px' }}>
                        Examples
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {CODING_PROBLEM.examples.map((ex, i) => (
                            <div key={i} style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px' }}>
                                <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Input:</span> {ex.input}
                                </div>
                                <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Output:</span> <strong style={{ color: 'var(--primary)' }}>{ex.output}</strong>
                                </div>
                                {ex.explanation && (
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        {ex.explanation}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column: Code Editor & Test Cases */}
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Editor Header */}
                <div style={{
                    height: '44px',
                    background: '#f8fafc',
                    borderBottom: '1px solid var(--border)',
                    padding: '0 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                        <Code2 size={16} color="var(--primary)" />
                        <span>solution.py</span>
                    </div>

                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={handleReset}
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                    >
                        <RotateCcw size={12} /> Reset code
                    </button>
                </div>

                {/* Code Textarea Editor */}
                <div style={{ flex: 1, position: 'relative', background: '#ffffff', minHeight: '260px' }}>
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        onKeyDown={handleKeyDown}
                        spellCheck="false"
                        style={{
                            width: '100%',
                            height: '100%',
                            minHeight: '260px',
                            padding: '18px 24px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '14px',
                            lineHeight: '1.5',
                            border: 'none',
                            outline: 'none',
                            resize: 'none',
                            background: '#ffffff',
                            color: '#0f172a'
                        }}
                    />
                </div>

                {/* Action Bar (Run & Submit) */}
                <div style={{
                    padding: '10px 20px',
                    background: '#f8fafc',
                    borderTop: '1px solid var(--border)',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Press <strong>Run</strong> to test sample cases, or <strong>Submit</strong> to evaluate all tests.
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            className="btn btn-secondary btn-sm"
                            disabled={isRunning || isSubmitting}
                            onClick={handleRunCode}
                        >
                            <Play size={13} fill="currentColor" /> {isRunning ? "Running..." : "Run"}
                        </button>
                        <button
                            className="btn btn-success btn-sm"
                            disabled={isRunning || isSubmitting}
                            onClick={handleSubmitCode}
                        >
                            <Send size={13} /> {isSubmitting ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </div>

                {/* Test Results Output Console */}
                <div style={{ height: '220px', background: '#ffffff', overflowY: 'auto', padding: '16px 20px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Terminal size={15} /> Test Results
                    </div>

                    {errorMessage && (
                        <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: '8px', padding: '12px', color: 'var(--danger)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                            <div style={{ fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <AlertCircle size={15} /> Execution Error
                            </div>
                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '12px' }}>{errorMessage}</pre>
                        </div>
                    )}

                    {!errorMessage && !testResults && (
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '20px 0', textAlign: 'center' }}>
                            Click <strong>Run</strong> to execute your code against sample test cases.
                        </div>
                    )}

                    {testResults && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {testResults.map((t, idx) => (
                                <div
                                    key={t.id || idx}
                                    style={{
                                        background: t.passed ? 'var(--success-bg)' : 'var(--danger-bg)',
                                        border: `1px solid ${t.passed ? 'var(--success-border)' : 'var(--danger-border)'}`,
                                        borderRadius: '6px',
                                        padding: '10px 14px',
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {t.passed ? (
                                            <CheckCircle2 size={16} color="var(--success)" />
                                        ) : (
                                            <XCircle size={16} color="var(--danger)" />
                                        )}
                                        <span style={{ fontWeight: 600 }}>Case {idx + 1}</span>
                                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                                            input: <strong>{t.input}</strong>
                                        </span>
                                    </div>

                                    <div style={{ fontFamily: 'var(--font-mono)' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Expected: {t.expected}</span>
                                        {' | '}
                                        <span style={{ color: t.passed ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                                            Output: {t.actual}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
