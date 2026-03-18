import { useState, useEffect } from "react";
import { Shield, X, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

const AddSkill = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [pendingSkills, setPendingSkills] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, bookings: 0, messages: 0 });
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/home"); return; }
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    if (!profile?.is_admin) {
      setIsAdmin(false);
      return;
    }
    setIsAdmin(true);
    fetchAdminData();
  };

  const fetchAdminData = async () => {
    const [
      { data: profiles },
      { count: bookingCount },
      { count: msgCount },
      { data: pending }
    ] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("bookings").select("*", { count: "exact", head: true }),
      supabase.from("messages").select("*", { count: "exact", head: true }),
      supabase.from("pending_skills").select("*").eq("status", "pending"),
    ]);
    setUsers(profiles || []);
    setStats({
      users: profiles?.length || 0,
      bookings: bookingCount || 0,
      messages: msgCount || 0,
    });
    setPendingSkills(pending || []);
  };

  const handleSkillAction = async (id: string, action: "approved" | "rejected") => {
    await supabase.from("pending_skills").update({ status: action }).eq("id", id);
    setPendingSkills((p) => p.filter((s) => s.id !== id));
    showToast(`Skill ${action}!`);
  };

  const handleBanUser = async (userId: string, name: string) => {
    await supabase.from("profiles").update({ is_banned: true }).eq("id", userId);
    setUsers((p) => p.map((u) => u.id === userId ? { ...u, is_banned: true } : u));
    showToast(`${name} has been banned`);
  };

  const handleUnbanUser = async (userId: string, name: string) => {
    await supabase.from("profiles").update({ is_banned: false }).eq("id", userId);
    setUsers((p) => p.map((u) => u.id === userId ? { ...u, is_banned: false } : u));
    showToast(`${name} has been unbanned`);
  };

  // Loading state
  if (isAdmin === null) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">Checking permissions...</p>
      </div>
    </div>
  );

  // Access denied
  if (isAdmin === false) return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
      <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
        <Shield className="w-12 h-12 text-red-400" />
      </div>
      <h2 className="font-heading font-bold text-xl mb-2">Access Denied</h2>
      <p className="text-sm text-muted-foreground mb-1">
        You don't have admin privileges to view this page.
      </p>
      <p className="text-xs text-muted-foreground mb-6">
        Contact the platform admin if you think this is a mistake.
      </p>
      <Button onClick={() => navigate("/home")} className="gradient-bg text-primary-foreground">
        Go Back Home
      </Button>
    </div>
  );

  // Admin panel
  return (
    <div className="pb-8">
      {toast && (
        <div className="fixed top-4 right-4 z-[9999] px-4 py-3 rounded-xl text-sm font-medium bg-green-500/90 text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-lg">Admin Panel</h1>
          <p className="text-xs text-muted-foreground">Platform management</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Users", value: stats.users, icon: "👥" },
          { label: "Bookings", value: stats.bookings, icon: "📅" },
          { label: "Messages", value: stats.messages, icon: "💬" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl p-3 border border-border text-center">
            <p className="text-xl mb-1">{s.icon}</p>
            <p className="font-bold text-xl gradient-text">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending Skills */}
      <div className="mb-6">
        <h3 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
          Pending Skill Approvals
          {pendingSkills.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs border border-amber-500/30">
              {pendingSkills.length}
            </span>
          )}
        </h3>
        {pendingSkills.length === 0 ? (
          <div className="bg-card rounded-xl p-5 border border-border text-center">
            <p className="text-2xl mb-2">✅</p>
            <p className="text-sm text-muted-foreground">No pending skills to review</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingSkills.map((s) => (
              <div key={s.id} className="bg-card rounded-xl p-3 border border-border flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.submitted_by || "Unknown user"}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSkillAction(s.id, "approved")}
                    className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSkillAction(s.id, "rejected")}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Management */}
      <div>
        <h3 className="font-heading font-semibold text-sm mb-3">
          All Users ({users.length})
        </h3>
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="bg-card rounded-xl p-3 border border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {u.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{u.name}</p>
                <p className="text-xs text-muted-foreground truncate">{u.email}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {u.is_admin && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                    Admin
                  </span>
                )}
                {u.is_banned ? (
                  <button
                    onClick={() => handleUnbanUser(u.id, u.name)}
                    className="text-[10px] px-2 py-1 rounded-lg border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors"
                  >
                    Unban
                  </button>
                ) : !u.is_admin && (
                  <button
                    onClick={() => handleBanUser(u.id, u.name)}
                    className="text-[10px] px-2 py-1 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    Ban
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddSkill;