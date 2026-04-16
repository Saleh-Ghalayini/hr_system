import React, { useEffect, useState, useCallback } from "react";
import { request } from "../../../common/request";
import { toast } from "react-toastify";
import "./styles.css";

const InsuranceAndTax = () => {
  const [loading, setLoading] = useState(true);
  const [insuranceData, setInsuranceData] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null); // 'insurance' or 'tax'
  const [editingItem, setEditingItem] = useState(null);
  const [value, setValue] = useState("");
  const [label, setLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [insRes, taxRes] = await Promise.all([
        request({ method: "GET", path: "admin/insurances" }),
        request({ method: "GET", path: "admin/taxes" }),
      ]);
      setInsuranceData(Array.isArray(insRes.data) ? insRes.data : []);
      const taxesData = Array.isArray(taxRes.data) ? taxRes.data : (taxRes.data?.data ?? []);
      setTaxes(taxesData);
    } catch {
      toast.error("Failed to load insurance and tax data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!modalOpen) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [modalOpen]);

  const closeModal = () => {
    setModalOpen(false);
    setEditingType(null);
    setEditingItem(null);
    setValue("");
    setLabel("");
  };

  const openEditInsurance = (insurance) => {
    setEditingType("insurance");
    setEditingItem(insurance);
    setValue(String(insurance.cost));
    setLabel("");
    setModalOpen(true);
  };

  const openEditTax = (tax) => {
    setEditingType("tax");
    setEditingItem(tax);
    setValue(String(tax.rate));
    setLabel(tax.label || "");
    setModalOpen(true);
  };

  const updateInsurance = async (e) => {
    e.preventDefault();
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await request({
        method: "PUT",
        path: `admin/insurances/${editingItem.id}`,
        data: { value: numValue },
      });
      if (response.success) {
        toast.success(`${editingItem.type} updated to $${numValue.toFixed(2)}/month`);
        closeModal();
        fetchData();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to update insurance plan.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateTax = async (e) => {
    e.preventDefault();
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 100) {
      toast.error("Please enter a valid tax rate between 0 and 100.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = { rate: numValue };
      if (label.trim()) {
        payload.label = label.trim();
      }
      const response = await request({
        method: "PUT",
        path: `admin/taxes/${editingItem.id}`,
        data: payload,
      });
      toast.success(`Tax rate updated to ${numValue}%`);
      closeModal();
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to update tax rate.");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate summary stats
  const totalDeduction = insuranceData.reduce((sum, ins) => sum + (parseFloat(ins.cost) || 0), 0);
  const highestTaxRate = taxes.length > 0 ? Math.max(...taxes.map(t => parseFloat(t.rate) || 0)) : 0;

  if (loading) {
    return (
      <div className="ins-tax-page">
        <div className="ins-tax-header">
          <h2>Insurance & Tax Settings</h2>
          <p>Manage deduction rates and insurance plan costs</p>
        </div>
        <div className="loading-spinner" />
      </div>
    );
  }

  const isEditingTax = editingType === "tax";

  return (
    <div className="ins-tax-page">
      {/* Header */}
      <div className="ins-tax-header">
        <div>
          <h2>Insurance & Tax Settings</h2>
          <p>Manage deduction rates and insurance plan costs</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="ins-tax-summary">
        <div className="ins-tax-summary-card">
          <div className="ins-tax-summary-icon deduction-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div className="ins-tax-summary-content">
            <span className="ins-tax-summary-value">
              ${totalDeduction.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="ins-tax-summary-label">Total Monthly Deductions</span>
          </div>
        </div>

        <div className="ins-tax-summary-card">
          <div className="ins-tax-summary-icon plans-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div className="ins-tax-summary-content">
            <span className="ins-tax-summary-value">{insuranceData.length}</span>
            <span className="ins-tax-summary-label">Active Insurance Plans</span>
          </div>
        </div>

        <div className="ins-tax-summary-card">
          <div className="ins-tax-summary-icon tax-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <div className="ins-tax-summary-content">
            <span className="ins-tax-summary-value">{highestTaxRate}%</span>
            <span className="ins-tax-summary-label">Highest Tax Rate</span>
          </div>
        </div>
      </div>

      {/* Insurance Plans Section */}
      <div className="ins-tax-section">
        <div className="ins-tax-section-header">
          <h3>Insurance Plans</h3>
          <span className="ins-tax-section-count">{insuranceData.length} plans</span>
        </div>

        {insuranceData.length === 0 ? (
          <div className="ins-tax-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
            <p>No insurance plans configured yet.</p>
          </div>
        ) : (
          <div className="ins-tax-cards-grid">
            {insuranceData.map((insurance) => {
              const changed = insurance.old_cost && Number(insurance.old_cost) !== Number(insurance.cost);
              const increased = changed && Number(insurance.cost) > Number(insurance.old_cost);

              return (
                <div key={insurance.id} className="ins-tax-card">
                  <div className="ins-tax-card-header">
                    <div className="ins-tax-card-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                    </div>
                    <div className="ins-tax-card-badge">ACTIVE</div>
                  </div>

                  <div className="ins-tax-card-body">
                    <h4 className="ins-tax-card-title">{insurance.type}</h4>
                    <div className="ins-tax-card-value">
                      <span className="ins-tax-card-amount">
                        ${Number(insurance.cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <span className="ins-tax-card-period">/month</span>
                    </div>
                    {changed && (
                      <div className={`ins-tax-card-change ${increased ? "increase" : "decrease"}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          {increased ? (
                            <path d="M12 19V5M5 12l7-7 7 7"/>
                          ) : (
                            <path d="M12 5v14M5 12l7 7 7-7"/>
                          )}
                        </svg>
                        <span>
                          Previous: ${Number(insurance.old_cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="ins-tax-card-footer">
                    <button
                      className="ins-tax-edit-btn"
                      onClick={() => openEditInsurance(insurance)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit Amount
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tax Rates Section */}
      <div className="ins-tax-section">
        <div className="ins-tax-section-header">
          <h3>Tax Rates</h3>
          <span className="ins-tax-section-count">{taxes.length} rates</span>
        </div>

        {taxes.length === 0 ? (
          <div className="ins-tax-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            <p>No tax records found.</p>
          </div>
        ) : (
          <div className="ins-tax-cards-grid">
            {taxes.map((tax) => (
              <div key={tax.id} className="ins-tax-card tax-card">
                <div className="ins-tax-card-header">
                  <div className="ins-tax-card-icon tax-icon-bg">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M14.31 8l5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16L3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94"/>
                    </svg>
                  </div>
                  <div className="ins-tax-card-badge tax-badge">TAX</div>
                </div>
                <div className="ins-tax-card-body">
                  <h4 className="ins-tax-card-title">{tax.label || "Income Tax"}</h4>
                  <div className="ins-tax-card-value">
                    <span className="ins-tax-card-amount">{tax.rate}%</span>
                  </div>
                  <p className="ins-tax-card-desc">Applied to gross salary</p>
                </div>
                <div className="ins-tax-card-footer">
                  <button
                    className="ins-tax-edit-btn"
                    onClick={() => openEditTax(tax)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit Rate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Update Modal */}
      {modalOpen && (
        <div className="ins-tax-modal-overlay" onClick={closeModal}>
          <div className="ins-tax-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ins-tax-modal-header">
              <div className={`ins-tax-modal-icon ${isEditingTax ? 'tax-icon-bg' : ''}`}>
                {isEditingTax ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M14.31 8l5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                )}
              </div>
              <div>
                <h3>{isEditingTax ? "Edit Tax Rate" : "Edit Insurance Plan"}</h3>
                <p>{editingItem?.label || editingItem?.type}</p>
              </div>
              <button className="ins-tax-modal-close" onClick={closeModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <form className="ins-tax-modal-form" onSubmit={isEditingTax ? updateTax : updateInsurance}>
              {isEditingTax && (
                <div className="ins-tax-form-group">
                  <label htmlFor="tax-label">Tax Label (optional)</label>
                  <input
                    id="tax-label"
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g., Income Tax, VAT"
                    className="ins-tax-input"
                    maxLength={255}
                  />
                </div>
              )}

              <div className="ins-tax-form-group">
                <label htmlFor="deduction-value">
                  {isEditingTax ? "Tax Rate (%)" : "Monthly Deduction Amount ($)"}
                </label>
                <input
                  id="deduction-value"
                  type="number"
                  step={isEditingTax ? "0.1" : "0.01"}
                  min="0"
                  max={isEditingTax ? "100" : undefined}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={isEditingTax ? "Enter rate (0-100)" : "Enter amount"}
                  className="ins-tax-input"
                  autoFocus
                />
              </div>

              <div className="ins-tax-form-info">
                {isEditingTax ? (
                  <span>Current rate: {editingItem?.rate}%</span>
                ) : (
                  <span>Current value: ${editingItem?.cost}</span>
                )}
              </div>

              <div className="ins-tax-modal-actions">
                <button
                  type="button"
                  className="ins-tax-btn-cancel"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ins-tax-btn-save"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="ins-tax-spinner" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsuranceAndTax;