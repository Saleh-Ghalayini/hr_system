import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import { request, baseApi } from "../../common/request";
import { toast } from "react-toastify";
import "./style.css";
import Input from "../../components/Input";
import Select from "../../components/Select";
import Button from "../../components/Button";
import { useAuthContext } from "../../context/AuthContext";

const getInitials = (first, last) =>
  `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();

const GENDER_OPTIONS = [
  { value: "", label: "— Select gender —" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const LEVEL_OPTIONS = [
  { value: "", label: "-- Select level --" },
  { value: "junior", label: "Junior" },
  { value: "mid-senior", label: "Mid-Senior" },
  { value: "senior", label: "Senior" },
];

const TYPE_OPTIONS = [
  { value: "", label: "-- Select type --" },
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];

const STATUS_OPTIONS = [
  { value: "", label: "-- Select status --" },
  { value: "active", label: "Active" },
  { value: "terminated", label: "Terminated" },
];

const LOCATION_OPTIONS = [
  { value: "", label: "-- Select location --" },
  { value: "on_site", label: "On-site" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
];

const normalizeDateForInput = (value) => {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value).slice(0, 10);
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const EmployeeDirectory = () => {
  const { user } = useAuthContext();
  const isAdmin = user?.role === "admin";

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [posFilter, setPosFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    basicInfo: {},
    jobDetails: {},
  });
  const [saving, setSaving] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const fetchEmployees = useCallback(async (searchQuery = "") => {
    setLoading(true);
    try {
      // Use server-side search if provided
      const path = searchQuery ? `directory/users?search=${encodeURIComponent(searchQuery)}` : "directory/users";
      const res = await request({ method: "GET", path });
      
      // Handle paginated response
      const data = res.data?.data ?? res.data ?? [];
      setEmployees(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load employee directory.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchEmployees]);

  const positions = ["All", ...Array.from(new Set(employees.map((e) => e.position).filter(Boolean))).sort()];

  const filtered = employees.filter((e) => {
    const name = `${e.first_name} ${e.last_name}`.toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) || (e.email ?? "").toLowerCase().includes(search.toLowerCase());
    const matchPos = posFilter === "All" || e.position === posFilter;
    return matchSearch && matchPos;
  });

  const openProfile = (emp) => setSelected(emp);
  const closeProfile = () => {
    setSelected(null);
    setIsEditing(false);
    setEditData({ basicInfo: {}, jobDetails: {} });
  };

  const openEditMode = async (emp) => {
    setLoadingEdit(true);
    try {
      const res = await request({ method: "GET", path: `admin/users/${emp.id}/profile` });
      if (res.success) {
        setEditData({
          basicInfo: {
            first_name: res.data.user.first_name || "",
            last_name: res.data.user.last_name || "",
            email: res.data.user.email || "",
            date_of_birth: normalizeDateForInput(res.data.user.date_of_birth),
            nationality: res.data.user.nationality || "",
            phone_number: res.data.user.phone_number || "",
            gender: res.data.user.gender || "",
            address: res.data.user.address || "",
          },
          jobDetails: res.data.job_detail ? {
            title: res.data.job_detail.title || "",
            employment_type: res.data.job_detail.employment_type || "",
            employee_level: res.data.job_detail.employee_level || "",
            work_location: res.data.job_detail.work_location || "",
            employment_status: res.data.job_detail.employment_status || "",
            hiring_date: normalizeDateForInput(res.data.job_detail.hiring_date),
          } : {
            title: "",
            employment_type: "",
            employee_level: "",
            work_location: "",
            employment_status: "",
            hiring_date: "",
          },
        });
        setIsEditing(true);
      } else {
        toast.error("Failed to load employee data for editing.");
      }
    } catch (error) {
      const errorMsg = error?.response?.data?.message || "You don't have permission to edit this profile.";
      toast.error(errorMsg);
    } finally {
      setLoadingEdit(false);
    }
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      const basicRes = await request({
        method: "PUT",
        path: `admin/users/${selected.id}/basic-info`,
        data: editData.basicInfo,
      });

      const jobRes = await request({
        method: "PUT",
        path: `admin/users/${selected.id}/job-details`,
        data: editData.jobDetails,
      });

      if (basicRes.success || jobRes.success) {
        toast.success("Employee profile updated successfully!");
        setIsEditing(false);
        fetchEmployees();
        setSelected((prev) => ({
          ...prev,
          first_name: editData.basicInfo.first_name,
          last_name: editData.basicInfo.last_name,
          email: editData.basicInfo.email,
        }));
      } else {
        toast.error("Failed to save some changes.");
      }
    } catch (error) {
      const errorMsg = error?.response?.data?.message || "Failed to save changes. Please try again.";
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadgeClass = (role) => {
    if (role === "admin") return "role-admin";
    if (role === "manager") return "role-manager";
    return "role-employee";
  };

  const getAvatarUrl = (profileUrl) => {
    if (!profileUrl) return null;
    if (profileUrl.startsWith("http")) return profileUrl;
    return `${baseApi.replace("/api/v1/", "")}/storage/${profileUrl}`;
  };

  return (
    <div className="directory-container">
      <div className="directory-header">
        <h1>Employee Directory</h1>
        <p className="dir-count">{filtered.length} employee{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="directory-filters">
        <div className="dir-search-wrap">
          <Icon icon="mdi:magnify" width="18" className="dir-search-icon" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="dir-search-input"
          />
        </div>
        <div className="pos-filter-wrap">
          {positions.map((p) => (
            <button
              key={p}
              className={`filter-chip ${posFilter === p ? "active" : ""}`}
              onClick={() => setPosFilter(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="dir-loading"><div className="loading-spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="dir-empty">
          <Icon icon="mdi:account-search-outline" width="48" />
          <p>No employees found</p>
        </div>
      ) : (
        <div className="directory-grid">
          {filtered.map((emp) => {
            const avatarUrl = getAvatarUrl(emp.profile_url);
            return (
              <div key={emp.id} className="employee-card" onClick={() => openProfile(emp)}>
                <div className="emp-avatar-wrap">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="emp-photo" />
                  ) : (
                    <div className="emp-avatar-initials">
                      {getInitials(emp.first_name, emp.last_name)}
                    </div>
                  )}
                  <span className={`role-dot ${getRoleBadgeClass(emp.role)}`} title={emp.role} />
                </div>
                <div className="emp-card-info">
                  <h3 className="emp-name">{emp.first_name} {emp.last_name}</h3>
                  <p className="emp-position">{emp.position ?? "—"}</p>
                  <p className="emp-email">{emp.email}</p>
                </div>
                <div className="emp-card-footer">
                  <span className={`role-badge ${getRoleBadgeClass(emp.role)}`}>{emp.role ?? "employee"}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="dir-profile-overlay" onClick={closeProfile}>
          <div className="dir-profile-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-profile-btn" onClick={closeProfile}>
              <Icon icon="mdi:close" width="20" />
            </button>

            {loadingEdit ? (
              <div className="dir-loading">
                <div className="loading-spinner" />
                <p>Loading...</p>
              </div>
            ) : isEditing ? (
              <div className="edit-profile-form">
                <div className="edit-header">
                  <h2>Edit Profile: {selected.first_name} {selected.last_name}</h2>
                </div>

                <div className="edit-section">
                  <h3>Basic Information</h3>
                  <div className="edit-grid">
                    <Input
                      type="text"
                      label="First Name"
                      value={editData.basicInfo.first_name}
                      onChange={(e) => setEditData((p) => ({
                        ...p,
                        basicInfo: { ...p.basicInfo, first_name: e.target.value },
                      }))}
                    />
                    <Input
                      type="text"
                      label="Last Name"
                      value={editData.basicInfo.last_name}
                      onChange={(e) => setEditData((p) => ({
                        ...p,
                        basicInfo: { ...p.basicInfo, last_name: e.target.value },
                      }))}
                    />
                    <Input
                      type="email"
                      label="Email"
                      value={editData.basicInfo.email}
                      onChange={(e) => setEditData((p) => ({
                        ...p,
                        basicInfo: { ...p.basicInfo, email: e.target.value },
                      }))}
                    />
                    <Input
                      type="text"
                      label="Phone Number"
                      value={editData.basicInfo.phone_number}
                      onChange={(e) => setEditData((p) => ({
                        ...p,
                        basicInfo: { ...p.basicInfo, phone_number: e.target.value },
                      }))}
                    />
                    <Input
                      type="date"
                      label="Date of Birth"
                      value={editData.basicInfo.date_of_birth}
                      onChange={(e) => setEditData((p) => ({
                        ...p,
                        basicInfo: { ...p.basicInfo, date_of_birth: e.target.value },
                      }))}
                    />
                    <Input
                      type="text"
                      label="Nationality"
                      value={editData.basicInfo.nationality}
                      onChange={(e) => setEditData((p) => ({
                        ...p,
                        basicInfo: { ...p.basicInfo, nationality: e.target.value },
                      }))}
                    />
                    <Select
                      label="Gender"
                      value={editData.basicInfo.gender}
                      onChange={(e) => setEditData((p) => ({
                        ...p,
                        basicInfo: { ...p.basicInfo, gender: e.target.value },
                      }))}
                      options={GENDER_OPTIONS}
                    />
                    <Input
                      type="text"
                      label="Address"
                      value={editData.basicInfo.address}
                      onChange={(e) => setEditData((p) => ({
                        ...p,
                        basicInfo: { ...p.basicInfo, address: e.target.value },
                      }))}
                    />
                  </div>
                </div>

                <div className="edit-section">
                  <h3>Job Information</h3>
                  <div className="edit-grid">
                    <Input
                      type="text"
                      label="Job Title"
                      value={editData.jobDetails.title}
                      onChange={(e) => setEditData((p) => ({
                        ...p,
                        jobDetails: { ...p.jobDetails, title: e.target.value },
                      }))}
                    />
                    <Select
                      label="Employment Type"
                      value={editData.jobDetails.employment_type}
                      onChange={(e) => setEditData((p) => ({
                        ...p,
                        jobDetails: { ...p.jobDetails, employment_type: e.target.value },
                      }))}
                      options={TYPE_OPTIONS}
                    />
                    <Select
                      label="Employee Level"
                      value={editData.jobDetails.employee_level}
                      onChange={(e) => setEditData((p) => ({
                        ...p,
                        jobDetails: { ...p.jobDetails, employee_level: e.target.value },
                      }))}
                      options={LEVEL_OPTIONS}
                    />
                    <Select
                      label="Work Location"
                      value={editData.jobDetails.work_location}
                      onChange={(e) => setEditData((p) => ({
                        ...p,
                        jobDetails: { ...p.jobDetails, work_location: e.target.value },
                      }))}
                      options={LOCATION_OPTIONS}
                    />
                    <Select
                      label="Employment Status"
                      value={editData.jobDetails.employment_status}
                      onChange={(e) => setEditData((p) => ({
                        ...p,
                        jobDetails: { ...p.jobDetails, employment_status: e.target.value },
                      }))}
                      options={STATUS_OPTIONS}
                    />
                    <Input
                      type="date"
                      label="Hiring Date"
                      value={editData.jobDetails.hiring_date}
                      onChange={(e) => setEditData((p) => ({
                        ...p,
                        jobDetails: { ...p.jobDetails, hiring_date: e.target.value },
                      }))}
                    />
                  </div>
                </div>

                <div className="edit-actions">
                  <Button
                    text={saving ? "Saving..." : "Save Changes"}
                    onClick={saveChanges}
                    disabled={saving}
                  />
                  <Button
                    text="Cancel"
                    onClick={() => {
                      setIsEditing(false);
                      setEditData({ basicInfo: {}, jobDetails: {} });
                    }}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="profile-modal-top">
                  <div className="profile-modal-initials">
                    {getInitials(selected.first_name, selected.last_name)}
                  </div>
                  <h2>{selected.first_name} {selected.last_name}</h2>
                  <span className={`role-badge ${getRoleBadgeClass(selected.role)}`}>{selected.role ?? "employee"}</span>
                  <p className="profile-position">{selected.position ?? "—"}</p>
                </div>
                <div className="profile-modal-details">
                  <ProfileRow icon="mdi:email-outline" label="Email" value={selected.email} />
                  <ProfileRow icon="mdi:phone-outline" label="Phone" value={selected.phone_number} />
                  <ProfileRow icon="mdi:map-marker-outline" label="Address" value={selected.address} />
                  <ProfileRow icon="mdi:earth" label="Nationality" value={selected.nationality} />
                  <ProfileRow icon="mdi:calendar-outline" label="Date of Birth" value={selected.date_of_birth ? new Date(selected.date_of_birth).toLocaleDateString("en-GB") : null} />
                  {selected.manager && (
                    <ProfileRow icon="mdi:account-supervisor-outline" label="Manager" value={`${selected.manager.first_name} ${selected.manager.last_name}`} />
                  )}
                </div>
                {isAdmin && (
                  <div className="profile-modal-actions">
                    <Button text="Edit Profile" onClick={() => openEditMode(selected)} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileRow = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="profile-row">
      <Icon icon={icon} width="18" className="profile-row-icon" />
      <div>
        <span className="profile-row-label">{label}</span>
        <span className="profile-row-value">{value}</span>
      </div>
    </div>
  );
};

export default EmployeeDirectory;
