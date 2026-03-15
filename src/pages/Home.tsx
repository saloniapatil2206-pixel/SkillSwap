import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, TrendingUp, Star, ArrowRight, Sparkles, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

const TRENDING_SKILLS = ["AI & ML", "Guitar", "Photography", "Web Dev", "Cooking", "Yoga", "React", "Python", "Design", "Music"];

type Profile = {
  id: string;
  name: string;
  teach_skills: { name: string; level: string }[];
  learn_skills: string[];
  bio: string;
  avatar_url: string | null;
};

const getInitials = (name: string) =>
  name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";

const Home = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [userLearnSkills, setUserLearnSkills] = useState<string[]>([]);
  const [matches, setMatches] = useState<Profile[]>([]);
  const [recentUsers, setRecentUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<any>(null);

  useEffect(() => {
    fetchData();
    // Close search on outside click
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    // Get current user profile
    const { data: myProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (myProfile) {
      setUserName(myProfile.name?.split(" ")[0] || "there");
      setUserLearnSkills(myProfile.learn_skills || []);
    }

    // Get unread notifications count
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false);
    setUnreadNotifs(count || 0);

    // Get all other profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", user.id)
      .order("created_at", { ascending: false });

    if (profiles) {
      // Sort by match score for recommended
      const sorted = [...profiles].sort((a, b) => {
        const aMatch = getMatchScore(myProfile?.learn_skills || [], a);
        const bMatch = getMatchScore(myProfile?.learn_skills || [], b);
        return bMatch - aMatch;
      });
      setMatches(sorted.slice(0, 3));
      setRecentUsers(profiles.slice(0, 6));
    }

    setLoading(false);
  };

  const getMatchScore = (learnSkills: string[], mentor: Profile) => {
    if (!learnSkills?.length || !mentor.teach_skills?.length) return 0;
    const teachNames = mentor.teach_skills.map((s) => s.name.toLowerCase());
    return learnSkills.some((s) => teachNames.includes(s.toLowerCase())) ? 100 : 50;
  };

  // Debounced search — only fires 400ms after user stops typing
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (!value.trim()) {
      setSearchResults([]);
      setShowResults(false);
      setSearching(false);
      return;
    }
    setSearching(true);
    setShowResults(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", userId)
        .limit(50);
      const q = value.toLowerCase();
      const filtered = (data || []).filter((p) => {
        const nameMatch = p.name?.toLowerCase().includes(q);
        const bioMatch = p.bio?.toLowerCase().includes(q);
        const teachMatch = p.teach_skills?.some((s: any) =>
          s.name?.toLowerCase().includes(q)
        );
        const learnMatch = p.learn_skills?.some((s: string) =>
          s.toLowerCase().includes(q)
        );
        return nameMatch || bioMatch || teachMatch || learnMatch;
      });
      setSearchResults(filtered.slice(0, 8));
      setSearching(false);
    }, 400);
  };

  const clearSearch = () => {
    setSearch("");
    setSearchResults([]);
    setShowResults(false);
  };

  const goToProfile = (profileId: string) => {
    clearSearch();
    // For now navigate to matchmaking — later we'll add individual profile pages
    navigate("/matchmaking");
  };

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-muted-foreground">Hello 👋</p>
          <h1 className="text-xl font-heading font-bold">
            {loading ? "Welcome!" : `Welcome, ${userName}!`}
          </h1>
        </div>
        <button
          onClick={() => navigate("/notifications")}
          className="relative p-2 rounded-full bg-card border border-border"
        >
          <Bell className="w-5 h-5" />
          {unreadNotifs > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
              {unreadNotifs > 9 ? "9+" : unreadNotifs}
            </span>
          )}
        </button>
      </div>

      {/* Search Bar */}
      <div ref={searchRef} className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        <input
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => search && setShowResults(true)}
          placeholder="Search skills, people..."
          className="w-full pl-10 pr-10 h-11 bg-card border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors"
        />
        {search && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto">
            {searching ? (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-muted-foreground animate-pulse">Searching...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-muted-foreground">No results for "{search}"</p>
              </div>
            ) : (
              searchResults.map((p) => (
                <button
                  key={p.id}
                  onClick={() => goToProfile(p.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/10 transition-colors text-left border-b border-border last:border-0"
                >
                  <Avatar className="w-9 h-9 flex-shrink-0">
                    <AvatarFallback className="gradient-bg text-primary-foreground text-xs font-bold">
                      {getInitials(p.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {p.teach_skills?.[0]?.name
                        ? `Teaches ${p.teach_skills[0].name}`
                        : "SkillSwap user"}
                    </p>
                  </div>
                  {p.teach_skills?.some((s) =>
                    userLearnSkills.some((l) => l.toLowerCase() === s.name.toLowerCase())
                  ) && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex-shrink-0">
                        Match
                      </span>
                    )}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Trending Skills */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h2 className="font-heading font-semibold text-sm">Trending Skills</h2>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {TRENDING_SKILLS.map((skill) => (
            <button
              key={skill}
              onClick={() => { setSearch(skill); handleSearchChange(skill); }}
              className="whitespace-nowrap px-3 py-1.5 rounded-full bg-card border border-border text-xs font-medium hover:border-primary hover:text-primary transition-colors flex-shrink-0"
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Recommended Matches */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-semibold text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Recommended Matches
          </h2>
          <button
            onClick={() => navigate("/matchmaking")}
            className="text-xs text-primary flex items-center gap-1 hover:underline"
          >
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-card rounded-xl border border-border animate-pulse" />
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-card rounded-xl p-6 border border-border text-center">
            <p className="text-sm text-muted-foreground">No matches yet</p>
            <button
              onClick={() => navigate("/matchmaking")}
              className="text-xs text-primary mt-1 hover:underline"
            >
              Browse all mentors →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((user) => {
              const primarySkill = user.teach_skills?.[0]?.name;
              const wantsSkill = user.learn_skills?.[0];
              const isMatch = userLearnSkills.some((s) =>
                user.teach_skills?.some((t) => t.name.toLowerCase() === s.toLowerCase())
              );
              return (
                <div
                  key={user.id}
                  onClick={() => navigate("/matchmaking")}
                  className="bg-card rounded-xl p-4 border border-border flex items-center gap-3 cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <Avatar className="w-12 h-12 flex-shrink-0">
                    <AvatarFallback className="gradient-bg text-primary-foreground font-semibold text-sm">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-sm truncate">{user.name}</h3>
                      {isMatch && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex-shrink-0">
                          ✓ Match
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {primarySkill ? (
                        <>Teaches <span className="text-foreground">{primarySkill}</span>
                          {wantsSkill && <> · Wants <span className="text-foreground">{wantsSkill}</span></>}
                        </>
                      ) : (
                        "New to SkillSwap"
                      )}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recently Joined */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-semibold text-sm">Recently Joined</h2>
          <button
            onClick={() => navigate("/matchmaking")}
            className="text-xs text-primary flex items-center gap-1 hover:underline"
          >
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {loading ? (
          <div className="flex gap-3 overflow-x-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="min-w-[100px] h-32 bg-card rounded-xl border border-border animate-pulse flex-shrink-0" />
            ))}
          </div>
        ) : recentUsers.length === 0 ? (
          <div className="bg-card rounded-xl p-6 border border-border text-center">
            <p className="text-sm text-muted-foreground">No other users yet</p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {recentUsers.map((u) => (
              <div
                key={u.id}
                onClick={() => navigate("/matchmaking")}
                className="bg-card rounded-xl p-3 border border-border min-w-[100px] text-center cursor-pointer hover:border-primary/50 transition-colors flex-shrink-0"
              >
                <Avatar className="w-12 h-12 mx-auto mb-2">
                  <AvatarFallback className="gradient-bg text-primary-foreground font-semibold text-sm">
                    {getInitials(u.name)}
                  </AvatarFallback>
                </Avatar>
                <p className="text-xs font-semibold truncate">{u.name.split(" ")[0]}</p>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                  {u.teach_skills?.[0]?.name || "New user"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <h2 className="font-heading font-semibold text-sm mb-3">🌍 Platform Stats</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Members", value: recentUsers.length + 1 },
            { label: "Skills", value: TRENDING_SKILLS.length + "+" },
            { label: "Sessions", value: "∞" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-bold text-lg gradient-text">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;