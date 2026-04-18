import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Icon } from "@iconify/react";
import Table from "../../../components/Table";
import { request } from "../../../common/request";
import { toast } from "react-toastify";
import { useAuthContext } from "../../../context/AuthContext";
import "./style.css";

const PayrollDetails = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const getLastMonthValue = () => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().slice(0, 7);
  };

  const [month, setMonth] = useState(getLastMonthValue());
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genMonth, setGenMonth] = useState(new Date().toISOString().slice(0, 7));
  const { user } = useAuthContext();
  const isAdmin = user?.role === "admin";

  const formatMonth = (value) => {
    if (!value) return "—";
    if (/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) {
      const [year, monthIndex] = value.split("-").map(Number);
      const date = new Date(year, monthIndex - 1, 1);
      return date.toLocaleString("en-US", { month: "long", year: "numeric" });
    }
    return value;
  };

  const formatCurrency = (value) => {
    const num = Number(value || 0);
    if (isNaN(num)) return "0.00";
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Calculate summary statistics
  const stats = useMemo(() => {
    if (payrolls.length === 0) {
      return { total: 0, count: 0, draft: 0, processed: 0, paid: 0, totalNet: 0 };
    }
    const totalNet = payrolls.reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0);
    const draft = payrolls.filter(p => p.status_col?.props?.status === "draft").length;
    const processed = payrolls.filter(p => p.status_col?.props?.status === "processed").length;
    const paid = payrolls.filter(p => p.status_col?.props?.status === "paid").length;
    return { total: totalNet, count: payrolls.length, draft, processed, paid };
  }, [payrolls]);

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
    ...(isAdmin ? [{ key: "actions", label: "Actions" }] : []),
  ];

  const fetchPayrolls = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page };
      if (search.trim()) params.search = search.trim();
      if (month) params.month = month;
      if (status) params.status = status;

      const path = "admin/payroll";
      const res = await request({ method: "GET", path, params });

      // Handle both paginated and non-paginated responses
      let raw = [];
      if (Array.isArray(res)) {
        raw = res;
      } else if (res?.data) {
        raw = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      }

      const paginationInfo = res?.data?.last_page ? {
        last_page: res.data.last_page,
        current_page: res.data.current_page
      } : { last_page: 1, current_page: 1 };

      setTotalPages(paginationInfo.last_page);
      setCurrentPage(page);

      setPayrolls(raw.map((p) => {
        const mapped = {
          id: p.id,
          user_id: p.user_id,
          month: formatMonth(p.month),
          fullname: p.fullname,
          position: p.position,
          base: Number(p.base_salary?.salary || 0).toFixed(2),
          overtime: (Number(p.overtime_hours ?? 0) * (Number(p.base_salary?.salary ?? 0) / 160) * Number(p.overtime_rate ?? 1.5)).toFixed(2),
          bonus: Number(p.bonus ?? 0).toFixed(2),
          allowances: Number(p.allowances ?? 0).toFixed(2),
          deductions_col: Number(p.deductions ?? 0).toFixed(2),
          total: Number(p.total ?? 0).toFixed(2),
          status_col: <StatusBadge status={p.status ?? "draft"} />,
          // Store original RAW values for editing
          _bonus: Number(p.bonus ?? 0),
          _allowances: Number(p.allowances ?? 0),
          _overtime_hours: Number(p.overtime_hours ?? 0),
          _overtime_rate: Number(p.overtime_rate ?? 1.5),
          _base_salary: Number(p.base_salary?.salary ?? 0),
          _insurance_cost: Number(p.insurance?.cost ?? 0),
          _tax_rate: Number(p.tax?.rate ?? 0),
          _extra_leaves: Number(p.extra_leaves ?? 0),
          _deductions: Number(p.deductions ?? 0),
          _notes: p.notes ?? "",
          _status: p.status ?? "draft",
        };

        if (isAdmin) {
          mapped.actions = (
            <button className="edit-payroll-btn" onClick={() => openEdit(mapped)}>
              Edit
            </button>
          );
        }

        return mapped;
      }));
    } catch (err) {
      console.error("Payroll fetch error:", err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Failed to load payroll records.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [search, month, status, isAdmin]);

  // Auto-fetch when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPayrolls(1);
    }, 300); // Debounce
    return () => clearTimeout(timer);
  }, [search, month, status, fetchPayrolls]);

  const openEdit = (p) => {
    // Get values from the raw stored fields (prefixed with _)
    // These are the actual values from the database
    const newForm = {
      id: p.id,
      user_id: p.user_id,
      fullname: p.fullname,
      position: p.position,
      overtime_hours: p._overtime_hours ?? 0,
      overtime_rate: p._overtime_rate ?? 1.5,
      bonus: p._bonus ?? 0,
      allowances: p._allowances ?? 0,
      deductions: p._deductions ?? 0,
      extra_leaves: p._extra_leaves ?? 0,
      notes: p._notes ?? "",
      status: p._status ?? "draft",
      // Values for calculation (NOT editable in form, pulled from employee profile)
      base_salary: p._base_salary ?? 0,
      insurance_cost: p._insurance_cost ?? 0,
      tax_rate: p._tax_rate ?? 0,
    };
    
    console.log("Opening edit with values:", newForm);
    setEditForm(newForm);
    setEditingId(p.id);
  };

  // Calculate net total for preview - recalculates on every render
  const getCalculatedNet = () => {
    const base = Number(editForm.base_salary) || 0;
    const ins = Number(editForm.insurance_cost) || 0;
    const taxRate = Number(editForm.tax_rate) || 0;
    const taxAmount = base * (taxRate / 100);
    const dailyRate = base / 22;
    const leaveDeduct = (Number(editForm.extra_leaves) || 0) * dailyRate;
    const overtimePay = (Number(editForm.overtime_hours) || 0) * (base / 160) * (Number(editForm.overtime_rate) || 1.5);
    const total = base - ins - taxAmount - leaveDeduct - (Number(editForm.deductions) || 0)
      + (Number(editForm.bonus) || 0) + (Number(editForm.allowances) || 0) + overtimePay;
    return Math.max(total, 0);
  };

  // Debug helper to check editForm state
  const debugForm = () => {
    console.log("Current editForm:", editForm);
  };

  const handleSaveEdit = async () => {
    console.log("Saving with editForm:", editForm);
    if (!editingId || !isAdmin) return;

    // Prevent editing paid payrolls (belt and suspenders with backend protection)
    if (editForm.status === 'paid') {
      toast.error("Cannot modify a paid payroll record.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        overtime_hours: Number(editForm.overtime_hours ?? 0),
        overtime_rate: Number(editForm.overtime_rate ?? 1.5),
        bonus: Number(editForm.bonus ?? 0),
        allowances: Number(editForm.allowances ?? 0),
        deductions: Number(editForm.deductions ?? 0),
        extra_leaves: Number(editForm.extra_leaves ?? 0),
        notes: editForm.notes ?? "",
        status: editForm.status ?? "draft"
      };

      const res = await request({
        method: "PUT",
        path: `admin/payroll/${editingId}`,
        data: payload
      });
      
      // Show success with the recalculated total
      const newTotal = res?.data?.total ?? getCalculatedNet();
      toast.success(`Payroll updated. New net salary: ${formatCurrency(newTotal)}`);
      setEditingId(null);
      setEditForm({});
      fetchPayrolls(currentPage);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!isAdmin) return;
    if (!genMonth) {
      toast.error("Select a month first.");
      return;
    }
    if (!window.confirm(`Generate payroll records for ${formatMonth(genMonth)}? Existing records for this month will not be overwritten.`)) {
      return;
    }
    setGenerating(true);
    try {
      const res = await request({ method: "POST", path: "admin/payroll/generate", data: { month: genMonth } });
      toast.success(res.message ?? `Payrolls generated for ${genMonth}`);
      fetchPayrolls(1);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Generation failed.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="payroll-page">
      {/* Header */}
      <div className="payroll-header">
        <div className="payroll-header-text">
          <h1>Payroll Management</h1>
          <p>View and manage employee payroll records</p>
        </div>
        {isAdmin && (
          <div className="payroll-generate-section">
            <label>Generate payrolls for:</label>
            <input
              type="month"
              value={genMonth}
              onChange={(e) => setGenMonth(e.target.value)}
              className="payroll-month-input"
            />
            <button
              className="payroll-generate-btn"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <>
                  <span className="payroll-spinner" />
                  Generating…
                </>
              ) : (
                <>
                  <Icon icon="mdi:play-circle-outline" width="18" />
                  Generate
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="payroll-summary">
        <div className="payroll-summary-card">
          <div className="payroll-summary-icon total-icon">
            <Icon icon="mdi:wallet-outline" width="22" />
          </div>
          <div className="payroll-summary-content">
            <span className="payroll-summary-value">${formatCurrency(stats.total)}</span>
            <span className="payroll-summary-label">Total Payroll</span>
          </div>
        </div>

        <div className="payroll-summary-card">
          <div className="payroll-summary-icon count-icon">
            <Icon icon="mdi:account-group-outline" width="22" />
          </div>
          <div className="payroll-summary-content">
            <span className="payroll-summary-value">{stats.count}</span>
            <span className="payroll-summary-label">Employees</span>
          </div>
        </div>

        <div className="payroll-summary-card">
          <div className="payroll-summary-icon draft-icon">
            <Icon icon="mdi:file-document-edit-outline" width="22" />
          </div>
          <div className="payroll-summary-content">
            <span className="payroll-summary-value">{stats.draft}</span>
            <span className="payroll-summary-label">Draft</span>
          </div>
        </div>

        <div className="payroll-summary-card">
          <div className="payroll-summary-icon processed-icon">
            <Icon icon="mdi:check-circle-outline" width="22" />
          </div>
          <div className="payroll-summary-content">
            <span className="payroll-summary-value">{stats.processed}</span>
            <span className="payroll-summary-label">Processed</span>
          </div>
        </div>

        <div className="payroll-summary-card">
          <div className="payroll-summary-icon paid-icon">
            <Icon icon="mdi:check-all" width="22" />
          </div>
          <div className="payroll-summary-content">
            <span className="payroll-summary-value">{stats.paid}</span>
            <span className="payroll-summary-label">Paid</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="payroll-filters">
        <div className="payroll-filter-search">
          <Icon icon="mdi:magnify" width="18" className="payroll-search-icon" />
          <input
            type="text"
            placeholder="Search employee name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="payroll-filter-select"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="payroll-filter-select"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="processed">Processed</option>
          <option value="paid">Paid</option>
        </select>
        {(search || month || status) && (
          <button
            className="payroll-clear-btn"
            onClick={() => {
              setSearch("");
              setMonth("");
              setStatus("");
            }}
          >
            <Icon icon="mdi:close" width="14" />
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <Table
        headers={headers}
        data={payrolls}
        loading={loading}
        emptyMessage="No payroll records found"
        pagination={totalPages > 1 ? { currentPage, totalPages, onPageChange: fetchPayrolls } : undefined}
      />

      {/* Edit Modal */}
      {editingId && isAdmin && (
        <div className="payroll-modal-overlay" onClick={() => setEditingId(null)}>
          <div className="payroll-modal" onClick={(e) => e.stopPropagation()}>
            <div className="payroll-modal-header">
              <div className="payroll-modal-title">
                <Icon icon="mdi:calculator" width="24" />
                <div>
                  <h2>Edit Payroll</h2>
                  <p>{editForm.fullname || 'Employee'} · {editForm.position || 'Position'} · {formatMonth(month)}</p>
                </div>
              </div>
              <button className="payroll-modal-close" onClick={() => setEditingId(null)}>
                <Icon icon="mdi:close" width="20" />
              </button>
            </div>

            <div className="payroll-modal-body" key={editingId}>
              {/* Paid warning banner */}
              {editForm.status === 'paid' && (
                <div className="payroll-paid-warning">
                  <Icon icon="mdi:lock-outline" width="18" />
                  <span>This payroll is already paid and cannot be modified.</span>
                </div>
              )}
              
              <div className="payroll-form-grid" style={{ opacity: editForm.status === 'paid' ? 0.5 : 1, pointerEvents: editForm.status === 'paid' ? 'none' : 'auto' }}>
                <div className="payroll-form-group">
                  <label>Overtime Hours</label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    step="0.5"
                    value={editForm.overtime_hours ?? ""}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setEditForm(prev => ({ ...prev, overtime_hours: val }));
                    }}
                  />
                </div>
                <div className="payroll-form-group">
                  <label>Overtime Rate (×)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.5"
                    value={editForm.overtime_rate ?? ""}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 1.5;
                      setEditForm(prev => ({ ...prev, overtime_rate: val }));
                    }}
                  />
                </div>
                <div className="payroll-form-group">
                  <label>Bonus ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.bonus ?? ""}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setEditForm(prev => ({ ...prev, bonus: val }));
                    }}
                  />
                </div>
                <div className="payroll-form-group">
                  <label>Allowances ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.allowances ?? ""}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setEditForm(prev => ({ ...prev, allowances: val }));
                    }}
                  />
                </div>
                <div className="payroll-form-group">
                  <label>Other Deductions ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.deductions ?? ""}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setEditForm(prev => ({ ...prev, deductions: val }));
                    }}
                  />
                </div>
                <div className="payroll-form-group">
                  <label>Unpaid Leaves (days)</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.extra_leaves ?? ""}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setEditForm(prev => ({ ...prev, extra_leaves: val }));
                    }}
                    title="Unpaid leave days (not covered by sick leave)"
                  />
                </div>
                <div className="payroll-form-group full-width">
                  <label>Status</label>
                  <select
                    value={editForm.status ?? "draft"}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="draft">Draft</option>
                    <option value="processed">Processed</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div className="payroll-form-group full-width">
                  <label>Notes</label>
                  <textarea
                    rows={2}
                    value={editForm.notes ?? ""}
                    onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Internal notes…"
                    maxLength={1000}
                  />
                </div>
              </div>

              {/* Net Calculation Preview */}
              <div className="payroll-net-preview">
                <div className="payroll-net-header">
                  <Icon icon="mdi:calculator-variant" width="18" />
                  <span>Net Salary Calculation Preview</span>
                </div>
                <div className="payroll-net-breakdown">
                  <div className="payroll-net-row">
                    <span>Base Salary</span>
                    <span className="payroll-net-positive">+ ${formatCurrency(editForm.base_salary || 0)}</span>
                  </div>
                  <div className="payroll-net-row">
                    <span>Insurance</span>
                    <span className="payroll-net-negative">- ${formatCurrency(editForm.insurance_cost || 0)}</span>
                  </div>
                  <div className="payroll-net-row">
                    <span>Tax ({editForm.tax_rate || 0}%)</span>
                    <span className="payroll-net-negative">- ${formatCurrency((editForm.base_salary || 0) * ((editForm.tax_rate || 0) / 100))}</span>
                  </div>
                  <div className="payroll-net-row">
                    <span>Leave Deduction ({editForm.extra_leaves || 0} days)</span>
                    <span className="payroll-net-negative">- ${formatCurrency((editForm.extra_leaves || 0) * ((editForm.base_salary || 0) / 22))}</span>
                  </div>
                  <div className="payroll-net-row">
                    <span>Overtime ({editForm.overtime_hours || 0}h × {editForm.overtime_rate || 1.5}×)</span>
                    <span className="payroll-net-positive">+ ${formatCurrency((editForm.overtime_hours || 0) * ((editForm.base_salary || 0) / 160) * (editForm.overtime_rate || 1.5))}</span>
                  </div>
                  <div className="payroll-net-row">
                    <span>Bonus</span>
                    <span className="payroll-net-positive">+ ${formatCurrency(editForm.bonus || 0)}</span>
                  </div>
                  <div className="payroll-net-row">
                    <span>Allowances</span>
                    <span className="payroll-net-positive">+ ${formatCurrency(editForm.allowances || 0)}</span>
                  </div>
                  <div className="payroll-net-row">
                    <span>Other Deductions</span>
                    <span className="payroll-net-negative">- ${formatCurrency(editForm.deductions || 0)}</span>
                  </div>
                  <div className="payroll-net-total">
                    <span>Net Salary</span>
                    <span className={getCalculatedNet() >= 0 ? "payroll-net-positive" : "payroll-net-negative"}>
                      ${formatCurrency(getCalculatedNet())}
                    </span>
                  </div>
                </div>
              </div>

              <div className="payroll-modal-actions">
                <button
                  className="payroll-btn-cancel"
                  onClick={() => setEditingId(null)}
                  disabled={saving}
                >
                  Close
                </button>
                {editForm.status !== 'paid' && (
                  <button
                    className="payroll-btn-save"
                    onClick={handleSaveEdit}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="payroll-spinner" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Icon icon="mdi:content-save-outline" width="18" />
                        Save & Recalculate
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const cls = {
    paid: "status-green",
    processed: "status-blue",
    draft: "status-gray"
  }[status?.toLowerCase()] ?? "status-gray";
  const label = {
    paid: "Paid",
    processed: "Processed",
    draft: "Draft"
  }[status?.toLowerCase()] ?? status;
  return <span className={`payroll-status ${cls}`}>{label}</span>;
};

export default PayrollDetails;