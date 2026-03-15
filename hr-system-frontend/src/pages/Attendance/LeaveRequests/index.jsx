import React, { useState, useEffect, useCallback, useRef } from "react";
import Table from "../../../components/Table";
import { request } from "../../../common/request";
import { toast } from "react-toastify";
import "./style.css";

const STATUS_OPTIONS = ["pending", "approved", "rejected"];

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const LeaveRequests = () => {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rows, setRows] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  const tableHeaders = [
    { key: "id", label: "ID" },
    { key: "employee", label: "Employee" },
    { key: "start_date", label: "Start Date" },
    { key: "end_date", label: "End Date" },
    { key: "leave_type", label: "Type" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions" },
  ];

  const fetchLeaveRequests = useCallback(async (page = 1, srch = "", statuses = []) => {
    setLoading(true);
    try {
      const params = { page };
      if (srch.trim()) params.search = srch.trim();
      if (statuses.length > 0) params.status = statuses;

      const response = await request({ method: "GET", path: "admin/leave/requests", params });
      const list = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
      setRows(list);
      setTotalPages(response.data?.last_page ?? 1);
      setCurrentPage(page);
    } catch {
      toast.error("Failed to fetch leave requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaveRequests(1, "", []);
  }, [fetchLeaveRequests]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setStatusDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Escape closes modal
  useEffect(() => {
    if (!showModal) return;
    const handleEsc = (e) => { if (e.key === "Escape") handleCloseModal(); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [showModal]);

  const triggerSearch = (srch, statuses, page = 1) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchLeaveRequests(page, srch, statuses);
    }, 350);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    triggerSearch(val, selectedStatuses);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      clearTimeout(debounceRef.current);
      fetchLeaveRequests(1, search, selectedStatuses);
    }
  };

  const toggleStatus = (status) => {
    const next = selectedStatuses.includes(status)
      ? selectedStatuses.filter(s => s !== status)
      : [...selectedStatuses, status];
    setSelectedStatuses(next);
    fetchLeaveRequests(1, search, next);
  };

  const handlePageChange = (page) => {
    fetchLeaveRequests(page, search, selectedStatuses);
  };

  const fetchUserDetails = async (userId) => {
    try {
      setModalLoading(true);
      const [userResponse, balanceResponse] = await Promise.all([
        request({ method: "GET", path: `admin/users/${userId}` }),
        request({ method: "GET", path: `admin/leave/balance-by-id/${userId}` }),
      ]);
      setUserData(userResponse.data);
      setLeaveBalance(balanceResponse.data);
    } catch {
      toast.error("Failed to load user details");
    } finally {
      setModalLoading(false);
    }
  };

  const updateLeaveStatus = async () => {
    if (!newStatus) { toast.error("Please select a status"); return; }
    try {
      setUpdateLoading(true);
      await request({
        method: "PUT",
        path: `leave/requests/${selectedRequest.id}`,
        data: { status: newStatus },
      });
      toast.success("Status updated successfully");
      fetchLeaveRequests(currentPage, search, selectedStatuses);
      handleCloseModal();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleViewDetails = (req) => {
    setSelectedRequest(req);
    setNewStatus(req.status);
    setShowModal(true);
    fetchUserDetails(req.user_id);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setUserData(null);
    setLeaveBalance(null);
    setNewStatus("");
  };

  const statusLabel = selectedStatuses.length === 0
    ? "All Statuses"
    : selectedStatuses.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(", ");

  const transformedRows = rows.map((item) => ({
    ...item,
    employee: item.user ? `${item.user.first_name} ${item.user.last_name}` : `#${item.user_id}`,
    start_date: formatDate(item.start_date),
    end_date: formatDate(item.end_date),
    actions: (
      <button onClick={() => handleViewDetails(item)} className="view-btn">
        Details
      </button>
    ),
  }));

  return (
    <div className="leave-requests-container">
      <div className="filters-container">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
          className="search-input"
        />

        {/* Multi-select status */}
        <div className="status-multi-dropdown" ref={dropdownRef}>
          <button
            className="status-dropdown-btn"
            type="button"
            onClick={() => setStatusDropdownOpen(o => !o)}
          >
            {statusLabel}
            <span className="dropdown-arrow">{statusDropdownOpen ? "▲" : "▼"}</span>
          </button>
          {statusDropdownOpen && (
            <div className="status-dropdown-menu">
              {STATUS_OPTIONS.map(s => (
                <label key={s} className="status-option">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(s)}
                    onChange={() => toggleStatus(s)}
                  />
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <Table
        headers={tableHeaders}
        data={transformedRows}
        loading={loading}
        emptyMessage={
          search || selectedStatuses.length > 0
            ? "No matching leave requests found"
            : "No leave requests available"
        }
        pagination={totalPages > 1 ? { currentPage, totalPages, onPageChange: handlePageChange } : undefined}
      />

      {showModal && selectedRequest && (
        <div className="modal" onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Leave Request Details</h2>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              {modalLoading ? (
                <div className="loading-spinner" />
              ) : (
                <div className="modal-grid">
                  <div className="modal-left">
                    {userData && (
                      <div className="user-details">
                        <h3>User Information</h3>
                        <div className="info-grid">
                          <div className="info-item">
                            <label>Name</label>
                            <span>{userData.first_name} {userData.last_name}</span>
                          </div>
                          <div className="info-item">
                            <label>Phone</label>
                            <span>{userData.phone_number}</span>
                          </div>
                          <div className="info-item">
                            <label>Address</label>
                            <span>{userData.address}</span>
                          </div>
                          <div className="info-item">
                            <label>Role</label>
                            <span>{userData.role}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="request-details">
                      <h3>Request Details</h3>
                      <div className="info-grid">
                        <div className="info-item">
                          <label>Status</label>
                          <span>{selectedRequest.status.toUpperCase()}</span>
                        </div>
                        <div className="info-item">
                          <label>Leave Type</label>
                          <span>{selectedRequest.leave_type}</span>
                        </div>
                        <div className="info-item">
                          <label>Start Date</label>
                          <span>{formatDate(selectedRequest.start_date)}</span>
                        </div>
                        <div className="info-item">
                          <label>End Date</label>
                          <span>{formatDate(selectedRequest.end_date)}</span>
                        </div>
                        <div className="info-item full-width">
                          <label>Reason</label>
                          <span>{selectedRequest.reason}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="modal-right">
                    {leaveBalance && (
                      <div className="leave-balance">
                        <h3>Leave Balances</h3>
                        <div className="balance-grid">
                          <div className="balance-item">
                            <span>Annual</span>
                            <strong>{leaveBalance.balances?.annual}</strong>
                          </div>
                          <div className="balance-item">
                            <span>Sick</span>
                            <strong>{leaveBalance.balances?.sick}</strong>
                          </div>
                          <div className="balance-item">
                            <span>Casual</span>
                            <strong>{leaveBalance.balances?.casual}</strong>
                          </div>
                          <div className="balance-item">
                            <span>Other</span>
                            <strong>{leaveBalance.balances?.other}</strong>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="status-actions">
                      <h3>Update Status</h3>
                      <div className="status-update-form">
                        <div className="status-select-container">
                          <label>New Status</label>
                          <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="status-select"
                          >
                            <option value="">Select Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                        <button
                          className="update-btn"
                          onClick={updateLeaveStatus}
                          disabled={updateLoading || newStatus === selectedRequest.status}
                        >
                          {updateLoading ? "Updating…" : "Update Status"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequests;
