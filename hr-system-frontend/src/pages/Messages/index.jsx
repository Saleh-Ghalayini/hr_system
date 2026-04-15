import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import { request } from "../../common/request";
import { toast } from "react-toastify";
import "./style.css";

const Messages = () => {
  const [activeTab, setActiveTab] = useState("inbox");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [users, setUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [search, setSearch] = useState("");
  const [composing, setComposing] = useState(false);
  const [form, setForm] = useState({ receiver_id: "", subject: "", body: "", parent_id: null });

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const path = activeTab === "inbox" ? "messages/inbox" : "messages/sent";
      const params = search.trim() ? { search: search.trim() } : {};
      const res = await request({ method: "GET", path, params });
      const list = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      setMessages(list);
    } catch {
      toast.error("Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await request({ method: "GET", path: "messages/unread-count" });
      setUnreadCount(res.data?.count ?? 0);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await request({ method: "GET", path: "directory/users" });
      const list = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      setUsers(list);
    } catch (e) {
      console.error("Failed to fetch users");
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    fetchUnreadCount();
  }, [fetchMessages, fetchUnreadCount]);

  useEffect(() => {
    if (showCompose) fetchUsers();
  }, [showCompose, fetchUsers]);

  const openMessage = async (msg) => {
    setSelectedMsg(msg);
    setShowDetail(true);
    if (activeTab === "inbox" && !msg.read_at) {
      try {
        await request({ method: "PUT", path: `messages/${msg.id}/read` });
        setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, read_at: new Date().toISOString() } : m));
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (e) {
        console.error("Failed to mark message as read:", e);
      }
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.receiver_id || !form.body.trim()) {
      toast.error("Recipient and message body are required.");
      return;
    }
    setComposing(true);
    try {
      await request({ method: "POST", path: "messages", data: form });
      toast.success("Message sent!");
      setShowCompose(false);
      setForm({ receiver_id: "", subject: "", body: "", parent_id: null });
      if (activeTab === "sent") fetchMessages();
    } catch {
      toast.error("Failed to send message.");
    } finally {
      setComposing(false);
    }
  };

  const handleReply = (msg) => {
    setForm({
      receiver_id: msg.sender_id,
      subject: msg.subject ? `Re: ${msg.subject}` : "",
      body: "",
      parent_id: msg.id,
    });
    setShowDetail(false);
    setShowCompose(true);
  };

  const handleDelete = async (msgId) => {
    try {
      await request({ method: "DELETE", path: `messages/${msgId}` });
      toast.success("Message deleted.");
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
      setShowDetail(false);
    } catch {
      toast.error("Failed to delete message.");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffHours = diffMs / 3600000;
    if (diffHours < 24) return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    if (diffHours < 168) return d.toLocaleDateString("en-GB", { weekday: "short" });
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  };

  const userName = (person) => person ? `${person.first_name} ${person.last_name}` : "Unknown";

  return (
    <div className="messages-container">
      {/* Sidebar */}
      <aside className="messages-sidebar">
        <button className="compose-btn" onClick={() => { setForm({ receiver_id: "", subject: "", body: "", parent_id: null }); setShowCompose(true); }}>
          <Icon icon="mdi:pencil" width="16" /> Compose
        </button>

        <nav className="messages-nav">
          <button
            className={`msg-nav-item ${activeTab === "inbox" ? "active" : ""}`}
            onClick={() => setActiveTab("inbox")}
          >
            <Icon icon="mdi:inbox" width="18" />
            <span>Inbox</span>
            {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
          </button>
          <button
            className={`msg-nav-item ${activeTab === "sent" ? "active" : ""}`}
            onClick={() => setActiveTab("sent")}
          >
            <Icon icon="mdi:send" width="18" />
            <span>Sent</span>
          </button>
        </nav>
      </aside>

      {/* Message List */}
      <main className="messages-main">
        <div className="messages-toolbar">
          <h2 className="messages-title">{activeTab === "inbox" ? "Inbox" : "Sent"}</h2>
          <div className="msg-search-wrap">
            <Icon icon="mdi:magnify" width="18" className="msg-search-icon" />
            <input
              type="text"
              placeholder="Search messages…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="msg-search-input"
            />
          </div>
        </div>

        <div className="message-list">
          {loading ? (
            <div className="messages-loading"><div className="loading-spinner" /></div>
          ) : messages.length === 0 ? (
            <div className="messages-empty">
              <Icon icon="mdi:email-open-outline" width="48" />
              <p>No messages found</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`message-item ${!msg.read_at && activeTab === "inbox" ? "unread" : ""} ${selectedMsg?.id === msg.id ? "selected" : ""}`}
                onClick={() => openMessage(msg)}
              >
                <div className="msg-avatar">
                  {activeTab === "inbox"
                    ? (msg.sender?.first_name?.[0] ?? "?")
                    : (msg.receiver?.first_name?.[0] ?? "?")}
                </div>
                <div className="msg-info">
                  <div className="msg-top-row">
                    <span className="msg-from">
                      {activeTab === "inbox" ? userName(msg.sender) : userName(msg.receiver)}
                    </span>
                    <span className="msg-date">{formatDate(msg.created_at)}</span>
                  </div>
                  <p className="msg-subject">{msg.subject || "(no subject)"}</p>
                  <p className="msg-preview">{msg.body?.substring(0, 100)}</p>
                </div>
                {!msg.read_at && activeTab === "inbox" && <span className="unread-dot" />}
              </div>
            ))
          )}
        </div>
      </main>

      {/* Message Detail Panel */}
      {showDetail && selectedMsg && (
        <div className="message-detail-overlay" onClick={() => setShowDetail(false)}>
          <div className="message-detail" onClick={(e) => e.stopPropagation()}>
            <div className="detail-header">
              <h3>{selectedMsg.subject || "(no subject)"}</h3>
              <div className="detail-actions">
                <button className="detail-btn reply-btn" onClick={() => handleReply(selectedMsg)} title="Reply">
                  <Icon icon="mdi:reply" width="18" /> Reply
                </button>
                <button className="detail-btn delete-btn" onClick={() => handleDelete(selectedMsg.id)} title="Delete">
                  <Icon icon="mdi:trash-can-outline" width="18" />
                </button>
                <button className="detail-btn close-btn" onClick={() => setShowDetail(false)}>
                  <Icon icon="mdi:close" width="18" />
                </button>
              </div>
            </div>
            <div className="detail-meta">
              {activeTab === "inbox" ? (
                <span>From: <strong>{userName(selectedMsg.sender)}</strong></span>
              ) : (
                <span>To: <strong>{userName(selectedMsg.receiver)}</strong></span>
              )}
              <span className="meta-date">{new Date(selectedMsg.created_at).toLocaleString("en-GB")}</span>
            </div>
            <div className="detail-body">{selectedMsg.body}</div>

            {selectedMsg.replies?.length > 0 && (
              <div className="detail-replies">
                <h4>Replies ({selectedMsg.replies.length})</h4>
                {selectedMsg.replies.map((r) => (
                  <div key={r.id} className="reply-item">
                    <span className="reply-from">{userName(r.sender)}</span>
                    <span className="reply-date">{formatDate(r.created_at)}</span>
                    <p className="reply-body">{r.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compose Modal */}
      {showCompose && (
        <div className="compose-overlay" onClick={() => setShowCompose(false)}>
          <div className="compose-modal" onClick={(e) => e.stopPropagation()}>
            <div className="compose-header">
              <h3>New Message</h3>
              <button className="close-compose" onClick={() => setShowCompose(false)}>
                <Icon icon="mdi:close" width="20" />
              </button>
            </div>
            <form className="compose-form" onSubmit={handleSend}>
              <div className="compose-field">
                <label>To</label>
                <select
                  value={form.receiver_id}
                  onChange={(e) => setForm((f) => ({ ...f, receiver_id: e.target.value }))}
                  required
                >
                  <option value="">Select recipient…</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.first_name} {u.last_name} — {u.position}
                    </option>
                  ))}
                </select>
              </div>
              <div className="compose-field">
                <label>Subject</label>
                <input
                  type="text"
                  placeholder="(optional)"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  maxLength={255}
                />
              </div>
              <div className="compose-field">
                <label>Message</label>
                <textarea
                  rows={6}
                  value={form.body}
                  onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                  placeholder="Write your message…"
                  required
                  maxLength={5000}
                />
              </div>
              <div className="compose-footer">
                <span className="char-count">{form.body.length}/5000</span>
                <button type="submit" className="send-btn" disabled={composing}>
                  {composing ? "Sending…" : (<><Icon icon="mdi:send" width="16" /> Send</>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
