import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Paperclip, Mic, Phone, Video } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

const messages = [
  { id: 1, from: "them", text: "Hey! I saw you want to learn Guitar. I can help!", time: "10:30 AM" },
  { id: 2, from: "me", text: "That's great! I can teach you Python in exchange 🎉", time: "10:31 AM" },
  { id: 3, from: "them", text: "Perfect! When are you free this week?", time: "10:32 AM" },
  { id: 4, from: "me", text: "How about Saturday at 10 AM?", time: "10:33 AM" },
  { id: 5, from: "them", text: "Works for me! Let me send you some resources.", time: "10:35 AM" },
  { id: 6, from: "them", text: "📎 guitar-basics.pdf", time: "10:35 AM" },
];

const conversations = [
  { name: "Priya M.", last: "Works for me! Let me send...", time: "10:35 AM", unread: 2, avatar: "PM" },
  { name: "Alex K.", last: "Thanks for the session!", time: "Yesterday", unread: 0, avatar: "AK" },
  { name: "Sam R.", last: "Can we reschedule?", time: "Feb 17", unread: 1, avatar: "SR" },
];

const Chat = () => {
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  if (!activeChat) {
    return (
      <div className="px-4 pt-4">
        <h1 className="font-heading font-semibold text-lg mb-4">Messages</h1>
        <div className="space-y-2">
          {conversations.map((c) => (
            <button key={c.name} onClick={() => setActiveChat(c.name)} className="w-full bg-card rounded-xl p-3 border border-border flex items-center gap-3 text-left hover:border-primary/50 transition-colors">
              <Avatar className="w-12 h-12"><AvatarFallback className="gradient-bg text-primary-foreground font-semibold text-sm">{c.avatar}</AvatarFallback></Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between"><h3 className="font-semibold text-sm">{c.name}</h3><span className="text-[10px] text-muted-foreground">{c.time}</span></div>
                <p className="text-xs text-muted-foreground truncate">{c.last}</p>
              </div>
              {c.unread > 0 && <span className="w-5 h-5 rounded-full gradient-bg text-primary-foreground text-[10px] flex items-center justify-center font-bold">{c.unread}</span>}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button onClick={() => setActiveChat(null)} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <Avatar className="w-9 h-9"><AvatarFallback className="gradient-bg text-primary-foreground text-xs font-semibold">PM</AvatarFallback></Avatar>
        <div className="flex-1"><h3 className="font-semibold text-sm">Priya M.</h3><p className="text-[10px] text-green-400">Online</p></div>
        <button className="p-2 text-muted-foreground"><Phone className="w-4 h-4" /></button>
        <button className="p-2 text-muted-foreground"><Video className="w-4 h-4" /></button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${m.from === "me" ? "gradient-bg text-primary-foreground rounded-br-sm" : "bg-card border border-border rounded-bl-sm"}`}>
              <p className="text-sm">{m.text}</p>
              <p className={`text-[10px] mt-1 ${m.from === "me" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{m.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border flex items-center gap-2">
        <button className="p-2 text-muted-foreground"><Paperclip className="w-5 h-5" /></button>
        <button className="p-2 text-muted-foreground"><Mic className="w-5 h-5" /></button>
        <Input placeholder="Type a message..." className="flex-1 bg-card h-10" value={message} onChange={(e) => setMessage(e.target.value)} />
        <button className="p-2.5 rounded-full gradient-bg text-primary-foreground"><Send className="w-4 h-4" /></button>
      </div>
    </div>
  );
};

export default Chat;
