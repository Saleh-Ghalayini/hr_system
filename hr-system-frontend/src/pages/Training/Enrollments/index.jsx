import React, { useState, useEffect, useCallback } from "react";
import "./style.css";
import Table from "../../../components/Table";
import axios from "axios";
import baseApi from "../../../services/baseApi";

const BASE = "http://127.0.0.1:8000/api/v1";

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const PAGE_SIZE = 10;

const Enrollments = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    user_id: "",
    course_id: "",
    status: "enrolled",
    start_date: "",
    end_date: "",
  });
  const token = localStorage.getItem("token");

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${BASE}/admin/courses`, authHeaders);
        setCourses(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, [token]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${BASE}/admin/users`, authHeaders);
        setUsers(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [token]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE}/admin/enrollments`, authHeaders);
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      setEnrollments(data);
      setFilteredData(transformEnrollmentData(data));
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [token]);

  const transformEnrollmentData = (data) => {
    return data.map((enrollment) => ({
      id: enrollment.id,
      date: enrollment.start_date,
      AssignedTo: `${enrollment.user?.first_name} ${enrollment.user?.last_name}`,
      CourseName: enrollment.course?.course_name || "Course Not Available",
      DueDate: enrollment.end_date,
      status: enrollment.status,
      certificate: enrollment.status === "completed" ? "Yes" : "No",
      url: enrollment.course?.certificate_text || "#",
    }));
  };

  const tableHeaders = [
    { key: "date", label: "Start Date" },
    { key: "AssignedTo", label: "Assigned To" },
    { key: "CourseName", label: "Course Name" },
    { key: "DueDate", label: "End Date" },
    { key: "status", label: "Status" },
    { key: "certificate", label: "Certificate" },
    { key: "url", label: "Certificate URL" },
  ];

  const filterData = useCallback(
    (searchValue) => {
      const transformedData = transformEnrollmentData(enrollments);
      if (!searchValue.trim()) return transformedData;
      const lowerSearch = searchValue.toLowerCase();
      return transformedData.filter((item) =>
        Object.entries(item).some(([key, value]) => {
          if (key === "url") return false;
          return String(value).toLowerCase().includes(lowerSearch);
        })
      );
    },
    [enrollments]
  );

  const debouncedFilter = useCallback(
    debounce((searchValue) => {
      setFilteredData(filterData(searchValue));
      setCurrentPage(1);
      setLoading(false);
    }, 300),
    [filterData]
  );

  useEffect(() => {
    setLoading(true);
    debouncedFilter(search);
    return () => debouncedFilter.cancel?.();
  }, [search, debouncedFilter]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const enrollNewEmployee = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await baseApi.post("/admin/enrollments", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Refresh enrollments list
      const enrollmentsResponse = await axios.get(`${BASE}/admin/enrollments`, authHeaders);
      const data = Array.isArray(enrollmentsResponse.data.data) ? enrollmentsResponse.data.data : [];
      setEnrollments(data);
      setFilteredData(transformEnrollmentData(data));

      setFormData({
        user_id: "",
        course_id: "",
        status: "enrolled",
        start_date: "",
        end_date: "",
      });
      setModal(false);
    } catch (error) {
      console.error("Error creating enrollment:", error);
      alert("Failed to create enrollment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="enrollments-container">
      {modal && (
        <div className="enroll-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Enroll</h2>
              <div className="modal-close" onClick={() => setModal(false)}>X</div>
            </div>
            <div className="modal-body">
              <form className="modal-body-input">
                <span>Select Employee</span>
                <select
                  name="user_id"
                  id="user_id"
                  className="modal-body-input-select"
                  value={formData.user_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Employee</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name}
                    </option>
                  ))}
                </select>
                <span>Select Course</span>
                <select
                  name="course_id"
                  id="course_id"
                  className="modal-body-input-select"
                  value={formData.course_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.course_name}
                    </option>
                  ))}
                </select>
                <span>Start Date</span>
                <input type="date" name="start_date" value={formData.start_date} onChange={handleInputChange} required />
                <span>End Date</span>
                <input type="date" name="end_date" value={formData.end_date} onChange={handleInputChange} required />
                <span>Status</span>
                <select
                  name="status"
                  id="status"
                  className="modal-body-input-select"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="enrolled">Enrolled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="terminated">Terminated</option>
                </select>
                <button
                  onClick={enrollNewEmployee}
                  className="enroll-btn"
                  style={{ width: "100%", height: "30px", borderRadius: "5px", border: "1px solid #ccc", padding: "5px" }}
                >
                  {loading ? "Loading..." : "Enroll"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      <div className="enrollments-main-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name, course, or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="enroll-btn" onClick={() => setModal(true)}>Enroll</div>
        </div>
        <Table
          headers={tableHeaders}
          data={filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)}
          loading={loading}
          emptyMessage={search ? "No matching records found" : "No enrollments available"}
          pagination={filteredData.length > PAGE_SIZE ? { currentPage, totalPages: Math.ceil(filteredData.length / PAGE_SIZE), onPageChange: setCurrentPage } : undefined}
        />
      </div>
    </div>
  );
};

export default Enrollments;
