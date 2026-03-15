import ModuleCard from "@/components/ModuleCard";

const modules = [
  {
    emoji: "🔐",
    name: "Authentication Module",
    description: "Secure login & signup with multi-provider support",
    badge: "Core" as const,
    features: ["Login Page", "Sign Up Page", "Forgot Password", "OTP Verification", "Email/Mobile Login", "Google Sign-In", "Profile Creation", "Skill Selection During Signup"],
  },
  {
    emoji: "👤",
    name: "User Profile Dashboard",
    description: "Complete user identity and skill showcase",
    badge: "Core" as const,
    features: ["Profile Photo", "Bio", "Skills Offered", "Skills Required", "Skill Level (Beginner/Intermediate/Expert)", "Availability Schedule", "Location (Optional)", "Ratings & Reviews", "Earned Skill Credits"],
  },
  {
    emoji: "🏠",
    name: "Home Page",
    description: "Personalized discovery hub with smart recommendations",
    badge: "Core" as const,
    features: ["Trending Skills", "AI-Based Recommended Matches", "Nearby Skill Providers", "Recently Added Users", "Search Bar"],
  },
  {
    emoji: "📋",
    name: "Skill Listing Page",
    description: "Publish and manage your teaching & learning skills",
    badge: "Core" as const,
    features: ["Add Skill to Teach", "Add Skill to Learn", "Set Experience Level", "Upload Certificates (Optional)", "Add Description", "Mention Teaching Method (Online/Offline)"],
  },
  {
    emoji: "🤖",
    name: "AI Matchmaking System",
    description: "Intelligent pairing powered by machine learning",
    badge: "AI" as const,
    features: ["Match by Skill Level", "Match by Availability", "Match by Location", "Match by Ratings", "Suggest Best Teacher-Learner Pair", "Recommend Trending Skills", "Suggest Learning Path"],
  },
  {
    emoji: "💳",
    name: "Skill Credits Wallet",
    description: "Earn by teaching, spend by learning",
    badge: "Core" as const,
    features: ["Earn Credits by Teaching", "Spend Credits by Learning", "Wallet Balance", "Transaction History"],
  },
  {
    emoji: "📅",
    name: "Session Booking Page",
    description: "Schedule and manage learning sessions effortlessly",
    badge: "Core" as const,
    features: ["Book Learning Session", "Select Time Slot", "Accept/Reject Requests", "Session Reminder Notifications"],
  },
  {
    emoji: "💬",
    name: "Chat & Communication",
    description: "Real-time messaging with rich media support",
    badge: "Core" as const,
    features: ["In-App Messaging", "Video Call Integration", "File Sharing", "Voice Notes"],
  },
  {
    emoji: "⭐",
    name: "Ratings & Review System",
    description: "Build trust through transparent feedback",
    badge: "Core" as const,
    features: ["Give Rating After Session", "Provide Feedback", "Build Trust Score"],
  },
  {
    emoji: "🏅",
    name: "Certification Module",
    description: "Verified achievements and skill badges",
    badge: "Premium" as const,
    features: ["Skill Completion Certificate", "Verified Badge"],
  },
  {
    emoji: "🔔",
    name: "Notifications Page",
    description: "Stay updated with real-time alerts",
    badge: "Core" as const,
    features: ["Session Reminders", "Match Alerts", "Credit Updates", "New Skill Requests"],
  },
  {
    emoji: "🛠️",
    name: "Admin Panel",
    description: "Complete control center for platform management",
    badge: "Core" as const,
    features: ["User Management", "Fake Profile Detection", "Report Handling", "Skill Trend Analysis", "App Analytics"],
  },
  {
    emoji: "⚙️",
    name: "Settings Page",
    description: "Customize your account and preferences",
    badge: "Core" as const,
    features: ["Privacy Settings", "Change Password", "Language Preference", "Account Deactivation"],
  },
];

const extraPages = [
  { emoji: "ℹ️", name: "About Us" },
  { emoji: "🆘", name: "Help & Support" },
  { emoji: "❓", name: "FAQ" },
  { emoji: "📜", name: "Terms & Conditions" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-16 pt-24 text-center">
        {/* Background glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] rounded-full opacity-20 blur-[120px]" style={{ background: "var(--gradient-primary)" }} />

        <div className="relative mx-auto max-w-3xl">
          <h1 className="animate-fade-up font-heading text-5xl font-extrabold tracking-tight sm:text-7xl">
            <span className="gradient-text">SkillSwap</span>
          </h1>
          <p className="animate-fade-up mt-4 text-lg text-muted-foreground sm:text-xl" style={{ animationDelay: "100ms" }}>
            Exchange Skills, Grow Together — The ultimate peer-to-peer skill exchange platform
          </p>

          <div className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-6" style={{ animationDelay: "200ms" }}>
            {[
              { value: "13", label: "Modules" },
              { value: "60+", label: "Features" },
              { value: "4", label: "Extra Pages" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border bg-card px-6 py-4 text-center animate-pulse-glow">
                <div className="font-heading text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section className="mx-auto max-w-5xl px-4 pb-12">
        <h2 className="animate-fade-up mb-8 text-center font-heading text-3xl font-bold text-foreground">
          App Modules
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {modules.map((mod, i) => (
            <ModuleCard key={mod.name} {...mod} delay={i * 60} />
          ))}
        </div>
      </section>

      {/* Extra Pages Section */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <h2 className="animate-fade-up mb-6 text-center font-heading text-2xl font-bold text-foreground">
          Extra Pages
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {extraPages.map((page, i) => (
            <div
              key={page.name}
              className="animate-fade-up flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5 text-center transition-all hover:border-primary/40"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span className="text-2xl">{page.emoji}</span>
              <span className="text-sm font-medium text-foreground">{page.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Built with 💜 — SkillSwap © 2026
      </footer>
    </div>
  );
};

export default Index;
