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

const SummaryCards = ({ stats, recentLeaves, recentCourses, recentEnrollments, attendanceToday }) => {
  const totalEmployees = stats?.total_users ?? 0;
  const pendingLeaves = stats?.pending_leaves ?? 0;
  const totalCourses = stats?.total_courses ?? 0;
  const activeEnrollments = stats?.active_enrollments ?? 0;
  const presentToday = stats?.today_checked_in ?? 0;
  const payrollCount = stats?.payroll_this_month ?? 0;

  // Calculate course completion from recent enrollments sample
  const completedEnrollments = (recentEnrollments ?? []).filter(e => e?.status === 'completed').length;
  const totalEnrollments = (recentEnrollments ?? []).length;
  const completionRate = totalEnrollments > 0
    ? Math.round((completedEnrollments / totalEnrollments) * 100)
    : 0;

  // Calculate attendance rate
  const lateToday = (attendanceToday ?? []).filter(a => a?.time_in_status === 'Late').length;
  const attendanceRate = totalEmployees > 0
    ? Math.round((presentToday / totalEmployees) * 100)
    : 0;

  // Calculate approved leaves from recent data (approximate)
  const approvedLeaves = (recentLeaves ?? []).filter(l => l?.status === 'approved').length;

  // Monthly payroll display
  const payrollDisplay = payrollCount > 0 ? `${payrollCount} records` : '—';

  return (
    <div className="kpi-row">
      <KpiCard
        icon="mdi:account-group-outline"
        label="Total Employees"
        value={totalEmployees}
        sub={`${stats?.active_employees ?? 0} active employees`}
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
        sub={`${approvedLeaves} approved in recent requests`}
        accent="#d39c1d"
      />
      <KpiCard
        icon="mdi:school-outline"
        label="Course Completion"
        value={`${completionRate}%`}
        sub={`${activeEnrollments} active enrollments · ${totalCourses} courses`}
        accent="#7c3aed"
      />
      <KpiCard
        icon="mdi:cash-multiple"
        label="Monthly Payroll"
        value={payrollDisplay}
        sub={`${payrollCount} records this month`}
        accent="#0891b2"
      />
    </div>
  );
};

export default SummaryCards;