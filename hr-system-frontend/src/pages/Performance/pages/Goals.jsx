import React, { useEffect, useState } from 'react';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { request } from '../../../common/request';
import { toast } from 'react-toastify';
import useInitialPageLoader from '../../../hooks/useInitialPageLoader';
import './style.css';

const Goals = () => {
    const [goals, setGoals] = useState([]);
    const [cycles, setCycles] = useState([]);
    const [activeCycle, setActiveCycle] = useState(null);
    const [selectedCycle, setSelectedCycle] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [loading, setLoading] = useState(true);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('kpi');
    const [targetValue, setTargetValue] = useState('');
    const [currentValue, setCurrentValue] = useState('');
    const [unit, setUnit] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [weight, setWeight] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const showInitialLoader = useInitialPageLoader(loading);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [goalsRes, cyclesRes, activeRes] = await Promise.all([
                request({ method: 'GET', path: 'performance/goals' }),
                request({ method: 'GET', path: 'performance/cycles' }),
                request({ method: 'GET', path: 'performance/cycles/active' }),
            ]);

            if (goalsRes?.success) setGoals(goalsRes.data.goals || []);
            if (cyclesRes?.success) setCycles(cyclesRes.data);
            if (activeRes?.success) setActiveCycle(activeRes.data);
        } catch (error) {
            toast.error('Failed to load goals');
        } finally {
            setLoading(false);
        }
    };

    const handleCycleChange = async (e) => {
        const cycleId = e.target.value;
        setSelectedCycle(cycleId ? parseInt(cycleId) : null);
        try {
            const goalsRes = cycleId
                ? await request({ method: 'GET', path: `performance/goals?cycle_id=${cycleId}` })
                : await request({ method: 'GET', path: 'performance/goals' });
            if (goalsRes?.success) {
                setGoals(goalsRes.data.goals || []);
            }
        } catch (error) {
            console.error('Failed to fetch goals');
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setCategory('kpi');
        setTargetValue('');
        setCurrentValue('');
        setUnit('');
        setDueDate('');
        setWeight(1);
        setEditingGoal(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!title.trim()) {
            toast.error('Please enter a goal title');
            return;
        }

        setSubmitting(true);
        try {
            const data = {
                title,
                description,
                category,
                target_value: targetValue || null,
                current_value: currentValue || 0,
                unit,
                due_date: dueDate || null,
                weight,
                review_cycle_id: selectedCycle || activeCycle?.id,
            };

            const res = editingGoal
                ? await request({ method: 'PUT', path: `performance/goals/${editingGoal}/progress`, data: { current_value: currentValue } })
                : await request({ method: 'POST', path: 'performance/goals', data });

            if (res?.success) {
                toast.success(editingGoal ? 'Goal progress updated!' : 'Goal created!');
                resetForm();
                fetchData();
            } else {
                toast.error(res?.message || 'Failed to save goal');
            }
        } catch (error) {
            toast.error('Failed to save goal');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (goalId) => {
        if (!confirm('Are you sure you want to delete this goal?')) return;
        
        try {
            const res = await request({ method: 'DELETE', path: `performance/goals/${goalId}` });
            if (res?.success) {
                toast.success('Goal deleted');
                fetchData();
            }
        } catch (error) {
            toast.error('Failed to delete goal');
        }
    };

    const handleUpdateProgress = (goal) => {
        setEditingGoal(goal.id);
        setTitle(goal.title);
        setDescription(goal.description || '');
        setCurrentValue(goal.current_value || 0);
        setShowForm(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'achieved': return '#069855';
            case 'in_progress': return '#3b82f6';
            case 'exceeded': return '#a855f7';
            default: return '#f59e0b';
        }
    };

    const getProgressColor = (progress) => {
        if (progress >= 100) return '#069855';
        if (progress >= 75) return '#84cc16';
        if (progress >= 50) return '#eab308';
        if (progress >= 25) return '#f97316';
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

    const stats = {
        total: goals.length,
        achieved: goals.filter(g => g.status === 'achieved' || g.status === 'exceeded').length,
        inProgress: goals.filter(g => g.status === 'in_progress').length,
        pending: goals.filter(g => g.status === 'pending').length,
        overdue: goals.filter(g => g.due_date && new Date(g.due_date) < new Date() && g.status !== 'achieved').length,
    };

    return (
        <div className="page-wrapper">
            <div className="goals-header">
                <div>
                    <h2 className="page-title">My Goals</h2>
                    <p className="page-subtitle">Set, track, and achieve your performance objectives</p>
                </div>
                <Button
                    text="+ Add Goal"
                    onClick={() => setShowForm(true)}
                />
            </div>

            {/* Stats Cards */}
            <div className="goals-stats">
                <div className="card stat-card">
                    <span className="stat-value">{stats.total}</span>
                    <span className="stat-label">Total Goals</span>
                </div>
                <div className="card stat-card">
                    <span className="stat-value achieved">{stats.achieved}</span>
                    <span className="stat-label">Achieved</span>
                </div>
                <div className="card stat-card">
                    <span className="stat-value progress">{stats.inProgress}</span>
                    <span className="stat-label">In Progress</span>
                </div>
                <div className="card stat-card">
                    <span className="stat-value pending">{stats.pending}</span>
                    <span className="stat-label">Pending</span>
                </div>
            </div>

            {/* Cycle Filter */}
            <div className="cycle-filter">
                <select value={selectedCycle || ''} onChange={handleCycleChange}>
                    <option value="">All Cycles</option>
                    {cycles.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {/* Goals List */}
            <div className="goals-list">
                {goals.map(goal => (
                    <div key={goal.id} className="card goal-card">
                        <div className="goal-card-header">
                            <div className="goal-info">
                                <h3>{goal.title}</h3>
                                <span className={`category-badge ${goal.category}`}>
                                    {goal.category}
                                </span>
                                {goal.reviewCycle && (
                                    <span className="cycle-badge">
                                        {goal.reviewCycle.name}
                                    </span>
                                )}
                            </div>
                            <span className="goal-status" style={{ color: getStatusColor(goal.status) }}>
                                {goal.status.replace('_', ' ')}
                            </span>
                        </div>

                        {goal.description && (
                            <p className="goal-description">{goal.description}</p>
                        )}

                        <div className="goal-progress-section">
                            <div className="progress-header">
                                <span>Progress</span>
                                <span>{goal.progress || 0}%</span>
                            </div>
                            <div className="progress-bar-bg">
                                <div 
                                    className="progress-bar-fill"
                                    style={{ 
                                        width: `${goal.progress || 0}%`,
                                        backgroundColor: getProgressColor(goal.progress || 0)
                                    }}
                                />
                            </div>
                            <div className="progress-values">
                                <span>{goal.current_value || 0} {goal.unit}</span>
                                <span>of {goal.target_value || '?'} {goal.unit}</span>
                            </div>
                        </div>

                        <div className="goal-footer">
                            {goal.due_date && (
                                <span className={`due-date ${new Date(goal.due_date) < new Date() && goal.status !== 'achieved' ? 'overdue' : ''}`}>
                                    Due: {new Date(goal.due_date).toLocaleDateString()}
                                </span>
                            )}
                            {goal.weight && goal.weight > 1 && (
                                <span className="weight-badge">Weight: ×{goal.weight}</span>
                            )}
                        </div>

                        <div className="goal-actions">
                            <Button
                                text="Update Progress"
                                onClick={() => handleUpdateProgress(goal)}
                            />
                            <Button
                                className="danger"
                                text="Delete"
                                onClick={() => handleDelete(goal.id)}
                            />
                        </div>
                    </div>
                ))}

                {goals.length === 0 && (
                    <div className="card empty-state">
                        <p>No goals set yet.</p>
                        <Button
                            text="Create Your First Goal"
                            onClick={() => setShowForm(true)}
                        />
                    </div>
                )}
            </div>

            {/* Goal Form Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => resetForm()}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingGoal ? 'Update Goal Progress' : 'Create New Goal'}</h3>
                            <button className="modal-close" onClick={resetForm}>×</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {!editingGoal && (
                                <>
                                    <Input
                                        label="Goal Title"
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="What do you want to achieve?"
                                    />

                                    <div className="form-group">
                                        <label className="input-label-text">Description</label>
                                        <textarea
                                            className="comment-textarea"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Describe your goal in detail..."
                                            rows={3}
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="input-label-text">Category</label>
                                            <select 
                                                className="input"
                                                value={category} 
                                                onChange={(e) => setCategory(e.target.value)}
                                            >
                                                <option value="kpi">KPI</option>
                                                <option value="development">Development</option>
                                                <option value="project">Project</option>
                                                <option value="behavioral">Behavioral</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="input-label-text">Weight</label>
                                            <select 
                                                className="input"
                                                value={weight} 
                                                onChange={(e) => setWeight(parseInt(e.target.value))}
                                            >
                                                <option value={1}>1 - Normal</option>
                                                <option value={2}>2 - Important</option>
                                                <option value={3}>3 - High Priority</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <Input
                                            label="Target Value"
                                            type="number"
                                            value={targetValue}
                                            onChange={(e) => setTargetValue(e.target.value)}
                                            placeholder="e.g., 100"
                                        />
                                        <Input
                                            label="Unit"
                                            type="text"
                                            value={unit}
                                            onChange={(e) => setUnit(e.target.value)}
                                            placeholder="e.g., sales, hours, %"
                                        />
                                    </div>

                                    <Input
                                        label="Due Date"
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                    />
                                </>
                            )}

                            {editingGoal && (
                                <Input
                                    label="Current Progress"
                                    type="number"
                                    value={currentValue}
                                    onChange={(e) => setCurrentValue(e.target.value)}
                                    placeholder="Enter current value"
                                />
                            )}

                            <div className="form-actions">
                                <Button
                                    text="Cancel"
                                    onClick={resetForm}
                                    type="button"
                                />
                                <Button
                                    className="btn-primary"
                                    text={submitting ? 'Saving...' : (editingGoal ? 'Update' : 'Create Goal')}
                                    type="submit"
                                    disabled={submitting}
                                />
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Goals;