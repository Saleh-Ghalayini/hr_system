import React, { useEffect, useState, useMemo } from "react";
import Table from "../../../components/Table";
import { request } from "../../../common/request";
import { toast } from "react-toastify";
import "../style.css";

const PAGE_SIZE = 10;

const SalaryReports = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await request({ method: "GET", path: "admin/payroll" });
        setPayrolls(Array.isArray(response.data) ? response.data : (response.data?.data ?? []));
      } catch {
        toast.error("Failed to load payroll data.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const uniqueMonths = useMemo(
    () => [...new Set(payrolls.map((p) => p.month))].sort().reverse(),
    [payrolls]
  );

  const tableData = useMemo(() => {
    let filtered = payrolls;
    if (monthFilter !== "all") {
      filtered = filtered.filter((p) => p.month === monthFilter);
    }
    if (search.trim()) {
      const lower = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.fullname || "").toLowerCase().includes(lower) ||
          (p.position || "").toLowerCase().includes(lower)
      );
    }
    return filtered.map((p) => {
      const base = p.base_salary?.salary ?? 0;
      const taxDeduction = base > 0 && p.tax?.rate ? ((base * p.tax.rate) / 100).toFixed(2) : "—";
      const insuranceCost = p.insurance?.cost ?? 0;
      const net = base > 0 ? (base - (base * (p.tax?.rate ?? 0)) / 100 - insuranceCost).toFixed(2) : "—";
      return {
        id: p.id,
        fullname: p.fullname,
        month: p.month,
        position: p.position,
        base_salary: base > 0 ? `$${Number(base).toLocaleString()}` : "—",
        tax_deduction: taxDeduction !== "—" ? `$${taxDeduction}` : "—",
        insurance: p.insurance?.type ? `${p.insurance.type} ($${insuranceCost})` : "—",
        net_pay: net !== "—" ? `$${Number(net).toLocaleString()}` : `$${Number(p.total).toLocaleString()}`,
      };
    });
  }, [payrolls, monthFilter, search]);

  const summaryStats = useMemo(() => {
    if (!payrolls.length) return { employees: 0, totalPayroll: 0, avgSalary: 0 };
    const currentMonthData = monthFilter !== "all"
      ? payrolls.filter((p) => p.month === monthFilter)
      : payrolls.filter((p) => p.month === uniqueMonths[0]);
    const totalPayroll = currentMonthData.reduce((sum, p) => sum + Number(p.total || 0), 0);
    const employees = new Set(currentMonthData.map((p) => p.user_id)).size;
    return {
      employees,
      totalPayroll: totalPayroll.toLocaleString(undefined, { minimumFractionDigits: 2 }),
      avgSalary: employees > 0 ? (totalPayroll / employees).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00",
    };
  }, [payrolls, monthFilter, uniqueMonths]);

  const headers = [
    { key: "fullname", label: "Employee" },
    { key: "month", label: "Month" },
    { key: "position", label: "Position" },
    { key: "base_salary", label: "Base Salary" },
    { key: "tax_deduction", label: "Tax Deduction" },
    { key: "insurance", label: "Insurance" },
    { key: "net_pay", label: "Net Pay" },
  ];

  const totalPages = Math.ceil(tableData.length / PAGE_SIZE);
  const paginatedData = tableData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearch = (val) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleMonthFilter = (val) => {
    setMonthFilter(val);
    setCurrentPage(1);
  };

  return (
    <div className="report-page">
      <div className="report-header">
        <h2 className="report-title">Salary Reports</h2>
        <p className="report-subtitle">Detailed breakdown of employee compensation</p>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-card-value">{summaryStats.employees}</div>
          <div className="summary-card-label">Employees Paid</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-value">${summaryStats.totalPayroll}</div>
          <div className="summary-card-label">Total Payroll</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-value">${summaryStats.avgSalary}</div>
          <div className="summary-card-label">Average Salary</div>
        </div>
      </div>

      <div className="report-filters">
        <input
          type="text"
          className="report-search"
          placeholder="Search by employee or position..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <select
          className="report-select"
          value={monthFilter}
          onChange={(e) => handleMonthFilter(e.target.value)}
        >
          <option value="all">All Months</option>
          {uniqueMonths.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <Table
        headers={headers}
        data={paginatedData}
        loading={loading}
        emptyMessage="No salary records match your filters"
        pagination={totalPages > 1 ? { currentPage, totalPages, onPageChange: setCurrentPage } : undefined}
      />
    </div>
  );
};

export default SalaryReports;
