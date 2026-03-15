import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownLeft, TrendingUp, CreditCard, Gift, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";

const SIGNUP_BONUS = 50;
const CREDITS_PER_SESSION_TAUGHT = 15;
const CREDITS_PER_SESSION_LEARNED = 10;

type Transaction = {
  id: string;
  type: "earned" | "spent" | "bonus";
  desc: string;
  credits: number;
  date: string;
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

const WalletPage = () => {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [sessionsDone, setSessionsDone] = useState(0);
  const [sessionsTaught, setSessionsTaught] = useState(0);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, created_at")
      .eq("id", user.id)
      .single();

    if (profile) setUserName(profile.name?.split(" ")[0] || "there");

    // Get all bookings as learner (spent credits)
    const { data: learnedBookings } = await supabase
      .from("bookings")
      .select("*")
      .eq("learner_id", user.id)
      .eq("status", "Completed")
      .order("created_at", { ascending: false });

    // Get all bookings as mentor (earned credits)
    const { data: taughtBookings } = await supabase
      .from("bookings")
      .select("*")
      .eq("mentor_id", user.id)
      .eq("status", "Completed")
      .order("created_at", { ascending: false });

    const learned = learnedBookings || [];
    const taught = taughtBookings || [];

    setSessionsDone(learned.length);
    setSessionsTaught(taught.length);

    // Build transaction list
    const txns: Transaction[] = [];

    // Signup bonus
    txns.push({
      id: "signup-bonus",
      type: "bonus",
      desc: "🎉 Signup bonus",
      credits: SIGNUP_BONUS,
      date: profile?.created_at || new Date().toISOString(),
    });

    // Sessions taught → earned credits
    taught.forEach((b) => {
      txns.push({
        id: `taught-${b.id}`,
        type: "earned",
        desc: `Taught ${b.skill} to ${b.learner_name || "a learner"}`,
        credits: CREDITS_PER_SESSION_TAUGHT,
        date: b.created_at,
      });
    });

    // Sessions learned → spent credits
    learned.forEach((b) => {
      txns.push({
        id: `learned-${b.id}`,
        type: "spent",
        desc: `Learned ${b.skill} from ${b.mentor_name}`,
        credits: -CREDITS_PER_SESSION_LEARNED,
        date: b.created_at,
      });
    });

    // Sort by date descending
    txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTransactions(txns);

    // Calculate balance
    const earned = SIGNUP_BONUS + taught.length * CREDITS_PER_SESSION_TAUGHT;
    const spent = learned.length * CREDITS_PER_SESSION_LEARNED;
    setTotalEarned(earned);
    setTotalSpent(spent);
    setBalance(earned - spent);

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="pb-8">
        <div className="h-40 bg-card rounded-2xl animate-pulse mb-4" />
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="h-24 bg-card rounded-xl animate-pulse" />
          <div className="h-24 bg-card rounded-xl animate-pulse" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-card rounded-xl animate-pulse mb-2" />
        ))}
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Balance Card */}
      <div className="gradient-bg rounded-2xl p-6 mb-5 text-primary-foreground relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute -right-4 -bottom-8 w-24 h-24 rounded-full bg-white/5" />

        <p className="text-sm opacity-80 relative">Hello, {userName} 👋</p>
        <p className="text-sm opacity-70 relative mt-0.5">Your Skill Credits</p>
        <h2 className="text-5xl font-heading font-bold mt-2 relative">{balance}</h2>
        <p className="text-sm opacity-70 relative">credits available</p>

        <div className="flex gap-6 mt-5 relative">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs opacity-70">Earned</p>
              <p className="font-bold">+{totalEarned}</p>
            </div>
          </div>
          <div className="w-px bg-white/20" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs opacity-70">Spent</p>
              <p className="font-bold">-{totalSpent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Sessions Done</p>
          </div>
          <p className="text-2xl font-bold">{sessionsDone + sessionsTaught}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {sessionsTaught} taught · {sessionsDone} learned
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Gift className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xs text-muted-foreground">How to Earn</p>
          </div>
          <p className="text-sm font-semibold">+{CREDITS_PER_SESSION_TAUGHT} per teach</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            -{CREDITS_PER_SESSION_LEARNED} per learn
          </p>
        </div>
      </div>

      {/* How Credits Work */}
      <div className="bg-card rounded-xl p-4 border border-border mb-5">
        <h3 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" /> How Credits Work
        </h3>
        <div className="space-y-2">
          {[
            { icon: "🎉", text: `Signup bonus: +${SIGNUP_BONUS} credits` },
            { icon: "🎓", text: `Teach a skill: +${CREDITS_PER_SESSION_TAUGHT} credits per session` },
            { icon: "📚", text: `Learn a skill: -${CREDITS_PER_SESSION_LEARNED} credits per session` },
            { icon: "⭐", text: "Get 5-star review: +5 bonus credits" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading font-semibold text-sm">Transaction History</h3>
        <span className="text-xs text-muted-foreground">{transactions.length} transactions</span>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-10 bg-card rounded-xl border border-border">
          <p className="text-3xl mb-2">💳</p>
          <p className="text-sm font-semibold text-muted-foreground">No transactions yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Complete sessions to earn credits
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((t) => (
            <div
              key={t.id}
              className="bg-card rounded-xl p-3 border border-border flex items-center gap-3"
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${t.type === "earned" ? "bg-green-500/10" :
                t.type === "bonus" ? "bg-amber-500/10" :
                  "bg-red-500/10"
                }`}>
                {t.type === "earned" ? (
                  <ArrowDownLeft className="w-4 h-4 text-green-400" />
                ) : t.type === "bonus" ? (
                  <Gift className="w-4 h-4 text-amber-400" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-red-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.desc}</p>
                <p className="text-[10px] text-muted-foreground">{formatDate(t.date)}</p>
              </div>
              <span className={`text-sm font-bold flex-shrink-0 ${t.credits > 0 ? "text-green-400" : "text-red-400"
                }`}>
                {t.credits > 0 ? "+" : ""}{t.credits}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WalletPage;