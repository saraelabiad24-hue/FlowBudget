import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../hooks/useauth";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../lib/services";
import type { Notification } from "../../types/database";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    const data = await getNotifications(user.id);
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const handleMarkRead = async (id: string) => {
    const { error } = await markNotificationRead(id);
    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    const { error } = await markAllNotificationsRead(user.id);
    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }
  };

  const typeColors: Record<string, string> = {
    info: "bg-blue-50 border-blue-200",
    warning: "bg-yellow-50 border-yellow-200",
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
  };

  const typeIcons: Record<string, string> = {
    info: "ℹ️",
    warning: "⚠️",
    success: "✅",
    error: "❌",
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-500 text-sm mt-1">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "All caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-4xl mb-4">🔔</p>
            <p className="text-lg font-medium">No notifications</p>
            <p className="text-sm mt-1">
              You're all up to date
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-xl border p-4 transition ${
                  typeColors[notification.type] || "bg-white border-gray-100"
                } ${
                  !notification.is_read
                    ? "ring-2 ring-blue-400 ring-opacity-50"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-xl mt-0.5">
                      {typeIcons[notification.type] || "📢"}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {notification.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {notification.created_at
                          ? new Date(notification.created_at).toLocaleString()
                          : ""}
                      </p>
                    </div>
                  </div>
                  {!notification.is_read && (
                    <button
                      onClick={() => handleMarkRead(notification.id)}
                      className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}