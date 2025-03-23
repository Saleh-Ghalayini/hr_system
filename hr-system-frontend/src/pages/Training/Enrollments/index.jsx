import React, { useState, useEffect, useCallback } from "react";
import "./style.css";
import Table from "../../../components/Table";

// Debounce function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const Enrollments = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState([]);

  // Original data should be in state to preserve it
  const [tableData] = useState([
    {
      date: <input type="date" />,
      AssignetTo: "John Doe",
      CourseName: "React",
      DueDate: "2024-01-01",
      status: "Completed",
      CompletionDate: "2024-01-01",
      cetificate: "Yes",
      url: "https://www.google.com",
    },
    {
      date: "2024-01-01",
      AssignetTo: "Jane Doe",
      CourseName: "Node",
      DueDate: "2024-01-01",
      status: "Pending",
      CompletionDate: "2024-01-01",
      cetificate: "Yes",
      url: "https://www.google.com",
    },
    {
      date: "2024-01-01",
      AssignetTo: "Jane Doe",
      CourseName: "Node",
      DueDate: "2024-01-01",
      status: "In Progress",
      CompletionDate: "2024-01-01",
      cetificate: "Yes",
      url: "https://www.google.com",
    },
    {
      date: "2024-01-01",
      AssignetTo: "Jane Doe",
      CourseName: "Node",
      DueDate: "2024-01-01",
      status: "Ended",
      CompletionDate: "2024-01-01",
      cetificate: "Yes",
      url: "https://www.google.com",
    },
    {
      date: "2024-01-01",
      AssignetTo: "Jane Doe",
      CourseName: "Node",
      DueDate: "2024-01-01",
      status: "Ended",
      CompletionDate: "2024-01-01",
      cetificate: "Yes",
      url: "https://www.google.com",
    },
    {
      date: "2024-01-01",
      AssignetTo: "Jane Doe",
      CourseName: "Node",
      DueDate: "2024-01-01",
      status: "Ended",
      CompletionDate: "2024-01-01",
      cetificate: "Yes",
      url: "https://www.google.com",
    },
    {
      date: "2024-01-01",
      AssignetTo: "Jane Doe",
      CourseName: "Node",
      DueDate: "2024-01-01",
      status: "Ended",
      CompletionDate: "2024-01-01",
      cetificate: "Yes",
      url: "https://www.google.com",
    },
    {
      date: "2024-01-01",
      AssignetTo: "Jane Doe",
      CourseName: "Node",
      DueDate: "2024-01-01",
      status: "Ended",
      CompletionDate: "2024-01-01",
      cetificate: "Yes",
      url: "https://www.google.com",
    },
    {
      date: "2024-01-01",
      AssignetTo: "Jane Doe",
      CourseName: "Node",
      DueDate: "2024-01-01",
      status: "Ended",
      CompletionDate: "2024-01-01",
      cetificate: "Yes",
      url: "https://www.google.com",
    },
    {
      date: "2024-01-01",
      AssignetTo: "Jane Doe",
      CourseName: "Node",
      DueDate: "2024-01-01",
      status: "Ended",
      CompletionDate: "2024-01-01",
      cetificate: "Yes",
      url: "https://www.google.com",
    },
  ]);

  const tableHeaders = [
    { key: "date", label: "Date" },
    { key: "AssignetTo", label: "Assigned To" },
    { key: "CourseName", label: "Course Name" },
    { key: "DueDate", label: "Due Date" },
    { key: "status", label: "Status" },
    { key: "CompletionDate", label: "Completion Date" },
    { key: "cetificate", label: "Certificate" },
    { key: "url", label: "Course URL" },
  ];

  // Memoized filter function
  const filterData = useCallback(
    (searchValue) => {
      if (!searchValue.trim()) return tableData;

      const lowerSearch = searchValue.toLowerCase();
      return tableData.filter((item) =>
        Object.entries(item).some(([key, value]) => {
          if (key === "url") return false; // Exclude URL from search
          return String(value).toLowerCase().includes(lowerSearch);
        })
      );
    },
    [tableData]
  );

  // Debounced filter function
  const debouncedFilter = useCallback(
    debounce((searchValue) => {
      setFilteredData(filterData(searchValue));
      setLoading(false);
    }, 300),
    [filterData]
  );

  useEffect(() => {
    setLoading(true);
    debouncedFilter(search);

    // Cleanup debounce on unmount
    return () => debouncedFilter.cancel?.();
  }, [search, debouncedFilter]);

  return (
    <div className="enrollments-container">
      <div className="enrollments-main-container">
        <div className="search-contianer">
          <input
            type="text"
            placeholder="Search by name, course, or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {loading && <div className="search-loading">Searching...</div>}
        </div>
        <Table
          headers={tableHeaders}
          data={filteredData.length > 0 ? filteredData : tableData}
          emptyMessage={
            search ? "No matching records found" : "No data available"
          }
        />
      </div>
    </div>
  );
};

export default Enrollments;
