import React, { useEffect, useState } from 'react';
import { request } from '../../../common/request';
import { toast } from 'react-toastify';
import MyChart from '../../../components/Chart';
import useInitialPageLoader from '../../../hooks/useInitialPageLoader';
import './style.css';

const EmpPerfo = () => {
    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState(null);
    const [types, setTypes] = useState([]);
    const [cycles, setCycles] = useState([]);
    const [activeCycle, setActiveCycle] = useState(null);
    const [selectedCycle, setSelectedCycle] = useState(null);
    const [viewMode, setViewMode] = useState('overview');
    const showInitialLoader = useInitialPageLoader(loading);

    const fetchData = async (cycleId = null) => {
        setLoading(true);
        try {
            const [reportRes, typesRes, cyclesRes, activeRes] = await Promise.all([
                request({ method: 'GET', path: cycleId ? `performance/report?cycle_id=${cycleId}` : 'performance/report' }),
                request({ method: 'GET', path: 'performance/types' }),
                request({ method: 'GET', path: 'performance/cycles' }),
                request({ method: 'GET', path: 'performance/cycles/active' }),
            ]);

            if (reportRes?.success) setReport(reportRes.data);
            if (typesRes?.success) setTypes(typesRes.data);
            if (cyclesRes?.success) setCycles(cyclesRes.data);
            if (activeRes?.success) {
                setActiveCycle(activeRes.data);
                if (!cycleId) setSelectedCycle(activeRes.data?.id);
            }
        } catch (error) {
            toast.error('Failed to load performance data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCycleChange = (e) => {
        const cycleId = e.target.value;
        setSelectedCycle(cycleId ? parseInt(cycleId) : null);
        fetchData(cycleId || null);
    };

    const getScoreColor = (score) => {
        if (!score) return '#6b7280';
        if (score >= 4.5) return '#069855';
        if (score >= 3.5) return '#84cc16';
        if (score >= 2.5) return '#eab308';
        return '#BA5143';
    };

    const formatDueDate = (dueDate) => {
        const parsedDate = new Date(dueDate);

        if (Number.isNaN(parsedDate.getTime())) {
            return dueDate;
        }

        return new Intl.DateTimeFormat(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(parsedDate);
    };

    if (showInitialLoader) {
        return (
            <div className="page-wrapper">
                <div className="perf-loading">
                    <div className="loading-spinner" />
                </div>
            </div>
        );
    }

    const scores = report?.scores || {};
    const breakdown = report?.breakdown || [];
    const goals = report?.goals || [];
    const peerReviews = report?.peer_reviews_received || [];

    return (
        <div className="page-wrapper">
            {/* Header */}
            <div className="perf-header">
                <div>
                    <h2 className="page-title">My Performance</h2>
                    <p className="page-subtitle">{report?.cycle?.name || 'Performance Review'}</p>
                </div>
                <select 
                    className="cycle-select"
                    value={selectedCycle || ''}
                    onChange={handleCycleChange}
                >
                    <option value="">Current Cycle</option>
                    {cycles.map(cycle => (
                        <option key={cycle.id} value={cycle.id}>
                            {cycle.name} ({cycle.status})
                        </option>
                    ))}
                </select>
            </div>

            {/* Navigation Tabs */}
            <div className="perf-tabs">
                <button 
                    className={`tab ${viewMode === 'overview' ? 'active' : ''}`}
                    onClick={() => setViewMode('overview')}
                >
                    Overview
                </button>
                <button 
                    className={`tab ${viewMode === 'breakdown' ? 'active' : ''}`}
                    onClick={() => setViewMode('breakdown')}
                >
                    Breakdown
                </button>
                <button 
                    className={`tab ${viewMode === 'goals' ? 'active' : ''}`}
                    onClick={() => setViewMode('goals')}
                >
                    Goals
                </button>
                <button 
                    className={`tab ${viewMode === 'peers' ? 'active' : ''}`}
                    onClick={() => setViewMode('peers')}
                >
                    Peer Feedback
                </button>
            </div>

            {/* Overview View */}
            {viewMode === 'overview' && (
                <div className="perf-overview">
                    {/* Overall Score Card */}
                    <div className="card overall-score-card" style={{ borderLeftColor: getScoreColor(scores.manager) }}>
                        <div className="score-value" style={{ color: getScoreColor(scores.manager) }}>
                            {scores.manager ? scores.manager.toFixed(1) : '—'}
                        </div>
                        <div className="score-label">Overall Rating</div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="score-breakdown-grid">
                        <div className="card score-card">
                            <span className="score-num" style={{ color: getScoreColor(scores.self) }}>{scores.self || '—'}</span>
                            <span className="score-name">Self Assessment</span>
                        </div>
                        <div className="card score-card highlight">
                            <span className="score-num" style={{ color: getScoreColor(scores.manager) }}>{scores.manager || '—'}</span>
                            <span className="score-name">Manager Rating</span>
                        </div>
                        <div className="card score-card">
                            <span className="score-num" style={{ color: getScoreColor(scores.peer) }}>{scores.peer || '—'}</span>
                            <span className="score-name">Peer Average</span>
                        </div>
                        <div className="card score-card">
                            <span className="score-num" style={{ color: getScoreColor(scores.team) }}>{scores.team || '—'}</span>
                            <span className="score-name">Team Score</span>
                        </div>
                    </div>

                    {/* Radar Chart */}
                    {breakdown.length > 0 && (
                        <div className="card chart-section">
                            <h3 className="section-title">Performance by Category</h3>
                            <MyChart
                                className="mychart"
                                label="Performance Breakdown"
                                labelsData={breakdown.map(b => b.type)}
                                numericalData={breakdown.map(b => b.manager || b.peer || b.self || 0)}
                            />
                        </div>
                    )}

                    {/* Manager Feedback */}
                    {report?.summary?.manager_feedback && (
                        <div className="card feedback-section">
                            <h3 className="section-title">Manager Feedback</h3>
                            <p className="feedback-text">{report.summary.manager_feedback}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Breakdown View */}
            {viewMode === 'breakdown' && (
                <div className="card breakdown-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Self</th>
                                <th>Manager</th>
                                <th>Peer</th>
                                <th>Team</th>
                            </tr>
                        </thead>
                        <tbody>
                            {breakdown.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="category-cell">{item.type}</td>
                                    <td className="score-cell">{item.self ?? '—'}</td>
                                    <td className="score-cell highlight">{item.manager ?? '—'}</td>
                                    <td className="score-cell">{item.peer ?? '—'}</td>
                                    <td className="score-cell">{item.team ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {breakdown.length === 0 && (
                        <p className="empty-message">No breakdown data available.</p>
                    )}
                </div>
            )}

            {/* Goals View */}
            {viewMode === 'goals' && (
                <div className="perf-goals">
                    <div className="goals-stats">
                        <div className="card stat-card">
                            <span className="stat-value">{goals.filter(g => g.status === 'achieved').length}</span>
                            <span className="stat-label">Achieved</span>
                        </div>
                        <div className="card stat-card">
                            <span className="stat-value">{goals.filter(g => g.status === 'in_progress').length}</span>
                            <span className="stat-label">In Progress</span>
                        </div>
                        <div className="card stat-card">
                            <span className="stat-value">{goals.filter(g => g.status === 'pending').length}</span>
                            <span className="stat-label">Pending</span>
                        </div>
                    </div>

                    <div className="goals-list">
                        {goals.map(goal => (
                            <div key={goal.id} className="card goal-card">
                                <div className="goal-header">
                                    <h4>{goal.title}</h4>
                                    <span className={`status-badge ${goal.status}`}>
                                        {goal.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="goal-category">{goal.category}</div>
                                <div className="goal-progress">
                                    <div className="progress-bar">
                                        <div 
                                            className="progress-fill"
                                            style={{ width: `${goal.progress || 0}%` }}
                                        />
                                    </div>
                                    <span className="progress-text">{goal.progress || 0}%</span>
                                </div>
                                {goal.due_date && (
                                    <div className="goal-due">Due: {formatDueDate(goal.due_date)}</div>
                                )}
                            </div>
                        ))}
                        {goals.length === 0 && (
                            <div className="card empty-state">
                                <p>No goals set for this cycle.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Peer Feedback View */}
            {viewMode === 'peers' && (
                <div className="perf-peers">
                    <div className="card peer-summary">
                        <div className="peer-stat">
                            <strong>{peerReviews.length}</strong>
                            <span>Reviews Received</span>
                        </div>
                        <div className="peer-stat">
                            <strong>
                                {peerReviews.length > 0 
                                    ? (peerReviews.reduce((s, r) => s + r.rate, 0) / peerReviews.length).toFixed(1) 
                                    : '—'}
                            </strong>
                            <span>Avg Rating</span>
                        </div>
                    </div>

                    <div className="peer-reviews-list">
                        {peerReviews.map(review => (
                            <div key={review.id} className="card peer-review-card">
                                <div className="reviewer-info">
                                    <span className="reviewer-name">
                                        From: {review.reviewer?.first_name} {review.reviewer?.last_name}
                                    </span>
                                    <span className="review-type">{review.type?.name}</span>
                                </div>
                                <div className="review-rating">
                                    {'★'.repeat(review.rate)}{'☆'.repeat(5 - review.rate)}
                                </div>
                                {review.comment && (
                                    <p className="review-comment">{review.comment}</p>
                                )}
                            </div>
                        ))}
                        {peerReviews.length === 0 && (
                            <div className="card empty-state">
                                <p>No peer reviews received yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmpPerfo;
