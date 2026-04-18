import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import { request } from "../../common/request";
import { toast } from "react-toastify";
import { useAuthContext } from "../../context/AuthContext";
import useInitialPageLoader from "../../hooks/useInitialPageLoader";
import "./style.css";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const formatDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
};

const getDayOfWeek = (d) => new Date(d).toLocaleDateString("en-GB", { weekday: "long" });

const Holidays = () => {
  const { user } = useAuthContext();
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const showInitialLoader = useInitialPageLoader(loading);
  const isAdmin = user?.role === "admin";
  const [year, setYear] = useState(new Date().getFullYear());
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", date: "", type: "public", is_recurring: false, description: "" });

  const fetchHolidays = useCallback(async () => {
    setLoading(true);
    try {
      const res = await request({ method: "GET", path: "holidays", params: { year } });
      setHolidays(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Failed to load holidays.");
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => { fetchHolidays(); }, [fetchHolidays]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", date: "", type: "public", is_recurring: false, description: "" });
    setShowForm(true);
  };

  const openEdit = (h) => {
    setEditing(h);
    setForm({ name: h.name, date: h.date, type: h.type, is_recurring: h.is_recurring, description: h.description ?? "" });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await request({ method: "PUT", path: `admin/holidays/${editing.id}`, data: form });
        toast.success("Holiday updated.");
      } else {
        await request({ method: "POST", path: "admin/holidays", data: form });
        toast.success("Holiday added.");
      }
      setShowForm(false);
      fetchHolidays();
    } catch { toast.error("Failed to save holiday."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this holiday?")) return;
    try {
      await request({ method: "DELETE", path: `admin/holidays/${id}` });
      toast.success("Holiday deleted.");
      setHolidays((prev) => prev.filter((h) => h.id !== id));
    } catch { toast.error("Failed to delete."); }
  };

  const filtered = filter === "all" ? holidays : holidays.filter((h) => h.type === filter);

  // Group by month
  const byMonth = MONTHS.map((name, idx) => ({
    name,
    items: filtered.filter((h) => new Date(h.date).getMonth() === idx),
  })).filter((m) => m.items.length > 0);

  const currentYear = new Date().getFullYear();
  const now = new Date();
  const upcomingCount = year > currentYear
    ? holidays.length
    : year < currentYear
      ? 0
      : holidays.filter((h) => new Date(h.date) >= now).length;

  return (
    <div className="holidays-container">
      <div className="holidays-header">
        <div>
          <h1>Holiday Calendar</h1>
          <p className="holidays-sub">
            {year === currentYear
              ? `${upcomingCount} upcoming · ${holidays.length} total`
              : `${holidays.length} holiday${holidays.length !== 1 ? "s" : ""} in ${year}`}
          </p>
        </div>
        <div className="holidays-controls">
          <div className="year-nav">
            <button className="year-btn" onClick={() => setYear((y) => y - 1)}>
              <Icon icon="mdi:chevron-left" width="18" />
            </button>
            <span className="year-label">{year}</span>
            <button className="year-btn" onClick={() => setYear((y) => y + 1)}>
              <Icon icon="mdi:chevron-right" width="18" />
            </button>
          </div>
          {isAdmin && (
            <button className="primary-btn" onClick={openCreate}>
              <Icon icon="mdi:plus" width="18" /> Add Holiday
            </button>
          )}
        </div>
      </div>

      <div className="holiday-filters">
        {["all", "public", "company"].map((f) => (
          <button key={f} className={`filter-chip ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {showInitialLoader ? (
        <div className="holidays-loading"><div className="loading-spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="holidays-empty">
          <Icon icon="mdi:calendar-blank-outline" width="48" />
          <p>No holidays found for {year}</p>
        </div>
      ) : (
        <div className="holidays-calendar">
          {byMonth.map((month) => (
            <div key={month.name} className="month-group">
              <h3 className="month-heading">{month.name} {year}</h3>
              <div className="holiday-list">
                {month.items.sort((a, b) => new Date(a.date) - new Date(b.date)).map((h) => {
                  const isPast = new Date(h.date) < new Date();
                  return (
                    <div key={h.id} className={`holiday-item ${isPast ? "past" : ""} type-${h.type}`}>
                      <div className="holiday-date-badge">
                        <span className="hd-day">{new Date(h.date).getDate()}</span>
                        <span className="hd-weekday">{getDayOfWeek(h.date).slice(0, 3)}</span>
                      </div>
                      <div className="holiday-info">
                        <div className="holiday-name-row">
                          <span className="holiday-name">{h.name}</span>
                          {h.is_recurring && <span className="recurring-badge"><Icon icon="mdi:repeat" width="12" /> Annual</span>}
                          <span className={`holiday-type-badge type-${h.type}`}>{h.type}</span>
                        </div>
                        {h.description && <p className="holiday-desc">{h.description}</p>}
                      </div>
                      {isAdmin && (
                        <div className="holiday-actions">
                          <button className="hol-action-btn" onClick={() => openEdit(h)} title="Edit"><Icon icon="mdi:pencil" width="14" /></button>
                          <button className="hol-action-btn delete" onClick={() => handleDelete(h.id)} title="Delete"><Icon icon="mdi:trash-can-outline" width="14" /></button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="holidays-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="holidays-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? "Edit Holiday" : "Add Holiday"}</h2>
              <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form className="holiday-form" onSubmit={handleSave}>
              <div className="hol-form-group">
                <label>Holiday Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required maxLength={255} placeholder="e.g. National Day" />
              </div>
              <div className="hol-form-row">
                <div className="hol-form-group">
                  <label>Date *</label>
                  <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
                </div>
                <div className="hol-form-group">
                  <label>Type *</label>
                  <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                    <option value="public">Public</option>
                    <option value="company">Company</option>
                  </select>
                </div>
              </div>
              <div className="hol-form-group">
                <label>Description</label>
                <input type="text" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} maxLength={500} placeholder="Optional description" />
              </div>
              <div className="hol-form-check">
                <input type="checkbox" id="recurring" checked={form.is_recurring} onChange={(e) => setForm((f) => ({ ...f, is_recurring: e.target.checked }))} />
                <label htmlFor="recurring">Repeat every year (annual holiday)</label>
              </div>
              <div className="hol-form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Holidays;
