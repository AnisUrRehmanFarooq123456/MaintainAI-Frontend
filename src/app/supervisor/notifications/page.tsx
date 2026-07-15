"use client";

import { useEffect, useState } from "react";
import { FaBell, FaCheckCircle } from "react-icons/fa";
import { apiFetch } from "../../../utils/api";
import "../../admin/notifications/notifications.css";

type Notification = {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function SupervisorNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await apiFetch("/api/notifications/mine");
      setNotifications(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleMarkRead = async (id: string) => {
    await apiFetch(`/api/notifications/read/${id}`, { method: "PUT" });
    load();
  };

  return (
    <div className="notifications-page">
      <h1 className="notifications-title">Notifications</h1>
      <p className="notifications-subtitle">Recent activity relevant to you</p>

      {loading && <p className="notifications-loading">Loading...</p>}

      {!loading && (
        <div className="notifications-list">
          {notifications.length === 0 && (
            <p className="notifications-empty">No notifications yet</p>
          )}
          {notifications.map((n) => (
            <div
              className={`notification-item ${n.isRead ? "" : "notification-unread"}`}
              key={n._id}
            >
              <div className="notification-icon">
                <FaBell />
              </div>
              <div className="notification-body">
                <p className="notification-title">{n.title}</p>
                <p className="notification-message">{n.message}</p>
                <p className="notification-time">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {!n.isRead && (
                <button
                  className="notification-read-btn"
                  onClick={() => handleMarkRead(n._id)}
                >
                  <FaCheckCircle />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
