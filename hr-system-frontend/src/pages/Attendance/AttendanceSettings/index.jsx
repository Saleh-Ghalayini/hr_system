import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { request } from "../../../common/request";
import { toast } from "react-toastify";
import "./style.css";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const AttendanceSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    work_start: "09:00",
    work_end: "17:00",
    late_threshold_minutes: 15,
    overtime_threshold_minutes: 30,
    max_radius_meters: 100,
    company_lat: 0,
    company_lon: 0,
    require_location: true,
    allow_remote_checkin: false,
    working_days: ["Monday","Tuesday","Wednesday","Thursday","Friday"],
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await request({ method: "GET", path: "admin/attendance-settings" });
        const s = res.data ?? {};
        setSettings(s);
        setForm({
          work_start:                  (s.work_start ?? "09:00:00").slice(0, 5),
          work_end:                    (s.work_end ?? "17:00:00").slice(0, 5),
          late_threshold_minutes:      s.late_threshold_minutes ?? 15,
          overtime_threshold_minutes:  s.overtime_threshold_minutes ?? 30,
          max_radius_meters:           s.max_radius_meters ?? 100,
          company_lat:                 s.company_lat ?? 0,
          company_lon:                 s.company_lon ?? 0,
          require_location:            s.require_location ?? true,
          allow_remote_checkin:        s.allow_remote_checkin ?? false,
          working_days:                s.working_days ?? ["Monday","Tuesday","Wednesday","Thursday","Friday"],
        });
      } catch {
        toast.error("Failed to load attendance settings.");
      } finally { setLoading(false); }
    };
    fetchSettings();
  }, []);

  const toggleDay = (day) => {
    setForm((f) => ({
      ...f,
      working_days: f.working_days.includes(day)
        ? f.working_days.filter((d) => d !== day)
        : [...f.working_days, day],
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await request({ method: "PUT", path: "admin/attendance-settings", data: form });
      toast.success("Settings saved successfully!");
    } catch {
      toast.error("Failed to save settings.");
    } finally { setSaving(false); }
  };

  if (loading) return <div className="att-settings-loading"><div className="loading-spinner" /></div>;

  return (
    <div className="att-settings-container">
      <div className="att-settings-header">
        <h1>Attendance Settings</h1>
        <p>Configure work hours, location, and attendance rules</p>
      </div>

      <form className="att-settings-form" onSubmit={handleSave}>
        {/* Work Hours */}
        <div className="settings-card">
          <div className="settings-card-header">
            <Icon icon="mdi:clock-time-eight-outline" width="22" />
            <h2>Work Hours</h2>
          </div>
          <div className="settings-grid">
            <div className="setting-row">
              <label>Work Start Time</label>
              <input type="time" value={form.work_start} onChange={(e) => setForm((f) => ({ ...f, work_start: e.target.value }))} />
            </div>
            <div className="setting-row">
              <label>Work End Time</label>
              <input type="time" value={form.work_end} onChange={(e) => setForm((f) => ({ ...f, work_end: e.target.value }))} />
            </div>
            <div className="setting-row">
              <label>Late Grace Period (minutes)</label>
              <div className="num-input-wrap">
                <input type="number" value={form.late_threshold_minutes} onChange={(e) => setForm((f) => ({ ...f, late_threshold_minutes: parseInt(e.target.value) || 0 }))} min={0} max={120} />
                <span className="unit">min</span>
              </div>
            </div>
            <div className="setting-row">
              <label>Overtime Threshold (minutes after end)</label>
              <div className="num-input-wrap">
                <input type="number" value={form.overtime_threshold_minutes} onChange={(e) => setForm((f) => ({ ...f, overtime_threshold_minutes: parseInt(e.target.value) || 0 }))} min={0} max={120} />
                <span className="unit">min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Working Days */}
        <div className="settings-card">
          <div className="settings-card-header">
            <Icon icon="mdi:calendar-week" width="22" />
            <h2>Working Days</h2>
          </div>
          <div className="days-grid">
            {DAYS.map((day) => (
              <button
                key={day}
                type="button"
                className={`day-btn ${form.working_days.includes(day) ? "active" : ""}`}
                onClick={() => toggleDay(day)}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
          <p className="settings-note">{form.working_days.length} days/week selected</p>
        </div>

        {/* Location */}
        <div className="settings-card">
          <div className="settings-card-header">
            <Icon icon="mdi:map-marker-radius-outline" width="22" />
            <h2>Location & Geofencing</h2>
          </div>
          <div className="settings-grid">
            <div className="setting-row">
              <label>Check-in Radius (meters)</label>
              <div className="num-input-wrap">
                <input type="number" value={form.max_radius_meters} onChange={(e) => setForm((f) => ({ ...f, max_radius_meters: parseInt(e.target.value) || 100 }))} min={10} max={10000} />
                <span className="unit">m</span>
              </div>
            </div>
            <div className="setting-row">
              <label>Company Latitude</label>
              <input type="number" step="0.000001" value={form.company_lat} onChange={(e) => setForm((f) => ({ ...f, company_lat: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div className="setting-row">
              <label>Company Longitude</label>
              <input type="number" step="0.000001" value={form.company_lon} onChange={(e) => setForm((f) => ({ ...f, company_lon: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div className="setting-row toggle-row">
              <label>Require Location for Check-in</label>
              <button type="button" className={`toggle-btn ${form.require_location ? "on" : "off"}`} onClick={() => setForm((f) => ({ ...f, require_location: !f.require_location }))}>
                <span className="toggle-thumb" />
              </button>
            </div>
            <div className="setting-row toggle-row">
              <label>Allow Remote Check-in</label>
              <button type="button" className={`toggle-btn ${form.allow_remote_checkin ? "on" : "off"}`} onClick={() => setForm((f) => ({ ...f, allow_remote_checkin: !f.allow_remote_checkin }))}>
                <span className="toggle-thumb" />
              </button>
            </div>
          </div>
          {form.company_lat === 0 && form.company_lon === 0 && (
            <div className="settings-warning">
              <Icon icon="mdi:alert-outline" width="16" />
              Company coordinates are not set. Geofencing will not work correctly.
            </div>
          )}
        </div>

        <div className="settings-save-row">
          <button type="submit" className="primary-btn save-settings-btn" disabled={saving}>
            {saving ? "Saving…" : (<><Icon icon="mdi:content-save" width="18" /> Save Settings</>)}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AttendanceSettings;
