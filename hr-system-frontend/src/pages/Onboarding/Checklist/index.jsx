import React, { useState } from "react";
import { Icon } from "@iconify/react";
import "./style.css";

const CHECKLIST_ITEMS = [
    { id: 1, category: "Day 1", label: "Receive company badge and access cards" },
    { id: 2, category: "Day 1", label: "Set up workstation and equipment" },
    { id: 3, category: "Day 1", label: "Complete HR paperwork and contracts" },
    { id: 4, category: "Day 1", label: "Meet team members and direct manager" },
    { id: 5, category: "Week 1", label: "Complete security and compliance training" },
    { id: 6, category: "Week 1", label: "Review company policies and handbook" },
    { id: 7, category: "Week 1", label: "Set up email and required software accounts" },
    { id: 8, category: "Week 1", label: "Schedule 1-on-1 with manager" },
    { id: 9, category: "Month 1", label: "Complete role-specific training" },
    { id: 10, category: "Month 1", label: "Submit first performance check-in" },
    { id: 11, category: "Month 1", label: "Confirm payroll and benefits enrollment" },
];

const CATEGORIES = ["Day 1", "Week 1", "Month 1"];

const Checklist = () => {
    const [checked, setChecked] = useState({});

    const toggle = (id) => setChecked(p => ({ ...p, [id]: !p[id] }));

    const total = CHECKLIST_ITEMS.length;
    const done = Object.values(checked).filter(Boolean).length;
    const pct = Math.round((done / total) * 100);

    return (
        <div className="checklist-page">
            <div className="checklist-header">
                <Icon icon="mdi:clipboard-check" width="24" height="24" />
                <h2>Onboarding Checklist</h2>
            </div>

            <div className="checklist-progress-card">
                <div className="checklist-progress-info">
                    <span>{done} of {total} tasks completed</span>
                    <span className="pct">{pct}%</span>
                </div>
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
            </div>

            {CATEGORIES.map(cat => (
                <div key={cat} className="checklist-section">
                    <h3 className="checklist-category">{cat}</h3>
                    <div className="checklist-items">
                        {CHECKLIST_ITEMS.filter(i => i.category === cat).map(item => (
                            <label key={item.id} className={`checklist-item ${checked[item.id] ? "done" : ""}`}>
                                <input
                                    type="checkbox"
                                    checked={!!checked[item.id]}
                                    onChange={() => toggle(item.id)}
                                />
                                <span>{item.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Checklist;
