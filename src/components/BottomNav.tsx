import { useLocation, useNavigate } from "react-router-dom";
import { Home, Search, MessageSquare, User, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: Search, label: "Explore", path: "/matchmaking" },
  { icon: Wallet, label: "Wallet", path: "/wallet" },
  { icon: MessageSquare, label: "Chat", path: "/chat" },
  { icon: User, label: "Profile", path: "/profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
