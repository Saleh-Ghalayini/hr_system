import React from "react";
import { Icon } from "@iconify/react";
import "./style.css";

const DOCUMENT_TYPES = [
    { icon: "mdi:card-account-details", label: "National ID / Passport", status: "required" },
    { icon: "mdi:school", label: "Educational Certificates", status: "required" },
    { icon: "mdi:briefcase", label: "Previous Employment Letters", status: "optional" },
    { icon: "mdi:file-sign", label: "Signed Contract", status: "required" },
    { icon: "mdi:bank", label: "Bank Account Details", status: "required" },
    { icon: "mdi:camera", label: "Profile Photo", status: "required" },
];

const Documents = () => {
    return (
        <div className="documents-page">
            <div className="documents-header">
                <Icon icon="mdi:folder-open" width="24" height="24" />
                <h2>Onboarding Documents</h2>
            </div>

            <div className="documents-notice">
                <Icon icon="mdi:information-outline" width="18" height="18" />
                <p>Document management is handled by HR administrators. The list below shows required documents for new hires.</p>
            </div>

            <div className="documents-grid">
                {DOCUMENT_TYPES.map((doc) => (
                    <div key={doc.label} className="document-card">
                        <Icon icon={doc.icon} width="28" height="28" className="doc-icon" />
                        <div className="doc-info">
                            <p className="doc-label">{doc.label}</p>
                            <span className={`doc-badge ${doc.status}`}>
                                {doc.status === "required" ? "Required" : "Optional"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Documents;
