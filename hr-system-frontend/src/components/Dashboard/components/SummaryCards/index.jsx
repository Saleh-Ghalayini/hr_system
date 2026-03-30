import React from 'react';
import { Icon } from '@iconify/react';
import './style.css';

const KpiCard = ({ icon, label, value, sub, accent }) => (
  <div className="kpi-card" style={{ '--accent': accent }}>
    <div className="kpi-icon">
      <Icon icon={icon} width="26" height="26" color={accent} />
    </div>
    <div className="kpi-body">
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  </div>
);

const SummaryCards = ({ users, leaves, courses, enrollments, attendanceToday, payroll }) => {
  const totalEmployees = users?.length ?? 0;

  const pendingLeaves = (leaves ?? []).filter(l => l?.status === 'pending').length;
  const approvedLeaves = (leaves ?? []).filter(l => l?.status === 'approved').length;

  const totalCourses = (courses ?? []).length;
  const completedEnrollments = (enrollments ?? []).filter(e => e?.status === 'completed').length;
  const totalEnrollments = (enrollments ?? []).length;
  const completionRate = totalEnrollments > 0
    ? Math.round((completedEnrollments / totalEnrollments) * 100)
    : 0;

  // Today's attendance
  const presentToday = (attendanceToday ?? []).length;
  const lateToday = (attendanceToday ?? []).filter(a => a?.time_in_status === 'Late').length;
  const attendanceRate = totalEmployees > 0
    ? Math.round((presentToday / totalEmployees) * 100)
    : 0;

  // Current month payroll total — month stored as "March 2026" (F Y format)
  const thisMonthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const monthPayroll = (payroll ?? [])
    .filter(p => p?.month === thisMonthLabel)
    .reduce((sum, p) => sum + Number(p?.total ?? 0), 0);
  const payrollDisplay = monthPayroll > 0
    ? `$${monthPayroll.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    : '—';

  return (
    <div className="kpi-row">
      <KpiCard
        icon="mdi:account-group-outline"
        label="Total Employees"
        value={totalEmployees}
        sub={`${users?.filter(u => u?.role === 'user').length ?? 0} employees · ${users?.filter(u => u?.role === 'manager').length ?? 0} managers`}
        accent="#142f5a"
      />
      <KpiCard
        icon="mdi:check-circle-outline"
        label="Present Today"
        value={presentToday}
        sub={`${attendanceRate}% attendance rate · ${lateToday} late`}
        accent="#069855"
      />
      <KpiCard
        icon="mdi:clock-outline"
        label="Pending Leaves"
        value={pendingLeaves}
        sub={`${approvedLeaves} approved this period`}
        accent="#d39c1d"
      />
      <KpiCard
        icon="mdi:school-outline"
        label="Course Completion"
        value={`${completionRate}%`}
        sub={`${completedEnrollments} of ${totalEnrollments} enrollments · ${totalCourses} courses`}
        accent="#7c3aed"
      />
      <KpiCard
        icon="mdi:cash-multiple"
        label="Monthly Payroll"
        value={payrollDisplay}
        sub={`${(payroll ?? []).filter(p => p?.month === thisMonthLabel).length} records this month`}
        accent="#0891b2"
      />
    </div>
  );
};

export default SummaryCards;
