import React, { useState, useEffect, useCallback } from "react";
import Table from "../../../components/Table";
import { request } from "../../../common/request";
import { toast } from "react-toastify";
import "./style.css";

const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const SickLeaveReport = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const headers = [
    { key: "employee", label: "Employee" },
    { key: "position", label: "Position" },
    { key: "start_date", label: "Start" },
    { key: "end_date", label: "End" },
    { key: "days", label: "Days" },
    { key: "status", label: "Status" },
  ];

  const fetchReport = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page };
      if (startDate) params.start_date = startDate;
      if (endDate)   params.end_date   = endDate;
      if (status)    params.status      = status;

      const res = await request({ method: "GET", path: "admin/leave/sick-report", params });
      const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      setTotalPages(res.data?.last_page ?? 1);
      setCurrentPage(page);

      setRows(data.map((r) => {
        const start = new Date(r.start_date);
        const end   = new Date(r.end_date);
        const days  = r.is_half_day ? 0.5 : Math.floor((end - start) / 86400000) + 1;
        return {
          ...r,
          employee:   r.user ? `${r.user.first_name} ${r.user.last_name}` : "—",
          position:   r.user?.position ?? "—",
          start_date: formatDate(r.start_date),
          end_date:   formatDate(r.end_date),
          days,
        };
      }));
    } catch {
      toast.error("Failed to load sick leave report.");
    } finally { setLoading(false); }
  }, [startDate, endDate, status]);

  useEffect(() => { fetchReport(1); }, [fetchReport]);

  const stats = {
    total: rows.length,
    pending: rows.filter((r) => r.status === "pending").length,
    approved: rows.filter((r) => r.status === "approved").length,
  };

  return (
    <div className="sick-report-container">
      <div className="sick-report-header">
        <h1>Sick Leave Report</h1>
        <p>Monitor sick leave requests and approval outcomes</p>
      </div>

      <div className="sick-stats-row">
        <div className="sick-stat-card"><span className="stat-val">{stats.total}</span><span className="stat-label">Total Requests</span></div>
        <div className="sick-stat-card approved"><span className="stat-val">{stats.approved}</span><span className="stat-label">Approved</span></div>
        <div className="sick-stat-card pending"><span className="stat-val">{stats.pending}</span><span className="stat-label">Pending</span></div>
      </div>

      <div className="sick-filters">
        <div className="sick-filter-inputs">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="From date" />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="To date" />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="sick-filter-actions">
          <button className="primary-btn" onClick={() => fetchReport(1)}>Filter</button>
          <button className="secondary-btn" onClick={() => { setStartDate(""); setEndDate(""); setStatus(""); }}>Reset</button>
        </div>
      </div>

      <Table
        headers={headers}
        data={rows}
        loading={loading}
        emptyMessage="No sick leave records found"
        pagination={totalPages > 1 ? { currentPage, totalPages, onPageChange: fetchReport } : undefined}
      />
    </div>
  );
};

export default SickLeaveReport;
