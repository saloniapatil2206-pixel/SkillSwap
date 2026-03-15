import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Home, Search, MessageSquare, User, Wallet, Menu, X, Bell, Shield, LogOut, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

const navItems = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: Search, label: "Explore", path: "/matchmaking" },
  { icon: BookOpen, label: "Bookings", path: "/booking" },
  { icon: MessageSquare, label: "Chat", path: "/chat" },
  { icon: Bell, label: "Alerts", path: "/notifications" },
  { icon: Wallet, label: "Wallet", path: "/wallet" },
  { icon: User, label: "Profile", path: "/profile" },
  { icon: Shield, label: "Admin", path: "/add-skill" },
];

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const fetchUnread = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);
      setUnreadNotifs(count || 0);
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-5 border-b border-border",
        sidebarCollapsed && !isMobile ? "justify-center px-2" : ""
      )}>
        {(!sidebarCollapsed || isMobile) && (
          <h1 className="text-lg font-heading font-bold gradient-text">SkillSwap</h1>
        )}
        {!isMobile && (
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="ml-auto p-1.5 rounded-lg hover:bg-accent/10 text-muted-foreground transition-colors"
          >
            {sidebarCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>
        )}
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto p-1.5 rounded-lg hover:bg-accent/10 text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); if (isMobile) setSidebarOpen(false); }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                sidebarCollapsed && !isMobile ? "justify-center px-2" : "",
                isActive
                  ? "gradient-bg text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
              )}
              title={sidebarCollapsed && !isMobile ? item.label : undefined}
            >
              {/* Icon with notification badge */}
              <div className="relative flex-shrink-0">
                <item.icon className="w-5 h-5" />
                {item.path === "/notifications" && unreadNotifs > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center font-bold">
                    {unreadNotifs > 9 ? "9+" : unreadNotifs}
                  </span>
                )}
              </div>
              {/* Label */}
              {(!sidebarCollapsed || isMobile) && (
                <span className="truncate">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 py-4 border-t border-border">
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all",
            sidebarCollapsed && !isMobile ? "justify-center px-2" : ""
          )}
          title={sidebarCollapsed && !isMobile ? "Logout" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {(!sidebarCollapsed || isMobile) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* DESKTOP SIDEBAR */}
      {!isMobile && (
        <aside className={cn(
          "fixed left-0 top-0 h-full bg-card border-r border-border z-50 transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-56"
        )}>
          <SidebarContent />
        </aside>
      )}

      {/* MOBILE OVERLAY */}
      {isMobile && sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-50 transition-transform duration-300">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* MOBILE TOP BAR */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 h-14 bg-card border-b border-border z-30 flex items-center px-4 gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-accent/10 text-muted-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-heading font-bold gradient-text">SkillSwap</h1>
          {/* Mobile notification badge */}
          {unreadNotifs > 0 && (
            <button
              onClick={() => navigate("/notifications")}
              className="ml-auto relative p-2"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center font-bold">
                {unreadNotifs > 9 ? "9+" : unreadNotifs}
              </span>
            </button>
          )}
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className={cn(
        "flex-1 overflow-y-auto",
        !isMobile && (sidebarCollapsed ? "ml-16" : "ml-56"),
        isMobile && "mt-14"
      )}>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;