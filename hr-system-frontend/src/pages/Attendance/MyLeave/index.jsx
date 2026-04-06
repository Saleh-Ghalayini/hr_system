import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import { request } from "../../../common/request";
import { toast } from "react-toastify";
import "./style.css";

const LEAVE_TYPES = [
  { value: "annual",      label: "Annual Leave",      icon: "mdi:beach",                   color: "#0369a1", needsDoc: false },
  { value: "sick",        label: "Sick Leave",         icon: "mdi:medical-bag",             color: "#d62525", needsDoc: true  },
  { value: "casual",      label: "Casual Leave",       icon: "mdi:coffee-outline",          color: "#6b7280", needsDoc: false },
  { value: "pto",         label: "PTO (Paid Time Off)", icon: "mdi:umbrella-beach-outline", color: "#28eea7", needsDoc: false },
  { value: "unpaid",      label: "Unpaid Leave",       icon: "mdi:currency-usd-off",        color: "#d39c1d", needsDoc: false },
  { value: "maternity",   label: "Maternity Leave",    icon: "mdi:baby-carriage",           color: "#a855f7", needsDoc: true  },
  { value: "paternity",   label: "Paternity Leave",    icon: "mdi:human-male-child",        color: "#3b82f6", needsDoc: false },
  { value: "bereavement", label: "Bereavement Leave",  icon: "mdi:candle",                  color: "#78716c", needsDoc: false },
  { value: "other",       label: "Other",              icon: "mdi:dots-horizontal-circle",  color: "#9ca3af", needsDoc: false },
];

const getLocalYmd = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatDate = (value) => {
  if (!value) return "—";

  const ymd = String(value).split("T")[0];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
    return value;
  }

  const [year, month, day] = ymd.split("-").map(Number);
  const localDate = new Date(year, month - 1, day);
  return localDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const StatusBadge = ({ status }) => {
  const cls = { approved: "status-green", pending: "status-yellow", rejected: "status-red" }[status] ?? "status-yellow";
  return <span className={`status-badge ${cls}`}>{status}</span>;
};

const MyLeave = () => {
  const [tab, setTab] = useState("balance");
  const [balance, setBalance] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loadingBal, setLoadingBal] = useState(true);
  const [loadingReq, setLoadingReq] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    leave_type: "", start_date: "", end_date: "", reason: "",
    is_half_day: false, half_day_period: "morning", document: null,
  });
  const [docPreview, setDocPreview] = useState(null);

  const fetchBalance = useCallback(async () => {
    setLoadingBal(true);
    try {
      const res = await request({ method: "GET", path: "leave/balance" });
      setBalance(res.data?.balances ?? res.data ?? {});
    } catch { toast.error("Failed to load leave balance."); }
    finally { setLoadingBal(false); }
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoadingReq(true);
    try {
      const res = await request({ method: "GET", path: "leave/requests" });
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch { toast.error("Failed to load leave requests."); }
    finally { setLoadingReq(false); }
  }, []);

  useEffect(() => {
    fetchBalance();
    fetchRequests();
  }, [fetchBalance, fetchRequests]);

  const selectedType = LEAVE_TYPES.find((t) => t.value === form.leave_type);
  const todayYmd = getLocalYmd();

  const handleDocChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((f) => ({ ...f, document: file }));
    setDocPreview(file.name);
  };

  const calcDays = () => {
    if (!form.start_date || !form.end_date) return 0;
    if (form.is_half_day) return 0.5;
    const diff = (new Date(form.end_date) - new Date(form.start_date)) / 86400000;
    return Math.floor(diff) + 1;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.leave_type) { toast.error("Please select a leave type."); return; }
    if (!form.start_date || !form.end_date) { toast.error("Please select dates."); return; }
    if (!form.reason.trim()) { toast.error("Please provide a reason."); return; }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("leave_type",      form.leave_type);
      payload.append("start_date",      form.start_date);
      payload.append("end_date",        form.end_date);
      payload.append("reason",          form.reason);
      payload.append("is_half_day",     form.is_half_day ? "1" : "0");
      if (form.is_half_day) payload.append("half_day_period", form.half_day_period);
      if (form.document)    payload.append("document", form.document);

      await request({
        method: "POST",
        path: "leave/requests",
        data: payload,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Leave request submitted successfully!");
      setForm({ leave_type: "", start_date: "", end_date: "", reason: "", is_half_day: false, half_day_period: "morning", document: null });
      setDocPreview(null);
      fetchBalance();
      fetchRequests();
      setTab("history");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to submit leave request.");
    } finally { setSubmitting(false); }
  };

  const balanceItems = Object.entries(balance ?? {}).map(([key, val]) => {
    const type = LEAVE_TYPES.find((t) => t.value === key);
    return { key, label: type?.label ?? key, value: val, color: type?.color ?? "#6b7280", icon: type?.icon ?? "mdi:calendar" };
  });

  const days = calcDays();

  return (
    <div className="my-leave-container">
      <div className="my-leave-tabs">
        <button className={`leave-tab ${tab === "balance" ? "active" : ""}`} onClick={() => setTab("balance")}>
          <Icon icon="mdi:scale-balance" width="18" /> Balance
        </button>
        <button className={`leave-tab ${tab === "apply" ? "active" : ""}`} onClick={() => setTab("apply")}>
          <Icon icon="mdi:plus-circle-outline" width="18" /> Apply
        </button>
        <button className={`leave-tab ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}>
          <Icon icon="mdi:history" width="18" /> History
        </button>
      </div>

      {/* ── Balance Tab ── */}
      {tab === "balance" && (
        <div className="balance-section">
          {loadingBal ? <div className="loading-spinner" /> : (
            <>
              <h2>Your Leave Balances</h2>
              <div className="balance-grid">
                {balanceItems.map(({ key, label, value, color, icon }) => (
                  <div key={key} className="balance-card" style={{ borderTopColor: color }}>
                    <div className="balance-icon" style={{ color }}><Icon icon={icon} width="28" /></div>
                    <div className="balance-days" style={{ color }}>{value}</div>
                    <div className="balance-label">{label}</div>
                    <div className="balance-unit">days remaining</div>
                  </div>
                ))}
                {/* Show balance-exempt types */}
                {["unpaid", "maternity", "paternity", "bereavement"].map((key) => {
                  if (balance?.[key] !== undefined) return null;
                  const type = LEAVE_TYPES.find((t) => t.value === key);
                  return (
                    <div key={key} className="balance-card exempt" style={{ borderTopColor: type?.color }}>
                      <div className="balance-icon" style={{ color: type?.color }}><Icon icon={type?.icon ?? "mdi:calendar"} width="28" /></div>
                      <div className="balance-days" style={{ color: type?.color }}>∞</div>
                      <div className="balance-label">{type?.label}</div>
                      <div className="balance-unit">no limit</div>
                    </div>
                  );
                })}
              </div>
              <p className="balance-note">
                <Icon icon="mdi:information-outline" width="14" /> Unpaid, maternity, paternity, and bereavement leaves are not deducted from your balance.
              </p>
            </>
          )}
        </div>
      )}

      {/* ── Apply Tab ── */}
      {tab === "apply" && (
        <div className="apply-section">
          <h2>Submit Leave Request</h2>
          <form className="leave-form" onSubmit={handleSubmit}>
            {/* Leave type selector */}
            <div className="form-group">
              <label>Leave Type *</label>
              <div className="leave-type-grid">
                {LEAVE_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    className={`leave-type-btn ${form.leave_type === t.value ? "selected" : ""}`}
                    style={form.leave_type === t.value ? { borderColor: t.color, background: t.color + "15" } : {}}
                    onClick={() => setForm((f) => ({ ...f, leave_type: t.value }))}
                  >
                    <Icon icon={t.icon} width="20" style={{ color: t.color }} />
                    <span>{t.label}</span>
                    {["unpaid","maternity","paternity","bereavement"].includes(t.value) && (
                      <span className="no-deduct-tag">no deduction</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="form-row">
              <div className="form-group">
                <label>Start Date *</label>
                <input type="date" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} min={todayYmd} required />
              </div>
              <div className="form-group">
                <label>End Date *</label>
                <input type="date" value={form.end_date} onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))} min={form.start_date || todayYmd} required />
              </div>
            </div>

            {/* Half day */}
            <div className="form-group half-day-wrap">
              <label className="check-label">
                <input type="checkbox" checked={form.is_half_day} onChange={(e) => setForm((f) => ({ ...f, is_half_day: e.target.checked }))} />
                Half-day leave
              </label>
              {form.is_half_day && (
                <select value={form.half_day_period} onChange={(e) => setForm((f) => ({ ...f, half_day_period: e.target.value }))}>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                </select>
              )}
            </div>

            {/* Days summary */}
            {days > 0 && (
              <div className="days-summary">
                <Icon icon="mdi:calendar-clock" width="18" />
                <span>{days} day{days !== 1 ? "s" : ""} requested</span>
                {selectedType && balance?.[form.leave_type] !== undefined && (
                  <span className="balance-after">
                    → {Math.max(0, (balance[form.leave_type] ?? 0) - days)} remaining after approval
                  </span>
                )}
              </div>
            )}

            {/* Reason */}
            <div className="form-group">
              <label>Reason *</label>
              <textarea rows={3} value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} placeholder="Please provide a reason for your leave request…" maxLength={1000} required />
            </div>

            {/* Medical document (shown for relevant types) */}
            {selectedType?.needsDoc && (
              <div className="form-group">
                <label>
                  Medical Document <span className="optional-tag">(optional — PDF or image)</span>
                </label>
                <div className="file-upload-area">
                  <input type="file" id="medical-doc" accept=".pdf,.jpg,.jpeg,.png" onChange={handleDocChange} style={{ display: "none" }} />
                  <label htmlFor="medical-doc" className="file-upload-btn">
                    <Icon icon="mdi:upload" width="20" />
                    {docPreview ? docPreview : "Upload document"}
                  </label>
                  {docPreview && (
                    <button type="button" className="remove-doc-btn" onClick={() => { setForm((f) => ({ ...f, document: null })); setDocPreview(null); }}>
                      <Icon icon="mdi:close" width="16" />
                    </button>
                  )}
                </div>
                {form.leave_type === "sick" && (
                  <p className="doc-hint"><Icon icon="mdi:information-outline" width="14" /> A medical certificate may be required for sick leave over 2 consecutive days.</p>
                )}
              </div>
            )}

            <button type="submit" className="submit-leave-btn" disabled={submitting}>
              {submitting ? "Submitting…" : (<><Icon icon="mdi:send" width="18" /> Submit Request</>)}
            </button>
          </form>
        </div>
      )}

      {/* ── History Tab ── */}
      {tab === "history" && (
        <div className="history-section">
          <h2>My Leave Requests</h2>
          {loadingReq ? <div className="loading-spinner" /> : requests.length === 0 ? (
            <div className="no-requests">
              <Icon icon="mdi:calendar-blank-outline" width="48" />
              <p>No leave requests yet</p>
              <button className="primary-btn" onClick={() => setTab("apply")}>Apply for Leave</button>
            </div>
          ) : (
            <div className="requests-list">
              {requests.map((req) => {
                const type = LEAVE_TYPES.find((t) => t.value === req.leave_type);
                return (
                  <div key={req.id} className="request-card">
                    <div className="req-icon" style={{ color: type?.color ?? "#6b7280", background: (type?.color ?? "#6b7280") + "15" }}>
                      <Icon icon={type?.icon ?? "mdi:calendar"} width="22" />
                    </div>
                    <div className="req-info">
                      <div className="req-top-row">
                        <span className="req-type">{type?.label ?? req.leave_type}</span>
                        <StatusBadge status={req.status} />
                      </div>
                      <p className="req-dates">{formatDate(req.start_date)} → {formatDate(req.end_date)}</p>
                      <p className="req-reason">{req.reason}</p>
                      {req.is_half_day && <span className="half-day-badge">Half day ({req.half_day_period})</span>}
                      {req.document_path && <p className="req-doc"><Icon icon="mdi:paperclip" width="14" /> Document attached</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyLeave;
