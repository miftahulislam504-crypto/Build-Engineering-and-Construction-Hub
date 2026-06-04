"use client";

import { useEffect, useState } from "react";
import { Bell, Package, Wrench, FileText, Tag, CheckCheck } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  listenToNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/firestore";
import { timeAgo, cn } from "@/lib/utils";
import type { Notification } from "@/lib/types";

const TYPE_ICON: Record<string, any> = {
  order:     Package,
  service:   Wrench,
  quotation: FileText,
  promo:     Tag,
  system:    Bell,
};

const TYPE_COLOR: Record<string, string> = {
  order:     "bg-blue-100   text-blue-600",
  service:   "bg-purple-100 text-purple-600",
  quotation: "bg-green-100  text-green-600",
  promo:     "bg-orange-100 text-orange-600",
  system:    "bg-gray-100   text-gray-600",
};

export default function NotificationsPage() {
  const user = useAuthStore((s) => s.user);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const unsub = listenToNotifications(user.id, (data) => {
      setNotifications(data as Notification[]);
      setLoading(false);
    });
    return () => unsub();
  }, [user?.id]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  async function handleRead(notif: Notification) {
    if (notif.isRead || !user?.id) return;
    await markNotificationRead(user.id, notif.id);
  }

  async function handleMarkAll() {
    if (!user?.id) return;
    await markAllNotificationsRead(user.id);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-dark-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-dark-400 mt-0.5">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            className="flex items-center gap-1.5 text-sm text-primary-600
                       hover:text-primary-700 font-medium transition-colors"
          >
            <CheckCheck size={16} />
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map((i) => (
            <div key={i} className="card p-4 flex gap-3">
              <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card p-14 text-center">
          <Bell size={48} className="text-dark-200 mx-auto mb-4" />
          <p className="font-medium text-dark-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const Icon  = TYPE_ICON[notif.type]  || Bell;
            const color = TYPE_COLOR[notif.type] || TYPE_COLOR.system;
            return (
              <div
                key={notif.id}
                onClick={() => handleRead(notif)}
                className={cn(
                  "card p-4 flex gap-3 cursor-pointer",
                  "hover:shadow-card-hover transition-all duration-150",
                  !notif.isRead && "border-primary-200 bg-primary-50/40"
                )}
              >
                {/* Icon */}
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                  color
                )}>
                  <Icon size={18} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn(
                      "text-sm leading-snug",
                      notif.isRead ? "text-dark-600" : "font-semibold text-dark-800"
                    )}>
                      {notif.title}
                    </p>
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary-600 flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-dark-400 mt-0.5 line-clamp-2">
                    {notif.message}
                  </p>
                  <p className="text-xs text-dark-300 mt-1">
                    {notif.createdAt
                      ? timeAgo(
                          (notif.createdAt as any)?.toDate?.()
                            ? (notif.createdAt as any).toDate()
                            : notif.createdAt
                        )
                      : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
