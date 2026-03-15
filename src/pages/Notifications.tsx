import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, Calendar, Star, MessageSquare, UserCheck, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  booking_id: string | null;
  created_at: string;
};

const TYPE_ICONS: Record<string, any> = {
  success: CheckCheck,
  error: X,
  booking: Calendar,
  review: Star,
  message: MessageSquare,
  match: UserCheck,
  info: Bell,
};

const TYPE_COLORS: Record<string, string> = {
  success: "bg-green-500/20 text-green-400",
  error: "bg-red-500/20 text-red-400",
  booking: "bg-blue-500/20 text-blue-400",
  review: "bg-yellow-500/20 text-yellow-400",
  message: "bg-purple-500/20 text-purple-400",
  match: "bg-primary/20 text-primary",
  info: "bg-card text-muted-foreground",
};

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) { setUserId(user.id); fetchNotifications(user.id); }
    });
  }, []);

  const fetchNotifications = async (uid: string) => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    if (data) setNotifications(data);
    setLoading(false);

    // Mark all as read
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", uid)
      .eq("read", false);
  };

  const markAllRead = async () => {
    await supabase.from("notifications").update({ read: true }).eq("user_id", userId);
    setNotifications((p) => p.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications((p) => p.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="pb-8">
        <div className="h-8 w-40 bg-card rounded-lg animate-pulse mb-5" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-card rounded-xl border border-border animate-pulse mb-2" />
        ))}
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-heading font-semibold text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" /> Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <Check className="w-3 h-3" /> Mark all read
          </button>
        )}
      </div>

      {/* Empty State */}
      {notifications.length === 0 && (
        <div className="text-center py-16">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="font-semibold text-muted-foreground">No notifications yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            You'll be notified about bookings, messages, and more
          </p>
        </div>
      )}

      {/* Notification List */}
      <div className="space-y-2">
        {notifications.map((n) => {
          const Icon = TYPE_ICONS[n.type] || Bell;
          const colorClass = TYPE_COLORS[n.type] || TYPE_COLORS.info;
          return (
            <div
              key={n.id}
              className={`bg-card rounded-xl p-3 border transition-all flex gap-3 items-start ${!n.read ? "border-primary/30 bg-primary/5" : "border-border"
                }`}
            >
              {/* Icon */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                <Icon className="w-4 h-4" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`text-sm font-semibold ${!n.read ? "text-foreground" : "text-foreground/80"}`}>
                    {n.title}
                  </h3>
                  <button
                    onClick={() => deleteNotification(n.id)}
                    className="text-muted-foreground hover:text-foreground flex-shrink-0 mt-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {n.message}
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                  {formatTime(n.created_at)}
                </p>
              </div>

              {/* Unread dot */}
              {!n.read && (
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Notifications;