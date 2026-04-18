import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { request } from "../../../common/request";
import { toast } from "react-toastify";
import "./style.css";

const EmployeeOverview = () => {
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyProgress();
    }, []);

    const fetchMyProgress = async () => {
        try {
            setLoading(true);
            const response = await request({ method: "GET", path: "onboarding/my" });
            if (response.success && response.data) {
                setProgress(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch onboarding progress:', error);
            toast.error("Failed to load onboarding progress.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="overview-page">
                <div className="overview-header">
                    <Icon icon="mdi:clipboard-check-outline" width="28" height="28" />
                    <h2>My Onboarding</h2>
                </div>
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading your onboarding progress...</p>
                </div>
            </div>
        );
    }

    const { documents = [], checklist = [], progress: progressData = {}, onboarding_status } = progress || {};

    // Calculate stats
    const requiredDocs = documents.filter(d => d.status === 'required');
    const uploadedDocs = documents.filter(d => d.user_status !== 'pending');
    const approvedDocs = documents.filter(d => d.user_status === 'approved');
    const rejectedDocs = documents.filter(d => d.user_status === 'rejected');
    const pendingDocs = documents.filter(d => d.user_status === 'uploaded');
    const notUploadedDocs = documents.filter(d => d.user_status === 'pending');

    const completedChecklist = checklist.filter(c => c.is_completed).length;
    const totalChecklist = checklist.length;

    const docsProgress = requiredDocs.length > 0
        ? Math.round((uploadedDocs.filter(d => requiredDocs.some(r => r.id === d.id)).length / requiredDocs.length) * 100)
        : 0;
    const checklistProgress = totalChecklist > 0
        ? Math.round((completedChecklist / totalChecklist) * 100)
        : 0;
    const overallProgress = progressData.overall_percent || 0;

    const isComplete = onboarding_status?.is_onboarding_complete;

    return (
        <div className="overview-page">
            <div className="overview-header">
                <Icon icon="mdi:clipboard-check-outline" width="28" height="28" />
                <h2>My Onboarding</h2>
                {isComplete && (
                    <span className="complete-badge">
                        <Icon icon="mdi:check-circle" width="18" height="18" />
                        Completed
                    </span>
                )}
            </div>

            {/* Overall Progress Card */}
            <div className="overall-progress-card">
                <div className="progress-circle-container">
                    <svg className="progress-ring" viewBox="0 0 120 120">
                        <circle
                            className="progress-ring-bg"
                            cx="60" cy="60" r="52"
                            fill="none"
                            strokeWidth="12"
                        />
                        <circle
                            className="progress-ring-fill"
                            cx="60" cy="60" r="52"
                            fill="none"
                            strokeWidth="12"
                            strokeDasharray={`${2 * Math.PI * 52}`}
                            strokeDashoffset={`${2 * Math.PI * 52 * (1 - overallProgress / 100)}`}
                        />
                    </svg>
                    <div className="progress-circle-text">
                        <span className="progress-value">{overallProgress}%</span>
                        <span className="progress-label">Complete</span>
                    </div>
                </div>

                <div className="progress-details">
                    <h3>Onboarding Progress</h3>
                    <p className="progress-subtitle">
                        {overallProgress === 100
                            ? "Congratulations! You've completed all onboarding tasks."
                            : overallProgress >= 50
                            ? "You're making great progress. Keep going!"
                            : "Your onboarding journey has begun. Complete all tasks to get started."
                        }
                    </p>

                    <div className="mini-stats">
                        <div className="mini-stat">
                            <Icon icon="mdi:file-upload" width="20" height="20" />
                            <div>
                                <span className="stat-value">{uploadedDocs.length}/{requiredDocs.length}</span>
                                <span className="stat-label">Documents Uploaded</span>
                            </div>
                        </div>
                        <div className="mini-stat">
                            <Icon icon="mdi:checkbox-marked" width="20" height="20" />
                            <div>
                                <span className="stat-value">{completedChecklist}/{totalChecklist}</span>
                                <span className="stat-label">Tasks Completed</span>
                            </div>
                        </div>
                    </div>

                    {onboarding_status?.onboarding_started_at && (
                        <p className="started-date">
                            Started: {new Date(onboarding_status.onboarding_started_at).toLocaleDateString('en-US', {
                                year: 'numeric', month: 'long', day: 'numeric'
                            })}
                        </p>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <Link to="/onboarding/documents" className="action-card">
                    <div className="action-icon docs">
                        <Icon icon="mdi:file-document-multiple" width="28" height="28" />
                    </div>
                    <div className="action-info">
                        <h4>Documents</h4>
                        <p>
                            {notUploadedDocs.length > 0
                                ? `${notUploadedDocs.length} document${notUploadedDocs.length > 1 ? 's' : ''} pending upload`
                                : uploadedDocs.length > 0
                                ? "All documents uploaded"
                                : "No documents required"}
                        </p>
                    </div>
                    <Icon icon="mdi:chevron-right" width="24" height="24" className="action-arrow" />
                </Link>

                <Link to="/onboarding/checklist" className="action-card">
                    <div className="action-icon checklist">
                        <Icon icon="mdi:clipboard-check" width="28" height="28" />
                    </div>
                    <div className="action-info">
                        <h4>Checklist</h4>
                        <p>
                            {totalChecklist - completedChecklist > 0
                                ? `${totalChecklist - completedChecklist} task${totalChecklist - completedChecklist > 1 ? 's' : ''} remaining`
                                : "All tasks completed!"}
                        </p>
                    </div>
                    <Icon icon="mdi:chevron-right" width="24" height="24" className="action-arrow" />
                </Link>
            </div>

            {/* Status Cards */}
            <div className="status-cards">
                <div className="status-card approved">
                    <Icon icon="mdi:check-circle" width="24" height="24" />
                    <div>
                        <span className="status-count">{approvedDocs.length}</span>
                        <span className="status-label">Approved</span>
                    </div>
                </div>
                <div className="status-card pending">
                    <Icon icon="mdi:clock-outline" width="24" height="24" />
                    <div>
                        <span className="status-count">{pendingDocs.length}</span>
                        <span className="status-label">Pending Review</span>
                    </div>
                </div>
                <div className="status-card rejected">
                    <Icon icon="mdi:close-circle" width="24" height="24" />
                    <div>
                        <span className="status-count">{rejectedDocs.length}</span>
                        <span className="status-label">Rejected</span>
                    </div>
                </div>
                <div className="status-card missing">
                    <Icon icon="mdi:file-alert" width="24" height="24" />
                    <div>
                        <span className="status-count">{notUploadedDocs.length}</span>
                        <span className="status-label">Not Uploaded</span>
                    </div>
                </div>
            </div>

            {/* Document Requirements Summary */}
            {requiredDocs.length > 0 && (
                <div className="requirements-summary">
                    <h3>
                        <Icon icon="mdi:file-document" width="20" height="20" />
                        Document Requirements
                    </h3>
                    <div className="req-progress-bar">
                        <div
                            className="req-progress-fill"
                            style={{ width: `${docsProgress}%` }}
                        />
                    </div>
                    <p>{docsProgress}% complete</p>
                </div>
            )}
        </div>
    );
};

export default EmployeeOverview;
