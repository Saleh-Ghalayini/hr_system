import React, { useState, useEffect, useCallback } from "react";
import "./style.css";
import Table from "../../../components/Table";
import { request } from "../../../common/request";
import { toast } from "react-toastify";

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const CourseCatalog = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    course_name: "",
    description: "",
    skills: [],
    duration_hours: "",
    certificate_text: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await request({
        method: "GET",
        path: "admin/courses",
      });
      const data = Array.isArray(response.data) ? response.data : [];
      setCourses(data);
      setFilteredData(transformCourseData(data));
    } catch (error) {
      toast.error("Failed to fetch courses.");
    } finally {
      setLoading(false);
    }
  };

  const transformCourseData = (data) => {
    return data.map((course) => ({
      id: course.id,
      course_name: course.course_name,
      description: course.description,
      skills: (course.skills ?? []).join(", "),
      duration: `${course.duration_hours} hours`,
      certificate: course.certificate_text,
    }));
  };

  const tableHeaders = [
    { key: "course_name", label: "Course Name" },
    { key: "description", label: "Description" },
    { key: "skills", label: "Skills" },
    { key: "duration", label: "Duration" },
    { key: "certificate", label: "Certificate" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(",").map((skill) => skill.trim()).filter((skill) => skill.length > 0);
    setFormData((prev) => ({
      ...prev,
      skills,
    }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.course_name.trim()) {
      setError("Course name is required");
      return false;
    }
    if (!formData.description.trim()) {
      setError("Description is required");
      return false;
    }
    if (formData.skills.length === 0) {
      setError("At least one skill is required");
      return false;
    }
    if (!formData.duration_hours || formData.duration_hours <= 0) {
      setError("Duration must be greater than 0");
      return false;
    }
    if (!formData.certificate_text.trim()) {
      setError("Certificate text is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      await request({
        method: "POST",
        path: "admin/courses",
        data: formData,
      });

      await fetchCourses();
      setFormData({
        course_name: "",
        description: "",
        skills: [],
        duration_hours: "",
        certificate_text: "",
      });
      setModal(false);
      toast.success("Course created successfully!");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create course. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const filterData = useCallback(
    (searchValue) => {
      const transformedData = transformCourseData(courses);
      if (!searchValue.trim()) return transformedData;
      const lowerSearch = searchValue.toLowerCase();
      return transformedData.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(lowerSearch)
        )
      );
    },
    [courses]
  );

  const debouncedFilter = useCallback(
    debounce((searchValue) => {
      setFilteredData(filterData(searchValue));
    }, 300),
    [filterData]
  );

  useEffect(() => {
    debouncedFilter(search);
    return () => debouncedFilter.cancel?.();
  }, [search, debouncedFilter]);

  return (
    <div className="course-catalog-container">
      {modal && (
        <div className="course-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Course</h2>
              <div className="modal-close" onClick={() => setModal(false)}>
                X
              </div>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="modal-body-input">
                {error && <div className="error-message">{error}</div>}
                <span>Course Name</span>{" "}
                <input
                  type="text"
                  name="course_name"
                  value={formData.course_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter course name"
                />
                <span>Description</span>{" "}
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter course description"
                />
                <span>Skills (comma-separated)</span>{" "}
                <input
                  type="text"
                  name="skills"
                  value={formData.skills.join(", ")}
                  onChange={handleSkillsChange}
                  required
                  placeholder="e.g., JavaScript, React, Node.js"
                />
                <span>Duration (hours)</span>{" "}
                <input
                  type="number"
                  name="duration_hours"
                  value={formData.duration_hours}
                  onChange={handleInputChange}
                  required
                  min="1"
                  placeholder="Enter duration in hours"
                />
                <span>Certificate Text</span>{" "}
                <input
                  type="text"
                  name="certificate_text"
                  value={formData.certificate_text}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter certificate text"
                />
                <button
                  type="submit"
                  className="course-btn"
                  disabled={loading}
                  style={{
                    width: "100%",
                    height: "30px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                    padding: "5px",
                  }}
                >
                  {loading ? "Creating Course..." : "Add Course"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="course-catalog-main-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="course-btn" onClick={() => setModal(true)}>
            Add Course
          </div>
        </div>

        <Table
          headers={tableHeaders}
          data={filteredData}
          loading={loading}
          emptyMessage={
            search ? "No matching courses found" : "No courses available"
          }
        />
      </div>
    </div>
  );
};

export default CourseCatalog;
