import React, { useEffect, useMemo, useState } from "react";
import { request } from "../../../common/request";
import Table from "../../../components/Table";
import "./style.css";

const AttendanceReports = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [monthFilter, setMonthFilter] = useState("all");

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const response = await request({ method: "GET", path: "admin/attendance/all" });
                setRecords(Array.isArray(response.data) ? response.data : (response.data?.data ?? []));
            } catch {
                // silently fail
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const months = useMemo(() => {
        const set = new Set(
            records
                .map(r => r.date ? r.date.slice(0, 7) : null)
                .filter(Boolean)
        );
        return Array.from(set).sort().reverse();
    }, [records]);

    const filtered = useMemo(() => {
        if (monthFilter === "all") return records;
        return records.filter(r => r.date && r.date.startsWith(monthFilter));
    }, [records, monthFilter]);

    const stats = useMemo(() => {
        const total = filtered.length;
        const present = filtered.filter(r => r.time_in_status === "on_time" || r.time_in_status === "late").length;
        const late = filtered.filter(r => r.time_in_status === "late").length;
        const absent = total - present;
        const totalHours = filtered.reduce((acc, r) => {
            const h = parseFloat(r.working_hours) || 0;
            return acc + h;
        }, 0);
        return { total, present, late, absent, totalHours: totalHours.toFixed(1) };
    }, [filtered]);

    const tableHeaders = [
        { key: "employee", label: "Employee" },
        { key: "date", label: "Date" },
        { key: "status", label: "Status" },
        { key: "check_in", label: "Check-in" },
        { key: "check_out", label: "Check-out" },
        { key: "hours", label: "Hours" },
    ];

    const tableData = filtered.map(r => ({
        employee: r.full_name || "—",
        date: r.date ? r.date.split("T")[0] : "—",
        status: r.time_in_status || "—",
        check_in: r.check_in || "—",
        check_out: r.check_out || "—",
        hours: r.working_hours || "0",
    }));

    return (
        <div className="att-reports-page">
            <div className="att-reports-header">
                <h2>Attendance Reports</h2>
                <select
                    className="month-select"
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                >
                    <option value="all">All Months</option>
                    {months.map(m => (
                        <option key={m} value={m}>
                            {new Date(m + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                        </option>
                    ))}
                </select>
            </div>

            <div className="att-stats-grid">
                <div className="att-stat-card">
                    <span className="att-stat-label">Total Records</span>
                    <span className="att-stat-value">{stats.total}</span>
                </div>
                <div className="att-stat-card present">
                    <span className="att-stat-label">Present</span>
                    <span className="att-stat-value">{stats.present}</span>
                </div>
                <div className="att-stat-card late">
                    <span className="att-stat-label">Late</span>
                    <span className="att-stat-value">{stats.late}</span>
                </div>
                <div className="att-stat-card absent">
                    <span className="att-stat-label">Absent</span>
                    <span className="att-stat-value">{stats.absent}</span>
                </div>
                <div className="att-stat-card hours">
                    <span className="att-stat-label">Total Hours</span>
                    <span className="att-stat-value">{stats.totalHours}</span>
                </div>
            </div>

            <div className="att-reports-table">
                <Table
                    headers={tableHeaders}
                    data={tableData}
                    loading={loading}
                    emptyMessage="No attendance data for this period"
                />
            </div>
        </div>
    );
};

export default AttendanceReports;
