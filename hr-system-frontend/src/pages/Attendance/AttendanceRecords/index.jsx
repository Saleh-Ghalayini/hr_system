import Table from "../../../components/Table";
import "./style.css";
import React, { useState, useEffect, useCallback } from "react";
import { request } from "../../../common/request";
import { toast } from 'react-toastify';

const AttendanceRecords = () => {
    const [longitude, setLongitude] = useState(null);
    const [latitude, setLatitude] = useState(null);
    const [is_checked_in, setIsCheckedIn] = useState(false);
    const [name, setName] = useState("");
    const [start_date, setStartDate] = useState("");
    const [end_date, setEndDate] = useState("");
    const [attendance, setAttendance] = useState([]);
    const [rawRecords, setRawRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 15;

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => { setLatitude(pos.coords.latitude); setLongitude(pos.coords.longitude); },
            () => {}
        );
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
            fetchAllUsersAttendances();
        } catch {
            toast.error("Error processing request.");
        }
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
                "hours worked": item.working_hours || "0 hrs",
            };
        });
    };

    const fetchAllUsersAttendances = useCallback(async () => {
        setLoading(true);
        try {
            const response = await request({ method: "GET", path: "admin/attendance/all" });
            const records = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
            setRawRecords(records);
            setAttendance(transformRecords(records));
        } catch {
            // silently fail
        } finally {
            setLoading(false);
        }
    }, []);

    const handleFilter = () => {
        let filtered = rawRecords;
        if (name.trim()) {
            const lower = name.toLowerCase();
            filtered = filtered.filter(r => (r.full_name || "").toLowerCase().includes(lower));
        }
        if (start_date) filtered = filtered.filter(r => r.date && r.date.split("T")[0] >= start_date);
        if (end_date) filtered = filtered.filter(r => r.date && r.date.split("T")[0] <= end_date);
        setAttendance(transformRecords(filtered));
        setCurrentPage(1);
    };

    useEffect(() => { fetchAllUsersAttendances(); }, []);

    return (
        <div className="attendance-records-container">
                <div className="filter-container">
                    <div className="filter-inputs">
                        <span className="filter-label">Filter:</span>
                        <input
                            type="text"
                            value={name}
                            placeholder="Employee name"
                            onChange={(e) => setName(e.target.value)}
                            style={{ height: 36, borderRadius: 6, border: "1px solid #cbd5e0", padding: "0 10px", fontSize: 13, fontFamily: "Lato, sans-serif", outline: "none" }}
                        />
                        <div className="date-range">
                            <input
                                type="date"
                                value={start_date}
                                onChange={(e) => setStartDate(e.target.value)}
                                style={{ height: 36, borderRadius: 6, border: "1px solid #cbd5e0", padding: "0 8px", fontSize: 13 }}
                            />
                            <span className="date-range-sep">→</span>
                            <input
                                type="date"
                                value={end_date}
                                onChange={(e) => setEndDate(e.target.value)}
                                style={{ height: 36, borderRadius: 6, border: "1px solid #cbd5e0", padding: "0 8px", fontSize: 13 }}
                            />
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
                    data={attendance.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)}
                    loading={loading}
                    emptyMessage="No attendance records found"
                    pagination={attendance.length > PAGE_SIZE
                        ? { currentPage, totalPages: Math.ceil(attendance.length / PAGE_SIZE), onPageChange: setCurrentPage }
                        : undefined}
                />
            </div>
    );
};

export default AttendanceRecords;
