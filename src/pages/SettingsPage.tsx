import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Shield, Globe, Trash2, LogOut, ChevronRight, User, Bell, HelpCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

const settingsGroups = [
  {
    title: "Account",
    items: [
      { icon: User, label: "Edit Profile", path: "/profile" },
      { icon: Lock, label: "Change Password" },
      { icon: Bell, label: "Notification Preferences" },
    ],
  },
  {
    title: "Privacy",
    items: [
      { icon: Shield, label: "Privacy Settings", toggle: true },
      { icon: Globe, label: "Language", value: "English" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: HelpCircle, label: "Help & Support" },
    ],
  },
];

const SettingsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="px-4 pt-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-card border border-border"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-heading font-semibold">Settings</h1>
      </div>

      {settingsGroups.map((group) => (
        <div key={group.title} className="mb-6">
          <h3 className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">{group.title}</h3>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {group.items.map((item, i) => (
              <div key={item.label}>
                <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary/50 transition-colors" onClick={() => item.path && navigate(item.path)}>
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="flex-1 text-sm">{item.label}</span>
                  {item.toggle ? <Switch /> : item.value ? <span className="text-xs text-muted-foreground">{item.value}</span> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </button>
                {i < group.items.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="space-y-2 mb-8">
        <button className="w-full flex items-center gap-3 px-4 py-3.5 bg-card rounded-xl border border-border text-red-400 hover:bg-red-500/10 transition-colors" onClick={() => navigate("/")}>
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Log Out</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3.5 bg-card rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors">
          <Trash2 className="w-4 h-4" />
          <span className="text-sm font-medium">Delete Account</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
