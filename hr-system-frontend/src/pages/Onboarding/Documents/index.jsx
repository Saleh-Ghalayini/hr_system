import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { request } from "../../../common/request";
import { toast } from "react-toastify";
import "./style.css";

const Documents = () => {
    const [documents, setDocuments] = useState([]);
    const [userDocuments, setUserDocuments] = useState({});
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(null);

    useEffect(() => {
        fetchMyProgress();
    }, []);

    const fetchMyProgress = async () => {
        try {
            setLoading(true);
            const response = await request({ method: "GET", path: "onboarding/my" });
            if (response.success && response.data) {
                setDocuments(response.data.documents || []);
                // Build user document map
                const docMap = {};
                (response.data.documents || []).forEach(doc => {
                    docMap[doc.id] = doc;
                });
                setUserDocuments(docMap);
            }
        } catch (error) {
            console.error('Failed to fetch onboarding progress:', error);
            toast.error("Failed to load documents.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (documentId, file) => {
        if (!file) return;
        
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            toast.error("File size must be less than 5MB");
            return;
        }

        const allowedTypes = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
        const ext = file.name.split('.').pop().toLowerCase();
        if (!allowedTypes.includes(ext)) {
            toast.error("Invalid file type. Allowed: PDF, JPG, PNG, DOC, DOCX");
            return;
        }

        setUploading(documentId);
        try {
            const formData = new FormData();
            formData.append('document_id', documentId);
            formData.append('file', file);

            const response = await request({
                method: "POST",
                path: "onboarding/documents/upload",
                data: formData,
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.success) {
                toast.success("Document uploaded successfully!");
                fetchMyProgress(); // Refresh data
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to upload document");
        } finally {
            setUploading(null);
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'approved': return 'status-approved';
            case 'uploaded': return 'status-uploaded';
            case 'rejected': return 'status-rejected';
            default: return 'status-pending';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'approved': return 'Approved';
            case 'uploaded': return 'Uploaded';
            case 'rejected': return 'Rejected';
            case 'required': 
            default: return 'Required';
        }
    };

    if (loading) {
        return (
            <div className="documents-page">
                <div className="documents-header">
                    <Icon icon="mdi:folder-open" width="24" height="24" />
                    <h2>Onboarding Documents</h2>
                </div>
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading documents...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="documents-page">
            <div className="documents-header">
                <Icon icon="mdi:folder-open" width="24" height="24" />
                <h2>Onboarding Documents</h2>
            </div>

            <div className="documents-notice">
                <Icon icon="mdi:information-outline" width="18" height="18" />
                <p>Upload your required documents below. All documents will be reviewed by HR administrators.</p>
            </div>

            <div className="documents-grid">
                {documents.map((doc) => (
                    <div key={doc.id} className={`document-card ${doc.status === 'optional' ? 'optional' : ''}`}>
                        <Icon icon={doc.icon || 'mdi:file-document'} width="28" height="28" className="doc-icon" />
                        <div className="doc-info">
                            <p className="doc-label">{doc.name}</p>
                            <span className={`doc-badge ${doc.status}`}>
                                {doc.status === "required" ? "Required" : "Optional"}
                            </span>
                        </div>
                        <div className="doc-actions">
                            <div className="upload-area">
                                <input
                                    type="file"
                                    id={`file-${doc.id}`}
                                    className="file-input"
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    onChange={(e) => handleFileUpload(doc.id, e.target.files[0])}
                                    disabled={uploading === doc.id}
                                />
                                <label 
                                    htmlFor={`file-${doc.id}`} 
                                    className={`upload-button ${uploading === doc.id ? 'uploading' : ''} ${userDocuments[doc.id]?.user_status !== 'pending' && userDocuments[doc.id]?.user_status ? 'uploaded' : ''}`}
                                >
                                    {uploading === doc.id ? (
                                        <>
                                            <div className="mini-spinner"></div>
                                            <span>Uploading...</span>
                                        </>
                                    ) : userDocuments[doc.id]?.user_status === 'uploaded' || userDocuments[doc.id]?.user_status === 'approved' ? (
                                        <>
                                            <Icon icon="mdi:check" width="16" height="16" />
                                            <span>Re-upload</span>
                                        </>
                                    ) : (
                                        <>
                                            <Icon icon="mdi:upload" width="16" height="16" />
                                            <span>Upload</span>
                                        </>
                                    )}
                                </label>
                            </div>
                            <div className={`upload-status ${getStatusClass(userDocuments[doc.id]?.user_status)}`}>
                                <Icon 
                                    icon={
                                        userDocuments[doc.id]?.user_status === 'approved' ? 'mdi:check-circle' :
                                        userDocuments[doc.id]?.user_status === 'uploaded' ? 'mdi:clock-outline' :
                                        userDocuments[doc.id]?.user_status === 'rejected' ? 'mdi:close-circle' :
                                        'mdi:clock-outline'
                                    } 
                                    width="16" 
                                    height="16" 
                                />
                                <span>
                                    {userDocuments[doc.id]?.user_status === 'approved' ? 'Approved' :
                                     userDocuments[doc.id]?.user_status === 'uploaded' ? 'Pending Review' :
                                     userDocuments[doc.id]?.user_status === 'rejected' ? 'Rejected' :
                                     'Not Uploaded'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {documents.length === 0 && (
                <div className="empty-state">
                    <Icon icon="mdi:folder-open-outline" width="48" height="48" />
                    <p>No document requirements configured yet.</p>
                    <p className="hint">HR administrators will set up document requirements.</p>
                </div>
            )}
        </div>
    );
};

export default Documents;