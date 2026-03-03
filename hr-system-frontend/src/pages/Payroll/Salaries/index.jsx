import React, { useState, useEffect } from "react";
import Table from "../../../components/Table";
import { request } from "../../../common/request";

const Salaries = () => {
  const [loading, setLoading] = useState(true);
  const [salaryData, setSalaryData] = useState([]);

  useEffect(() => {
    const fetchSalaries = async () => {
      setLoading(true);
      try {
        const response = await request({
          method: "GET",
          path: "admin/payroll",
        });
        setSalaryData(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error(error);
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
    { key: "total", label: "Payroll" },
  ];

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div>
      <Table headers={tableHeaders} data={salaryData} />
    </div>
  );
};

export default Salaries;
