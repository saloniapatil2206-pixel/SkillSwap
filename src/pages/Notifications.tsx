import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserCheck, CalendarCheck, Coins, BookOpen } from "lucide-react";

const notifications = [
  { icon: UserCheck, color: "text-primary", title: "New Match Found!", desc: "Priya M. matches your Guitar learning request", time: "2 min ago" },
  { icon: CalendarCheck, color: "text-green-400", title: "Session Confirmed", desc: "Guitar session with Priya M. on Sat, 10 AM", time: "1 hour ago" },
  { icon: Coins, color: "text-yellow-400", title: "Credits Earned", desc: "You earned 15 credits for teaching JavaScript", time: "Yesterday" },
  { icon: BookOpen, color: "text-accent", title: "New Skill Request", desc: "Alex K. wants to learn React from you", time: "Yesterday" },
  { icon: CalendarCheck, color: "text-green-400", title: "Session Reminder", desc: "Python session with Sam R. tomorrow at 3 PM", time: "2 days ago" },
  { icon: Coins, color: "text-yellow-400", title: "Credits Spent", desc: "10 credits spent on Cooking session", time: "3 days ago" },
];

const Notifications = () => {
  const navigate = useNavigate();

  return (
    <div className="px-4 pt-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-card border border-border"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-heading font-semibold">Notifications</h1>
      </div>

      <div className="space-y-2">
        {notifications.map((n, i) => (
          <div key={i} className="bg-card rounded-xl p-3 border border-border flex gap-3 items-start cursor-pointer hover:border-primary/50 transition-colors">
            <div className={`w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center shrink-0 ${n.color}`}>
              <n.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold">{n.title}</h3>
              <p className="text-xs text-muted-foreground">{n.desc}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
