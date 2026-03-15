import { useState, useEffect, useRef } from "react";
import { Send, Phone, Video, ArrowLeft, Check, CheckCheck, Search, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  teach_skills: { name: string; level: string }[];
  learn_skills: string[];
};

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  delivered: boolean;
  read: boolean;
  created_at: string;
  conversation_id: string;
};

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

const getConvId = (id1: string, id2: string) =>
  [id1, id2].sort().join("_");

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const Chat = () => {
  const [userId, setUserId] = useState<string>("");
  const [activeContact, setActiveContact] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [contacts, setContacts] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [lastMessages, setLastMessages] = useState<Record<string, Message>>({});
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef<any>(null);

  const showToast = (msg: string, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Get current user + load contacts
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        loadContacts(user.id);
      }
    });
  }, []);

  // Load contacts = all users except self who have exchanged messages
  const loadContacts = async (uid: string) => {
    // Get all profiles except current user
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", uid);

    if (!profiles) return;
    setContacts(profiles);

    // Get last messages for each
    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${uid},receiver_id.eq.${uid}`)
      .order("created_at", { ascending: false });

    if (!msgs) return;

    const lastMsgs: Record<string, Message> = {};
    const unread: Record<string, number> = {};

    profiles.forEach((p) => {
      const convId = getConvId(uid, p.id);
      const convMsgs = msgs.filter((m) => m.conversation_id === convId);
      if (convMsgs.length > 0) {
        lastMsgs[p.id] = convMsgs[0];
        unread[p.id] = convMsgs.filter(
          (m) => m.receiver_id === uid && !m.read
        ).length;
      }
    });

    setLastMessages(lastMsgs);
    setUnreadCounts(unread);
  };

  // Search users
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", userId)
        .ilike("name", `%${searchQuery}%`);
      setSearchResults(data || []);
      setSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, userId]);

  // Open chat with a contact
  const openChat = async (contact: Profile) => {
    setActiveContact(contact);
    setMessages([]);
    setInput("");
    setSearchQuery("");
    setSearchResults([]);

    const convId = getConvId(userId, contact.id);

    // Fetch existing messages
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (data) setMessages(data);

    // Mark received messages as read
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("conversation_id", convId)
      .eq("receiver_id", userId);

    setUnreadCounts((p) => ({ ...p, [contact.id]: 0 }));

    // Remove old subscription
    if (channelRef.current) supabase.removeChannel(channelRef.current);

    // Subscribe to new messages in this conversation
    channelRef.current = supabase
      .channel(`chat_${convId}_${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${convId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.find((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          // Mark as read if we are the receiver
          if (newMsg.receiver_id === userId) {
            await supabase
              .from("messages")
              .update({ read: true })
              .eq("id", newMsg.id);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${convId}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === payload.new.id ? (payload.new as Message) : m
            )
          );
        }
      )
      .subscribe();

    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, []);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || !activeContact || sending || !userId) return;
    const text = input.trim();
    setInput("");
    setSending(true);

    const convId = getConvId(userId, activeContact.id);

    const { error } = await supabase.from("messages").insert({
      sender_id: userId,
      receiver_id: activeContact.id,
      text,
      delivered: true,
      read: false,
      conversation_id: convId,
    });

    setSending(false);

    if (error) {
      showToast("Failed to send message");
      setInput(text);
      return;
    }

    loadContacts(userId);
  };

  // Group messages by date
  const groupedMessages = messages.reduce(
    (groups: Record<string, Message[]>, msg) => {
      const date = formatDate(msg.created_at);
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
      return groups;
    },
    {}
  );

  // Sort contacts: those with messages first
  const sortedContacts = [...contacts].sort((a, b) => {
    const aHasMsg = !!lastMessages[a.id];
    const bHasMsg = !!lastMessages[b.id];
    if (aHasMsg && !bHasMsg) return -1;
    if (!aHasMsg && bHasMsg) return 1;
    return 0;
  });

  const displayContacts = searchQuery ? searchResults : sortedContacts;

  // ─── CONVERSATION LIST ────────────────────────────────────────
  if (!activeContact) {
    return (
      <div className="pb-8">
        {toast && (
          <div className={`fixed top-4 right-4 z-[9999] px-4 py-3 rounded-xl text-sm font-medium shadow-lg ${toast.type === "error" ? "bg-red-500/90" : "bg-green-500/90"} text-white`}>
            {toast.msg}
          </div>
        )}

        <h1 className="font-heading font-semibold text-lg mb-4">💬 Messages</h1>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Searching indicator */}
        {searching && (
          <p className="text-xs text-muted-foreground text-center py-4 animate-pulse">
            Searching...
          </p>
        )}

        {/* No results */}
        {searchQuery && !searching && searchResults.length === 0 && (
          <div className="text-center py-10">
            <p className="text-4xl mb-2">🔍</p>
            <p className="text-sm font-semibold text-muted-foreground">No users found</p>
            <p className="text-xs text-muted-foreground mt-1">Try a different name</p>
          </div>
        )}

        {/* Contacts List */}
        {!searching && (
          <div className="space-y-2">
            {displayContacts.length === 0 && !searchQuery && (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">💬</p>
                <p className="font-semibold text-muted-foreground">No users yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Search for users to start chatting
                </p>
              </div>
            )}
            {displayContacts.map((c) => {
              const last = lastMessages[c.id];
              const unread = unreadCounts[c.id] || 0;
              const primarySkill = c.teach_skills?.[0]?.name || "SkillSwap user";
              return (
                <button
                  key={c.id}
                  onClick={() => openChat(c)}
                  className="w-full bg-card rounded-xl p-3 border border-border flex items-center gap-3 text-left hover:border-primary/50 transition-all"
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="gradient-bg text-primary-foreground font-semibold text-sm">
                        {getInitials(c.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-sm">{c.name}</h3>
                      {last && (
                        <span className="text-[10px] text-muted-foreground">
                          {formatTime(last.created_at)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {last
                        ? (last.sender_id === userId ? "You: " : "") + last.text
                        : primarySkill}
                    </p>
                  </div>
                  {unread > 0 && (
                    <span className="w-5 h-5 rounded-full gradient-bg text-primary-foreground text-[10px] flex items-center justify-center font-bold flex-shrink-0">
                      {unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ─── CHAT VIEW ────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {toast && (
        <div className={`fixed top-4 right-4 z-[9999] px-4 py-3 rounded-xl text-sm font-medium shadow-lg ${toast.type === "error" ? "bg-red-500/90" : "bg-green-500/90"} text-white`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 py-3 border-b border-border mb-1 flex-shrink-0">
        <button
          onClick={() => {
            setActiveContact(null);
            if (channelRef.current) supabase.removeChannel(channelRef.current);
            loadContacts(userId);
          }}
          className="p-1.5 rounded-full hover:bg-accent/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Avatar className="w-9 h-9">
          <AvatarFallback className="gradient-bg text-primary-foreground text-xs font-semibold">
            {getInitials(activeContact.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{activeContact.name}</h3>
          <p className="text-[10px] text-muted-foreground">
            {activeContact.teach_skills?.[0]?.name || "SkillSwap user"}
          </p>
        </div>
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Phone className="w-4 h-4" />
        </button>
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Video className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-2 space-y-1">
        {Object.keys(groupedMessages).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <span className="text-2xl">👋</span>
            </div>
            <p className="text-sm font-semibold">
              Say hello to {activeContact.name}!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Start the conversation
            </p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] text-muted-foreground px-2 bg-background rounded-full border border-border py-0.5">
                  {date}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {msgs.map((m) => {
                const isMe = m.sender_id === userId;
                return (
                  <div
                    key={m.id}
                    className={`flex mb-2 ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    {!isMe && (
                      <Avatar className="w-6 h-6 mr-2 mt-1 flex-shrink-0">
                        <AvatarFallback className="gradient-bg text-primary-foreground text-[9px] font-bold">
                          {getInitials(activeContact.name)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-[75%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <div className={`rounded-2xl px-3.5 py-2.5 ${isMe
                        ? "gradient-bg text-primary-foreground rounded-br-sm"
                        : "bg-card border border-border rounded-bl-sm"
                        }`}>
                        <p className="text-sm leading-relaxed">{m.text}</p>
                      </div>
                      <div className={`flex items-center gap-1 mt-0.5 ${isMe ? "flex-row-reverse" : ""}`}>
                        <span className="text-[10px] text-muted-foreground">
                          {formatTime(m.created_at)}
                        </span>
                        {isMe && (
                          m.read
                            ? <CheckCheck className="w-3 h-3 text-blue-400" />
                            : m.delivered
                              ? <CheckCheck className="w-3 h-3 text-muted-foreground" />
                              : <Check className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 pt-3 border-t border-border flex-shrink-0">
        <Input
          ref={inputRef}
          placeholder="Type a message..."
          className="flex-1 bg-card h-11 rounded-xl"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          className={`p-2.5 rounded-xl transition-all ${input.trim() && !sending
            ? "gradient-bg text-primary-foreground hover:opacity-90"
            : "bg-card border border-border text-muted-foreground cursor-not-allowed"
            }`}
        >
          {sending ? (
            <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

export default Chat;