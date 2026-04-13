import Table from "../../../components/Table";
import "./style.css";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { request } from "../../../common/request";
import { toast } from 'react-toastify';
import { useAuthContext } from "../../../context/AuthContext";

const STATUS_OPTIONS = ["On-time", "Late"];

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
    const [start_date, setStartDate] = useState("");
    const [end_date, setEndDate] = useState("");
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const [presetValue, setPresetValue] = useState("");
    const [attendance, setAttendance] = useState([]);
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
                date: dateLabel,
                employee: item.full_name || "--",
                "check-in time": item.check_in || "--",
                "check-out time": item.check_out || "--",
                "location status": item.loc_in_status || "--",
                status: item.time_in_status || "--",
                "hours worked": fmtHours(item.working_hours),
            };
        });
    };

    const fetchAttendance = useCallback(async (page = 1, filters = {}) => {
        setLoading(true);
        try {
            const params = {};
            if (isAdmin) params.page = page;
            if (isAdmin && filters.names?.length === 1) params.full_name = filters.names[0];
            if (filters.start_date) params.start_date = filters.start_date;
            if (filters.end_date) params.end_date = filters.end_date;
            if (isAdmin && filters.statuses?.length === 1) params.status = filters.statuses[0];

            const path = isAdmin ? "admin/attendance/all" : "attendance/my";
            const response = await request({ method: "GET", path, params });
            const raw = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);

            // Extract unique names for the name picker
            if (isAdmin) {
                const names = [...new Set(raw.map(r => r.full_name).filter(Boolean))].sort();
                if (names.length > 0 && allNames.length === 0) setAllNames(names);
            }

            // Client-side filtering for cases not covered by backend params.
            let filtered = raw;
            if (isAdmin && filters.names?.length > 1) {
                filtered = raw.filter(r => filters.names.includes(r.full_name));
            }
            if (filters.statuses?.length > 1 || !isAdmin) {
                filtered = filtered.filter(r =>
                    filters.statuses?.length ? filters.statuses.includes(r.time_in_status) : true
                );
            }

            setAttendance(transformRecords(filtered));
            if (isAdmin) {
                setTotalPages(response.data?.last_page ?? 1);
                setCurrentPage(page);
            } else {
                setTotalPages(1);
                setCurrentPage(1);
            }
        } catch {
            toast.error("Failed to load attendance records.");
        } finally {
            setLoading(false);
        }
    }, [allNames.length, isAdmin]);

    useEffect(() => {
        fetchAttendance(1, { names: selectedNames, start_date, end_date, statuses: selectedStatuses });
    }, [fetchAttendance]);

    const handleFilter = () => {
        fetchAttendance(1, { names: selectedNames, start_date, end_date, statuses: selectedStatuses });
    };

    const handleClearFilters = () => {
        setStartDate("");
        setEndDate("");
        setSelectedNames([]);
        setSelectedStatuses([]);
        setPresetValue("");
        fetchAttendance(1, { names: [], start_date: "", end_date: "", statuses: [] });
    };

    const handleKeyDown = (e) => { if (e.key === "Enter") handleFilter(); };

    const handlePageChange = (page) => {
        fetchAttendance(page, { names: selectedNames, start_date, end_date, statuses: selectedStatuses });
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

    const checkInOut = async () => {
        if (longitude === null || latitude === null) {
            toast.error("Geolocation is not available.");
            return;
        }
        try {
            await request({
                method: "POST",
                path: is_checked_in ? "attendance/check-out" : "attendance/check-in",
                data: is_checked_in
                    ? { check_out_lon: longitude, check_out_lat: latitude }
                    : { check_in_lon: longitude, check_in_lat: latitude },
            });
            toast.success(is_checked_in ? "Checked out!" : "Checked in!");
            setIsCheckedIn(!is_checked_in);
            fetchAttendance(1, { names: selectedNames, start_date, end_date, statuses: selectedStatuses });
        } catch (error) {
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
                    <select className="preset-select" onChange={applyPreset} value={presetValue}>
                        <option value="" disabled>Quick Select...</option>
                        {DATE_PRESETS.map(p => (
                            <option key={p.label} value={p.label}>{p.label}</option>
                        ))}
                    </select>
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
                                <span className="dropdown-arrow">{nameDropdownOpen ? "\u25B2" : "\u25BC"}</span>
                            </button>
                            {nameDropdownOpen && (
                                <div className="multi-dropdown-menu name-menu">
                                    {allNames.length === 0 ? (
                                        <div className="dropdown-empty">No employees loaded</div>
                                    ) : allNames.map(n => (
                                        <label key={n} className="dropdown-option">
                                            <input type="checkbox" checked={selectedNames.includes(n)} onChange={() => toggleName(n)} />
                                            {n}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Status multi-select */}
                    <div className="multi-dropdown" ref={statusRef}>
                        <button className="multi-dropdown-btn" onClick={() => setStatusDropdownOpen(o => !o)} type="button">
                            {statusLabel}
                            <span className="dropdown-arrow">{statusDropdownOpen ? "\u25B2" : "\u25BC"}</span>
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
                        <button className="filter-btn" onClick={handleFilter}>Apply Filters</button>
                        <button className="filter-btn clear-btn" onClick={handleClearFilters}>Clear</button>
                        <button className={`check-btn${is_checked_in ? " checked-in" : ""}`} onClick={checkInOut}>
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
