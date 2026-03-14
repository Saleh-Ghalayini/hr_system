import React, { useState, useEffect } from "react";
import Table from "../../../components/Table";
import { request } from "../../../common/request";

const PAGE_SIZE = 10;

const Salaries = () => {
  const [loading, setLoading] = useState(true);
  const [salaryData, setSalaryData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchSalaries = async () => {
      setLoading(true);
      try {
        const response = await request({
          method: "GET",
          path: "admin/payroll",
        });
        const raw = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
        setSalaryData(raw.map((p) => ({
          ...p,
          insurance: p.insurance?.type ?? "—",
        })));
      } catch {
        // silently fail — table shows empty state
      } finally {
        setLoading(false);
      }
    };
    fetchSalaries();
  }, []);

  const tableHeaders = [
    { key: "month", label: "Month" },
    { key: "fullname", label: "Employee" },
    { key: "position", label: "Position" },
    { key: "insurance", label: "Insurance Plan" },
    { key: "total", label: "Payroll ($)" },
  ];

  const totalPages = Math.ceil(salaryData.length / PAGE_SIZE);
  const paginatedData = salaryData.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="page-wrapper">
      <Table
        headers={tableHeaders}
        data={paginatedData}
        loading={loading}
        emptyMessage="No payroll records found"
        pagination={totalPages > 1 ? { currentPage, totalPages, onPageChange: setCurrentPage } : undefined}
      />
    </div>
  );
};

export default Salaries;
