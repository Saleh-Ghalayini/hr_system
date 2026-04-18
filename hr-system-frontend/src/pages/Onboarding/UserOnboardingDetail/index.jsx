import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { request } from "../../../common/request";
import { toast } from "react-toastify";
import "./style.css";

const UserOnboardingDetail = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [approving, setApproving] = useState(null);

    useEffect(() => {
        fetchUserProgress();
    }, [userId]);

    const fetchUserProgress = async () => {
        try {
            setLoading(true);
            const response = await request({ method: "GET", path: `admin/onboarding/users/${userId}/progress` });
            if (response.success && response.data) {
                setData(response.data);
            }
        } catch (error) {
            toast.error("Failed to load user progress");
            navigate('/onboarding/management');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveDocument = async (documentId) => {
        setApproving(`doc-${documentId}`);
        try {
            const response = await request({
                method: "PUT",
                path: `admin/onboarding/users/${userId}/documents/${documentId}/approve`,
                data: { status: 'approved' },
            });
            if (response.success) {
                toast.success("Document approved!");
                fetchUserProgress();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to approve document");
        } finally {
            setApproving(null);
        }
    };

    const handleRejectDocument = async (documentId) => {
        if (!confirm("Reject this document?")) return;
        setApproving(`doc-rej-${documentId}`);
        try {
            const response = await request({
                method: "PUT",
                path: `admin/onboarding/users/${userId}/documents/${documentId}/approve`,
                data: { status: 'rejected' },
            });
            if (response.success) {
                toast.success("Document rejected");
                fetchUserProgress();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reject document");
        } finally {
            setApproving(null);
        }
    };

    const handleApproveChecklistItem = async (itemId) => {
        setApproving(`check-${itemId}`);
        try {
            const response = await request({
                method: "PUT",
                path: `admin/onboarding/users/${userId}/checklist/${itemId}/approve`,
            });
            if (response.success) {
                toast.success("Task approved!");
                fetchUserProgress();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to approve task");
        } finally {
            setApproving(null);
        }
    };

    const handleMarkComplete = async () => {
        if (!confirm("Mark this employee's onboarding as complete?")) return;
        try {
            const response = await request({
                method: "PUT",
                path: `admin/onboarding/users/${userId}/complete`,
            });
            if (response.success) {
                toast.success("Onboarding marked as complete!");
                fetchUserProgress();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to mark complete");
        }
    };

    if (loading) {
        return (
            <div className="user-detail-page">
                <div className="detail-header">
                    <button className="back-btn" onClick={() => navigate('/onboarding/management')}>
                        <Icon icon="mdi:arrow-left" width="20" height="20" />
                        Back
                    </button>
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    const { user, documents: userDocs = [], checklist: userCheck = [], status } = data || {};

    const totalDocs = userDocs.length;
    const uploadedDocs = userDocs.filter(d => ['uploaded', 'approved'].includes(d.status)).length;
    const approvedDocs = userDocs.filter(d => d.status === 'approved').length;
    const rejectedDocs = userDocs.filter(d => d.status === 'rejected').length;
    const pendingDocs = userDocs.filter(d => d.status === 'uploaded').length;

    const completedTasks = userCheck.filter(c => c.is_completed).length;
    const totalTasks = userCheck.length;

    const docProgress = totalDocs > 0 ? Math.round((uploadedDocs / totalDocs) * 100) : 0;
    const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const overallProgress = Math.round((docProgress + taskProgress) / 2);

    return (
        <div className="user-detail-page">
            <div className="detail-header">
                <button className="back-btn" onClick={() => navigate('/onboarding/management')}>
                    <Icon icon="mdi:arrow-left" width="20" height="20" />
                    Back to Management
                </button>
            </div>

            {/* User Info Card */}
            <div className="user-info-card">
                <div className="user-details">
                    <h2>{user?.name || 'Unknown'}</h2>
                    <p>{user?.email}</p>
                    <span className="position-badge">{user?.position || 'No position'}</span>
                </div>
                <div className={`onboarding-status ${status?.is_complete ? 'complete' : 'in-progress'}`}>
                    <Icon icon={status?.is_complete ? 'mdi:check-circle' : 'mdi:clock-outline'} width="20" height="20" />
                    {status?.is_complete ? 'Onboarding Complete' : 'In Progress'}
                </div>
            </div>

            {/* Progress Overview */}
            <div className="progress-overview">
                <div className="progress-stat">
                    <span className="stat-value">{overallProgress}%</span>
                    <span className="stat-label">Overall Progress</span>
                    <div className="stat-bar">
                        <div className="stat-fill" style={{ width: `${overallProgress}%` }}></div>
                    </div>
                </div>
                <div className="progress-stat">
                    <span className="stat-value">{uploadedDocs}/{totalDocs}</span>
                    <span className="stat-label">Documents Uploaded</span>
                    <div className="stat-bar">
                        <div className="stat-fill docs" style={{ width: `${docProgress}%` }}></div>
                    </div>
                </div>
                <div className="progress-stat">
                    <span className="stat-value">{completedTasks}/{totalTasks}</span>
                    <span className="stat-label">Tasks Completed</span>
                    <div className="stat-bar">
                        <div className="stat-fill tasks" style={{ width: `${taskProgress}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
                {!status?.is_complete && (
                    <button className="btn-complete" onClick={handleMarkComplete}>
                        <Icon icon="mdi:check-all" width="18" height="18" />
                        Mark Onboarding Complete
                    </button>
                )}
                {status?.is_complete && (
                    <span className="complete-message">
                        <Icon icon="mdi:check-circle" width="18" height="18" />
                        Onboarding has been marked as complete
                    </span>
                )}
            </div>

            {/* Documents Section */}
            <div className="section-card">
                <h3>
                    <Icon icon="mdi:file-document-multiple" width="22" height="22" />
                    Uploaded Documents
                    <span className="count-badge">{uploadedDocs} / {totalDocs}</span>
                </h3>

                {userDocs.length === 0 ? (
                    <div className="empty-section">
                        <Icon icon="mdi:file-document-outline" width="40" height="40" />
                        <p>No documents uploaded yet</p>
                    </div>
                ) : (
                    <div className="documents-list">
                        {userDocs.map((doc) => (
                            <div key={doc.id} className={`document-item ${doc.status}`}>
                                <div className="doc-preview">
                                    <Icon icon="mdi:file-pdf-box" width="32" height="32" />
                                </div>
                                <div className="doc-details">
                                    <p className="doc-name">{doc.original_name || doc.file_path?.split('/').pop() || 'Document'}</p>
                                    {doc.file_path && (
                                        <a
                                            href={`${import.meta.env.VITE_Base_API}storage/${doc.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="doc-link"
                                        >
                                            View file <Icon icon="mdi:open-in-new" width="14" height="14" />
                                        </a>
                                    )}
                                </div>
                                <div className={`doc-status ${doc.status}`}>
                                    <Icon
                                        icon={
                                            doc.status === 'approved' ? 'mdi:check-circle' :
                                            doc.status === 'rejected' ? 'mdi:close-circle' :
                                            'mdi:clock-outline'
                                        }
                                        width="16" height="16"
                                    />
                                    {doc.status === 'approved' ? 'Approved' :
                                     doc.status === 'rejected' ? 'Rejected' : 'Pending Review'}
                                </div>
                                <div className="doc-actions">
                                    {doc.status !== 'approved' && (
                                        <button
                                            className="btn-approve"
                                            onClick={() => handleApproveDocument(doc.document_id)}
                                            disabled={approving === `doc-${doc.document_id}`}
                                        >
                                            {approving === `doc-${doc.document_id}` ? (
                                                <div className="mini-spinner"></div>
                                            ) : (
                                                <Icon icon="mdi:check" width="18" height="18" />
                                            )}
                                            Approve
                                        </button>
                                    )}
                                    {doc.status !== 'rejected' && (
                                        <button
                                            className="btn-reject"
                                            onClick={() => handleRejectDocument(doc.document_id)}
                                            disabled={approving === `doc-rej-${doc.document_id}`}
                                        >
                                            <Icon icon="mdi:close" width="18" height="18" />
                                            Reject
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {status?.is_complete && (
                    <div className="admin-note">
                        <Icon icon="mdi:information" width="18" height="18" />
                        <span>Onboarding is complete. All documents have been reviewed.</span>
                    </div>
                )}
            </div>

            {/* Checklist Section */}
            <div className="section-card">
                <h3>
                    <Icon icon="mdi:clipboard-check" width="22" height="22" />
                    Onboarding Checklist
                    <span className="count-badge">{completedTasks} / {totalTasks}</span>
                </h3>

                {userCheck.length === 0 ? (
                    <div className="empty-section">
                        <Icon icon="mdi:clipboard-outline" width="40" height="40" />
                        <p>No checklist items</p>
                    </div>
                ) : (
                    <div className="checklist-items">
                        {userCheck.map((item) => (
                            <div key={item.id} className={`checklist-item ${item.is_completed ? 'done' : ''}`}>
                                <div className="check-status">
                                    {item.is_completed ? (
                                        <Icon icon="mdi:check-circle" width="24" height="24" />
                                    ) : (
                                        <Icon icon="mdi:checkbox-blank-circle-outline" width="24" height="24" />
                                    )}
                                </div>
                                <div className="check-info">
                                    <p className="check-label">{item.checklist_item?.label || 'Task'}</p>
                                    {item.completed_at && (
                                        <span className="check-date">
                                            Completed: {new Date(item.completed_at).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                {!item.is_completed && !status?.is_complete && (
                                    <button
                                        className="btn-approve-task"
                                        onClick={() => handleApproveChecklistItem(item.checklist_item_id)}
                                        disabled={approving === `check-${item.checklist_item_id}`}
                                    >
                                        {approving === `check-${item.checklist_item_id}` ? (
                                            <div className="mini-spinner"></div>
                                        ) : (
                                            <Icon icon="mdi:check" width="16" height="16" />
                                        )}
                                        Approve
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Timeline / Dates */}
            {(status?.onboarding_started_at || status?.onboarding_completed_at) && (
                <div className="timeline-section">
                    <h3>
                        <Icon icon="mdi:timetable" width="22" height="22" />
                        Timeline
                    </h3>
                    <div className="timeline">
                        {status?.onboarding_started_at && (
                            <div className="timeline-item">
                                <div className="timeline-dot start"></div>
                                <div className="timeline-content">
                                    <span className="timeline-date">
                                        {new Date(status.onboarding_started_at).toLocaleDateString('en-US', {
                                            year: 'numeric', month: 'long', day: 'numeric'
                                        })}
                                    </span>
                                    <span className="timeline-label">Onboarding Started</span>
                                </div>
                            </div>
                        )}
                        {status?.onboarding_completed_at && (
                            <div className="timeline-item">
                                <div className="timeline-dot end"></div>
                                <div className="timeline-content">
                                    <span className="timeline-date">
                                        {new Date(status.onboarding_completed_at).toLocaleDateString('en-US', {
                                            year: 'numeric', month: 'long', day: 'numeric'
                                        })}
                                    </span>
                                    <span className="timeline-label">Onboarding Completed</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserOnboardingDetail;