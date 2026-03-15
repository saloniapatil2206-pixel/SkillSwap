import { useState, useEffect } from "react";
import { Clock, Video, X, Calendar, RefreshCw, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

const TIME_SLOTS = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "7:00 PM"];
const today = new Date().toISOString().split("T")[0];

const STATUS_COLORS: Record<string, string> = {
  Confirmed: "bg-green-500/20 text-green-400 border-green-500/30",
  Pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Completed: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  Cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};
const STATUS_BORDER: Record<string, string> = {
  Confirmed: "border-l-green-500",
  Pending: "border-l-amber-500",
  Completed: "border-l-indigo-500",
  Cancelled: "border-l-red-500",
};

const Booking = () => {
  const [userId, setUserId] = useState("");
  const [myBookings, setMyBookings] = useState<any[]>([]); // as learner
  const [incomingBookings, setIncomingBookings] = useState<any[]>([]); // as mentor
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"my" | "incoming">("my");
  const [filter, setFilter] = useState("All");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [rescheduleMode, setRescheduleMode] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newSlot, setNewSlot] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [jitsiOpen, setJitsiOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  const showToast = (message: string, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) { setUserId(user.id); fetchAll(user.id); }
    });
  }, []);

  const fetchAll = async (uid: string) => {
    setLoading(true);
    const [{ data: mine }, { data: incoming }] = await Promise.all([
      supabase.from("bookings").select("*").eq("learner_id", uid).order("created_at", { ascending: false }),
      supabase.from("bookings").select("*").eq("mentor_id", uid).order("created_at", { ascending: false }),
    ]);
    setMyBookings(mine || []);
    setIncomingBookings(incoming || []);
    setLoading(false);
  };

  // Send notification helper
  const sendNotification = async (userId: string, title: string, message: string, type: string, bookingId: string) => {
    await supabase.from("notifications").insert({ user_id: userId, title, message, type, booking_id: bookingId });
  };

  // MENTOR: Accept booking
  const handleAccept = async (b: any) => {
    setActionLoading(true);
    const { error } = await supabase.from("bookings").update({ status: "Confirmed" }).eq("id", b.id);
    if (!error) {
      setIncomingBookings((p) => p.map((x) => x.id === b.id ? { ...x, status: "Confirmed" } : x));
      if (selectedBooking?.id === b.id) setSelectedBooking((p: any) => ({ ...p, status: "Confirmed" }));
      // Notify learner
      await sendNotification(
        b.learner_id,
        "✅ Session Confirmed!",
        `Your ${b.skill} session with ${b.mentor_name} on ${b.date} at ${b.time} is confirmed.`,
        "success",
        b.id
      );
      showToast("Booking accepted!");
    }
    setActionLoading(false);
  };

  // MENTOR: Reject booking
  const handleReject = async (b: any) => {
    setActionLoading(true);
    const { error } = await supabase.from("bookings").update({ status: "Cancelled" }).eq("id", b.id);
    if (!error) {
      setIncomingBookings((p) => p.map((x) => x.id === b.id ? { ...x, status: "Cancelled" } : x));
      if (selectedBooking?.id === b.id) setSelectedBooking((p: any) => ({ ...p, status: "Cancelled" }));
      // Notify learner
      await sendNotification(
        b.learner_id,
        "❌ Session Rejected",
        `Your ${b.skill} session request with ${b.mentor_name} was declined.`,
        "error",
        b.id
      );
      showToast("Booking rejected");
    }
    setActionLoading(false);
  };

  // LEARNER: Cancel booking
  const handleCancel = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    const { error } = await supabase.from("bookings").update({ status: "Cancelled" }).eq("id", selectedBooking.id);
    if (!error) {
      setMyBookings((p) => p.map((b) => b.id === selectedBooking.id ? { ...b, status: "Cancelled" } : b));
      setSelectedBooking((p: any) => ({ ...p, status: "Cancelled" }));
      setCancelConfirm(false);
      showToast("Booking cancelled");
    }
    setActionLoading(false);
  };

  // LEARNER: Reschedule
  const handleReschedule = async () => {
    if (!newDate || !newSlot) { showToast("Select date and time", "error"); return; }
    setActionLoading(true);
    const { error } = await supabase.from("bookings")
      .update({ date: newDate, time: newSlot, status: "Pending" })
      .eq("id", selectedBooking.id);
    if (!error) {
      setMyBookings((p) => p.map((b) => b.id === selectedBooking.id ? { ...b, date: newDate, time: newSlot, status: "Pending" } : b));
      setSelectedBooking((p: any) => ({ ...p, date: newDate, time: newSlot, status: "Pending" }));
      setRescheduleMode(false);
      setNewDate(""); setNewSlot("");
      showToast("Session rescheduled!");
    }
    setActionLoading(false);
  };

  const filters = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];
  const currentList = activeTab === "my" ? myBookings : incomingBookings;
  const filtered = filter === "All" ? currentList : currentList.filter((b) => b.status === filter);
  const pendingIncoming = incomingBookings.filter((b) => b.status === "Pending").length;

  return (
    <div className="pb-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[9999] px-4 py-3 rounded-xl text-sm font-medium shadow-lg ${toast.type === "error" ? "bg-red-500/90" : "bg-green-500/90"
          } text-white`}>
          {toast.message}
        </div>
      )}

      <h1 className="font-heading font-semibold text-lg mb-4">📅 Bookings</h1>

      {/* Tab: My Bookings vs Incoming Requests */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setActiveTab("my"); setFilter("All"); setSelectedBooking(null); }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${activeTab === "my"
            ? "gradient-bg text-primary-foreground border-transparent"
            : "border-border text-muted-foreground hover:border-primary"
            }`}
        >
          My Bookings
          <span className="ml-1.5 opacity-70">({myBookings.length})</span>
        </button>
        <button
          onClick={() => { setActiveTab("incoming"); setFilter("All"); setSelectedBooking(null); }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors relative ${activeTab === "incoming"
            ? "gradient-bg text-primary-foreground border-transparent"
            : "border-border text-muted-foreground hover:border-primary"
            }`}
        >
          Incoming Requests
          {pendingIncoming > 0 && (
            <span className="ml-1.5 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {pendingIncoming}
            </span>
          )}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${filter === f
              ? "gradient-bg text-primary-foreground border-transparent"
              : "border-border text-muted-foreground hover:border-primary"
              }`}
          >
            {f}
            {f !== "All" && (
              <span className="ml-1 opacity-60">
                ({currentList.filter((b) => b.status === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-card rounded-xl border border-border animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="font-semibold text-muted-foreground">
            No {filter !== "All" ? filter.toLowerCase() : ""} {activeTab === "incoming" ? "requests" : "bookings"}
          </p>
          {activeTab === "incoming" && (
            <p className="text-xs text-muted-foreground mt-1">
              When someone books a session with you, it will appear here
            </p>
          )}
        </div>
      )}

      {/* Booking Cards */}
      <div className="space-y-3">
        {filtered.map((b) => (
          <div
            key={b.id}
            className={`bg-card rounded-xl p-4 border border-l-4 ${STATUS_BORDER[b.status] || "border-l-border"} border-border`}
          >
            <button
              className="w-full text-left"
              onClick={() => {
                setSelectedBooking(b);
                setRescheduleMode(false);
                setCancelConfirm(false);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="gradient-bg text-primary-foreground text-xs font-bold">
                      {b.mentor_avatar || b.mentor_name?.[0] || "M"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">
                      {activeTab === "incoming" ? b.learner_name || "A user" : b.mentor_name}
                    </p>
                    <p className="text-xs text-primary">{b.skill}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {b.date} · {b.time} · {b.mode === "Online" ? "🌐" : "📍"} {b.mode}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={`text-xs border ${STATUS_COLORS[b.status] || ""}`}>
                    {b.status}
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </button>

            {/* Inline Accept/Reject for incoming pending */}
            {activeTab === "incoming" && b.status === "Pending" && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                <Button
                  size="sm"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => handleAccept(b)}
                  disabled={actionLoading}
                >
                  <Check className="w-4 h-4 mr-1" /> Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                  onClick={() => handleReject(b)}
                  disabled={actionLoading}
                >
                  <X className="w-4 h-4 mr-1" /> Reject
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* BOOKING DETAIL DRAWER */}
      {selectedBooking && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setSelectedBooking(null)}
          />
          <div
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-card border-l border-border z-50 overflow-y-auto"
            style={{ animation: "slideInRight 0.3s ease" }}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading font-bold text-base">Session Details</h2>
                <button onClick={() => setSelectedBooking(null)} className="p-2 rounded-full hover:bg-accent/10">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Info */}
              <div className="flex items-center gap-3 bg-background rounded-xl p-3 mb-5">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="gradient-bg text-primary-foreground font-bold">
                    {selectedBooking.mentor_avatar || selectedBooking.mentor_name?.[0] || "M"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold">
                    {activeTab === "incoming"
                      ? selectedBooking.learner_name || "A user"
                      : selectedBooking.mentor_name}
                  </p>
                  <p className="text-sm text-primary">{selectedBooking.skill}</p>
                </div>
                <Badge className={`ml-auto text-xs border ${STATUS_COLORS[selectedBooking.status] || ""}`}>
                  {selectedBooking.status}
                </Badge>
              </div>

              {/* Detail Grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: "Date", value: selectedBooking.date, icon: "📅" },
                  { label: "Time", value: selectedBooking.time, icon: "🕐" },
                  { label: "Mode", value: selectedBooking.mode, icon: selectedBooking.mode === "Online" ? "🌐" : "📍" },
                  { label: "Duration", value: selectedBooking.duration || "60 min", icon: "⏱" },
                ].map((info) => (
                  <div key={info.label} className="bg-background rounded-xl p-3">
                    <p className="text-xs text-muted-foreground mb-1">{info.icon} {info.label}</p>
                    <p className="text-sm font-semibold">{info.value}</p>
                  </div>
                ))}
              </div>

              {selectedBooking.notes && (
                <div className="bg-background rounded-xl p-3 mb-5">
                  <p className="text-xs text-muted-foreground mb-1">📝 Notes</p>
                  <p className="text-sm">{selectedBooking.notes}</p>
                </div>
              )}

              <div className="h-px bg-border mb-5" />

              {/* Actions */}
              <div className="space-y-3">
                {/* Mentor actions */}
                {activeTab === "incoming" && selectedBooking.status === "Pending" && (
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white h-11"
                      onClick={() => handleAccept(selectedBooking)}
                      disabled={actionLoading}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {actionLoading ? "..." : "Accept"}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-11 border-red-500/30 text-red-400 hover:bg-red-500/10"
                      onClick={() => handleReject(selectedBooking)}
                      disabled={actionLoading}
                    >
                      <X className="w-4 h-4 mr-2" />
                      {actionLoading ? "..." : "Reject"}
                    </Button>
                  </div>
                )}

                {/* Learner: Join session */}
                {activeTab === "my" && selectedBooking.status === "Confirmed" && selectedBooking.mode === "Online" && (
                  <Button
                    className="w-full gradient-bg text-primary-foreground h-11"
                    onClick={() => setJitsiOpen(true)}
                  >
                    <Video className="w-4 h-4 mr-2" /> Join Session
                  </Button>
                )}

                {/* Learner: Reschedule */}
                {activeTab === "my" && !["Completed", "Cancelled"].includes(selectedBooking.status) && (
                  <Button
                    variant="outline"
                    className="w-full h-11"
                    onClick={() => { setRescheduleMode(!rescheduleMode); setCancelConfirm(false); }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" /> Reschedule
                  </Button>
                )}

                {rescheduleMode && (
                  <div className="bg-background rounded-xl p-4 space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">New Date</p>
                      <input
                        type="date"
                        min={today}
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">New Time Slot</p>
                      <div className="grid grid-cols-4 gap-1.5">
                        {TIME_SLOTS.map((t) => (
                          <button
                            key={t}
                            onClick={() => setNewSlot(t)}
                            className={`text-xs py-2 rounded-lg border transition-colors ${newSlot === t
                              ? "gradient-bg text-primary-foreground border-transparent"
                              : "border-border text-muted-foreground"
                              }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Button
                      className="w-full gradient-bg text-primary-foreground"
                      onClick={handleReschedule}
                      disabled={actionLoading}
                    >
                      {actionLoading ? "Saving..." : "Confirm Reschedule"}
                    </Button>
                  </div>
                )}

                {/* Learner: Cancel */}
                {activeTab === "my" && !["Completed", "Cancelled"].includes(selectedBooking.status) && (
                  <Button
                    variant="outline"
                    className="w-full h-11 border-red-500/30 text-red-400 hover:bg-red-500/10"
                    onClick={() => { setCancelConfirm(!cancelConfirm); setRescheduleMode(false); }}
                  >
                    <X className="w-4 h-4 mr-2" /> Cancel Session
                  </Button>
                )}

                {cancelConfirm && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <p className="text-sm font-semibold text-red-400 mb-3">Are you sure?</p>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => setCancelConfirm(false)}>
                        No, Keep It
                      </Button>
                      <Button
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                        onClick={handleCancel}
                        disabled={actionLoading}
                      >
                        {actionLoading ? "Cancelling..." : "Yes, Cancel"}
                      </Button>
                    </div>
                  </div>
                )}

                {selectedBooking.status === "Completed" && (
                  <Button variant="outline" className="w-full h-11">
                    ⭐ Leave a Review
                  </Button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Jitsi Video */}
      {jitsiOpen && selectedBooking?.jitsi_room && (
        <div className="fixed inset-0 bg-black z-[60] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <p className="font-semibold">Session with {selectedBooking.mentor_name}</p>
            <button onClick={() => setJitsiOpen(false)} className="p-2 rounded-full hover:bg-accent/10">
              <X className="w-5 h-5" />
            </button>
          </div>
          <iframe
            src={`https://meet.jit.si/${selectedBooking.jitsi_room}`}
            className="flex-1 w-full"
            allow="camera; microphone; fullscreen; display-capture"
          />
        </div>
      )}
    </div>
  );
};

export default Booking;