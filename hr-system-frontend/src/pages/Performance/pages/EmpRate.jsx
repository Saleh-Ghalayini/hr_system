import React, { useEffect, useState } from 'react';
import Input from '../../../components/Input';
import MyChart from '../../../components/Chart';
import './style.css';
import Button from '../../../components/Button';
import { request } from '../../../common/request';
import { toast } from 'react-toastify';
import useInitialPageLoader from '../../../hooks/useInitialPageLoader';

const EmpRate = () => {
    const [mode, setMode] = useState('team');
    const [types, setTypes] = useState([]);
    const [cycles, setCycles] = useState([]);
    const [activeCycle, setActiveCycle] = useState(null);
    const [selectedCycle, setSelectedCycle] = useState(null);
    const [ratings, setRatings] = useState({});
    const [comments, setComments] = useState({});
    const [generalComment, setGeneralComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Self-assessment fields
    const [accomplishments, setAccomplishments] = useState('');
    const [challenges, setChallenges] = useState('');
    const [developmentNeeds, setDevelopmentNeeds] = useState('');
    const showInitialLoader = useInitialPageLoader(loading);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [typesRes, cyclesRes, activeRes] = await Promise.all([
                request({ method: 'GET', path: 'performance/types' }),
                request({ method: 'GET', path: 'performance/cycles' }),
                request({ method: 'GET', path: 'performance/cycles/active' }),
            ]);

            if (typesRes?.success) {
                setTypes(typesRes.data);
                const initial = {};
                typesRes.data.forEach(t => { initial[t.id] = 3; });
                setRatings(initial);
            }

            if (cyclesRes?.success) setCycles(cyclesRes.data);
            if (activeRes?.success) {
                setActiveCycle(activeRes.data);
                setSelectedCycle(activeRes.data?.id);
                fetchExistingRatings(activeRes.data?.id);
            }
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const fetchExistingRatings = async (cycleId) => {
        if (!cycleId) return;
        try {
            const res = mode === 'team' 
                ? await request({ method: 'GET', path: `performance/my-team-rate?cycle_id=${cycleId}` })
                : await request({ method: 'GET', path: `performance/self-assessment?cycle_id=${cycleId}` });
            
            if (res?.success) {
                const data = res.data.ratings || res.data.assessment || [];
                if (data.length > 0) {
                    const existing = {};
                    const existingComments = {};
                    data.forEach(item => {
                        existing[item.type_id] = item.rate;
                        if (item.comment) existingComments[item.type_id] = item.comment;
                    });
                    setRatings(existing);
                    setComments(existingComments);
                    setGeneralComment(data[0]?.comment || '');
                }
            }
        } catch (error) {
            console.log('No existing ratings');
        }
    };

    const handleModeChange = (newMode) => {
        setMode(newMode);
        setSelectedCycle(activeCycle?.id);
        fetchExistingRatings(activeCycle?.id);
    };

    const handleCycleChange = async (e) => {
        const cycleId = e.target.value;
        setSelectedCycle(cycleId ? parseInt(cycleId) : null);
        if (cycleId) {
            await fetchExistingRatings(parseInt(cycleId));
        } else {
            const initial = {};
            types.forEach(t => { initial[t.id] = 3; });
            setRatings(initial);
            setComments({});
            setGeneralComment('');
        }
    };

    const handleRatingChange = (typeId, value) => {
        setRatings(prev => ({ ...prev, [typeId]: value }));
    };

    const handleCommentChange = (typeId, value) => {
        setComments(prev => ({ ...prev, [typeId]: value }));
    };

    const submitTeamRating = async () => {
        setSubmitting(true);
        try {
            const typeIds = types.map(t => t.id);
            const rates = typeIds.map(id => ratings[id] || 3);

            const res = await request({
                method: 'POST',
                path: 'performance/rate-team',
                data: {
                    type_ids: typeIds,
                    rate: rates,
                    comment: generalComment,
                    review_cycle_id: selectedCycle,
                },
            });

            if (res?.success) {
                toast.success('Team rating submitted successfully!');
            } else {
                toast.error('Failed to submit rating');
            }
        } catch (error) {
            toast.error('Failed to submit rating');
        } finally {
            setSubmitting(false);
        }
    };

    const submitSelfAssessment = async () => {
        setSubmitting(true);
        try {
            const typeIds = types.map(t => t.id);
            const rates = typeIds.map(id => ratings[id] || 3);
            const commentArray = typeIds.map(id => comments[id] || '');

            const res = await request({
                method: 'POST',
                path: 'performance/self-assessment',
                data: {
                    type_ids: typeIds,
                    rate: rates,
                    comments: commentArray,
                    review_cycle_id: selectedCycle,
                    accomplishments,
                    challenges,
                    development_needs: developmentNeeds,
                },
            });

            if (res?.success) {
                toast.success('Self-assessment submitted successfully!');
            } else {
                toast.error('Failed to submit self-assessment');
            }
        } catch (error) {
            toast.error('Failed to submit self-assessment');
        } finally {
            setSubmitting(false);
        }
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

    const chartData = types.map(t => ratings[t.id] || 0);
    const chartLabels = types.map(t => t.name);

    return (
        <div className="page-wrapper">
            {/* Header */}
            <div className="perf-header">
                <h2 className="page-title">Performance Review</h2>
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

            {/* Mode Tabs */}
            <div className="rating-mode-tabs">
                <button 
                    className={`tab ${mode === 'team' ? 'active' : ''}`}
                    onClick={() => handleModeChange('team')}
                >
                    Rate My Team
                </button>
                <button 
                    className={`tab ${mode === 'self' ? 'active' : ''}`}
                    onClick={() => handleModeChange('self')}
                >
                    Self Assessment
                </button>
            </div>

            <div className="card rate-content">
                {/* Ratings Section */}
                <div className="ratings-section">
                    <h3 className="section-title">
                        {mode === 'team' ? 'Rate Your Team' : 'Self-Assessment'}
                    </h3>
                    <p className="rate-instruction">
                        {mode === 'team' 
                            ? 'Rate how well your team performed in each area (1-5)'
                            : 'Rate yourself honestly in each area (1-5)'}
                    </p>

                    <div className="ratings-grid">
                        {types.map(type => (
                            <div key={type.id} className="rating-item">
                                <div className="rating-header">
                                    <label className="rating-label">{type.name}</label>
                                    {type.weight && <span className="weight-badge">×{type.weight}</span>}
                                </div>
                                <div className="rating-slider-container">
                                    <input
                                        type="range"
                                        min="1"
                                        max="5"
                                        value={ratings[type.id] || 3}
                                        onChange={(e) => handleRatingChange(type.id, parseInt(e.target.value))}
                                        className="rating-slider"
                                    />
                                    <div className="rating-value">{ratings[type.id] || 3}</div>
                                </div>
                                <div className="rating-labels">
                                    <span>Poor</span>
                                    <span>Excellent</span>
                                </div>
                                <Input
                                    label="Comment"
                                    type="text"
                                    placeholder="Optional comment..."
                                    value={comments[type.id] || ''}
                                    onChange={(e) => handleCommentChange(type.id, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>

                    {/* General Comment */}
                    <div className="general-comment">
                        <label className="input-label-text">Overall Comment</label>
                        <textarea
                            className="comment-textarea"
                            placeholder={mode === 'team' 
                                ? "Describe overall team performance, achievements, and areas for improvement..."
                                : "Reflect on your performance this period..."}
                            value={generalComment}
                            onChange={(e) => setGeneralComment(e.target.value)}
                            rows={4}
                        />
                    </div>
                </div>

                {/* Self-Assessment Additional Fields */}
                {mode === 'self' && (
                    <div className="self-assessment-fields">
                        <h3 className="section-title">Additional Reflection</h3>
                        <div className="reflection-field">
                            <label className="input-label-text">Key Accomplishments</label>
                            <textarea
                                className="comment-textarea"
                                placeholder="What were your major achievements this period?"
                                value={accomplishments}
                                onChange={(e) => setAccomplishments(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="reflection-field">
                            <label className="input-label-text">Challenges Faced</label>
                            <textarea
                                className="comment-textarea"
                                placeholder="What obstacles did you encounter and how did you address them?"
                                value={challenges}
                                onChange={(e) => setChallenges(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="reflection-field">
                            <label className="input-label-text">Development Needs</label>
                            <textarea
                                className="comment-textarea"
                                placeholder="What skills or knowledge would you like to develop?"
                                value={developmentNeeds}
                                onChange={(e) => setDevelopmentNeeds(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                )}

                {/* Chart Preview */}
                <div className="chart-preview">
                    <h3 className="section-title">Rating Preview</h3>
                    <MyChart
                        className="preview-chart"
                        label="Your Ratings"
                        labelsData={chartLabels}
                        numericalData={chartData}
                    />
                    <div className="chart-summary">
                        Average: <strong>
                            {types.length > 0 
                                ? (chartData.reduce((a, b) => a + b, 0) / chartData.length).toFixed(1)
                                : '—'}
                        </strong>
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className="submit-section">
                <Button
                    className="btn-primary"
                    text={submitting ? 'Submitting...' : 'Submit Review'}
                    onClick={mode === 'team' ? submitTeamRating : submitSelfAssessment}
                    disabled={submitting || !selectedCycle}
                />
                {!selectedCycle && (
                    <p className="warning-text">Please select a review cycle before submitting.</p>
                )}
            </div>
        </div>
    );
};

export default EmpRate;