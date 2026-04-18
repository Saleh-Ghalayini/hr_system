import React, { useEffect, useState } from 'react';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import MyChart from '../../../components/Chart';
import { request } from '../../../common/request';
import { toast } from 'react-toastify';
import Table from '../../../components/Table';
import useInitialPageLoader from '../../../hooks/useInitialPageLoader';
import './style.css';

const AdminRate = () => {
    const [users, setUsers] = useState([]);
    const [cycles, setCycles] = useState([]);
    const [activeCycle, setActiveCycle] = useState(null);
    const [selectedCycle, setSelectedCycle] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [viewMode, setViewMode] = useState('list');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Rating state
    const [types, setTypes] = useState([]);
    const [ratings, setRatings] = useState({});
    const [comments, setComments] = useState({});
    const [generalComment, setGeneralComment] = useState('');

    // Summary state
    const [employeeSummary, setEmployeeSummary] = useState(null);
    const showInitialLoader = useInitialPageLoader(loading);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [usersRes, cyclesRes, activeRes, typesRes] = await Promise.all([
                request({ method: 'GET', path: 'admin/users' }),
                request({ method: 'GET', path: 'performance/cycles' }),
                request({ method: 'GET', path: 'performance/cycles/active' }),
                request({ method: 'GET', path: 'performance/types' }),
            ]);

            if (usersRes?.success) {
                const userData = usersRes.data?.data || usersRes.data || [];
                setUsers(userData.filter(u => ['user', 'employee'].includes(u.role)));
            }
            if (cyclesRes?.success) setCycles(cyclesRes.data);
            if (activeRes?.success) {
                setActiveCycle(activeRes.data);
                setSelectedCycle(activeRes.data?.id);
            }
            if (typesRes?.success) {
                setTypes(typesRes.data);
                const initial = {};
                typesRes.data.forEach(t => { initial[t.id] = 3; });
                setRatings(initial);
            }
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const selectUser = async (user) => {
        setSelectedUser(user);
        setViewMode('summary');
        
        try {
            const res = await request({
                method: 'GET',
                path: `admin/performance/employee/${user.id}/summary?cycle_id=${selectedCycle}`
            });
            if (res?.success) {
                setEmployeeSummary(res.data);
                const existingRatings = {};
                const existingComments = {};
                (res.data.report?.breakdown || []).forEach(item => {
                    if (item.manager) existingRatings[item.type_id] = item.manager;
                    if (item.comment) existingComments[item.type_id] = item.comment;
                });
                if (Object.keys(existingRatings).length > 0) {
                    setRatings(existingRatings);
                }
            }
        } catch (error) {
            console.log('No summary available');
        }
    };

    const handleCycleChange = async (e) => {
        const cycleId = e.target.value;
        setSelectedCycle(cycleId ? parseInt(cycleId) : null);
        if (selectedUser) {
            selectUser(selectedUser);
        }
    };

    const submitRating = async () => {
        if (!selectedUser) return;
        
        setSubmitting(true);
        try {
            const typeIds = types.map(t => t.id);
            const rates = typeIds.map(id => ratings[id] || 3);

            const res = await request({
                method: 'POST',
                path: 'performance/rate-employee',
                data: {
                    user_id: selectedUser.id,
                    type_ids: typeIds,
                    rate: rates,
                    comment: generalComment,
                    review_cycle_id: selectedCycle,
                },
            });

            if (res?.success) {
                toast.success(`${selectedUser.first_name} rated successfully!`);
                setViewMode('list');
                setSelectedUser(null);
            } else {
                toast.error('Failed to submit rating');
            }
        } catch (error) {
            toast.error('Failed to submit rating');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (rating) => {
        const score = Math.round(rating);
        return '★'.repeat(score) + '☆'.repeat(5 - score);
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

    // Table headers and data for employee list
    const tableHeaders = [
        { key: 'name', label: 'Employee' },
        { key: 'position', label: 'Position' },
        { key: 'department', label: 'Department' },
        {
            key: 'actions',
            label: 'Action',
            render: (row) => (
                <Button
                    text="View / Rate"
                    onClick={() => selectUser(row)}
                />
            )
        }
    ];

    const tableData = users.map(user => ({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        position: user.position || '—',
        department: user.department || '—',
    }));

    return (
        <div className="page-wrapper">
            <div className="admin-header">
                <h2 className="page-title">Employee Performance Management</h2>
                <div className="cycle-selector">
                    <select value={selectedCycle || ''} onChange={handleCycleChange}>
                        <option value="">Select Cycle</option>
                        {cycles.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.name} {c.status === 'active' ? '(Active)' : ''}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* View Mode Tabs */}
            <div className="admin-mode-tabs">
                <button 
                    className={`tab ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => { setViewMode('list'); setSelectedUser(null); }}
                >
                    Employee List
                </button>
                <button 
                    className={`tab ${viewMode === 'summary' ? 'active' : ''}`}
                    onClick={() => setViewMode('summary')}
                    disabled={!selectedUser}
                >
                    Employee Summary
                </button>
            </div>

            {/* Employee List View */}
            {viewMode === 'list' && (
                <div className="card">
                    <Table
                        headers={tableHeaders}
                        data={tableData}
                        loading={loading}
                        emptyMessage="No employees found"
                    />
                </div>
            )}

            {/* Employee Summary/Rating View */}
            {viewMode === 'summary' && selectedUser && (
                <div className="employee-summary-view">
                    <div className="summary-header">
                        <button className="back-btn" onClick={() => { setViewMode('list'); setSelectedUser(null); }}>
                            ← Back to List
                        </button>
                        <h3 className="page-title">
                            {selectedUser.first_name} {selectedUser.last_name}
                            <span className="subtitle"> - {selectedUser.position}</span>
                        </h3>
                    </div>

                    {/* Performance Summary Cards */}
                    {employeeSummary?.report?.scores && (
                        <div className="summary-scores-grid">
                            <div className="card score-card">
                                <span className="score-label">Self Score</span>
                                <span className="score-value">
                                    {employeeSummary.report.scores.self || '—'}
                                </span>
                            </div>
                            <div className="card score-card highlight">
                                <span className="score-label">Manager Rating</span>
                                <span className="score-value">
                                    {employeeSummary.report.scores.manager || '—'}
                                </span>
                            </div>
                            <div className="card score-card">
                                <span className="score-label">Peer Average</span>
                                <span className="score-value">
                                    {employeeSummary.report.scores.peer || '—'}
                                </span>
                            </div>
                            <div className="card score-card">
                                <span className="score-label">Team Score</span>
                                <span className="score-value">
                                    {employeeSummary.report.scores.team || '—'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Rating Form */}
                    <div className="card rating-form-section">
                        <h3 className="section-title">Submit Manager Rating</h3>
                        
                        <div className="ratings-grid">
                            {types.map(type => (
                                <div key={type.id} className="rating-item">
                                    <label className="rating-label">{type.name}</label>
                                    <div className="rating-slider-container">
                                        <input
                                            type="range"
                                            min="1"
                                            max="5"
                                            value={ratings[type.id] || 3}
                                            onChange={(e) => setRatings(prev => ({ 
                                                ...prev, 
                                                [type.id]: parseInt(e.target.value) 
                                            }))}
                                            className="rating-slider"
                                        />
                                        <span className="rating-value">{ratings[type.id] || 3}</span>
                                    </div>
                                    <Input
                                        placeholder="Optional comment..."
                                        value={comments[type.id] || ''}
                                        onChange={(e) => setComments(prev => ({ 
                                            ...prev, 
                                            [type.id]: e.target.value 
                                        }))}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="general-comment">
                            <label className="input-label-text">Overall Feedback</label>
                            <textarea
                                className="comment-textarea"
                                placeholder="Provide overall performance feedback..."
                                value={generalComment}
                                onChange={(e) => setGeneralComment(e.target.value)}
                                rows={4}
                            />
                        </div>

                        <div className="form-actions">
                            <Button
                                text="Cancel"
                                onClick={() => setViewMode('list')}
                            />
                            <Button
                                className="btn-primary"
                                text={submitting ? 'Submitting...' : 'Submit Rating'}
                                onClick={submitRating}
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    {/* Breakdown Chart */}
                    {employeeSummary?.report?.breakdown && (
                        <div className="card chart-section">
                            <h3 className="section-title">Performance Breakdown</h3>
                            <MyChart
                                label="Category Ratings"
                                labelsData={employeeSummary.report.breakdown.map(b => b.type)}
                                numericalData={employeeSummary.report.breakdown.map(b => 
                                    b.manager || b.self || b.peer || 0
                                )}
                            />
                        </div>
                    )}

                    {/* Manager Feedback from Summary */}
                    {employeeSummary?.summary?.manager_feedback && (
                        <div className="card existing-feedback">
                            <h3 className="section-title">Current Manager Feedback</h3>
                            <p>{employeeSummary.summary.manager_feedback}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminRate;