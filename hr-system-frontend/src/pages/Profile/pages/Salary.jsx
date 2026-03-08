import React, { useEffect, useState } from "react";
import "../style.css";
import { request } from "../../../common/request";

const Salary = () => {
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        const response = await request({ method: "GET", path: "profile/payroll" });
        if (response.success) {
          setPayroll(response.data);
        } else {
          setError("Payroll record not found.");
        }
      } catch {
        setError("Failed to load payroll data.");
      } finally {
        setLoading(false);
      }
    };
    fetchPayroll();
  }, []);

  const base = payroll?.base_salary?.salary ?? 0;
  const taxRate = payroll?.tax?.rate ?? 0;
  const insuranceCost = payroll?.insurance?.cost ?? 0;
  const taxAmount = base > 0 ? ((base * taxRate) / 100).toFixed(2) : null;
  const net = base > 0 ? (base - (base * taxRate) / 100 - insuranceCost).toFixed(2) : null;

  if (loading) return <div className="loading-spinner" />;

  if (error) return (
    <div className="profilebody">
      <div className="profile-card profile-error">{error}</div>
    </div>
  );

  if (!payroll) return null;

  return (
    <div className="profilebody">
      <div className="containerP">
        <div className="profile-card">
          <p className="profile-card-title">My Salary</p>

          <div className="salary-summary">
            <div className="salary-item">
              <p className="salary-item-label">Position</p>
              <p className="salary-item-value">{payroll.position ?? "—"}</p>
              <p className="salary-item-sub">{payroll.base_salary?.position ?? ""}</p>
            </div>

            <div className="salary-item">
              <p className="salary-item-label">Base Salary</p>
              <p className="salary-item-value">${payroll.base_salary?.salary?.toLocaleString() ?? "—"}</p>
              <p className="salary-item-sub">per month</p>
            </div>

            <div className="salary-item">
              <p className="salary-item-label">Tax</p>
              <p className="salary-item-value">{payroll.tax?.label ?? "—"}</p>
              <p className="salary-item-sub">
                {taxRate}% {taxAmount ? `(−$${taxAmount})` : ""}
              </p>
            </div>

            <div className="salary-item">
              <p className="salary-item-label">Insurance</p>
              <p className="salary-item-value">{payroll.insurance?.type ?? "—"}</p>
              <p className="salary-item-sub">
                {insuranceCost > 0 ? `−$${insuranceCost}` : "No deduction"}
              </p>
            </div>

            <div className="salary-item salary-net">
              <p className="salary-item-label">Net Pay</p>
              <p className="salary-item-value">${net ?? payroll.total ?? "—"}</p>
              {payroll.month && <p className="salary-item-sub">Period: {payroll.month}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Salary;
