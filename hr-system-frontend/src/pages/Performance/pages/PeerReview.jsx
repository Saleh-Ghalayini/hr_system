import React, { useEffect, useState } from 'react';
import Button from '../../../components/Button';
import { request } from '../../../common/request';
import { toast } from 'react-toastify';
import useInitialPageLoader from '../../../hooks/useInitialPageLoader';
import './style.css';

const PeerReview = () => {
    const [mode, setMode] = useState('give');
    const [peers, setPeers] = useState([]);
    const [types, setTypes] = useState([]);
    const [cycles, setCycles] = useState([]);
    const [activeCycle, setActiveCycle] = useState(null);
    const [selectedPeer, setSelectedPeer] = useState(null);
    const [selectedCycle, setSelectedCycle] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [rating, setRating] = useState(3);
    const [comment, setComment] = useState('');
    const [relationship, setRelationship] = useState('colleague');
    const [reviewsReceived, setReviewsReceived] = useState([]);
    const [reviewsGiven, setReviewsGiven] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const showInitialLoader = useInitialPageLoader(loading);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [peersRes, typesRes, cyclesRes, activeRes, receivedRes, givenRes] = await Promise.all([
                request({ method: 'GET', path: 'performance/peers' }),
                request({ method: 'GET', path: 'performance/types' }),
                request({ method: 'GET', path: 'performance/cycles' }),
                request({ method: 'GET', path: 'performance/cycles/active' }),
                request({ method: 'GET', path: 'performance/peer-reviews/received' }),
                request({ method: 'GET', path: 'performance/peer-reviews/given' }),
            ]);

            if (peersRes?.success) setPeers(peersRes.data);
            if (typesRes?.success) setTypes(typesRes.data);
            if (cyclesRes?.success) setCycles(cyclesRes.data);
            if (activeRes?.success) {
                setActiveCycle(activeRes.data);
                setSelectedCycle(activeRes.data?.id);
            }
            if (receivedRes?.success) setReviewsReceived(receivedRes.data.reviews || []);
            if (givenRes?.success) setReviewsGiven(givenRes.data || []);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const submitReview = async () => {
        if (!selectedPeer || !selectedType) {
            toast.error('Please select a peer and rating category');
            return;
        }

        setSubmitting(true);
        try {
            const res = await request({
                method: 'POST',
                path: 'performance/peer-review',
                data: {
                    reviewed_id: selectedPeer,
                    type_id: selectedType,
                    rate: rating,
                    comment,
                    relationship,
                    review_cycle_id: selectedCycle,
                },
            });

            if (res?.success) {
                toast.success('Peer review submitted!');
                setSelectedPeer(null);
                setSelectedType(null);
                setRating(3);
                setComment('');
                const givenRes = await request({ method: 'GET', path: 'performance/peer-reviews/given' });
                if (givenRes?.success) setReviewsGiven(givenRes.data);
            } else {
                toast.error(res?.message || 'Failed to submit');
            }
        } catch (error) {
            toast.error('Failed to submit peer review');
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

    const renderStars = (count) => {
        return '★'.repeat(count) + '☆'.repeat(5 - count);
    };

    return (
        <div className="page-wrapper">
            <div className="peer-header">
                <h2 className="page-title">360° Peer Feedback</h2>
                <p className="page-subtitle">Give and receive confidential feedback from colleagues</p>
            </div>

            {/* Mode Tabs */}
            <div className="peer-mode-tabs">
                <button 
                    className={`tab ${mode === 'give' ? 'active' : ''}`}
                    onClick={() => setMode('give')}
                >
                    Give Feedback
                </button>
                <button 
                    className={`tab ${mode === 'received' ? 'active' : ''}`}
                    onClick={() => setMode('received')}
                >
                    Received Feedback
                </button>
            </div>

            {/* Give Feedback Mode */}
            {mode === 'give' && (
                <div className="give-feedback-section">
                    <div className="card feedback-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label className="input-label-text">Review Cycle</label>
                                <select 
                                    className="input"
                                    value={selectedCycle || ''}
                                    onChange={(e) => setSelectedCycle(e.target.value ? parseInt(e.target.value) : null)}
                                >
                                    <option value="">Select Cycle</option>
                                    {cycles.filter(c => c.status !== 'closed').map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="input-label-text">Peer to Review</label>
                                <select 
                                    className="input"
                                    value={selectedPeer || ''}
                                    onChange={(e) => setSelectedPeer(e.target.value ? parseInt(e.target.value) : null)}
                                >
                                    <option value="">Select a colleague</option>
                                    {peers.map(peer => (
                                        <option key={peer.id} value={peer.id}>
                                            {peer.first_name} {peer.last_name} - {peer.position}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="input-label-text">Category</label>
                                <select 
                                    className="input"
                                    value={selectedType || ''}
                                    onChange={(e) => setSelectedType(e.target.value ? parseInt(e.target.value) : null)}
                                >
                                    <option value="">Select category</option>
                                    {types.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="input-label-text">Relationship</label>
                                <select 
                                    className="input"
                                    value={relationship}
                                    onChange={(e) => setRelationship(e.target.value)}
                                >
                                    <option value="colleague">Colleague</option>
                                    <option value="cross_functional">Cross-functional</option>
                                    <option value="direct_report">Direct Report</option>
                                    <option value="client">Client</option>
                                </select>
                            </div>
                        </div>

                        <div className="rating-section">
                            <label className="input-label-text">Rating: {rating}/5</label>
                            <div className="star-rating">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <span
                                        key={star}
                                        className={`star ${rating >= star ? 'filled' : ''}`}
                                        onClick={() => setRating(star)}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                            <div className="rating-description">
                                {rating === 1 && 'Needs Significant Improvement'}
                                {rating === 2 && 'Needs Improvement'}
                                {rating === 3 && 'Meets Expectations'}
                                {rating === 4 && 'Exceeds Expectations'}
                                {rating === 5 && 'Exceptional'}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="input-label-text">Comments (Confidential)</label>
                            <textarea
                                className="comment-textarea"
                                placeholder="Provide constructive feedback..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                            />
                        </div>

                        <Button
                            className="btn-primary"
                            text={submitting ? 'Submitting...' : 'Submit Feedback'}
                            onClick={submitReview}
                            disabled={submitting || !selectedPeer || !selectedType}
                        />
                    </div>

                    {/* Reviews Given */}
                    <div className="reviews-given">
                        <h3 className="section-title">Your Submitted Feedback</h3>
                        {reviewsGiven.length > 0 ? (
                            <div className="reviews-list">
                                {reviewsGiven.map(review => (
                                    <div key={review.id} className="card review-card">
                                        <div className="review-meta">
                                            <span className="review-to">
                                                To: {review.reviewed?.first_name} {review.reviewed?.last_name}
                                            </span>
                                            <span className="review-date">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="review-category">{review.type?.name}</div>
                                        <div className="review-rating">{renderStars(review.rate)}</div>
                                        {review.comment && (
                                            <p className="review-comment">{review.comment}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="card empty-state">
                                <p>No feedback submitted yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Received Feedback Mode */}
            {mode === 'received' && (
                <div className="received-feedback-section">
                    <div className="card peer-summary">
                        <div className="peer-stat">
                            <strong>{reviewsReceived.length}</strong>
                            <span>Reviews Received</span>
                        </div>
                        <div className="peer-stat">
                            <strong>
                                {reviewsReceived.length > 0 
                                    ? (reviewsReceived.reduce((s, r) => s + r.rate, 0) / reviewsReceived.length).toFixed(1)
                                    : '—'}
                            </strong>
                            <span>Average Rating</span>
                        </div>
                    </div>

                    {reviewsReceived.length > 0 ? (
                        <div className="reviews-grid">
                            {reviewsReceived.map(review => (
                                <div key={review.id} className="card review-card">
                                    <div className="review-header">
                                        <span className="review-from">
                                            From: {review.reviewer?.first_name} {review.reviewer?.last_name}
                                        </span>
                                        <span className="review-relationship">{review.relationship}</span>
                                    </div>
                                    <div className="review-category">{review.type?.name}</div>
                                    <div className="review-rating">{renderStars(review.rate)}</div>
                                    {review.comment && (
                                        <p className="review-comment">{review.comment}</p>
                                    )}
                                    <div className="review-date">
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="card empty-state">
                            <p>No peer reviews received yet.</p>
                            <p className="hint">Encourage your colleagues to provide feedback!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PeerReview;