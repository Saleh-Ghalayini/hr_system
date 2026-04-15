import React, { useState, useEffect, useCallback } from "react";
import "./style.css";
import Table from "../../../components/Table";
import { request } from "../../../common/request";
import { toast } from "react-toastify";
const PAGE_SIZE = 10;
const initialFormData = {
  user_id: "",
  course_id: "",
  status: "enrolled",
  start_date: "",
  end_date: "",
};

const formatDate = (dateStr) => {
  if (!dateStr) return "--";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return dateStr; }
};

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
  const [editingEnrollment, setEditingEnrollment] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  const closeModal = useCallback(() => {
    setModal(false);
    setEditingEnrollment(null);
    setFormData(initialFormData);
  }, []);

  const openCreateModal = () => {
    setEditingEnrollment(null);
    setFormData(initialFormData);
    setModal(true);
  };

  const openEditModal = (enrollmentId) => {
    const target = enrollments.find((item) => item.id === enrollmentId);
    if (!target) return;

    setEditingEnrollment(target);
    setFormData({
      user_id: String(target.user_id ?? ""),
      course_id: String(target.course_id ?? ""),
      status: target.status ?? "enrolled",
      start_date: target.start_date ?? "",
      end_date: target.end_date ?? "",
    });
    setModal(true);
  };

  const deleteEnrollment = async (enrollmentId) => {
    if (!window.confirm("Delete this enrollment? This action cannot be undone.")) {
      return;
    }

    try {
      await request({ method: "DELETE", path: `admin/enrollments/${enrollmentId}` });
      toast.success("Enrollment deleted successfully.");
      await fetchEnrollments();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete enrollment.");
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await request({ method: "GET", path: "admin/courses" });
        setCourses(Array.isArray(response.data) ? response.data : (response.data?.data ?? []));
      } catch {
        toast.error("Failed to load courses.");
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await request({ method: "GET", path: "admin/users" });
        setUsers(Array.isArray(response.data) ? response.data : (response.data?.data ?? []));
      } catch {
        toast.error("Failed to load users.");
      }
    };
    fetchUsers();
  }, []);

  const transformEnrollmentData = (data) =>
    data.map((enrollment) => ({
      id: enrollment.id,
    user_id: enrollment.user_id,
    course_id: enrollment.course_id,
    start_date_raw: enrollment.start_date,
    end_date_raw: enrollment.end_date,
      date: formatDate(enrollment.start_date),
      AssignedTo: `${enrollment.user?.first_name ?? ""} ${enrollment.user?.last_name ?? ""}`.trim() || "--",
      CourseName: enrollment.course?.course_name || "--",
      DueDate: formatDate(enrollment.end_date),
      status: enrollment.status ? enrollment.status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "--",
      certificate: enrollment.status === "completed" ? "Yes" : "No",
    }));

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await request({ method: "GET", path: "admin/enrollments" });
      const data = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
      setEnrollments(data);
      setFilteredData(transformEnrollmentData(data));
    } catch {
      toast.error("Failed to load enrollments.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEnrollments(); }, [fetchEnrollments]);

  useEffect(() => {
    if (!modal) return;
    const handleEsc = (e) => { if (e.key === "Escape") closeModal(); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [modal, closeModal]);

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

  const saveEnrollment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await request({
        method: editingEnrollment ? "PUT" : "POST",
        path: editingEnrollment ? `admin/enrollments/${editingEnrollment.id}` : "admin/enrollments",
        data: formData,
      });

      toast.success(editingEnrollment ? "Enrollment updated successfully!" : "Employee enrolled successfully!");
      closeModal();
      await fetchEnrollments();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save enrollment. Please try again.");
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
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="enrollment-row-actions">
          <button className="enrollment-action-btn" onClick={() => openEditModal(row.id)}>
            Edit
          </button>
          <button className="enrollment-action-btn danger" onClick={() => deleteEnrollment(row.id)}>
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="enrollments-container">
      {modal && (
        <div className="enroll-modal" onClick={closeModal}>
          <div className="enroll-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="enroll-modal-header">
              <h3>{editingEnrollment ? "Edit Enrollment" : "New Enrollment"}</h3>
              <button className="enroll-modal-close" onClick={closeModal}>×</button>
            </div>
            <form className="enroll-modal-form" onSubmit={saveEnrollment}>
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
                {submitting
                  ? (editingEnrollment ? "Saving…" : "Enrolling…")
                  : (editingEnrollment ? "Save Changes" : "Enroll Employee")}
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
          <button className="enroll-btn" onClick={openCreateModal}>+ Enroll</button>
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
