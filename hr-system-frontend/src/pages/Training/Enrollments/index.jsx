import React, { useState, useEffect, useCallback } from "react";
import "./style.css";
import Table from "../../../components/Table";
import { request } from "../../../common/request";
import { toast } from "react-toastify";
const PAGE_SIZE = 10;

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const Enrollments = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    user_id: "", course_id: "", status: "enrolled", start_date: "", end_date: "",
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await request({ method: "GET", path: "admin/courses" });
        setCourses(Array.isArray(response.data) ? response.data : (response.data?.data ?? []));
      } catch { /* silently fail */ }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await request({ method: "GET", path: "admin/users" });
        setUsers(Array.isArray(response.data) ? response.data : (response.data?.data ?? []));
      } catch { /* silently fail */ }
    };
    fetchUsers();
  }, []);

  const transformEnrollmentData = (data) =>
    data.map((enrollment) => ({
      id: enrollment.id,
      date: enrollment.start_date,
      AssignedTo: `${enrollment.user?.first_name ?? ""} ${enrollment.user?.last_name ?? ""}`.trim() || "—",
      CourseName: enrollment.course?.course_name || "—",
      DueDate: enrollment.end_date,
      status: enrollment.status,
      certificate: enrollment.status === "completed" ? "Yes" : "No",
    }));

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await request({ method: "GET", path: "admin/enrollments" });
      const data = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
      setEnrollments(data);
      setFilteredData(transformEnrollmentData(data));
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEnrollments(); }, [fetchEnrollments]);

  useEffect(() => {
    if (!modal) return;
    const handleEsc = (e) => { if (e.key === "Escape") setModal(false); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [modal]);

  const filterData = useCallback((searchValue) => {
    const transformed = transformEnrollmentData(enrollments);
    if (!searchValue.trim()) return transformed;
    const lower = searchValue.toLowerCase();
    return transformed.filter((item) =>
      Object.entries(item).some(([key, value]) =>
        key !== "id" && String(value).toLowerCase().includes(lower)
      )
    );
  }, [enrollments]);

  const debouncedFilter = useCallback(
    debounce((searchValue) => {
      setFilteredData(filterData(searchValue));
      setCurrentPage(1);
    }, 300),
    [filterData]
  );

  useEffect(() => {
    debouncedFilter(search);
    return () => debouncedFilter.cancel?.();
  }, [search, debouncedFilter]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const enrollNewEmployee = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await request({ method: "POST", path: "admin/enrollments", data: formData });
      toast.success("Employee enrolled successfully!");
      setFormData({ user_id: "", course_id: "", status: "enrolled", start_date: "", end_date: "" });
      setModal(false);
      fetchEnrollments();
    } catch {
      toast.error("Failed to create enrollment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const tableHeaders = [
    { key: "date", label: "Start Date" },
    { key: "AssignedTo", label: "Assigned To" },
    { key: "CourseName", label: "Course" },
    { key: "DueDate", label: "End Date" },
    { key: "status", label: "Status" },
    { key: "certificate", label: "Certificate" },
  ];

  return (
    <div className="enrollments-container">
      {modal && (
        <div className="enroll-modal" onClick={() => setModal(false)}>
          <div className="enroll-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="enroll-modal-header">
              <h3>New Enrollment</h3>
              <button className="enroll-modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form className="enroll-modal-form" onSubmit={enrollNewEmployee}>
              <div className="enroll-field">
                <label>Employee</label>
                <select name="user_id" value={formData.user_id} onChange={handleInputChange} required>
                  <option value="">— Select employee —</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
                  ))}
                </select>
              </div>
              <div className="enroll-field">
                <label>Course</label>
                <select name="course_id" value={formData.course_id} onChange={handleInputChange} required>
                  <option value="">— Select course —</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.course_name}</option>
                  ))}
                </select>
              </div>
              <div className="enroll-row">
                <div className="enroll-field">
                  <label>Start Date</label>
                  <input type="date" name="start_date" value={formData.start_date} onChange={handleInputChange} required />
                </div>
                <div className="enroll-field">
                  <label>End Date</label>
                  <input type="date" name="end_date" value={formData.end_date} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="enroll-field">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} required>
                  <option value="enrolled">Enrolled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>
              <button type="submit" className="enroll-submit-btn" disabled={submitting}>
                {submitting ? "Enrolling…" : "Enroll Employee"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="enrollments-main-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name, course, or status…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="enroll-btn" onClick={() => setModal(true)}>+ Enroll</button>
        </div>
        <Table
          headers={tableHeaders}
          data={filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)}
          loading={loading}
          emptyMessage={search ? "No matching records found" : "No enrollments available"}
          pagination={filteredData.length > PAGE_SIZE
            ? { currentPage, totalPages: Math.ceil(filteredData.length / PAGE_SIZE), onPageChange: setCurrentPage }
            : undefined}
        />
      </div>
    </div>
  );
};

export default Enrollments;
