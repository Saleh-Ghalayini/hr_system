export const preparePositionData = (users) => {
  const positions = users ? [...new Set(users.map(user => user?.position || 'Unassigned'))] : [];
  const counts = positions.map(position => users.filter(user => user?.position === position).length);
  
  // Sort by count in descending order
  const sortedIndices = counts.map((_, index) => index).sort((a, b) => counts[b] - counts[a]);
  const sortedPositions = sortedIndices.map(index => positions[index]);
  const sortedCounts = sortedIndices.map(index => counts[index]);

  const colors = [
    'rgba(59, 130, 246, 0.8)',
    'rgba(16, 185, 129, 0.8)',
    'rgba(245, 158, 11, 0.8)',
    'rgba(239, 68, 68, 0.8)',
    'rgba(139, 92, 246, 0.8)',
    'rgba(236, 72, 153, 0.8)',
    'rgba(20, 184, 166, 0.8)',
    'rgba(234, 179, 8, 0.8)',
  ];

  return {
    labels: sortedPositions,
    datasets: [{
      label: 'Employees by Position',
      data: sortedCounts,
      backgroundColor: colors.slice(0, sortedPositions.length),
      borderColor: colors.slice(0, sortedPositions.length).map(color => color.replace('0.8', '1')),
      borderWidth: 1,
      borderRadius: 6,
    }],
  };
};

export const prepareLeaveData = (leaves) => {
  const statuses = ['approved', 'pending', 'rejected'];
  const statusLabels = ['Approved', 'Pending', 'Rejected'];
  
  return {
    labels: ['Leave Requests'],
    datasets: statuses.map((status, index) => ({
      label: statusLabels[index],
      data: [leaves ? leaves.filter(leave => leave?.status === status).length : 0],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ][index],
      borderColor: [
        'rgba(16, 185, 129, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(239, 68, 68, 1)',
      ][index],
      borderWidth: 1,
    })),
  };
};

export const prepareCourseData = (courses) => {
  const courseData = Array.isArray(courses) 
    ? courses.map(course => ({
        name: course?.course_name || 'Unnamed Course',
        duration: course?.duration_hours || 0
      }))
    : [];

  // Sort by duration in descending order
  courseData.sort((a, b) => b.duration - a.duration);

  return {
    labels: courseData.map(course => course.name),
    datasets: [{
      label: 'Course Duration (Hours)',
      data: courseData.map(course => course.duration),
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
    }],
  };
};

export const prepareEnrollmentData = (enrollments) => {
  const statuses = ['active', 'completed', 'in_progress', 'terminated'];
  const statusLabels = ['Active', 'Completed', 'In Progress', 'Terminated'];
  
  const counts = statuses.map(status => 
    enrollments ? enrollments.filter(enroll => 
      status === 'active' ? enroll?.status === 'active' || enroll?.status === 'enrolled' : enroll?.status === status
    ).length : 0
  );

  return {
    labels: statusLabels,
    datasets: [{
      label: 'Enrollment Status',
      data: counts,
      backgroundColor: [
        'rgba(59, 130, 246, 0.2)',
        'rgba(16, 185, 129, 0.2)',
        'rgba(245, 158, 11, 0.2)',
        'rgba(239, 68, 68, 0.2)',
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)',
      ],
      borderWidth: 2,
      pointBackgroundColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)',
      ],
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)',
      ],
    }],
  };
};

export const getChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 12,
        padding: 15,
        font: {
          family: 'Lato',
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        family: 'Lato',
        size: 14,
        weight: 700,
      },
      bodyFont: {
        family: 'Lato',
        size: 13,
      },
    },
  },
  animation: {
    animateScale: true,
    animateRotate: true,
  },
});

export const getDoughnutOptions = (baseOptions) => ({
  ...baseOptions,
//   cutout: '60%',
  plugins: {
    ...baseOptions.plugins,
    legend: {
      ...baseOptions.plugins.legend,
      position: 'right',
    },
  },
});

export const getStackedBarOptions = (baseOptions) => ({
  ...baseOptions,
  scales: {
    x: {
      stacked: true,
      ticks: {
        font: {
          family: 'Lato',
          size: 11,
        },
      },
    },
    y: {
      stacked: true,
      beginAtZero: true,
      title: {
        display: true,
        text: 'Count',
        font: {
          family: 'Lato',
          size: 12,
          weight: 600,
        },
      },
      ticks: {
        font: {
          family: 'Lato',
          size: 11,
        },
      },
    },
  },
});

export const getLineChartOptions = (baseOptions) => ({
  ...baseOptions,
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Duration (Hours)',
        font: {
          family: 'Lato',
          size: 12,
          weight: 600,
        },
      },
      ticks: {
        font: {
          family: 'Lato',
          size: 11,
        },
      },
    },
    x: {
      ticks: {
        font: {
          family: 'Lato',
          size: 11,
        },
        maxRotation: 45,
        minRotation: 45,
      },
    },
  },
});

export const getRadarChartOptions = (baseOptions) => ({
  ...baseOptions,
  scales: {
    r: {
      beginAtZero: true,
      ticks: {
        font: {
          family: 'Lato',
          size: 11,
        },
      },
      pointLabels: {
        font: {
          family: 'Lato',
          size: 12,
          weight: 600,
        },
      },
    },
  },
});
