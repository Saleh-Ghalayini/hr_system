import React, { useEffect, useState } from 'react';
import MyChart from '../../../components/Chart';
import { request } from '../../../common/request';
import { toast } from 'react-toastify';
import useInitialPageLoader from '../../../hooks/useInitialPageLoader';
import './style.css';

const AdminAverage = () => {
    const [loading, setLoading] = useState(true);
    const [cycles, setCycles] = useState([]);
    const [activeCycle, setActiveCycle] = useState(null);
    const [selectedCycle, setSelectedCycle] = useState(null);
    const [averages, setAverages] = useState([]);
    const [departmentOverview, setDepartmentOverview] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [viewMode, setViewMode] = useState('averages');
    const [chartData, setChartData] = useState(null);
    const showInitialLoader = useInitialPageLoader(loading);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [cyclesRes, activeRes, avgRes, deptRes] = await Promise.all([
                request({ method: 'GET', path: 'performance/cycles' }),
                request({ method: 'GET', path: 'performance/cycles/active' }),
                request({ method: 'GET', path: 'performance/average' }),
                request({ method: 'GET', path: 'admin/performance/department-overview' }),
            ]);

            if (cyclesRes?.success) setCycles(cyclesRes.data);
            if (activeRes?.success) {
                setActiveCycle(activeRes.data);
                setSelectedCycle(activeRes.data?.id);
            }
            if (avgRes?.success) setAverages(avgRes.data);
            if (deptRes?.success) {
                setDepartmentOverview(deptRes.data);
                const depts = [...new Set(deptRes.data.map(e => e.user?.department).filter(Boolean))];
                setDepartments(depts);
            }

            if (avgRes?.success) {
                setChartData({
                    labels: avgRes.data.map(r => r.type?.name || `Type ${r.type_id}`),
                    values: avgRes.data.map(r => parseFloat(r.average_rate)),
                });
            }
        } catch (error) {
            toast.error('Failed to load performance data');
        } finally {
            setLoading(false);
        }
    };

    const handleCycleChange = async (e) => {
        const cycleId = e.target.value;
        setSelectedCycle(cycleId ? parseInt(cycleId) : null);
        
        try {
            const [avgRes, deptRes] = await Promise.all([
                request({ method: 'GET', path: `performance/average${cycleId ? `?cycle_id=${cycleId}` : ''}` }),
                request({ method: 'GET', path: `admin/performance/department-overview${cycleId ? `?cycle_id=${cycleId}` : ''}` }),
            ]);

            if (avgRes?.success) {
                setAverages(avgRes.data);
                setChartData({
                    labels: avgRes.data.map(r => r.type?.name || `Type ${r.type_id}`),
                    values: avgRes.data.map(r => parseFloat(r.average_rate)),
                });
            }
            if (deptRes?.success) setDepartmentOverview(deptRes.data);
        } catch (error) {
            console.error('Failed to fetch data');
        }
    };

    const handleDepartmentFilter = async (dept) => {
        setSelectedDepartment(dept);
        try {
            const res = await request({
                method: 'GET',
                path: `admin/performance/department-overview${selectedCycle ? `?cycle_id=${selectedCycle}` : ''}${dept ? `&department_id=${dept}` : ''}`
            });
            if (res?.success) setDepartmentOverview(res.data);
        } catch (error) {
            console.error('Failed to filter');
        }
    };

    const getScoreColor = (score) => {
        if (score >= 4.5) return '#069855';
        if (score >= 3.5) return '#84cc16';
        if (score >= 2.5) return '#eab308';
        return '#BA5143';
    };

    if (showInitialLoader) {
        return (
            <div className="page-wrapper">
                <div className="perf-loading">
                    <div className="loading-spinner" />
                </div>
            </div>
        );
    }

    const departmentData = selectedDepartment
        ? departmentOverview.filter(e => e.user?.department === selectedDepartment)
        : departmentOverview;

    return (
        <div className="page-wrapper">
            <div className="admin-header">
                <div>
                    <h2 className="page-title">Performance Analytics</h2>
                    <p className="page-subtitle">Company-wide performance insights</p>
                </div>
                <div className="controls">
                    <select value={selectedCycle || ''} onChange={handleCycleChange}>
                        <option value="">Select Cycle</option>
                        {cycles.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.name} {c.status === 'active' ? '(Active)' : ''}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* View Mode Tabs */}
            <div className="analytics-tabs">
                <button 
                    className={`tab ${viewMode === 'averages' ? 'active' : ''}`}
                    onClick={() => setViewMode('averages')}
                >
                    Category Averages
                </button>
                <button 
                    className={`tab ${viewMode === 'department' ? 'active' : ''}`}
                    onClick={() => setViewMode('department')}
                >
                    Department Overview
                </button>
                <button 
                    className={`tab ${viewMode === 'trends' ? 'active' : ''}`}
                    onClick={() => setViewMode('trends')}
                >
                    Trends
                </button>
            </div>

            {/* Category Averages View */}
            {viewMode === 'averages' && chartData && (
                <div className="averages-view">
                    <div className="card chart-section full-width">
                        <h3 className="section-title">Average Rating by Category</h3>
                        <MyChart
                            label="Company Averages"
                            labelsData={chartData.labels}
                            numericalData={chartData.values}
                        />
                    </div>

                    <div className="card averages-table">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Average Score</th>
                                    <th>Employees Rated</th>
                                    <th>Performance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {averages.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{item.type?.name || `Type ${item.type_id}`}</td>
                                        <td style={{ color: getScoreColor(item.average_rate) }}>
                                            <strong>{parseFloat(item.average_rate).toFixed(2)}</strong>
                                        </td>
                                        <td>{item.employee_count}</td>
                                        <td>
                                            <div className="perf-bar">
                                                <div 
                                                    className="perf-fill"
                                                    style={{ 
                                                        width: `${(item.average_rate / 5) * 100}%`,
                                                        backgroundColor: getScoreColor(item.average_rate)
                                                    }}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Department Overview View */}
            {viewMode === 'department' && (
                <div className="department-view">
                    <div className="department-filters">
                        <button 
                            className={`filter-btn ${!selectedDepartment ? 'active' : ''}`}
                            onClick={() => handleDepartmentFilter(null)}
                        >
                            All Departments
                        </button>
                        {departments.map(dept => (
                            <button
                                key={dept}
                                className={`filter-btn ${selectedDepartment === dept ? 'active' : ''}`}
                                onClick={() => handleDepartmentFilter(dept)}
                            >
                                {dept}
                            </button>
                        ))}
                    </div>

                    {departmentData.length > 0 ? (
                        <div className="department-grid">
                            <div className="dept-summary-cards">
                                {departmentData.slice(0, 5).map((emp, idx) => (
                                    <div key={idx} className="card emp-card">
                                        <div className="emp-rank">#{idx + 1}</div>
                                        <div className="emp-info">
                                            <strong>{emp.user?.name}</strong>
                                            <span>{emp.user?.position}</span>
                                            <span className="dept">{emp.user?.department}</span>
                                        </div>
                                        <div className="emp-score" style={{ color: getScoreColor(emp.average_rating) }}>
                                            {emp.average_rating?.toFixed(1) || '—'}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="card chart-section">
                                <h3 className="section-title">Employee Performance Distribution</h3>
                                <MyChart
                                    label="Performance"
                                    labelsData={departmentData.map(e => e.user?.name?.split(' ')[0] || 'Unknown')}
                                    numericalData={departmentData.map(e => e.average_rating || 0)}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="card empty-state">
                            <p>No performance data available for this selection.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Trends View */}
            {viewMode === 'trends' && (
                <div className="trends-view">
                    <div className="card chart-section">
                        <h3 className="section-title">Performance Trends Over Time</h3>
                        <MyChart
                            label="Average Performance"
                            labelsData={cycles.filter(c => c.status === 'closed').slice(0, 6).map(c => c.name).reverse()}
                            numericalData={cycles.filter(c => c.status === 'closed').slice(0, 6).map(() => 
                                averages.length > 0 
                                    ? averages.reduce((s, a) => s + parseFloat(a.average_rate), 0) / averages.length
                                    : 0
                            ).reverse()}
                        />
                    </div>

                    <div className="trends-summary">
                        <h3 className="section-title">Performance Insights</h3>
                        <div className="insights-grid">
                            <div className="card insight-card">
                                <span className="insight-icon">📊</span>
                                <div className="insight-content">
                                    <strong>Average Rating</strong>
                                    <span>
                                        {averages.length > 0 
                                            ? (averages.reduce((s, a) => s + parseFloat(a.average_rate), 0) / averages.length).toFixed(2)
                                            : '—'}
                                    </span>
                                </div>
                            </div>
                            <div className="card insight-card">
                                <span className="insight-icon">👥</span>
                                <div className="insight-content">
                                    <strong>Employees Rated</strong>
                                    <span>{averages.reduce((s, a) => s + a.employee_count, 0)}</span>
                                </div>
                            </div>
                            <div className="card insight-card">
                                <span className="insight-icon">🏆</span>
                                <div className="insight-content">
                                    <strong>Top Performer</strong>
                                    <span>
                                        {departmentOverview.length > 0
                                            ? departmentOverview.reduce((max, e) => 
                                                (e.average_rating > (max?.average_rating || 0) ? e : max), null)?.user?.name || '—'
                                            : '—'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAverage;