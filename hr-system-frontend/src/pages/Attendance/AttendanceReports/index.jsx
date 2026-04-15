import React, { useEffect, useMemo, useState } from "react";
import { request } from "../../../common/request";
import Table from "../../../components/Table";
import { toast } from "react-toastify";
import "./style.css";

const fmtHours = (h) => {
    const num = parseFloat(h);
    if (isNaN(num) || num <= 0) return "--";
    const hrs = Math.floor(num);
    const mins = Math.round((num - hrs) * 60);
    if (hrs === 0 && mins === 0) return "0h";
    if (mins === 0) return `${hrs}h`;
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
};

const formatLocalDate = (value) => {
    if (!value) return "--";

    const ymd = String(value).split("T")[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
        return value;
    }

    const [year, month, day] = ymd.split("-").map(Number);
    const localDate = new Date(year, month - 1, day);
    return localDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatDate = (dateStr) => {
    if (!dateStr) return "--";
    try {
        return formatLocalDate(dateStr);
    } catch { return dateStr; }
};

const formatStatus = (s) => {
    if (!s) return "--";
    return s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
};

const resolveStatus = (record) => {
    const rawStatus = String(record?.status ?? "").toLowerCase();
    if (["present", "late", "early", "absent"].includes(rawStatus)) {
        return rawStatus;
    }

    if (!record?.check_in) {
        return "absent";
    }

    return String(record?.time_in_status ?? "").toLowerCase() === "late" ? "late" : "present";
};

const AttendanceReports = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [monthFilter, setMonthFilter] = useState("all");
    const [nameFilter, setNameFilter] = useState("all");

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const all = [];
                let page = 1;
                let lastPage = 1;

                do {
                    const response = await request({
                        method: "GET",
                        path: "admin/attendance/all",
                        params: { page },
                    });

                    const pageRows = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
                    all.push(...pageRows);
                    lastPage = response.data?.last_page ?? 1;
                    page += 1;
                } while (page <= lastPage);

                setRecords(all);
            } catch {
                toast.error("Failed to load attendance data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const months = useMemo(() => {
        const set = new Set(records.map(r => r.date ? String(r.date).split("T")[0].slice(0, 7) : null).filter(Boolean));
        return Array.from(set).sort().reverse();
    }, [records]);

    const employees = useMemo(() => {
        const set = new Set(records.map(r => r.full_name).filter(Boolean));
        return Array.from(set).sort();
    }, [records]);

    const filtered = useMemo(() => {
        let data = records;
        if (monthFilter !== "all") {
            data = data.filter(r => {
                if (!r.date) return false;
                const rowMonth = String(r.date).split("T")[0].slice(0, 7);
                return rowMonth === monthFilter;
            });
        }
        if (nameFilter !== "all") data = data.filter(r => r.full_name === nameFilter);
        return data;
    }, [records, monthFilter, nameFilter]);

    const stats = useMemo(() => {
        const total = filtered.length;
        const present = filtered.filter(r => {
            const status = resolveStatus(r);
            return status === "present" || status === "late" || status === "early";
        }).length;
        const late = filtered.filter(r => resolveStatus(r) === "late").length;
        const absent = filtered.filter(r => resolveStatus(r) === "absent").length;
        const totalHours = filtered.reduce((acc, r) => acc + (parseFloat(r.working_hours) || 0), 0);
        return { total, present, late, absent, totalHours };
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
        employee: r.full_name || "--",
        date: formatDate(r.date),
        status: formatStatus(resolveStatus(r)),
        check_in: r.check_in || "--",
        check_out: r.check_out || "--",
        hours: fmtHours(r.working_hours),
    }));

    return (
        <div className="att-reports-page">
            <div className="att-reports-header">
                <h2>Attendance Reports</h2>
                <div className="att-reports-filters">
                    <select className="att-select" value={nameFilter} onChange={(e) => setNameFilter(e.target.value)}>
                        <option value="all">All Employees</option>
                        {employees.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <select className="att-select" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
                        <option value="all">All Months</option>
                        {months.map(m => (
                            <option key={m} value={m}>
                                {new Date(m + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                            </option>
                        ))}
                    </select>
                </div>
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
                    <span className="att-stat-value">{fmtHours(stats.totalHours)}</span>
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
