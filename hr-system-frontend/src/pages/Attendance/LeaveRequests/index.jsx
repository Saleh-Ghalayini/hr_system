import React, { useState, useEffect, useCallback } from "react";
import Table from "../../../components/Table";
import axios from "axios";
import { toast } from "react-toastify";
import "./style.css";

const BASE = "http://127.0.0.1:8000/api/v1";

const LeaveRequests = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const tableHeaders = [
    { key: "id", label: "ID" },
    { key: "user_id", label: "User ID" },
    { key: "start_date", label: "Start Date" },
    { key: "end_date", label: "End Date" },
    { key: "status", label: "Status" },
    { key: "reason", label: "Reason" },
    { key: "leave_type", label: "Leave Type" },
    { key: "actions", label: "Actions" },
  ];

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE}/admin/leave/requests`,
        getAuthHeaders()
      );
      setLeaveRequests(response.data.data);
      setFilteredData(response.data.data);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      setError("Failed to fetch leave requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      setModalLoading(true);
      const [userResponse, balanceResponse] = await Promise.all([
        axios.get(`${BASE}/admin/users/${userId}`, getAuthHeaders()),
        axios.get(`${BASE}/admin/leave/balance-by-id/${userId}`, getAuthHeaders()),
      ]);

      setUserData(userResponse.data.data);
      setLeaveBalance(balanceResponse.data.data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const updateLeaveStatus = async () => {
    if (!newStatus) {
      toast.error("Please select a status");
      return;
    }

    try {
      setUpdateLoading(true);

      await axios.put(
        `${BASE}/leave/requests/${selectedRequest.id}`,
        { status: newStatus },
        getAuthHeaders()
      );

      toast.success("Status updated successfully");
      await fetchLeaveRequests();
      handleCloseModal();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setShowModal(true);
    fetchUserDetails(request.user_id);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setUserData(null);
    setLeaveBalance(null);
    setNewStatus("");
  };

  const filterData = useCallback(() => {
    let filtered = [...leaveRequests];

    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((item) =>
        Object.values(item).some(
          (value) =>
            value && value.toString().toLowerCase().includes(searchLower)
        )
      );
    }

    setFilteredData(filtered);
  }, [leaveRequests, statusFilter, search]);

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  useEffect(() => {
    filterData();
  }, [filterData, search, statusFilter]);

  const transformedData = filteredData.map((item) => ({
    ...item,
    status: item.status,
    actions: (
      <button onClick={() => handleViewDetails(item)} className="view-btn">
        View Details
      </button>
    ),
  }));

  return (
    <div className="leave-requests-container">
      <div className="filters-container">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="status-filter"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      <Table
        headers={tableHeaders}
        data={transformedData}
        loading={loading}
        emptyMessage={
          search || statusFilter !== "all"
            ? "No matching leave requests found"
            : "No leave requests available"
        }
      />

      {showModal && selectedRequest && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Leave Request Details</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              {modalLoading ? (
                <div className="loading">Loading...</div>
              ) : (
                <>
                  <div className="modal-grid">
                    <div className="modal-left">
                      {userData && (
                        <div className="user-details">
                          <h3>User Information</h3>
                          <div className="info-grid">
                            <div className="info-item">
                              <label>Name</label>
                              <span>
                                {userData.first_name} {userData.last_name}
                              </span>
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
                            <span>
                              {selectedRequest.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="info-item">
                            <label>Leave Type</label>
                            <span>{selectedRequest.leave_type}</span>
                          </div>
                          <div className="info-item">
                            <label>Start Date</label>
                            <span>{selectedRequest.start_date}</span>
                          </div>
                          <div className="info-item">
                            <label>End Date</label>
                            <span>{selectedRequest.end_date}</span>
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
                            <label>Status</label>
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
                            disabled={
                              updateLoading ||
                              newStatus === selectedRequest.status
                            }
                          >
                            {updateLoading ? "Updating..." : "Update Status"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequests;
