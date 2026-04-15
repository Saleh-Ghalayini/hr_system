import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { request } from "../../../common/request";
import { toast } from "react-toastify";
import "./style.css";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const AttendanceSettings = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
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
        const [attendanceRes, leaveRes] = await Promise.all([
          request({ method: "GET", path: "admin/attendance-settings" }),
          request({ method: "GET", path: "admin/leave/settings" }),
        ]);

        const s = attendanceRes.data ?? {};
        const leavePolicy = Array.isArray(leaveRes.data?.types) ? leaveRes.data.types : [];

        setLeaveTypes(
          leavePolicy.map((type) => ({
            name: type.name,
            max_days: Number(type.max_days ?? 0),
            is_balance_exempt: Boolean(type.is_balance_exempt),
          }))
        );

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
        toast.error("Failed to load settings.");
      } finally { setLoading(false); }
    };
    fetchSettings();
  }, []);

  const updateLeaveType = (name, patch) => {
    setLeaveTypes((prev) => prev.map((type) => (
      type.name === name ? { ...type, ...patch } : type
    )));
  };

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

    if (!leaveTypes.length) {
      toast.error("Leave policy is not loaded yet.");
      return;
    }

    setSaving(true);
    try {
      const [attendanceResult, leaveResult] = await Promise.allSettled([
        request({ method: "PUT", path: "admin/attendance-settings", data: form }),
        request({
          method: "PUT",
          path: "admin/leave/settings",
          data: {
            types: leaveTypes.map((type) => ({
              name: type.name,
              max_days: Number(type.max_days ?? 0),
              is_balance_exempt: Boolean(type.is_balance_exempt),
            })),
          },
        }),
      ]);

      const attendanceFailed = attendanceResult.status === "rejected";
      const leaveFailed = leaveResult.status === "rejected";

      if (!attendanceFailed && !leaveFailed) {
        toast.success("All settings saved successfully!");
      } else if (attendanceFailed && leaveFailed) {
        toast.error("Failed to save attendance and leave settings.");
      } else if (attendanceFailed) {
        toast.error("Attendance settings failed to save, but leave settings were saved.");
      } else {
        toast.error("Leave settings failed to save, but attendance settings were saved.");
      }
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
              </div>
            </div>
            <div className="setting-row">
              <label>Overtime Threshold (minutes after end)</label>
              <div className="num-input-wrap">
                <input type="number" value={form.overtime_threshold_minutes} onChange={(e) => setForm((f) => ({ ...f, overtime_threshold_minutes: parseInt(e.target.value) || 0 }))} min={0} max={120} />
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

        <div className="settings-card">
          <div className="settings-card-header">
            <Icon icon="mdi:clipboard-text-clock-outline" width="22" />
            <h2>Leave Policy Settings</h2>
          </div>

          <div className="leave-settings-grid">
            {leaveTypes.map((type) => (
              <div key={type.name} className="leave-type-row">
                <div className="leave-type-name">{type.name}</div>
                <div className="leave-type-days">
                  <label>Max Days</label>
                  <input
                    type="number"
                    min={0}
                    max={365}
                    value={type.max_days}
                    disabled={type.is_balance_exempt}
                    onChange={(e) => updateLeaveType(type.name, { max_days: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>
                <div className="leave-type-toggle">
                  <label>Balance Exempt</label>
                  <button
                    type="button"
                    className={`toggle-btn ${type.is_balance_exempt ? "on" : "off"}`}
                    onClick={() => updateLeaveType(type.name, {
                      is_balance_exempt: !type.is_balance_exempt,
                      max_days: !type.is_balance_exempt ? 0 : type.max_days,
                    })}
                  >
                    <span className="toggle-thumb" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        <div className="settings-save-row">
          <button type="submit" className="primary-btn save-settings-btn" disabled={saving}>
            {saving ? "Saving…" : (<><Icon icon="mdi:content-save" width="18" /> Save All Settings</>)}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AttendanceSettings;
