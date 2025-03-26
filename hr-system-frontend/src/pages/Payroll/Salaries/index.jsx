import React, { useState } from "react";
import Table from "../../../components/Table";
import { useEffect } from "react";
import { request } from "../../../common/request";

const Salaries = () => {
  const [loading, setloading] = useState(true);
  const [salaryData, setSalaryData] = useState();

  useEffect(() => {
    const fetchSalaries = async () => {
      setloading(true);
      try {
        const response = await request({
          method: "GET",
          path: "admin/getsalaries",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setSalaryData(response);
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
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

  return loading ? (
    <h1>Loading</h1>
  ) : (
    <div>
      <Table headers={tableHeaders} data={salaryData} />
    </div>
  );
};

export default Salaries;
