import Table from "../../../components/Table";
import "./style.css";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { request } from "../../../common/request";
import { toast } from 'react-toastify';
import { useAuthContext } from "../../../context/AuthContext";

const STATUS_OPTIONS = ["On-time", "Late", "Absent"];

const DATE_PRESETS = [
    { label: "Today", getValue: () => { const d = fmt(new Date()); return [d, d]; } },
    { label: "Yesterday", getValue: () => { const d = new Date(); d.setDate(d.getDate() - 1); const s = fmt(d); return [s, s]; } },
    { label: "Last 7 days", getValue: () => { const e = new Date(); const s = new Date(); s.setDate(s.getDate() - 6); return [fmt(s), fmt(e)]; } },
    { label: "Last 30 days", getValue: () => { const e = new Date(); const s = new Date(); s.setDate(s.getDate() - 29); return [fmt(s), fmt(e)]; } },
    { label: "This month", getValue: () => { const n = new Date(); return [fmt(new Date(n.getFullYear(), n.getMonth(), 1)), fmt(n)]; } },
];

function fmt(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const AttendanceRecords = () => {
    const { user } = useAuthContext();
    const role = (user?.role || "").toLowerCase();
    const isAdmin = role === "admin";
    const [longitude, setLongitude] = useState(null);
    const [latitude, setLatitude] = useState(null);
    const [is_checked_in, setIsCheckedIn] = useState(false);
    const [selectedNames, setSelectedNames] = useState([]);
    const [nameDropdownOpen, setNameDropdownOpen] = useState(false);
    const [employeeSearch, setEmployeeSearch] = useState("");
    const [start_date, setStartDate] = useState("");
    const [end_date, setEndDate] = useState("");
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const [presetValue, setPresetValue] = useState("");
    const [presetDropdownOpen, setPresetDropdownOpen] = useState(false);
    const [records, setRecords] = useState([]);
    const [allNames, setAllNames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const statusRef = useRef(null);
    const nameRef = useRef(null);

    // Get geolocation
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => { setLatitude(pos.coords.latitude); setLongitude(pos.coords.longitude); },
            () => {}
        );
    }, []);

    // Fetch today's attendance to determine check-in state
    useEffect(() => {
        const fetchTodayStatus = async () => {
            try {
                const today = fmt(new Date());
                const response = await request({
                    method: "GET", path: "attendance/my", params: { date: today },
                });
                const records = Array.isArray(response.data) ? response.data : [];
                const todayRecord = records[0];
                setIsCheckedIn(!!(todayRecord?.check_in && !todayRecord?.check_out));
            } catch { /* default stays false */ }
        };
        fetchTodayStatus();
    }, []);

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e) => {
            if (statusRef.current && !statusRef.current.contains(e.target)) setStatusDropdownOpen(false);
            if (nameRef.current && !nameRef.current.contains(e.target)) setNameDropdownOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const table_headers = [
        { key: 'date', label: "Date" },
        { key: 'employee', label: "Employee" },
        { key: 'check-in time', label: "Check-in" },
        { key: 'check-out time', label: "Check-out" },
        { key: 'location status', label: "Location" },
        { key: 'status', label: "Status" },
        { key: 'hours worked', label: "Hours Worked" },
    ];

    const fmtHours = (h) => {
        const num = parseFloat(h);
        if (isNaN(num) || num < 0) return "--";
        const hrs = Math.floor(num);
        const mins = Math.round((num - hrs) * 60);
        if (hrs === 0 && mins === 0) return "0h";
        if (mins === 0) return `${hrs}h`;
        if (hrs === 0) return `${mins}m`;
        return `${hrs}h ${mins}m`;
    };

    const formatLocStatus = (status, type, id) => {
        if (!status) return null;
        if (isAdmin && status === "Review needed") {
            return (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#BA5143', fontWeight: 'bold' }}>{type}: Review needed</span>
                    <button 
                        type="button"
                        style={{ padding: '2px 8px', fontSize: '11px', background: '#069855', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleReview(id, type === 'In' ? 'loc_in_status' : 'loc_out_status', 'Approved'); }}
                    >Approve</button>
                    <button 
                        type="button"
                        style={{ padding: '2px 8px', fontSize: '11px', background: '#BA5143', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleReview(id, type === 'In' ? 'loc_in_status' : 'loc_out_status', 'Rejected'); }}
                    >Reject</button>
                </div>
            );
        }
        return <div style={{ fontSize: '12px', marginBottom: '4px' }}>{type}: {status}</div>;
    };

    const transformRecords = (records) => {
        const todayStr = fmt(new Date());
        const yest = new Date(); yest.setDate(yest.getDate() - 1);
        const yesterdayStr = fmt(yest);
        return records.map(item => {
            const itemDate = item.date ? item.date.split("T")[0] : "N/A";
            let dateLabel = itemDate;
            if (itemDate === todayStr) dateLabel = "Today";
            else if (itemDate === yesterdayStr) dateLabel = "Yesterday";
            return {
                id: item.id,
                date: dateLabel,
                employee: item.full_name || "--",
                "check-in time": item.check_in || "--",
                "check-out time": item.check_out || "--",
                "location status": (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {formatLocStatus(item.loc_in_status, 'In', item.id) || <div>In: --</div>}
                        {item.check_out ? (formatLocStatus(item.loc_out_status, 'Out', item.id) || <div>Out: --</div>) : <div>Out: --</div>}
                    </div>
                ),
                status: item.time_in_status || item.status || "--",
                "hours worked": fmtHours(item.working_hours),
            };
        });
    };

    const fetchAttendance = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = { page };
            if (isAdmin && selectedNames.length === 1) params.full_name = selectedNames[0];
            if (start_date) params.start_date = start_date;
            if (end_date) params.end_date = end_date;
            if (isAdmin && selectedStatuses.length === 1) params.status = selectedStatuses[0];

            const path = isAdmin ? "admin/attendance/all" : "attendance/my";
            const response = await request({ method: "GET", path, params });

            // Handle paginated response
            let raw = [];
            let pageInfo = { current_page: 1, last_page: 1 };
            
            if (response?.data) {
                // Paginated response structure
                if (Array.isArray(response.data.data)) {
                    raw = response.data.data;
                    pageInfo = {
                        current_page: response.data.current_page || 1,
                        last_page: response.data.last_page || 1,
                    };
                } else if (Array.isArray(response.data)) {
                    raw = response.data;
                }
            } else if (Array.isArray(response)) {
                raw = response;
            }

            setRecords(raw);
            setCurrentPage(pageInfo.current_page);
            setTotalPages(pageInfo.last_page);
            
            // Extract unique names for the name picker
            if (isAdmin && raw.length > 0) {
                const names = [...new Set(raw.map(r => r.full_name).filter(Boolean))].sort();
                if (names.length > 0) setAllNames(names);
            }
        } catch {
            toast.error("Failed to load attendance records.");
        } finally {
            setLoading(false);
        }
    }, [isAdmin, selectedNames, start_date, end_date, selectedStatuses]);

    useEffect(() => {
        fetchAttendance(1);
    }, [fetchAttendance]);

    const handleReview = async (id, statusType, newValue) => {
        // Skip review for absent records (they don't have real IDs)
        if (String(id).startsWith('absent_')) {
            toast.info("Cannot review absent records.");
            return;
        }
        try {
            await request({
                method: "PUT",
                path: `admin/attendance/${id}/review`,
                data: { [statusType]: newValue },
            });
            toast.success("Location status updated successfully");
            fetchAttendance(currentPage);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update status");
        }
    };

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        fetchAttendance(1);
    };

    const handleClearFilters = (e) => {
        if (e) e.preventDefault();
        setStartDate("");
        setEndDate("");
        setSelectedNames([]);
        setSelectedStatuses([]);
        setPresetValue("");
        setEmployeeSearch("");
        fetchAttendance(1);
    };

    const handleKeyDown = (e) => { if (e.key === "Enter") handleFilter(); };

    const handlePageChange = (page) => {
        fetchAttendance(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleStatus = (status) => {
        setSelectedStatuses(prev =>
            prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
        );
    };

    const toggleName = (name) => {
        setSelectedNames(prev =>
            prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
        );
    };

    const applyPreset = (e) => {
        const val = e.target.value;
        setPresetValue(val);
        if (!val) return;
        const preset = DATE_PRESETS.find(p => p.label === val);
        if (preset) {
            const [s, end] = preset.getValue();
            setStartDate(s);
            setEndDate(end);
        }
    };

    // Client-side filter for multiple selection
    const filteredRecords = useMemo(() => {
        let filtered = records;
        if (isAdmin && selectedNames.length > 1) {
            filtered = filtered.filter(r => selectedNames.includes(r.full_name));
        }
        if (selectedStatuses.length > 1) {
            filtered = filtered.filter(r => selectedStatuses.includes(r.time_in_status || r.status));
        }
        return filtered;
    }, [records, isAdmin, selectedNames, selectedStatuses]);

    const attendance = useMemo(() => transformRecords(filteredRecords), [filteredRecords]);

    const checkInOut = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const hasCoordinates = Number.isFinite(longitude) && Number.isFinite(latitude);
        const payload = is_checked_in
            ? (hasCoordinates ? { check_out_lon: longitude, check_out_lat: latitude } : {})
            : (hasCoordinates ? { check_in_lon: longitude, check_in_lat: latitude } : {});

        try {
            await request({
                method: "POST",
                path: is_checked_in ? "attendance/check-out" : "attendance/check-in",
                data: payload,
            });
            toast.success(is_checked_in ? "Checked out!" : "Checked in!");
            setIsCheckedIn(!is_checked_in);
            fetchAttendance(1);
        } catch (error) {
            if ((error?.response?.status === 422) && !hasCoordinates) {
                toast.error("Location is required by attendance settings. Enable geolocation and try again.");
                return;
            }

            toast.error(error.response?.data?.message || error.message || "Error processing attendance request.");
        }
    };

    const statusLabel = selectedStatuses.length === 0 ? "All Statuses" : selectedStatuses.join(", ");
    const nameLabel = selectedNames.length === 0 ? "All Employees" : `${selectedNames.length} selected`;

    return (
        <div className="attendance-records-container">
            <div className="filter-container">
                {/* Date range with presets */}
                <div className="filter-row">
                    <div className="preset-select-wrap">
                        <select
                            className="preset-select"
                            onChange={applyPreset}
                            onFocus={() => setPresetDropdownOpen(true)}
                            onBlur={() => setPresetDropdownOpen(false)}
                            value={presetValue}
                        >
                            <option value="" disabled>Quick Select...</option>
                            {DATE_PRESETS.map(p => (
                                <option key={p.label} value={p.label}>{p.label}</option>
                            ))}
                        </select>
                        <span className={`dropdown-arrow${presetDropdownOpen ? " open" : ""}`} aria-hidden="true" />
                    </div>
                    <div className="date-range">
                        <input className="filter-date-input" type="date" value={start_date}
                            onChange={(e) => setStartDate(e.target.value)} onKeyDown={handleKeyDown} />
                        <span className="date-range-sep">to</span>
                        <input className="filter-date-input" type="date" value={end_date}
                            onChange={(e) => setEndDate(e.target.value)} onKeyDown={handleKeyDown} />
                    </div>
                </div>

                <div className="filter-row">
                    {/* Employee multi-select */}
                    {isAdmin && (
                        <div className="multi-dropdown" ref={nameRef}>
                            <button className="multi-dropdown-btn" onClick={() => setNameDropdownOpen(o => !o)} type="button">
                                {nameLabel}
                                <span className={`dropdown-arrow${nameDropdownOpen ? " open" : ""}`} aria-hidden="true" />
                            </button>
                            {nameDropdownOpen && (
                                <div className="multi-dropdown-menu name-menu">
                                    <div className="name-search-wrapper">
                                        <input
                                            type="text"
                                            className="name-search-input"
                                            placeholder="Search employees..."
                                            value={employeeSearch}
                                            onChange={(e) => setEmployeeSearch(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                    {allNames.length === 0 ? (
                                        <div className="dropdown-empty">No employees loaded</div>
                                    ) : (
                                        (() => {
                                            const filteredNames = allNames.filter(n => 
                                                n.toLowerCase().includes(employeeSearch.toLowerCase())
                                            );
                                            if (filteredNames.length === 0) {
                                                return <div className="dropdown-empty">No matching employees</div>;
                                            }
                                            return filteredNames.map(n => (
                                                <label key={n} className="dropdown-option">
                                                    <input type="checkbox" checked={selectedNames.includes(n)} onChange={() => toggleName(n)} />
                                                    {n}
                                                </label>
                                            ));
                                        })()
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Status multi-select */}
                    <div className="multi-dropdown" ref={statusRef}>
                        <button className="multi-dropdown-btn" onClick={() => setStatusDropdownOpen(o => !o)} type="button">
                            {statusLabel}
                            <span className={`dropdown-arrow${statusDropdownOpen ? " open" : ""}`} aria-hidden="true" />
                        </button>
                        {statusDropdownOpen && (
                            <div className="multi-dropdown-menu">
                                {STATUS_OPTIONS.map(s => (
                                    <label key={s} className="dropdown-option">
                                        <input type="checkbox" checked={selectedStatuses.includes(s)} onChange={() => toggleStatus(s)} />
                                        {s}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="filter-actions">
                        <button type="button" className="filter-btn" onClick={handleFilter}>Apply Filters</button>
                        <button type="button" className="filter-btn clear-btn" onClick={handleClearFilters}>Clear</button>
                        <button type="button" className={`check-btn${is_checked_in ? " checked-in" : ""}`} onClick={checkInOut}>
                            {is_checked_in ? "Check Out" : "Check In"}
                        </button>
                    </div>
                </div>
            </div>

            <Table
                headers={table_headers}
                data={attendance}
                loading={loading}
                emptyMessage="No attendance records found"
                pagination={isAdmin && totalPages > 1 ? { currentPage, totalPages, onPageChange: handlePageChange } : undefined}
            />
        </div>
    );
};

export default AttendanceRecords;
