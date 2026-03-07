import React, { useEffect, useState, useMemo } from "react";
import { request } from "../../../common/request";
import { toast } from "react-toastify";
import "../style.css";

const PaymentHistory = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMonth, setExpandedMonth] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await request({ method: "GET", path: "admin/payroll" });
        setPayrolls(Array.isArray(response.data) ? response.data : []);
      } catch {
        toast.error("Failed to load payment history.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const monthGroups = useMemo(() => {
    const groups = {};
    payrolls.forEach((p) => {
      if (!groups[p.month]) groups[p.month] = [];
      groups[p.month].push(p);
    });
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([month, records]) => ({
        month,
        count: records.length,
        total: records.reduce((sum, r) => sum + Number(r.total || 0), 0),
        records,
      }));
  }, [payrolls]);

  if (loading) return <div className="loading-spinner" />;

  return (
    <div className="report-page">
      <div className="report-header">
        <h2 className="report-title">Payment History</h2>
        <p className="report-subtitle">Monthly payroll disbursement records</p>
      </div>

      {monthGroups.length === 0 ? (
        <div className="report-empty">No payment records found.</div>
      ) : (
        <div className="month-groups">
          {monthGroups.map(({ month, count, total, records }) => (
            <div key={month} className="month-card">
              <div
                className="month-card-header"
                onClick={() => setExpandedMonth(expandedMonth === month ? null : month)}
              >
                <div className="month-card-info">
                  <span className="month-label">{month}</span>
                  <span className="month-badge">{count} employee{count !== 1 ? "s" : ""}</span>
                </div>
                <div className="month-card-right">
                  <span className="month-total">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  <span className="month-chevron">{expandedMonth === month ? "▲" : "▼"}</span>
                </div>
              </div>

              {expandedMonth === month && (
                <div className="month-card-body">
                  <table className="payment-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Position</th>
                        <th>Insurance</th>
                        <th>Amount Paid</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((r) => (
                        <tr key={r.id}>
                          <td>{r.fullname}</td>
                          <td>{r.position}</td>
                          <td>{r.insurance?.type ?? "—"}</td>
                          <td>${Number(r.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="payment-table-total-label">Monthly Total</td>
                        <td className="payment-table-total">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
