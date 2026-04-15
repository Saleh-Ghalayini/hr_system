import React, { useCallback, useEffect, useMemo, useState } from "react";
import { request } from "../../../common/request";
import { toast } from "react-toastify";
import Table from "../../../components/Table";
import "./style.css";

const PAGE_SIZE = 10;

const formatDate = (dateStr) => {
  if (!dateStr) return "--";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const toPercent = (value) => {
  const numeric = Number(value ?? 0);
  if (Number.isNaN(numeric)) return "0%";
  return `${Math.max(0, Math.min(100, numeric))}%`;
};

const MyLearning = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [enrollments, setEnrollments] = useState([]);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [progressInput, setProgressInput] = useState(0);

  const fetchMyLearning = useCallback(async () => {
    setLoading(true);
    try {
      const response = await request({ method: "GET", path: "enrollments/my" });
      const data = response?.data?.enrollments ?? [];
      setEnrollments(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load your learning records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyLearning();
  }, [fetchMyLearning]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const closeProgressModal = useCallback(() => {
    setProgressModalOpen(false);
    setSelectedEnrollment(null);
    setProgressInput(0);
  }, []);

  const openProgressModal = (row) => {
    setSelectedEnrollment(row);
    setProgressInput(Number(row.progressValue ?? 0));
    setProgressModalOpen(true);
  };

  const submitProgressUpdate = async (e) => {
    e.preventDefault();

    if (!selectedEnrollment?.id) {
      return;
    }

    setSaving(true);
    const safeProgress = Math.max(0, Math.min(95, Number(progressInput || 0)));

    try {
      await request({
        method: "PATCH",
        path: `enrollments/${selectedEnrollment.id}/progress`,
        data: { progress_percentage: safeProgress },
      });

      toast.success("Progress updated successfully.");
      closeProgressModal();
      await fetchMyLearning();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update progress.");
    } finally {
      setSaving(false);
    }
  };

  const transformed = useMemo(
    () =>
      enrollments.map((item) => ({
        id: item.id,
        course: item.course_name || "--",
        start_date: formatDate(item.start_date),
        end_date: formatDate(item.end_date),
        status: item.status ? item.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "--",
        progressValue: Number(item.progress ?? 0),
        progress: toPercent(item.progress),
        certificate: item.certificate_eligible ? "Eligible" : "Not Yet",
        canEditProgress: item.status !== "completed" && item.status !== "terminated",
      })),
    [enrollments]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return transformed;

    const lower = search.toLowerCase();
    return transformed.filter((row) => {
      return [row.course, row.status, row.progress, row.certificate].some((value) =>
        String(value).toLowerCase().includes(lower)
      );
    });
  }, [search, transformed]);

  const headers = [
    { key: "course", label: "Course" },
    { key: "start_date", label: "Start Date" },
    { key: "end_date", label: "End Date" },
    { key: "status", label: "Status" },
    { key: "progress", label: "Progress" },
    { key: "certificate", label: "Certificate" },
    {
      key: "actions",
      label: "Actions",
      render: (row) =>
        row.canEditProgress ? (
          <button className="my-learning-action-btn" onClick={() => openProgressModal(row)}>
            Update Progress
          </button>
        ) : (
          <span className="my-learning-action-disabled">Locked</span>
        ),
    },
  ];

  const visibleRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="my-learning-container">
      {progressModalOpen && (
        <div className="progress-modal" onClick={closeProgressModal}>
          <div className="progress-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="progress-modal-header">
              <h3>Update Progress</h3>
              <button className="progress-modal-close" onClick={closeProgressModal}>
                x
              </button>
            </div>

            <form className="progress-modal-form" onSubmit={submitProgressUpdate}>
              <p className="progress-modal-course">{selectedEnrollment?.course}</p>

              <label htmlFor="progress_percentage">Progress Percentage</label>
              <input
                id="progress_percentage"
                type="range"
                min="0"
                max="95"
                value={progressInput}
                onChange={(e) => setProgressInput(Number(e.target.value))}
              />

              <input
                type="number"
                min="0"
                max="95"
                value={progressInput}
                onChange={(e) => setProgressInput(Math.max(0, Math.min(95, Number(e.target.value || 0))))}
              />

              <small>Employees can update up to 95%. Completion status is verified by HR/Admin.</small>

              <button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Progress"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="my-learning-card">
        <div className="my-learning-header">
          <h2>My Learning</h2>
          <p>Track your enrollments, progress, and certificate eligibility.</p>
        </div>

        <div className="my-learning-search">
          <input
            type="text"
            placeholder="Search by course, status, or certificate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Table
          headers={headers}
          data={visibleRows}
          loading={loading}
          emptyMessage={search ? "No matching records found" : "No enrollments yet"}
          pagination={
            filtered.length > PAGE_SIZE
              ? {
                  currentPage,
                  totalPages: Math.ceil(filtered.length / PAGE_SIZE),
                  onPageChange: setCurrentPage,
                }
              : undefined
          }
        />
      </div>
    </div>
  );
};

export default MyLearning;
