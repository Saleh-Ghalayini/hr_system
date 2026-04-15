import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import { request, baseApi } from "../../common/request";
import { toast } from "react-toastify";
import "./style.css";

const getInitials = (first, last) =>
  `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();

const EmployeeDirectory = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [posFilter, setPosFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await request({ method: "GET", path: "directory/users" });
      setEmployees(Array.isArray(res.data) ? res.data : (res.data?.data ?? []));
    } catch {
      toast.error("Failed to load employee directory.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  // Build position list dynamically from actual data
  const positions = ["All", ...Array.from(new Set(employees.map((e) => e.position).filter(Boolean))).sort()];

  const filtered = employees.filter((e) => {
    const name = `${e.first_name} ${e.last_name}`.toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) || (e.email ?? "").toLowerCase().includes(search.toLowerCase());
    const matchPos = posFilter === "All" || e.position === posFilter;
    return matchSearch && matchPos;
  });

  const openProfile = (emp) => setSelected(emp);
  const closeProfile = () => setSelected(null);

  const getRoleBadgeClass = (role) => {
    if (role === "admin") return "role-admin";
    if (role === "manager") return "role-manager";
    return "role-employee";
  };

  const getPhotoUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${baseApi.replace("/api/v1/", "")}/storage/${url}`;
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
            const photo = getPhotoUrl(emp.profile_url);
            return (
              <div key={emp.id} className="employee-card" onClick={() => openProfile(emp)}>
                <div className="emp-avatar-wrap">
                  {photo ? (
                    <img src={photo} alt="" className="emp-photo" />
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
            <div className="profile-modal-top">
              {getPhotoUrl(selected.profile_url) ? (
                <img src={getPhotoUrl(selected.profile_url)} alt="" className="profile-modal-photo" />
              ) : (
                <div className="profile-modal-initials">
                  {getInitials(selected.first_name, selected.last_name)}
                </div>
              )}
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
