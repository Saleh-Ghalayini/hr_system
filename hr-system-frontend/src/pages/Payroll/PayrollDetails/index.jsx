import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import Table from "../../../components/Table";
import { request } from "../../../common/request";
import { toast } from "react-toastify";
import "./style.css";

const PayrollDetails = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genMonth, setGenMonth] = useState(new Date().toISOString().slice(0, 7));

  const headers = [
    { key: "month", label: "Month" },
    { key: "fullname", label: "Employee" },
    { key: "position", label: "Position" },
    { key: "base", label: "Base ($)" },
    { key: "overtime", label: "Overtime ($)" },
    { key: "bonus", label: "Bonus ($)" },
    { key: "deductions_col", label: "Deductions ($)" },
    { key: "total", label: "Net ($)" },
    { key: "status_col", label: "Status" },
    { key: "actions", label: "Actions" },
  ];

  const fetchPayrolls = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page };
      if (search.trim()) params.search = search.trim();
      if (month)  params.month  = month;
      if (status) params.status = status;

      const res = await request({ method: "GET", path: "admin/payroll", params });
      const raw = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      setTotalPages(res.data?.last_page ?? 1);
      setCurrentPage(page);

      setPayrolls(raw.map((p) => ({
        ...p,
        base:           p.base_salary?.salary?.toFixed(2) ?? "—",
        overtime:       ((p.overtime_hours ?? 0) * ((p.base_salary?.salary ?? 0) / 160) * (p.overtime_rate ?? 1.5)).toFixed(2),
        bonus:          (p.bonus ?? 0).toFixed(2),
        deductions_col: (p.deductions ?? 0).toFixed(2),
        status_col:     <StatusBadge status={p.status ?? "draft"} />,
        actions:        <button className="edit-payroll-btn" onClick={() => openEdit(p)}>Edit</button>,
      })));
    } catch {
      toast.error("Failed to load payroll records.");
    } finally { setLoading(false); }
  }, [search, month, status]);

  useEffect(() => { fetchPayrolls(1); }, [fetchPayrolls]);

  const openEdit = (p) => {
    setEditingId(p.id);
    setEditForm({
      overtime_hours: p.overtime_hours ?? 0,
      overtime_rate:  p.overtime_rate ?? 1.5,
      bonus:          p.bonus ?? 0,
      allowances:     p.allowances ?? 0,
      deductions:     p.deductions ?? 0,
      extra_leaves:   p.extra_leaves ?? 0,
      notes:          p.notes ?? "",
      status:         p.status ?? "draft",
    });
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await request({ method: "PUT", path: `admin/payroll/${editingId}`, data: editForm });
      toast.success("Payroll updated and total recalculated.");
      setEditingId(null);
      fetchPayrolls(currentPage);
    } catch {
      toast.error("Failed to update payroll.");
    } finally { setSaving(false); }
  };

  const handleGenerate = async () => {
    if (!genMonth) { toast.error("Select a month first."); return; }
    setGenerating(true);
    try {
      const res = await request({ method: "POST", path: "admin/payroll/generate", data: { month: genMonth } });
      toast.success(res.message ?? `Payrolls generated for ${genMonth}`);
      fetchPayrolls(1);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Generation failed.");
    } finally { setGenerating(false); }
  };

  return (
    <div className="payroll-details-container">
      <div className="pd-header">
        <h1>Payroll Management</h1>
        <div className="pd-generate-row">
          <label>Generate payrolls for:</label>
          <input type="month" value={genMonth} onChange={(e) => setGenMonth(e.target.value)} />
          <button className="primary-btn" onClick={handleGenerate} disabled={generating}>
            {generating ? "Generating…" : (<><Icon icon="mdi:cog-play-outline" width="18" /> Generate</>)}
          </button>
        </div>
      </div>

      <div className="pd-filters">
        <input type="text" placeholder="Search employee…" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchPayrolls(1)} />
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="processed">Processed</option>
          <option value="paid">Paid</option>
        </select>
        <button className="primary-btn" onClick={() => fetchPayrolls(1)}>Filter</button>
      </div>

      <Table
        headers={headers}
        data={payrolls}
        loading={loading}
        emptyMessage="No payroll records found"
        pagination={totalPages > 1 ? { currentPage, totalPages, onPageChange: fetchPayrolls } : undefined}
      />

      {/* Edit Modal */}
      {editingId && (
        <div className="pd-modal-overlay" onClick={() => setEditingId(null)}>
          <div className="pd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pd-modal-header">
              <h2>Edit Payroll</h2>
              <button className="close-btn" onClick={() => setEditingId(null)}>×</button>
            </div>
            <div className="pd-modal-body">
              <div className="pd-form-grid">
                <div className="pd-form-group">
                  <label>Overtime Hours</label>
                  <input type="number" min="0" max="200" step="0.5" value={editForm.overtime_hours} onChange={(e) => setEditForm((f) => ({ ...f, overtime_hours: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div className="pd-form-group">
                  <label>Overtime Rate (×)</label>
                  <input type="number" min="1" max="5" step="0.5" value={editForm.overtime_rate} onChange={(e) => setEditForm((f) => ({ ...f, overtime_rate: parseFloat(e.target.value) || 1.5 }))} />
                </div>
                <div className="pd-form-group">
                  <label>Bonus ($)</label>
                  <input type="number" min="0" step="0.01" value={editForm.bonus} onChange={(e) => setEditForm((f) => ({ ...f, bonus: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div className="pd-form-group">
                  <label>Allowances ($)</label>
                  <input type="number" min="0" step="0.01" value={editForm.allowances} onChange={(e) => setEditForm((f) => ({ ...f, allowances: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div className="pd-form-group">
                  <label>Deductions ($)</label>
                  <input type="number" min="0" step="0.01" value={editForm.deductions} onChange={(e) => setEditForm((f) => ({ ...f, deductions: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div className="pd-form-group">
                  <label>Unpaid Leaves (days)</label>
                  <input type="number" min="0" value={editForm.extra_leaves} onChange={(e) => setEditForm((f) => ({ ...f, extra_leaves: parseInt(e.target.value) || 0 }))} />
                </div>
                <div className="pd-form-group full-width">
                  <label>Status</label>
                  <select value={editForm.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}>
                    <option value="draft">Draft</option>
                    <option value="processed">Processed</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div className="pd-form-group full-width">
                  <label>Notes</label>
                  <textarea rows={2} value={editForm.notes} onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Internal notes…" maxLength={1000} />
                </div>
              </div>
              <div className="pd-form-info">
                <Icon icon="mdi:calculator" width="16" />
                Net = Base − Insurance − Tax − Leave deductions + Overtime + Bonus + Allowances − Deductions
              </div>
              <div className="pd-modal-actions">
                <button className="cancel-btn" onClick={() => setEditingId(null)}>Cancel</button>
                <button className="primary-btn" onClick={handleSaveEdit} disabled={saving}>
                  {saving ? "Saving…" : "Save & Recalculate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const cls = { paid: "status-green", processed: "status-blue", draft: "status-gray" }[status] ?? "status-gray";
  return <span className={`payroll-status ${cls}`}>{status}</span>;
};

export default PayrollDetails;
