// Brand palette
const NAV  = '#142f5a';
const MINT = '#28eea7';
const GRN  = '#069855';
const AMB  = '#d39c1d';
const RED  = '#d62525';
const PUR  = '#7c3aed';
const TEA  = '#0891b2';
const SLT  = '#64748b';

const PALETTE = [NAV, GRN, AMB, RED, PUR, TEA, MINT, SLT];
const alpha = (hex, a) => hex + Math.round(a * 255).toString(16).padStart(2, '0');

// ── Position Doughnut ──────────────────────────────────────────────────────────
export const preparePositionData = (users) => {
  const raw = users ?? [];
  const posMap = {};
  raw.forEach(u => {
    const p = u?.position || 'Unassigned';
    posMap[p] = (posMap[p] ?? 0) + 1;
  });
  const entries = Object.entries(posMap).sort((a, b) => b[1] - a[1]);
  const labels = entries.map(([p]) => p);
  const data   = entries.map(([, c]) => c);
  const bg     = PALETTE.slice(0, labels.length).map(c => alpha(c, 0.85));
  const border = PALETTE.slice(0, labels.length);

  return {
    labels,
    datasets: [{
      label: 'Employees',
      data,
      backgroundColor: bg,
      borderColor: border,
      borderWidth: 2,
      hoverOffset: 6,
    }],
  };
};

// ── Leave Status Doughnut ──────────────────────────────────────────────────────
export const prepareLeaveData = (leaves) => {
  const raw = leaves ?? [];
  const approved = raw.filter(l => l?.status === 'approved').length;
  const pending  = raw.filter(l => l?.status === 'pending').length;
  const rejected = raw.filter(l => l?.status === 'rejected').length;

  return {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [{
      data: [approved, pending, rejected],
      backgroundColor: [alpha(GRN, 0.85), alpha(AMB, 0.85), alpha(RED, 0.85)],
      borderColor:     [GRN, AMB, RED],
      borderWidth: 2,
      hoverOffset: 6,
    }],
  };
};

// ── Course Duration Horizontal Bar ────────────────────────────────────────────
export const prepareCourseData = (courses) => {
  const raw = Array.isArray(courses) ? courses : [];
  const sorted = [...raw]
    .map(c => ({ name: c?.course_name || 'Unnamed', duration: c?.duration_hours || 0 }))
    .sort((a, b) => b.duration - a.duration);

  return {
    labels: sorted.map(c => c.name),
    datasets: [{
      label: 'Duration (hrs)',
      data: sorted.map(c => c.duration),
      backgroundColor: alpha(NAV, 0.75),
      borderColor: NAV,
      borderWidth: 1,
      borderRadius: 4,
    }],
  };
};

// ── Enrollment Status Horizontal Bar ─────────────────────────────────────────
export const prepareEnrollmentData = (enrollments) => {
  const raw = enrollments ?? [];
  const counts = [
    raw.filter(e => e?.status === 'enrolled' || e?.status === 'active').length,
    raw.filter(e => e?.status === 'in_progress').length,
    raw.filter(e => e?.status === 'completed').length,
    raw.filter(e => e?.status === 'terminated').length,
  ];

  return {
    labels: ['Enrolled', 'In Progress', 'Completed', 'Terminated'],
    datasets: [{
      label: 'Enrollments',
      data: counts,
      backgroundColor: [
        alpha(TEA, 0.8),
        alpha(AMB, 0.8),
        alpha(GRN, 0.8),
        alpha(RED, 0.8),
      ],
      borderColor: [TEA, AMB, GRN, RED],
      borderWidth: 1,
      borderRadius: 4,
    }],
  };
};

// ── Attendance Trend Line (last 7 weeks) ──────────────────────────────────────
export const prepareAttendanceTrendData = (trend) => {
  if (!Array.isArray(trend) || trend.length === 0) {
    return { labels: [], datasets: [] };
  }

  // Group by ISO week (Mon–Sun)
  const weekMap = {};
  trend.forEach(rec => {
    const d = new Date(rec.date);
    // Get Monday of the week
    const day = d.getDay() || 7;
    const mon = new Date(d);
    mon.setDate(d.getDate() - day + 1);
    const key = mon.toISOString().slice(0, 10);
    if (!weekMap[key]) weekMap[key] = { present: 0, late: 0 };
    weekMap[key].present++;
    if (rec.time_in_status === 'Late') weekMap[key].late++;
  });

  const weeks = Object.keys(weekMap).sort().slice(-7);
  const labels = weeks.map(w => {
    const d = new Date(w);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  });

  return {
    labels,
    datasets: [
      {
        label: 'Present',
        data: weeks.map(w => weekMap[w].present),
        borderColor: GRN,
        backgroundColor: alpha(GRN, 0.12),
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: GRN,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Late',
        data: weeks.map(w => weekMap[w].late),
        borderColor: AMB,
        backgroundColor: alpha(AMB, 0.10),
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: AMB,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };
};

// ── Chart Options ─────────────────────────────────────────────────────────────
const baseFont = { family: 'Lato', size: 12 };

export const getChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { boxWidth: 12, padding: 16, font: baseFont },
    },
    tooltip: {
      backgroundColor: 'rgba(15,23,42,0.85)',
      padding: 12,
      titleFont: { ...baseFont, size: 13, weight: 700 },
      bodyFont: baseFont,
      cornerRadius: 8,
    },
  },
  animation: { animateScale: true, animateRotate: true },
});

export const getDoughnutOptions = (base) => ({
  ...base,
  cutout: '62%',
  plugins: {
    ...base.plugins,
    legend: { ...base.plugins.legend, position: 'right' },
  },
});

export const getHBarOptions = (base, yTitle = '') => ({
  ...base,
  indexAxis: 'y',
  scales: {
    x: {
      beginAtZero: true,
      grid: { color: 'rgba(0,0,0,0.05)' },
      ticks: { font: { ...baseFont, size: 11 } },
    },
    y: {
      ticks: { font: { ...baseFont, size: 11 } },
      title: yTitle ? { display: true, text: yTitle, font: baseFont } : undefined,
    },
  },
  plugins: { ...base.plugins, legend: { display: false } },
});

export const getTrendLineOptions = (base) => ({
  ...base,
  scales: {
    x: {
      grid: { color: 'rgba(0,0,0,0.04)' },
      ticks: { font: { ...baseFont, size: 11 } },
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(0,0,0,0.04)' },
      ticks: { font: { ...baseFont, size: 11 }, stepSize: 1 },
      title: { display: true, text: 'Check-ins', font: baseFont },
    },
  },
});

// Keep for backwards-compat (unused but exported)
export const getStackedBarOptions = (base) => getHBarOptions(base);
export const getLineChartOptions  = (base) => getTrendLineOptions(base);
export const getRadarChartOptions = (base) => base;
