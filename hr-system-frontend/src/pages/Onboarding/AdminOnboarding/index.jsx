import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { request } from "../../../common/request";
import { toast } from "react-toastify";
import "./style.css";

const AdminOnboarding = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('progress');
    const [usersProgress, setUsersProgress] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [checklistItems, setChecklistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form refs for scrolling
    const docFormRef = useRef(null);
    const checklistFormRef = useRef(null);

    // Document form
    const [docForm, setDocForm] = useState({ name: '', icon: 'mdi:file-document', status: 'required' });
    const [editingDocId, setEditingDocId] = useState(null);

    // Checklist form
    const [checklistForm, setChecklistForm] = useState({ label: '', category: 'Day 1' });
    const [editingChecklistId, setEditingChecklistId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (activeTab === 'documents') fetchDocuments();
        if (activeTab === 'checklist') fetchChecklist();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await request({ method: "GET", path: "admin/onboarding/users/progress" });
            if (response.success) {
                setUsersProgress(response.data || []);
            }
        } catch (error) {
            toast.error("Failed to load users progress");
        } finally {
            setLoading(false);
        }
    };

    const fetchDocuments = async () => {
        try {
            const response = await request({ method: "GET", path: "admin/onboarding/documents/templates" });
            if (response.success) setDocuments(response.data || []);
        } catch (error) {
            toast.error("Failed to load document templates");
        }
    };

    const fetchChecklist = async () => {
        try {
            const response = await request({ method: "GET", path: "admin/onboarding/checklist/templates" });
            if (response.success) setChecklistItems(response.data || []);
        } catch (error) {
            toast.error("Failed to load checklist templates");
        }
    };

    // Document handlers
    const handleSaveDocument = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        
        try {
            const isEditing = editingDocId !== null;
            const response = isEditing
                ? await request({ method: "PUT", path: `admin/onboarding/documents/templates/${editingDocId}`, data: docForm })
                : await request({ method: "POST", path: "admin/onboarding/documents/templates", data: docForm });
            
            if (response.success) {
                toast.success(isEditing ? "Document template updated!" : "Document template added!");
                resetDocForm();
                fetchDocuments();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save document");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteDocument = async (id) => {
        if (!confirm("Deactivate this document template?")) return;
        
        try {
            const response = await request({ method: "DELETE", path: `admin/onboarding/documents/templates/${id}` });
            if (response.success) {
                toast.success("Document template deactivated");
                if (editingDocId === id) resetDocForm();
                fetchDocuments();
            }
        } catch (error) {
            toast.error("Failed to delete document");
        }
    };

    const startEditDoc = (doc) => {
        setEditingDocId(doc.id);
        setDocForm({ name: doc.name, icon: doc.icon || 'mdi:file-document', status: doc.status });
        
        // Switch to documents tab and scroll to form
        if (activeTab !== 'documents') {
            setActiveTab('documents');
        }
        setTimeout(() => {
            docFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            docFormRef.current?.querySelector('input')?.focus();
        }, 100);
    };

    const resetDocForm = () => {
        setEditingDocId(null);
        setDocForm({ name: '', icon: 'mdi:file-document', status: 'required' });
    };

    // Checklist handlers
    const handleSaveChecklist = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        
        try {
            const isEditing = editingChecklistId !== null;
            const response = isEditing
                ? await request({ method: "PUT", path: `admin/onboarding/checklist/templates/${editingChecklistId}`, data: checklistForm })
                : await request({ method: "POST", path: "admin/onboarding/checklist/templates", data: checklistForm });
            
            if (response.success) {
                toast.success(isEditing ? "Checklist item updated!" : "Checklist item added!");
                resetChecklistForm();
                fetchChecklist();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save checklist item");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteChecklist = async (id) => {
        if (!confirm("Deactivate this checklist item?")) return;
        
        try {
            const response = await request({ method: "DELETE", path: `admin/onboarding/checklist/templates/${id}` });
            if (response.success) {
                toast.success("Checklist item deactivated");
                if (editingChecklistId === id) resetChecklistForm();
                fetchChecklist();
            }
        } catch (error) {
            toast.error("Failed to delete checklist item");
        }
    };

    const startEditChecklist = (item) => {
        setEditingChecklistId(item.id);
        setChecklistForm({ label: item.label, category: item.category });
        
        // Switch to checklist tab and scroll to form
        if (activeTab !== 'checklist') {
            setActiveTab('checklist');
        }
        setTimeout(() => {
            checklistFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            checklistFormRef.current?.querySelector('input')?.focus();
        }, 100);
    };

    const resetChecklistForm = () => {
        setEditingChecklistId(null);
        setChecklistForm({ label: '', category: 'Day 1' });
    };

    const calculateProgress = (user) => {
        const docProgress = user.documents?.required > 0 
            ? Math.round((user.documents?.uploaded / user.documents?.required) * 50) 
            : 0;
        const checkProgress = user.checklist?.total > 0 
            ? Math.round((user.checklist?.completed / user.checklist?.total) * 50) 
            : 0;
        return docProgress + checkProgress;
    };

    if (loading) {
        return (
            <div className="admin-onboarding">
                <div className="admin-header">
                    <Icon icon="mdi:clipboard-list" width="28" height="28" />
                    <h1>Onboarding Management</h1>
                </div>
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    const isEditingDoc = editingDocId !== null;
    const isEditingChecklist = editingChecklistId !== null;

    return (
        <div className="admin-onboarding">
            <div className="admin-header">
                <Icon icon="mdi:clipboard-list" width="28" height="28" />
                <h1>Onboarding Management</h1>
                <button className="add-new-hire-btn" onClick={() => navigate('/onboarding/new-hires')}>
                    <Icon icon="mdi:account-plus" width="18" height="18" />
                    Add New Hire
                </button>
            </div>

            <div className="tabs">
                <button 
                    className={`tab ${activeTab === 'progress' ? 'active' : ''}`}
                    onClick={() => setActiveTab('progress')}
                >
                    <Icon icon="mdi:account-group" width="18" height="18" />
                    Employee Progress
                </button>
                <button 
                    className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
                    onClick={() => setActiveTab('documents')}
                >
                    <Icon icon="mdi:file-document-multiple" width="18" height="18" />
                    Document Templates
                </button>
                <button 
                    className={`tab ${activeTab === 'checklist' ? 'active' : ''}`}
                    onClick={() => setActiveTab('checklist')}
                >
                    <Icon icon="mdi:clipboard-check-outline" width="18" height="18" />
                    Checklist Templates
                </button>
            </div>

            {/* Employee Progress Tab */}
            {activeTab === 'progress' && (
                <div className="tab-content">
                    <div className="users-grid">
                        {usersProgress.map((userData) => {
                            const progress = calculateProgress(userData);
                            return (
                                <div key={userData.user?.id} className="user-card">
                                    <div className="user-header">
                                        <div className="user-info">
                                            <h3>{userData.user?.name || 'Unknown'}</h3>
                                            <p>{userData.user?.email}</p>
                                            <span className="position">{userData.user?.position}</span>
                                        </div>
                                        <div className={`status-badge ${userData.status?.is_complete ? 'complete' : 'in-progress'}`}>
                                            {userData.status?.is_complete ? 'Complete' : 'In Progress'}
                                        </div>
                                    </div>

                                    <div className="progress-section">
                                        <div className="progress-item">
                                            <div className="progress-header">
                                                <Icon icon="mdi:file-upload" width="16" height="16" />
                                                <span>Documents</span>
                                            </div>
                                            <div className="progress-bar">
                                                <div 
                                                    className="progress-fill docs"
                                                    style={{ 
                                                        width: `${userData.documents?.required > 0 
                                                            ? (userData.documents.uploaded / userData.documents.required) * 100 
                                                            : 0}%` 
                                                    }} 
                                                />
                                            </div>
                                            <span className="progress-text">
                                                {userData.documents?.uploaded || 0} / {userData.documents?.required || 0} required
                                            </span>
                                        </div>

                                        <div className="progress-item">
                                            <div className="progress-header">
                                                <Icon icon="mdi:checkbox-marked" width="16" height="16" />
                                                <span>Checklist</span>
                                            </div>
                                            <div className="progress-bar">
                                                <div 
                                                    className="progress-fill checklist"
                                                    style={{ 
                                                        width: `${userData.checklist?.total > 0 
                                                            ? (userData.checklist.completed / userData.checklist.total) * 100 
                                                            : 0}%` 
                                                    }} 
                                                />
                                            </div>
                                            <span className="progress-text">
                                                {userData.checklist?.completed || 0} / {userData.checklist?.total || 0} tasks
                                            </span>
                                        </div>
                                    </div>

                                    <div className="overall-progress">
                                        <span>Overall: {progress}%</span>
                                    </div>

                                    {userData.status?.started_at && (
                                        <div className="user-meta">
                                            Started: {new Date(userData.status.started_at).toLocaleDateString()}
                                            {userData.status?.completed_at && (
                                                <> • Completed: {new Date(userData.status.completed_at).toLocaleDateString()}</>
                                            )}
                                        </div>
                                    )}

                                    <button 
                                        className="view-details-btn"
                                        onClick={() => navigate(`/onboarding/user/${userData.user?.id}`)}
                                    >
                                        <Icon icon="mdi:eye" width="16" height="16" />
                                        View Details
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {usersProgress.length === 0 && (
                        <div className="empty-state">
                            <Icon icon="mdi:account-group" width="48" height="48" />
                            <p>No employees with onboarding data yet.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Document Templates Tab */}
            {activeTab === 'documents' && (
                <div className="tab-content">
                    <div className="form-card" ref={docFormRef}>
                        <h3>{isEditingDoc ? 'Edit Document Template' : 'Add Document Template'}</h3>
                        <form onSubmit={handleSaveDocument} className="template-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Document Name</label>
                                    <input
                                        type="text"
                                        value={docForm.name}
                                        onChange={(e) => setDocForm({...docForm, name: e.target.value})}
                                        placeholder="e.g., National ID"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>
                                        Icon 
                                        <a 
                                            href="https://icon-sets.iconify.design/mdi/" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="icon-help-link"
                                        >
                                            (Browse icons)
                                        </a>
                                    </label>
                                    <input
                                        type="text"
                                        value={docForm.icon}
                                        onChange={(e) => setDocForm({...docForm, icon: e.target.value})}
                                        placeholder="mdi:file-document"
                                    />
                                    <span className="field-hint">Start with "mdi:" followed by icon name</span>
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        value={docForm.status}
                                        onChange={(e) => setDocForm({...docForm, status: e.target.value})}
                                    >
                                        <option value="required">Required</option>
                                        <option value="optional">Optional</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-actions">
                                {isEditingDoc && (
                                    <button type="button" className="btn-secondary" onClick={resetDocForm}>
                                        Cancel
                                    </button>
                                )}
                                <button type="submit" className="btn-primary" disabled={submitting}>
                                    {submitting ? 'Saving...' : (isEditingDoc ? 'Update' : 'Add')} Template
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="templates-list">
                        <h3>Current Templates ({documents.length})</h3>
                        {documents.map((doc) => (
                            <div key={doc.id} className="template-item">
                                <Icon icon={doc.icon || 'mdi:file-document'} width="24" height="24" />
                                <div className="template-info">
                                    <strong>{doc.name}</strong>
                                    <span className={`badge ${doc.status}`}>{doc.status}</span>
                                </div>
                                <div className="template-actions">
                                    <button className="btn-icon" onClick={() => startEditDoc(doc)} title="Edit">
                                        <Icon icon="mdi:pencil" width="18" height="18" />
                                    </button>
                                    <button className="btn-icon danger" onClick={() => handleDeleteDocument(doc.id)} title="Deactivate">
                                        <Icon icon="mdi:delete" width="18" height="18" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {documents.length === 0 && (
                            <div className="empty-list">No document templates yet. Use the form above to add one.</div>
                        )}
                    </div>
                </div>
            )}

            {/* Checklist Templates Tab */}
            {activeTab === 'checklist' && (
                <div className="tab-content">
                    <div className="form-card" ref={checklistFormRef}>
                        <h3>{isEditingChecklist ? 'Edit Checklist Item' : 'Add Checklist Item'}</h3>
                        <form onSubmit={handleSaveChecklist} className="template-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Task Label</label>
                                    <input
                                        type="text"
                                        value={checklistForm.label}
                                        onChange={(e) => setChecklistForm({...checklistForm, label: e.target.value})}
                                        placeholder="e.g., Complete security training"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        value={checklistForm.category}
                                        onChange={(e) => setChecklistForm({...checklistForm, category: e.target.value})}
                                    >
                                        <option value="Day 1">Day 1</option>
                                        <option value="Week 1">Week 1</option>
                                        <option value="Month 1">Month 1</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-actions">
                                {isEditingChecklist && (
                                    <button type="button" className="btn-secondary" onClick={resetChecklistForm}>
                                        Cancel
                                    </button>
                                )}
                                <button type="submit" className="btn-primary" disabled={submitting}>
                                    {submitting ? 'Saving...' : (isEditingChecklist ? 'Update' : 'Add')} Item
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="templates-list">
                        <h3>Current Items ({checklistItems.length})</h3>
                        {['Day 1', 'Week 1', 'Month 1'].map(cat => {
                            const items = checklistItems.filter(i => i.category === cat);
                            if (items.length === 0) return null;
                            return (
                                <div key={cat} className="category-group">
                                    <h4>{cat}</h4>
                                    {items.map((item) => (
                                        <div key={item.id} className="template-item">
                                            <div className="template-info">
                                                <span>{item.label}</span>
                                            </div>
                                            <div className="template-actions">
                                                <button className="btn-icon" onClick={() => startEditChecklist(item)} title="Edit">
                                                    <Icon icon="mdi:pencil" width="18" height="18" />
                                                </button>
                                                <button className="btn-icon danger" onClick={() => handleDeleteChecklist(item.id)} title="Deactivate">
                                                    <Icon icon="mdi:delete" width="18" height="18" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                        {checklistItems.length === 0 && (
                            <div className="empty-list">No checklist items yet. Use the form above to add one.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOnboarding;
