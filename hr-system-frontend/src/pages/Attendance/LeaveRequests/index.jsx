import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Table from "../../../components/Table";
import { request } from "../../../common/request";
import { toast } from "react-toastify";
import { useAuthContext } from "../../../context/AuthContext";
import "./style.css";

const STATUS_OPTIONS = ["pending", "approved", "rejected"];
const CLIENT_PAGE_SIZE = 10;

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
  const { user } = useAuthContext();
  const role = (user?.role || "").toLowerCase();
  const isAdmin = role === "admin";
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

  const tableHeaders = isAdmin
    ? [
        { key: "id", label: "ID" },
        { key: "employee", label: "Employee" },
        { key: "start_date", label: "Start Date" },
        { key: "end_date", label: "End Date" },
        { key: "leave_type", label: "Type" },
        { key: "status", label: "Status" },
        { key: "actions", label: "Actions" },
      ]
    : [
        { key: "id", label: "ID" },
        { key: "start_date", label: "Start Date" },
        { key: "end_date", label: "End Date" },
        { key: "leave_type", label: "Type" },
        { key: "status", label: "Status" },
        { key: "reason", label: "Reason" },
      ];

  const fetchLeaveRequests = useCallback(async (page = 1, srch = "", statuses = []) => {
    setLoading(true);
    try {
      if (isAdmin) {
        const params = { page };
        if (srch.trim()) params.search = srch.trim();
        if (statuses.length > 0) params.status = statuses;

        const response = await request({ method: "GET", path: "admin/leave/requests", params });
        const list = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
        setRows(list);
        setTotalPages(response.data?.last_page ?? 1);
        setCurrentPage(page);
      } else {
        const response = await request({ method: "GET", path: "leave/requests" });
        const list = Array.isArray(response.data) ? response.data : [];
        setRows(list);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch {
      toast.error("Failed to fetch leave requests.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

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
    if (isAdmin) {
      triggerSearch(val, selectedStatuses);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      if (isAdmin) {
        clearTimeout(debounceRef.current);
        fetchLeaveRequests(1, search, selectedStatuses);
      }
    }
  };

  const toggleStatus = (status) => {
    const next = selectedStatuses.includes(status)
      ? selectedStatuses.filter(s => s !== status)
      : [...selectedStatuses, status];
    setSelectedStatuses(next);
    if (isAdmin) {
      fetchLeaveRequests(1, search, next);
    }
  };

  const handlePageChange = (page) => {
    if (isAdmin) {
      fetchLeaveRequests(page, search, selectedStatuses);
    } else {
      setCurrentPage(page);
    }
  };

  const fetchUserDetails = async (userId) => {
    if (!isAdmin) return;
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
    if (!isAdmin) return;
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
    if (!isAdmin) return;
    setSelectedRequest(req);
    setNewStatus(req.status === "pending" ? "" : req.status);
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

  const filteredClientRows = useMemo(() => {
    if (isAdmin) return rows;

    const term = search.trim().toLowerCase();
    return rows.filter((item) => {
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(item.status);
      if (!matchesStatus) return false;
      if (!term) return true;

      const haystack = [
        item.leave_type,
        item.reason,
        item.status,
        item.start_date,
        item.end_date,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [isAdmin, rows, search, selectedStatuses]);

  const effectiveTotalPages = isAdmin
    ? totalPages
    : Math.max(1, Math.ceil(filteredClientRows.length / CLIENT_PAGE_SIZE));

  const effectiveRows = isAdmin
    ? rows
    : filteredClientRows.slice((currentPage - 1) * CLIENT_PAGE_SIZE, currentPage * CLIENT_PAGE_SIZE);

  useEffect(() => {
    if (!isAdmin) {
      setCurrentPage(1);
    }
  }, [isAdmin, search, selectedStatuses]);

  const transformedRows = effectiveRows.map((item) => {
    const base = {
      ...item,
      start_date: formatDate(item.start_date),
      end_date: formatDate(item.end_date),
      leave_type: item.leave_type ? item.leave_type.charAt(0).toUpperCase() + item.leave_type.slice(1) : "—",
      reason: item.reason || "—",
    };

    if (!isAdmin) {
      return base;
    }

    return {
      ...base,
      employee: item.user ? `${item.user.first_name} ${item.user.last_name}` : `#${item.user_id}`,
      actions: (
        <button onClick={() => handleViewDetails(item)} className="view-btn">
          Details
        </button>
      ),
    };
  });

  return (
    <div className="leave-requests-container">
      <div className="filters-container">
        <input
          type="text"
          placeholder={isAdmin ? "Search by name or email..." : "Search by type, reason, or date..."}
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
            <span className={`dropdown-arrow${statusDropdownOpen ? " open" : ""}`} aria-hidden="true" />
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
        pagination={effectiveTotalPages > 1 ? { currentPage, totalPages: effectiveTotalPages, onPageChange: handlePageChange } : undefined}
      />

      {isAdmin && showModal && selectedRequest && (
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
                          <span style={{textTransform:'capitalize'}}>{selectedRequest.status}</span>
                        </div>
                        <div className="info-item">
                          <label>Leave Type</label>
                          <span style={{textTransform:'capitalize'}}>{selectedRequest.leave_type}</span>
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
                            disabled={selectedRequest.status !== "pending"}
                          >
                            <option value="">Select Status</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                        {selectedRequest.status !== "pending" && (
                          <p className="status-note">Only pending requests can be updated.</p>
                        )}
                        <button
                          className="update-btn"
                          onClick={updateLeaveStatus}
                          disabled={updateLoading || selectedRequest.status !== "pending" || !newStatus || newStatus === selectedRequest.status}
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
