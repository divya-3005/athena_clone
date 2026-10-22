// src/components/CodingWorkspace.jsx
import React, { useState } from 'react';
import { 
    Play, 
    Send, 
    RotateCcw, 
    CheckCircle2, 
    XCircle, 
    AlertCircle, 
    Code2, 
    Terminal, 
    Clock, 
    ListOrdered,
    Check,
    HelpCircle
} from 'lucide-react';
import { CODING_PROBLEMS } from '../data/examQuestions';

export default function CodingWorkspace({
    remainingSeconds = 600,
    onSubmitCoding,
    onOpenRules,
    onOpenDiagnostics
}) {
    // Current active coding question (0: Palindrome, 1: Sum of Two Numbers)
    const [selectedProblemIndex, setSelectedProblemIndex] = useState(0);
    const activeProblem = CODING_PROBLEMS[selectedProblemIndex];

    // Independent code state per question
    const [codeMap, setCodeMap] = useState(() => ({
        [CODING_PROBLEMS[0].id]: CODING_PROBLEMS[0].defaultCode,
        [CODING_PROBLEMS[1].id]: CODING_PROBLEMS[1].defaultCode
    }));

    // Independent test results per question
    const [resultsMap, setResultsMap] = useState(() => ({
        [CODING_PROBLEMS[0].id]: null,
        [CODING_PROBLEMS[1].id]: null
    }));

    // Independent print logs per question
    const [logsMap, setLogsMap] = useState(() => ({
        [CODING_PROBLEMS[0].id]: "",
        [CODING_PROBLEMS[1].id]: ""
    }));

    // Independent solved status per question
    const [solvedMap, setSolvedMap] = useState(() => ({
        [CODING_PROBLEMS[0].id]: false,
        [CODING_PROBLEMS[1].id]: false
    }));

    // UI state
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('testcases'); // 'testcases' | 'logs'
    const [errorMessage, setErrorMessage] = useState(null);

    const currentCode = codeMap[activeProblem.id] || activeProblem.defaultCode;
    const currentResults = resultsMap[activeProblem.id];
    const currentLogs = logsMap[activeProblem.id];

    function formatTime(totalSeconds) {
        const secs = Math.max(0, Math.floor(totalSeconds || 0));
        const mm = String(Math.floor(secs / 60)).padStart(2, '0');
        const ss = String(secs % 60).padStart(2, '0');
        return `${mm}:${ss}`;
    }

    function handleCodeChange(newCode) {
        setCodeMap(prev => ({
            ...prev,
            [activeProblem.id]: newCode
        }));
    }

    // Fallback runner if running outside Electron
    function runCodeFallback(codeToRun, problem, tests) {
        try {
            const results = tests.map(t => {
                let actual;
                const inp = t.input;
                if (problem.functionName === 'is_palindrome') {
                    const cleaned = String(inp).toLowerCase().replace(/[^a-z0-9]/g, '');
                    actual = (cleaned === cleaned.split('').reverse().join(''));
                } else if (problem.functionName === 'sum_of_two_numbers') {
                    if (Array.isArray(inp)) {
                        actual = Number(inp[0]) + Number(inp[1]);
                    } else {
                        actual = Number(inp);
                    }
                } else {
                    actual = null;
                }

                return {
                    id: t.id,
                    input: String(t.label || inp),
                    expected: String(t.expected),
                    actual: String(actual),
                    passed: actual === t.expected
                };
            });
            return { results, allPassed: results.every(r => r.passed), logs: "" };
        } catch (err) {
            return { error: err.message, logs: "" };
        }
    }

    // Run sample test cases
    async function handleRunCode() {
        setIsRunning(true);
        setErrorMessage(null);

        try {
            let res;
            if (window.athena?.runPythonCode) {
                res = await window.athena.runPythonCode({
                    code: currentCode,
                    testCases: activeProblem.sampleTests,
                    functionName: activeProblem.functionName
                });
            } else {
                res = runCodeFallback(currentCode, activeProblem, activeProblem.sampleTests);
            }

            if (res.error) {
                setErrorMessage(res.error);
                setResultsMap(prev => ({ ...prev, [activeProblem.id]: null }));
                setLogsMap(prev => ({ ...prev, [activeProblem.id]: res.logs || "" }));
                if (res.logs) setActiveTab('logs');
            } else {
                setResultsMap(prev => ({ ...prev, [activeProblem.id]: res.results }));
                setLogsMap(prev => ({ ...prev, [activeProblem.id]: res.logs || "" }));
                setActiveTab('testcases');
            }
        } catch (err) {
            setErrorMessage(err.message || "Failed to execute Python code.");
        } finally {
            setIsRunning(false);
        }
    }

    // Submit against all test cases for this question
    async function handleSubmitCode() {
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            let res;
            if (window.athena?.runPythonCode) {
                res = await window.athena.runPythonCode({
                    code: currentCode,
                    testCases: activeProblem.allTests,
                    functionName: activeProblem.functionName
                });
            } else {
                res = runCodeFallback(currentCode, activeProblem, activeProblem.allTests);
            }

            if (res.error) {
                setErrorMessage(res.error);
                setResultsMap(prev => ({ ...prev, [activeProblem.id]: null }));
                setLogsMap(prev => ({ ...prev, [activeProblem.id]: res.logs || "" }));
                setIsSubmitting(false);
                return;
            }

            setResultsMap(prev => ({ ...prev, [activeProblem.id]: res.results }));
            setLogsMap(prev => ({ ...prev, [activeProblem.id]: res.logs || "" }));

            if (res.allPassed) {
                setSolvedMap(prev => ({ ...prev, [activeProblem.id]: true }));
            }
            setActiveTab('testcases');
        } catch (err) {
            setErrorMessage(err.message || "Submission failed.");
        } finally {
            setIsSubmitting(false);
        }
    }

    // Reset code to starter template
    function handleReset() {
        handleCodeChange(activeProblem.defaultCode);
        setResultsMap(prev => ({ ...prev, [activeProblem.id]: null }));
        setLogsMap(prev => ({ ...prev, [activeProblem.id]: "" }));
        setErrorMessage(null);
    }

    // Finalize all coding questions and proceed
    function handleFinishSection() {
        onSubmitCoding({
            codeMap,
            solvedMap,
            solvedCount: Object.values(solvedMap).filter(Boolean).length,
            totalCount: CODING_PROBLEMS.length
        });
    }

    // Tab key support in textarea
    function handleKeyDown(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const value = e.target.value;
            handleCodeChange(value.substring(0, start) + '    ' + value.substring(end));
            setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = start + 4;
            }, 0);
        }
    }

    const solvedCount = Object.values(solvedMap).filter(Boolean).length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 60px)', background: 'var(--bg)' }}>
            {/* Top Bar: Choose which question to do first */}
            <div style={{
                background: '#ffffff',
                borderBottom: '1px solid var(--border)',
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ListOrdered size={16} color="var(--primary)" />
                        Choose question to work on:
                    </span>

                    {/* Question Switcher Tabs */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {CODING_PROBLEMS.map((prob, idx) => {
                            const isSelected = selectedProblemIndex === idx;
                            const isSolved = solvedMap[prob.id];

                            return (
                                <button
                                    key={prob.id}
                                    onClick={() => {
                                        setSelectedProblemIndex(idx);
                                        setErrorMessage(null);
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '7px 14px',
                                        borderRadius: '8px',
                                        border: `1px solid ${isSelected ? '#0f172a' : 'var(--border)'}`,
                                        background: isSelected ? '#1e293b' : '#ffffff',
                                        color: isSelected ? '#ffffff' : 'var(--text)',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease'
                                    }}
                                >
                                    <span>Q{idx + 1}: {prob.title}</span>
                                    {isSolved ? (
                                        <span style={{
                                            background: 'var(--success-bg)',
                                            color: 'var(--success)',
                                            borderRadius: '50%',
                                            width: '18px',
                                            height: '18px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '11px'
                                        }}>
                                            <Check size={12} />
                                        </span>
                                    ) : (
                                        <span style={{
                                            fontSize: '11px',
                                            color: isSelected ? '#94a3b8' : 'var(--text-muted)'
                                        }}>
                                            ({prob.functionName})
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right side: Timer & Final Submit Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#eff6ff',
                        color: 'var(--primary)',
                        border: '1px solid var(--primary-border)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 600,
                        fontFamily: 'var(--font-mono)'
                    }}>
                        <Clock size={14} />
                        <span>{formatTime(remainingSeconds)} left</span>
                    </div>

                    <button
                        className="btn btn-primary btn-sm"
                        onClick={handleFinishSection}
                        title="Submit all coding answers and conclude section"
                    >
                        Finish Coding Section ({solvedCount}/{CODING_PROBLEMS.length} Solved)
                    </button>
                </div>
            </div>

            {/* Main Two-Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '460px 1fr', flex: 1, minHeight: 'calc(100vh - 120px)' }}>
                {/* Left Column: Problem Description & Examples */}
                <div style={{
                    background: '#ffffff',
                    borderRight: '1px solid var(--border)',
                    padding: '24px',
                    overflowY: 'auto',
                    maxHeight: 'calc(100vh - 120px)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span className="badge badge-neutral" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                            Problem {selectedProblemIndex + 1} of {CODING_PROBLEMS.length}
                        </span>
                        <span className="badge badge-ready" style={{ fontSize: '11px' }}>
                            Python 3
                        </span>
                        {solvedMap[activeProblem.id] && (
                            <span className="badge badge-ready" style={{ fontSize: '11px', background: 'var(--success-bg)', color: 'var(--success)' }}>
                                <Check size={12} /> Solved
                            </span>
                        )}
                    </div>

                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
                        {activeProblem.title}
                    </h2>

                    <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.6', marginBottom: '20px' }}>
                        {activeProblem.description}
                    </p>

                    {/* Input / Output description */}
                    <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px', marginBottom: '20px', fontSize: '13px' }}>
                        <div style={{ marginBottom: '8px' }}>
                            <strong style={{ color: 'var(--text)' }}>Input:</strong>{' '}
                            <span style={{ color: 'var(--text-muted)' }}>{activeProblem.inputDescription}</span>
                        </div>
                        <div>
                            <strong style={{ color: 'var(--text)' }}>Output:</strong>{' '}
                            <span style={{ color: 'var(--text-muted)' }}>{activeProblem.outputDescription}</span>
                        </div>
                    </div>

                    {/* Examples */}
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '10px' }}>
                            Examples
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {activeProblem.examples.map((ex, i) => (
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

                {/* Right Column: Code Editor & Test Console */}
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Editor Header Bar */}
                    <div style={{
                        height: '44px',
                        background: '#f8fafc',
                        borderBottom: '1px solid var(--border)',
                        padding: '0 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                            <Code2 size={16} color="var(--primary)" />
                            <span>solution_{activeProblem.functionName}.py</span>
                        </div>

                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={handleReset}
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                            title="Reset starter template"
                        >
                            <RotateCcw size={12} /> Reset template
                        </button>
                    </div>

                    {/* Code Textarea Editor */}
                    <div style={{ flex: 1, position: 'relative', background: '#ffffff', minHeight: '280px' }}>
                        <textarea
                            value={currentCode}
                            onChange={(e) => handleCodeChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            spellCheck="false"
                            style={{
                                width: '100%',
                                height: '100%',
                                minHeight: '280px',
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
                            Click <strong>Run</strong> for sample tests or <strong>Submit</strong> to evaluate all test cases.
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                className="btn btn-secondary btn-sm"
                                disabled={isRunning || isSubmitting}
                                onClick={handleRunCode}
                            >
                                <Play size={13} fill="currentColor" /> {isRunning ? "Running..." : "Run (Sample Cases)"}
                            </button>
                            <button
                                className="btn btn-success btn-sm"
                                disabled={isRunning || isSubmitting}
                                onClick={handleSubmitCode}
                            >
                                <Send size={13} /> {isSubmitting ? "Submitting..." : "Submit Question"}
                            </button>
                        </div>
                    </div>

                    {/* Test Console / Output Panel */}
                    <div style={{ height: '220px', background: '#ffffff', overflowY: 'auto', padding: '14px 20px' }}>
                        {/* Tab Switcher */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                            <button
                                onClick={() => setActiveTab('testcases')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '13px',
                                    fontWeight: activeTab === 'testcases' ? 700 : 500,
                                    color: activeTab === 'testcases' ? 'var(--primary)' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <Terminal size={14} /> Test Results
                            </button>

                            <button
                                onClick={() => setActiveTab('logs')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '13px',
                                    fontWeight: activeTab === 'logs' ? 700 : 500,
                                    color: activeTab === 'logs' ? 'var(--primary)' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <span>Standard Output / Print Logs</span>
                                {currentLogs && (
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
                                )}
                            </button>
                        </div>

                        {/* Error Alert */}
                        {errorMessage && (
                            <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: '8px', padding: '12px', color: 'var(--danger)', fontSize: '13px', fontFamily: 'var(--font-mono)', marginBottom: '10px' }}>
                                <div style={{ fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <AlertCircle size={15} /> Execution Error
                                </div>
                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '12px' }}>{errorMessage}</pre>
                            </div>
                        )}

                        {/* Test Cases Tab Content */}
                        {activeTab === 'testcases' && (
                            <div>
                                {!errorMessage && !currentResults && (
                                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '24px 0', textAlign: 'center' }}>
                                        Click <strong>Run</strong> to evaluate against sample test cases or <strong>Submit</strong> to evaluate all cases.
                                    </div>
                                )}

                                {currentResults && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {currentResults.map((t, idx) => (
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
                        )}

                        {/* Logs Tab Content */}
                        {activeTab === 'logs' && (
                            <div>
                                {currentLogs ? (
                                    <pre style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '12px',
                                        color: '#1e293b',
                                        background: '#f8fafc',
                                        border: '1px solid var(--border)',
                                        borderRadius: '6px',
                                        padding: '12px',
                                        whiteSpace: 'pre-wrap',
                                        margin: 0
                                    }}>
                                        {currentLogs}
                                    </pre>
                                ) : (
                                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '24px 0', textAlign: 'center' }}>
                                        No output printed. Any <code>print(...)</code> statements in your Python code will be displayed here.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
