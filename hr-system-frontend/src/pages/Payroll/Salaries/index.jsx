import React, { useState, useEffect, useCallback } from "react";
import Table from "../../../components/Table";
import { request } from "../../../common/request";
import { toast } from "react-toastify";
import { useAuthContext } from "../../../context/AuthContext";
import "./styles.css";

const Salaries = () => {
  const [loading, setLoading] = useState(true);
  const [salaryData, setSalaryData] = useState([]);
  const [search, setSearch] = useState("");
  const getLastMonthValue = () => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().slice(0, 7);
  };

  const [month, setMonth] = useState(getLastMonthValue());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuthContext();
  const isAdmin = user?.role === "admin";

  const formatMonth = (value) => {
    if (!value) return "—";
    if (/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) {
      const [year, monthIndex] = value.split("-").map(Number);
      const date = new Date(year, monthIndex - 1, 1);
      return date.toLocaleString("en-US", { month: "long", year: "numeric" });
    }
    return value;
  };

  const tableHeaders = [
    { key: "month", label: "Month" },
    { key: "fullname", label: "Employee" },
    { key: "position", label: "Position" },
    { key: "insurance", label: "Insurance Plan" },
    { key: "total", label: "Payroll ($)" },
  ];

  const fetchSalaries = useCallback(async (page = 1, srch = "", mn = "") => {
    setLoading(true);
    try {
      const params = { page };
      if (srch.trim()) params.search = srch.trim();
      if (mn) params.month = mn;

      const path = isAdmin ? "admin/payroll" : "payroll";
      const response = await request({ method: "GET", path, params });
      const raw = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
      setSalaryData(raw.map((p) => ({
        ...p,
        month: formatMonth(p.month),
        insurance: p.insurance?.type ?? "—",
      })));
      setTotalPages(response.data?.last_page ?? 1);
      setCurrentPage(page);
    } catch {
      toast.error("Failed to load payroll records.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchSalaries(1, "", month);
  }, [fetchSalaries, month]);

  const handleFilter = () => fetchSalaries(1, search, month);
  const handleKeyDown = (e) => { if (e.key === "Enter") handleFilter(); };
  const handlePageChange = (page) => fetchSalaries(page, search, month);

  return (
    <div className="page-wrapper">
      <div className="salaries-filter-bar">
        <input
          className="salaries-search-input"
          type="text"
          placeholder="Search by employee name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <input
          className="salaries-month-input"
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="primary-btn" onClick={handleFilter}>Filter</button>
      </div>

      <Table
        headers={tableHeaders}
        data={salaryData}
        loading={loading}
        emptyMessage="No payroll records found"
        pagination={totalPages > 1 ? { currentPage, totalPages, onPageChange: handlePageChange } : undefined}
      />
    </div>
  );
};

export default Salaries;
