import Table from "../../../components/Table";
import "./style.css";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { request } from "../../../common/request";
import { toast } from 'react-toastify';

const STATUS_OPTIONS = ["On-time", "Late"];

const AttendanceRecords = () => {
    const [longitude, setLongitude] = useState(null);
    const [latitude, setLatitude] = useState(null);
    const [is_checked_in, setIsCheckedIn] = useState(false);
    const [name, setName] = useState("");
    const [start_date, setStartDate] = useState("");
    const [end_date, setEndDate] = useState("");
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const dropdownRef = useRef(null);

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
                const today = new Date().toISOString().split("T")[0];
                const response = await request({
                    method: "GET",
                    path: "attendance/my",
                    params: { date: today },
                });
                const records = Array.isArray(response.data) ? response.data : [];
                const todayRecord = records[0];
                setIsCheckedIn(!!(todayRecord?.check_in && !todayRecord?.check_out));
            } catch {
                // Not critical — default stays false
            }
        };
        fetchTodayStatus();
    }, []);

    // Close status dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setStatusDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
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
        if (isNaN(num) || num < 0) return "—";
        const hrs  = Math.floor(num);
        const mins = Math.round((num - hrs) * 60);
        if (hrs === 0 && mins === 0) return "0h";
        if (mins === 0) return `${hrs}h`;
        if (hrs === 0) return `${mins}m`;
        return `${hrs}h ${mins}m`;
    };

    const transformRecords = (records) => {
        const todayStr = new Date().toISOString().split("T")[0];
        const yest = new Date();
        yest.setDate(yest.getDate() - 1);
        const yesterdayStr = yest.toISOString().split("T")[0];

        return records.map(item => {
            const itemDate = item.date ? item.date.split("T")[0] : "N/A";
            let dateLabel = itemDate;
            if (itemDate === todayStr) dateLabel = "Today";
            else if (itemDate === yesterdayStr) dateLabel = "Yesterday";
            return {
                date: dateLabel,
                employee: item.full_name || "—",
                "check-in time": item.check_in || "—",
                "check-out time": item.check_out || "—",
                "location status": item.loc_in_status || "—",
                status: item.time_in_status || "—",
                "hours worked": fmtHours(item.working_hours),
            };
        });
    };

    const fetchAttendance = useCallback(async (page = 1, filters = {}) => {
        setLoading(true);
        try {
            const params = { page };
            if (filters.name?.trim())        params.full_name   = filters.name.trim();
            if (filters.start_date)          params.start_date  = filters.start_date;
            if (filters.end_date)            params.end_date    = filters.end_date;
            if (filters.statuses?.length === 1) params.status   = filters.statuses[0];

            const response = await request({ method: "GET", path: "admin/attendance/all", params });
            const raw = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
            setAttendance(transformRecords(raw));
            setTotalPages(response.data?.last_page ?? 1);
            setCurrentPage(page);
        } catch {
            toast.error("Failed to load attendance records.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAttendance(1, { name, start_date, end_date, statuses: selectedStatuses });
    }, []);

    const handleFilter = () => {
        fetchAttendance(1, { name, start_date, end_date, statuses: selectedStatuses });
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleFilter();
    };

    const handlePageChange = (page) => {
        fetchAttendance(page, { name, start_date, end_date, statuses: selectedStatuses });
    };

    const toggleStatus = (status) => {
        setSelectedStatuses(prev =>
            prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
        );
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
            toast.success(is_checked_in ? "Checked out successfully!" : "Checked in successfully!");
            setIsCheckedIn(!is_checked_in);
            fetchAttendance(1, { name, start_date, end_date, statuses: selectedStatuses });
        } catch {
            toast.error("Error processing attendance request.");
        }
    };

    const statusLabel = selectedStatuses.length === 0
        ? "All Statuses"
        : selectedStatuses.join(", ");

    return (
        <div className="attendance-records-container">
            <div className="filter-container">
                <div className="filter-inputs">
                    <span className="filter-label">Filter:</span>
                    <input
                        className="filter-text-input"
                        type="text"
                        value={name}
                        placeholder="Employee name"
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="date-range">
                        <input
                            className="filter-date-input"
                            type="date"
                            value={start_date}
                            onChange={(e) => setStartDate(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <span className="date-range-sep">→</span>
                        <input
                            className="filter-date-input"
                            type="date"
                            value={end_date}
                            onChange={(e) => setEndDate(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>

                    {/* Status multi-select */}
                    <div className="status-dropdown" ref={dropdownRef}>
                        <button
                            className="status-dropdown-btn"
                            onClick={() => setStatusDropdownOpen(o => !o)}
                            type="button"
                        >
                            {statusLabel}
                            <span className="dropdown-arrow">{statusDropdownOpen ? "▲" : "▼"}</span>
                        </button>
                        {statusDropdownOpen && (
                            <div className="status-dropdown-menu">
                                {STATUS_OPTIONS.map(s => (
                                    <label key={s} className="status-option">
                                        <input
                                            type="checkbox"
                                            checked={selectedStatuses.includes(s)}
                                            onChange={() => toggleStatus(s)}
                                        />
                                        {s}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="filter-actions">
                    <button className="filter-btn" onClick={handleFilter}>Filter</button>
                    <button
                        className={`check-btn${is_checked_in ? " checked-in" : ""}`}
                        onClick={checkInOut}
                    >
                        {is_checked_in ? "Check Out" : "Check In"}
                    </button>
                </div>
            </div>

            <Table
                headers={table_headers}
                data={attendance}
                loading={loading}
                emptyMessage="No attendance records found"
                pagination={totalPages > 1
                    ? { currentPage, totalPages, onPageChange: handlePageChange }
                    : undefined}
            />
        </div>
    );
};

export default AttendanceRecords;
