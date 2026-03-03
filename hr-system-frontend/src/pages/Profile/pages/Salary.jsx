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
        const response = await request({
          method: "GET",
          path: "profile/payroll",
        });
        if (response.success) {
          setPayroll(response.data);
        } else {
          setError("Payroll record not found.");
        }
      } catch (err) {
        setError("Failed to load payroll data.");
      } finally {
        setLoading(false);
      }
    };
    fetchPayroll();
  }, []);

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!payroll) return null;

  return (
    <div className="flex align-center justify-center mt-1">
      <div className="containerP">
        <div className="bg-white p-1 border-rad-eight full-width flex flex-dir-col">
          <h1 className="subtitle">My Salary</h1>

          <div className="salary-grid" style={{ display: "grid", gap: "1rem", padding: "1rem" }}>
            <div className="salary-card" style={{ background: "#f5f5f5", borderRadius: "8px", padding: "1rem" }}>
              <h3>Position</h3>
              <p>{payroll.position ?? "—"}</p>
            </div>

            <div className="salary-card" style={{ background: "#f5f5f5", borderRadius: "8px", padding: "1rem" }}>
              <h3>Base Salary</h3>
              <p>${payroll.base_salary?.salary ?? "—"}</p>
              <small>({payroll.base_salary?.position})</small>
            </div>

            <div className="salary-card" style={{ background: "#f5f5f5", borderRadius: "8px", padding: "1rem" }}>
              <h3>Insurance Plan</h3>
              <p>{payroll.insurance?.type ?? "—"}</p>
              <small>Deduction: ${payroll.insurance?.cost ?? "—"}</small>
            </div>

            <div className="salary-card" style={{ background: "#f5f5f5", borderRadius: "8px", padding: "1rem" }}>
              <h3>Tax</h3>
              <p>{payroll.tax?.label ?? "—"}</p>
              <small>Rate: {payroll.tax?.rate ? `${payroll.tax.rate * 100}%` : "—"}</small>
            </div>

            <div
              className="salary-card"
              style={{
                background: "#1976d2",
                color: "white",
                borderRadius: "8px",
                padding: "1rem",
                gridColumn: "1 / -1",
              }}
            >
              <h3>Net Total</h3>
              <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>${payroll.total ?? "—"}</p>
              {payroll.month && <small>Period: {payroll.month}</small>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Salary;
