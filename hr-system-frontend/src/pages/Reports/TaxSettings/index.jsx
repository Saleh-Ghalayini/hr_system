import React, { useEffect, useState, useMemo } from "react";
import { request } from "../../../common/request";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../style.css";

const TaxSettings = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [insurances, setInsurances] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [payrollRes, insuranceRes] = await Promise.all([
          request({ method: "GET", path: "admin/payroll" }),
          request({ method: "GET", path: "admin/insurances" }),
        ]);
        const pd = payrollRes.data;
        setPayrolls(Array.isArray(pd) ? pd : (pd?.data ?? []));
        setInsurances(Array.isArray(insuranceRes.data) ? insuranceRes.data : []);
      } catch {
        toast.error("Failed to load tax and insurance settings.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const taxes = useMemo(() => {
    const seen = new Set();
    return payrolls
      .filter((p) => p.tax && !seen.has(p.tax.id) && seen.add(p.tax.id))
      .map((p) => p.tax);
  }, [payrolls]);

  if (loading) return <div className="loading-spinner" />;

  return (
    <div className="report-page">
      <div className="report-header">
        <h2 className="report-title">Tax & Insurance Settings</h2>
        <p className="report-subtitle">Current tax rates and insurance plan details</p>
      </div>

      {/* Tax Rates Section */}
      <div className="settings-section">
        <h3 className="settings-section-title">Tax Rates</h3>
        {taxes.length === 0 ? (
          <p className="report-empty">No tax records found.</p>
        ) : (
          <div className="settings-cards">
            {taxes.map((tax) => (
              <div key={tax.id} className="settings-card">
                <div className="settings-card-icon tax-icon">%</div>
                <div className="settings-card-info">
                  <div className="settings-card-name">{tax.label || "Income Tax"}</div>
                  <div className="settings-card-value">{tax.rate}% rate</div>
                </div>
                <div className="settings-card-badge tax-badge">{tax.rate}%</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Insurance Plans Section */}
      <div className="settings-section">
        <div className="settings-section-header">
          <h3 className="settings-section-title">Insurance Plans</h3>
          <button
            className="settings-edit-btn"
            onClick={() => navigate("/payroll/insandtax")}
          >
            Edit Plans
          </button>
        </div>
        {insurances.length === 0 ? (
          <p className="report-empty">No insurance plans found.</p>
        ) : (
          <div className="settings-cards">
            {insurances.map((ins) => {
              const changed = ins.old_cost && Number(ins.old_cost) !== Number(ins.cost);
              const increased = changed && Number(ins.cost) > Number(ins.old_cost);
              return (
                <div key={ins.id} className="settings-card">
                  <div className="settings-card-icon ins-icon">🛡</div>
                  <div className="settings-card-info">
                    <div className="settings-card-name">{ins.type}</div>
                    <div className="settings-card-value">
                      ${Number(ins.cost).toLocaleString(undefined, { minimumFractionDigits: 2 })} / month
                    </div>
                    {changed && (
                      <div className={`settings-card-change ${increased ? "change-up" : "change-down"}`}>
                        {increased ? "▲" : "▼"} prev: ${Number(ins.old_cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    )}
                  </div>
                  <div className="settings-card-badge ins-badge">
                    ${Number(ins.cost).toFixed(0)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxSettings;