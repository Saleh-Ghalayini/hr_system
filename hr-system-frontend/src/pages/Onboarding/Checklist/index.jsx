import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { request } from "../../../common/request";
import { toast } from "react-toastify";
import "./style.css";

const Checklist = () => {
    const [checklist, setChecklist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchChecklist();
    }, []);

    const fetchChecklist = async () => {
        try {
            setLoading(true);
            const response = await request({ method: "GET", path: "onboarding/my" });
            if (response.success && response.data) {
                setChecklist(response.data.checklist || []);
            }
        } catch (error) {
            console.error('Failed to fetch checklist:', error);
            toast.error("Failed to load checklist.");
        } finally {
            setLoading(false);
        }
    };

    // Handle checkbox toggle
    // If item is completed (checked), clicking should uncheck it
    // If item is not completed (unchecked), clicking should check it
    const handleToggle = async (item) => {
        const willCheck = !item.is_completed; // true if we're checking, false if unchecking
        const action = willCheck ? 'completing' : 'uncompleting';
        
        setProcessingId(item.id);
        
        try {
            const endpoint = willCheck 
                ? "onboarding/checklist/toggle"
                : "onboarding/checklist/untoggle";
            
            const response = await request({
                method: "POST",
                path: endpoint,
                data: { checklist_item_id: item.id },
            });

            if (response.success) {
                // Update local state immediately
                setChecklist(prev => prev.map(i => 
                    i.id === item.id 
                        ? { 
                            ...i, 
                            is_completed: willCheck,
                            completed_at: willCheck ? new Date().toISOString() : null
                          } 
                        : i
                ));
                
                toast.success(
                    willCheck 
                        ? `"${item.label}" marked as complete!` 
                        : `"${item.label}" unchecked`
                );
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update task");
        } finally {
            setProcessingId(null);
        }
    };

    // Calculate stats
    const total = checklist.length;
    const completed = checklist.filter(i => i.is_completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Group items by category
    const categories = {};
    checklist.forEach(item => {
        const cat = item.category || 'Other';
        if (!categories[cat]) {
            categories[cat] = [];
        }
        categories[cat].push(item);
    });

    const categoryOrder = ["Day 1", "Week 1", "Month 1"];

    if (loading) {
        return (
            <div className="checklist-page">
                <div className="checklist-header">
                    <Icon icon="mdi:clipboard-check" width="24" height="24" />
                    <h2>Onboarding Checklist</h2>
                </div>
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading checklist...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="checklist-page">
            <div className="checklist-header">
                <Icon icon="mdi:clipboard-check" width="24" height="24" />
                <h2>Onboarding Checklist</h2>
            </div>

            {/* Progress Card */}
            <div className="checklist-progress-card">
                <div className="checklist-progress-info">
                    <span>{completed} of {total} tasks completed</span>
                    <span className="pct">{percentage}%</span>
                </div>
                <div className="progress-bar">
                    <div 
                        className="progress-fill" 
                        style={{ width: `${percentage}%` }} 
                    />
                </div>
            </div>

            {/* Category Sections */}
            {categoryOrder.map(cat => {
                const items = categories[cat];
                if (!items || items.length === 0) return null;
                
                return (
                    <div key={cat} className="checklist-section">
                        <h3 className="checklist-category">{cat}</h3>
                        <div className="checklist-items">
                            {items.map(item => {
                                const isProcessing = processingId === item.id;
                                
                                return (
                                    <div 
                                        key={item.id} 
                                        className={`checklist-item ${item.is_completed ? 'done' : ''} ${isProcessing ? 'processing' : ''}`}
                                    >
                                        {/* Custom checkbox */}
                                        <div 
                                            className={`checkbox-wrapper ${isProcessing ? 'loading' : ''}`}
                                            onClick={() => !isProcessing && handleToggle(item)}
                                        >
                                            {isProcessing ? (
                                                <div className="mini-spinner"></div>
                                            ) : (
                                                <div className={`custom-checkbox ${item.is_completed ? 'checked' : ''}`}>
                                                    {item.is_completed && (
                                                        <Icon icon="mdi:check" width="14" height="14" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Label */}
                                        <span className="item-label">{item.label}</span>
                                        
                                        {/* Completion date */}
                                        {item.completed_at && (
                                            <span className="completed-date">
                                                {new Date(item.completed_at).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {/* Empty State */}
            {checklist.length === 0 && (
                <div className="empty-state">
                    <Icon icon="mdi:clipboard-outline" width="48" height="48" />
                    <p>No checklist items configured yet.</p>
                    <p className="hint">HR administrators will set up onboarding tasks for you.</p>
                </div>
            )}
        </div>
    );
};

export default Checklist;
