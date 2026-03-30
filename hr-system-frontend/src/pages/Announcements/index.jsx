import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import { request } from "../../common/request";
import { toast } from "react-toastify";
import "./style.css";

const TYPE_ICONS = {
  info:    { icon: "mdi:information-outline", color: "#0369a1" },
  warning: { icon: "mdi:alert-outline",       color: "#d39c1d" },
  urgent:  { icon: "mdi:alert-circle-outline", color: "#d62525" },
};

const TYPE_LABELS = { info: "Info", warning: "Warning", urgent: "Urgent" };

const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "";

const AnnouncementCard = ({ item, isAdmin, onEdit, onDelete }) => {
  const { icon, color } = TYPE_ICONS[item.type] ?? TYPE_ICONS.info;
  return (
    <div className={`announcement-card type-${item.type} ${item.is_pinned ? "pinned" : ""}`}>
      {item.is_pinned && <span className="pin-badge"><Icon icon="mdi:pin" width="14" /> Pinned</span>}
      <div className="ann-card-header">
        <div className="ann-type-icon" style={{ color }}>
          <Icon icon={icon} width="22" />
        </div>
        <div className="ann-meta">
          <span className={`ann-type-label type-${item.type}`}>{TYPE_LABELS[item.type]}</span>
          <span className="ann-date">{formatDate(item.published_at ?? item.created_at)}</span>
        </div>
        {isAdmin && (
          <div className="ann-admin-actions">
            <button className="ann-action-btn" onClick={() => onEdit(item)} title="Edit">
              <Icon icon="mdi:pencil" width="16" />
            </button>
            <button className="ann-action-btn delete" onClick={() => onDelete(item.id)} title="Delete">
              <Icon icon="mdi:trash-can-outline" width="16" />
            </button>
          </div>
        )}
      </div>
      <h3 className="ann-title">{item.title}</h3>
      <p className="ann-body">{item.body}</p>
      {item.author && (
        <p className="ann-author">— {item.author.first_name} {item.author.last_name}</p>
      )}
      {item.expires_at && (
        <p className="ann-expires">Expires {formatDate(item.expires_at)}</p>
      )}
    </div>
  );
};

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({
    title: "", body: "", type: "info", is_pinned: false,
    target_role: "", published_at: "", expires_at: ""
  });

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      // Try admin endpoint first (if admin, will succeed)
      let res;
      try {
        res = await request({ method: "GET", path: "admin/announcements" });
        setIsAdmin(true);
      } catch {
        res = await request({ method: "GET", path: "announcements" });
        setIsAdmin(false);
      }
      const list = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      setAnnouncements(list);
    } catch {
      toast.error("Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", body: "", type: "info", is_pinned: false, target_role: "", published_at: "", expires_at: "" });
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title:       item.title ?? "",
      body:        item.body ?? "",
      type:        item.type ?? "info",
      is_pinned:   item.is_pinned ?? false,
      target_role: item.target_role ?? "",
      published_at: item.published_at ? item.published_at.split("T")[0] : "",
      expires_at:  item.expires_at ? item.expires_at.split("T")[0] : "",
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) { toast.error("Title and body are required."); return; }
    setSaving(true);
    try {
      const payload = { ...form, target_role: form.target_role || null, expires_at: form.expires_at || null, published_at: form.published_at || null };
      if (editing) {
        await request({ method: "PUT", path: `admin/announcements/${editing.id}`, data: payload });
        toast.success("Announcement updated.");
      } else {
        await request({ method: "POST", path: "admin/announcements", data: payload });
        toast.success("Announcement created.");
      }
      setShowForm(false);
      fetchAnnouncements();
    } catch { toast.error("Failed to save announcement."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await request({ method: "DELETE", path: `admin/announcements/${id}` });
      toast.success("Announcement deleted.");
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch { toast.error("Failed to delete."); }
  };

  const filtered = filter === "all"
    ? announcements
    : announcements.filter((a) => a.type === filter);

  return (
    <div className="announcements-container">
      <div className="ann-page-header">
        <div>
          <h1>Announcements</h1>
          <p className="ann-subtitle">{announcements.length} announcement{announcements.length !== 1 ? "s" : ""}</p>
        </div>
        {isAdmin && (
          <button className="primary-btn" onClick={openCreate}>
            <Icon icon="mdi:plus" width="18" /> New Announcement
          </button>
        )}
      </div>

      <div className="ann-filters">
        {["all", "info", "warning", "urgent"].map((f) => (
          <button key={f} className={`filter-chip ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="ann-loading"><div className="loading-spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="ann-empty">
          <Icon icon="mdi:bullhorn-outline" width="48" />
          <p>No announcements</p>
        </div>
      ) : (
        <div className="announcements-grid">
          {filtered.map((item) => (
            <AnnouncementCard
              key={item.id}
              item={item}
              isAdmin={isAdmin}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showForm && (
        <div className="ann-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="ann-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ann-modal-header">
              <h2>{editing ? "Edit Announcement" : "New Announcement"}</h2>
              <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form className="ann-form" onSubmit={handleSave}>
              <div className="ann-form-group">
                <label>Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required maxLength={255} placeholder="Announcement title" />
              </div>
              <div className="ann-form-group">
                <label>Body *</label>
                <textarea rows={4} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} required maxLength={5000} placeholder="Announcement details…" />
              </div>
              <div className="ann-form-row">
                <div className="ann-form-group">
                  <label>Type</label>
                  <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="ann-form-group">
                  <label>Target Role</label>
                  <select value={form.target_role} onChange={(e) => setForm((f) => ({ ...f, target_role: e.target.value }))}>
                    <option value="">All</option>
                    <option value="employee">Employees</option>
                    <option value="manager">Managers</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
              </div>
              <div className="ann-form-row">
                <div className="ann-form-group">
                  <label>Publish Date</label>
                  <input type="date" value={form.published_at} onChange={(e) => setForm((f) => ({ ...f, published_at: e.target.value }))} />
                </div>
                <div className="ann-form-group">
                  <label>Expires</label>
                  <input type="date" value={form.expires_at} onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))} />
                </div>
              </div>
              <div className="ann-form-check">
                <input type="checkbox" id="pinned" checked={form.is_pinned} onChange={(e) => setForm((f) => ({ ...f, is_pinned: e.target.checked }))} />
                <label htmlFor="pinned">Pin this announcement</label>
              </div>
              <div className="ann-form-actions">
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

export default Announcements;
