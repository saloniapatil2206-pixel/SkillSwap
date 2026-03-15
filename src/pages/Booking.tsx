import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Video, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const dates = [
  { day: "Mon", date: 20 }, { day: "Tue", date: 21 }, { day: "Wed", date: 22 },
  { day: "Thu", date: 23 }, { day: "Fri", date: 24 }, { day: "Sat", date: 25 }, { day: "Sun", date: 26 },
];

const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "7:00 PM"];

const Booking = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(21);
  const [selectedTime, setSelectedTime] = useState("");
  const [mode, setMode] = useState<"online" | "offline">("online");

  return (
    <div className="px-4 pt-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-card border border-border"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-heading font-semibold">Book Session</h1>
      </div>

      {/* Teacher Info */}
      <div className="bg-card rounded-xl p-4 border border-border flex items-center gap-3 mb-6">
        <Avatar className="w-12 h-12"><AvatarFallback className="gradient-bg text-primary-foreground font-semibold">PM</AvatarFallback></Avatar>
        <div>
          <h3 className="font-semibold text-sm">Priya M.</h3>
          <p className="text-xs text-muted-foreground">Guitar · ⭐ 4.8</p>
        </div>
        <Badge className="ml-auto gradient-bg text-xs">10 Credits</Badge>
      </div>

      {/* Mode */}
      <div className="mb-5">
        <h3 className="font-heading font-semibold text-sm mb-3">Session Mode</h3>
        <div className="flex gap-2">
          {([{ key: "online", icon: Video, label: "Online" }, { key: "offline", icon: MapPin, label: "Offline" }] as const).map((m) => (
            <button key={m.key} onClick={() => setMode(m.key as "online" | "offline")} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border transition-colors ${mode === m.key ? "gradient-bg text-primary-foreground border-transparent" : "border-border text-muted-foreground"}`}>
              <m.icon className="w-4 h-4" />{m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date */}
      <div className="mb-5">
        <h3 className="font-heading font-semibold text-sm mb-3">Select Date</h3>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {dates.map((d) => (
            <button key={d.date} onClick={() => setSelectedDate(d.date)} className={`min-w-[52px] py-3 rounded-xl text-center transition-colors ${selectedDate === d.date ? "gradient-bg text-primary-foreground" : "bg-card border border-border"}`}>
              <p className="text-[10px]">{d.day}</p>
              <p className="text-lg font-bold">{d.date}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Time */}
      <div className="mb-6">
        <h3 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-primary" />Select Time</h3>
        <div className="grid grid-cols-4 gap-2">
          {timeSlots.map((t) => (
            <button key={t} onClick={() => setSelectedTime(t)} className={`py-2.5 rounded-lg text-xs font-medium border transition-colors ${selectedTime === t ? "gradient-bg text-primary-foreground border-transparent" : "border-border text-muted-foreground"}`}>{t}</button>
          ))}
        </div>
      </div>

      <Button className="w-full gradient-bg text-primary-foreground h-12 text-base font-semibold" onClick={() => { navigate("/notifications"); }}>
        Book Session · 10 Credits
      </Button>
    </div>
  );
};

export default Booking;
