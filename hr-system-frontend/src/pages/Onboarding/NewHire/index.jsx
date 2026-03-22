import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { request } from "../../../common/request";
import "./style.css";

const NewHire = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    date_of_birth: "",
    nationality: "",
    phone_number: "",
    address: "",
    position: "",
    gender: "",
    insurance_id: "",
  });
  const [insurances, setInsurances] = useState([]);

  useEffect(() => {
    const fetchInsurances = async () => {
      try {
        const response = await request({ method: "GET", path: "admin/insurances" });
        const list = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
        setInsurances(list);
      } catch { /* fallback: user picks manually */ }
    };
    fetchInsurances();
  }, []);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (!formData.date_of_birth) newErrors.date_of_birth = "Date of birth is required";
    if (!formData.nationality.trim()) newErrors.nationality = "Nationality is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.position.trim()) newErrors.position = "Position is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.insurance_id) newErrors.insurance_id = "Insurance plan is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await request({
        method: "POST",
        path: "guest/register",
        data: formData,
      });
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          navigate("/onboarding/new-hires");
        }, 2000);
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: error.response?.data?.message || "An error occurred. Please try again.",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-hire-container">
      <div className="new-hire-header">
        <Icon icon="mdi:account-plus" width="32" height="32" />
        <h1>New Hire Registration</h1>
      </div>

      {success ? (
        <div className="success-message">
          <Icon icon="mdi:check-circle" width="48" height="48" />
          <h2>Registration Successful!</h2>
          <p>Redirecting...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="new-hire-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="first_name">First Name</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={errors.first_name ? "error" : ""}
                placeholder="Enter first name"
              />
              {errors.first_name && <span className="error-message">{errors.first_name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Last Name</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={errors.last_name ? "error" : ""}
                placeholder="Enter last name"
              />
              {errors.last_name && <span className="error-message">{errors.last_name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "error" : ""}
                placeholder="Enter email address"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "error" : ""}
                placeholder="Enter password"
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="date_of_birth">Date of Birth</label>
              <input
                type="date"
                id="date_of_birth"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className={errors.date_of_birth ? "error" : ""}
              />
              {errors.date_of_birth && <span className="error-message">{errors.date_of_birth}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="nationality">Nationality</label>
              <input
                type="text"
                id="nationality"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                className={errors.nationality ? "error" : ""}
                placeholder="Enter nationality"
              />
              {errors.nationality && <span className="error-message">{errors.nationality}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone_number">Phone Number</label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className={errors.phone_number ? "error" : ""}
                placeholder="Enter phone number"
              />
              {errors.phone_number && <span className="error-message">{errors.phone_number}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={errors.address ? "error" : ""}
                placeholder="Enter address"
              />
              {errors.address && <span className="error-message">{errors.address}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="position">Position</label>
              <select
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className={errors.position ? "error" : ""}
              >
                <option value="">Select Position</option>
                <option value="Junior">Junior</option>
                <option value="Senior">Senior</option>
                <option value="Intern">Intern</option>
                <option value="Executive">Executive</option>
              </select>
              {errors.position && <span className="error-message">{errors.position}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={errors.gender ? "error" : ""}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <span className="error-message">{errors.gender}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="insurance_id">Insurance Plan</label>
              <select
                id="insurance_id"
                name="insurance_id"
                value={formData.insurance_id}
                onChange={handleChange}
                className={errors.insurance_id ? "error" : ""}
              >
                <option value="">Select Insurance</option>
                {insurances.map((ins) => (
                  <option key={ins.id} value={ins.id}>
                    {ins.type} — ${ins.cost}/mo
                  </option>
                ))}
              </select>
              {errors.insurance_id && <span className="error-message">{errors.insurance_id}</span>}
            </div>
          </div>

          {errors.submit && <div className="submit-error">{errors.submit}</div>}

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate("/onboarding/new-hires")}
              className="cancel-button"
            >
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Registering..." : "Register New Hire"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default NewHire;
