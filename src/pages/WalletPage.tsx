import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, TrendingUp, CreditCard } from "lucide-react";

const transactions = [
  { type: "earned", desc: "Taught JavaScript to Alex K.", credits: 15, date: "Today" },
  { type: "spent", desc: "Learned Guitar from Priya M.", credits: -10, date: "Yesterday" },
  { type: "earned", desc: "Taught React to Sam R.", credits: 20, date: "Feb 17" },
  { type: "spent", desc: "Learned Cooking from Lisa P.", credits: -10, date: "Feb 16" },
  { type: "earned", desc: "Signup bonus", credits: 50, date: "Feb 15" },
];

const WalletPage = () => {
  const navigate = useNavigate();

  return (
    <div className="px-4 pt-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-card border border-border"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-heading font-semibold">Skill Credits</h1>
      </div>

      {/* Balance Card */}
      <div className="gradient-bg rounded-2xl p-6 mb-6 text-primary-foreground">
        <p className="text-sm opacity-80">Total Balance</p>
        <h2 className="text-4xl font-heading font-bold mt-1">150</h2>
        <p className="text-sm opacity-80">Skill Credits</p>
        <div className="flex gap-6 mt-4">
          <div className="flex items-center gap-2"><ArrowDownLeft className="w-4 h-4" /><div><p className="text-xs opacity-80">Earned</p><p className="font-bold">85</p></div></div>
          <div className="flex items-center gap-2"><ArrowUpRight className="w-4 h-4" /><div><p className="text-xs opacity-80">Spent</p><p className="font-bold">20</p></div></div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <TrendingUp className="w-5 h-5 mx-auto text-primary mb-1" />
          <p className="text-xl font-bold">24</p>
          <p className="text-[10px] text-muted-foreground">Sessions Done</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <CreditCard className="w-5 h-5 mx-auto text-accent mb-1" />
          <p className="text-xl font-bold">4.8</p>
          <p className="text-[10px] text-muted-foreground">Avg Rating</p>
        </div>
      </div>

      {/* Transactions */}
      <h3 className="font-heading font-semibold text-sm mb-3">Transaction History</h3>
      <div className="space-y-2">
        {transactions.map((t, i) => (
          <div key={i} className="bg-card rounded-xl p-3 border border-border flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${t.type === "earned" ? "bg-green-500/10" : "bg-red-500/10"}`}>
              {t.type === "earned" ? <ArrowDownLeft className="w-4 h-4 text-green-400" /> : <ArrowUpRight className="w-4 h-4 text-red-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{t.desc}</p>
              <p className="text-[10px] text-muted-foreground">{t.date}</p>
            </div>
            <span className={`text-sm font-bold ${t.type === "earned" ? "text-green-400" : "text-red-400"}`}>
              {t.credits > 0 ? "+" : ""}{t.credits}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WalletPage;
