import React from "react";
import Table from "../../../components/Table";

const Salaries = () => {
  const tableHeaders = [
    { key: "date", label: "Date" },
    { key: "employee", label: "Employee" },
    { key: "role", label: "Role" },
    { key: "insurance", label: "Insurance Plan" },
    { key: "deductions", label: "Deductions" },
    { key: "payrolls", label: "Payroll" },
  ];

  const tableData = [
    {
      date: "March",
      employee: "Halim Njeim",
      role: "Junior",
      insurance: "HFA",
      deductions: "140.00",
      payrolls: "1200.00$",
    },
  ];

  return (
    <div>
      <Table headers={tableHeaders} data={tableData} />
    </div>
  );
};

export default Salaries;
