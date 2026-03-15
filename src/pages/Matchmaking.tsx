import { useState, useEffect } from "react";
import { Sparkles, Star, Clock, X, Check, Video } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

const TIME_SLOTS = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "7:00 PM"];
const today = new Date().toISOString().split("T")[0];

type Profile = {
  id: string;
  name: string;
  email: string;
  teach_skills: { name: string; level: string }[];
  learn_skills: string[];
  preferred_mode: string;
  available_days: string[];
  bio: string;
};

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const Matchmaking = () => {
  const [mentors, setMentors] = useState<Profile[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState("");
  const [userLearnSkills, setUserLearnSkills] = useState<string[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Profile | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedMode, setSelectedMode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading2, setLoading2] = useState(false);
  const [done, setDone] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  const showToast = (message: string, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    // Get current user's learn skills
    const { data: myProfile } = await supabase
      .from("profiles")
      .select("learn_skills")
      .eq("id", user.id)
      .single();

    if (myProfile?.learn_skills) {
      setUserLearnSkills(myProfile.learn_skills);
    }

    // Get all other profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", user.id);

    if (profiles) {
      // Sort by match score
      const sorted = profiles.sort((a, b) => {
        const aMatch = getMatchScore(myProfile?.learn_skills || [], a);
        const bMatch = getMatchScore(myProfile?.learn_skills || [], b);
        return bMatch - aMatch;
      });
      setMentors(sorted);
      setFilteredMentors(sorted);
    }
    setLoading(false);
  };

  // Filter by search
  useEffect(() => {
    if (!search.trim()) {
      setFilteredMentors(mentors);
      return;
    }
    const q = search.toLowerCase();
    setFilteredMentors(
      mentors.filter((m) =>
        m.name.toLowerCase().includes(q) ||
        m.teach_skills?.some((s) => s.name.toLowerCase().includes(q)) ||
        m.bio?.toLowerCase().includes(q)
      )
    );
  }, [search, mentors]);

  const getMatchScore = (learnSkills: string[], mentor: Profile) => {
    if (!learnSkills?.length || !mentor.teach_skills?.length) return 0;
    const teachNames = mentor.teach_skills.map((s) => s.name.toLowerCase());
    return learnSkills.some((s) => teachNames.includes(s.toLowerCase())) ? 100 : 0;
  };

  const isPastDateTime = (date: string, time: string) => {
    if (!date || !time) return false;
    return new Date(`${date} ${time}`) < new Date();
  };

  const openBooking = (mentor: Profile) => {
    setSelectedMentor(mentor);
    setSelectedDate("");
    setSelectedSlot("");
    setSelectedMode("");
    setErrors({});
    setDone(false);
  };

  const validateBooking = () => {
    const e: Record<string, string> = {};
    if (!selectedDate) e.date = "Please select a date";
    if (!selectedSlot) e.slot = "Please select a time slot";
    if (!selectedMode) e.mode = "Please select a mode";
    if (selectedDate && selectedSlot && isPastDateTime(selectedDate, selectedSlot)) {
      e.date = "Cannot book for past date/time";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleBook = async () => {
    if (!validateBooking() || !selectedMentor) return;
    setLoading2(true);

    const jitsiRoom = `skillswap-${selectedMentor.id.slice(0, 8)}-${Date.now()}`;
    const primarySkill = selectedMentor.teach_skills?.[0]?.name || "Skill Session";

    const { error } = await supabase.from("bookings").insert({
      learner_id: userId,
      mentor_id: selectedMentor.id,
      mentor_name: selectedMentor.name,
      mentor_avatar: getInitials(selectedMentor.name),
      skill: primarySkill,
      date: selectedDate,
      time: selectedSlot,
      mode: selectedMode,
      status: "Pending",
      notes: `Session for ${primarySkill} with ${selectedMentor.name}`,
      duration: "60 min",
      jitsi_room: jitsiRoom,
    });

    setLoading2(false);

    if (error) {
      showToast(error.message, "error");
      return;
    }

    setDone(true);
    showToast("🎉 Session booked successfully!");
  };

  // Skeleton loader
  if (loading) {
    return (
      <div className="pb-8">
        <div className="h-8 w-48 bg-card rounded-lg animate-pulse mb-5" />
        <div className="h-10 bg-card rounded-xl animate-pulse mb-5" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-card rounded-xl border border-border animate-pulse mb-3" />
        ))}
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[9999] px-4 py-3 rounded-xl text-sm font-medium shadow-lg ${toast.type === "error" ? "bg-red-500/90" : "bg-green-500/90"
          } text-white`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-heading font-semibold text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Explore
          </h1>
          <p className="text-xs text-muted-foreground">
            {filteredMentors.length} mentor{filteredMentors.length !== 1 ? "s" : ""} found
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or skill..."
          className="bg-card pr-8"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Empty State */}
      {filteredMentors.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold text-muted-foreground">No mentors found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Try different search terms
          </p>
          <button
            onClick={() => setSearch("")}
            className="text-xs text-primary mt-3 hover:underline"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Mentor Cards */}
      <div className="space-y-3">
        {filteredMentors.map((m) => {
          const matchScore = getMatchScore(userLearnSkills, m);
          const primarySkill = m.teach_skills?.[0]?.name;
          const wantsSkill = m.learn_skills?.[0];

          return (
            <div
              key={m.id}
              className="bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-all"
            >
              <div className="flex items-start gap-3">
                <Avatar className="w-14 h-14 flex-shrink-0">
                  <AvatarFallback className="gradient-bg text-primary-foreground font-semibold">
                    {getInitials(m.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold truncate">{m.name}</h3>
                    <div className="flex gap-1.5 flex-shrink-0">
                      {matchScore === 100 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 font-medium whitespace-nowrap">
                          ✓ Match
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mt-1">
                    {primarySkill && (
                      <p className="text-xs text-muted-foreground">
                        Teaches{" "}
                        <span className="text-foreground font-medium">
                          {primarySkill}
                        </span>
                        {wantsSkill && (
                          <>
                            {" · "}Wants{" "}
                            <span className="text-foreground font-medium">
                              {wantsSkill}
                            </span>
                          </>
                        )}
                      </p>
                    )}
                    {!primarySkill && (
                      <p className="text-xs text-muted-foreground italic">
                        No skills listed yet
                      </p>
                    )}
                  </div>

                  {/* Extra info */}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {m.preferred_mode && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        {m.preferred_mode === "Online" ? "🌐" : m.preferred_mode === "Offline" ? "📍" : "🌐📍"}
                        {m.preferred_mode}
                      </span>
                    )}
                    {m.available_days?.length > 0 && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {m.available_days.slice(0, 2).map(d => d.slice(0, 3)).join(", ")}
                        {m.available_days.length > 2 ? ` +${m.available_days.length - 2}` : ""}
                      </span>
                    )}
                    {m.teach_skills?.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {m.teach_skills.length} skill{m.teach_skills.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {/* Bio preview */}
                  {m.bio && (
                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">
                      {m.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    // Navigate to chat with this user
                    window.location.href = "/chat";
                  }}
                >
                  💬 Message
                </Button>
                <Button
                  size="sm"
                  className="flex-1 gradient-bg text-primary-foreground"
                  onClick={() => openBooking(m)}
                >
                  Book Session
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* BOOKING MODAL */}
      {selectedMentor && (
        <>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={() => !loading2 && setSelectedMentor(null)}
          />
          <div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-card border border-border rounded-2xl z-50 overflow-y-auto max-h-[90vh]"
            style={{ animation: "fadeIn 0.2s ease" }}
          >
            <div className="p-5">
              {done ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="font-bold text-lg text-green-400 mb-2">
                    Booking Confirmed!
                  </h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    Session with{" "}
                    <span className="text-foreground font-semibold">
                      {selectedMentor.name}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground mb-1">
                    {selectedDate} at {selectedSlot}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedMode === "Online" ? "🌐 Online" : "📍 Offline"}
                  </p>
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs border border-amber-500/30">
                    Status: Pending
                  </span>
                  <div className="flex gap-2 mt-5">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSelectedMentor(null)}
                    >
                      Close
                    </Button>
                    <Button
                      className="flex-1 gradient-bg text-primary-foreground"
                      onClick={() => {
                        setSelectedMentor(null);
                        window.location.href = "/booking";
                      }}
                    >
                      View Bookings
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-heading font-bold">Book a Session</h2>
                    <button
                      onClick={() => setSelectedMentor(null)}
                      className="p-1.5 rounded-full hover:bg-accent/10"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Mentor Info */}
                  <div className="flex items-center gap-3 bg-background rounded-xl p-3 mb-5">
                    <Avatar className="w-11 h-11">
                      <AvatarFallback className="gradient-bg text-primary-foreground font-bold text-sm">
                        {getInitials(selectedMentor.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-sm">{selectedMentor.name}</p>
                      <p className="text-xs text-primary">
                        {selectedMentor.teach_skills?.[0]?.name || "Skill session"}
                      </p>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="mb-4">
                    <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-2">
                      Session Date *
                    </label>
                    <input
                      type="date"
                      min={today}
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setErrors((p) => ({ ...p, date: "" }));
                      }}
                      className={`w-full bg-background border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary ${errors.date ? "border-red-500" : "border-border"
                        }`}
                    />
                    {errors.date && (
                      <p className="text-red-400 text-xs mt-1">{errors.date}</p>
                    )}
                  </div>

                  {/* Time Slots */}
                  <div className="mb-4">
                    <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-2">
                      Time Slot *
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {TIME_SLOTS.map((t) => (
                        <button
                          key={t}
                          onClick={() => {
                            setSelectedSlot(t);
                            setErrors((p) => ({ ...p, slot: "" }));
                          }}
                          className={`text-xs py-2 rounded-lg border transition-colors ${selectedSlot === t
                            ? "gradient-bg text-primary-foreground border-transparent"
                            : "border-border text-muted-foreground hover:border-primary"
                            }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    {errors.slot && (
                      <p className="text-red-400 text-xs mt-1">{errors.slot}</p>
                    )}
                  </div>

                  {/* Mode */}
                  <div className="mb-5">
                    <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-2">
                      Session Mode *
                    </label>
                    <div className="flex gap-2">
                      {[
                        { key: "Online", icon: "🌐" },
                        { key: "Offline", icon: "📍" },
                      ].map((m) => (
                        <button
                          key={m.key}
                          onClick={() => {
                            setSelectedMode(m.key);
                            setErrors((p) => ({ ...p, mode: "" }));
                          }}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors flex items-center justify-center gap-2 ${selectedMode === m.key
                            ? "gradient-bg text-primary-foreground border-transparent"
                            : "border-border text-muted-foreground hover:border-primary"
                            }`}
                        >
                          {m.icon} {m.key}
                        </button>
                      ))}
                    </div>
                    {errors.mode && (
                      <p className="text-red-400 text-xs mt-1">{errors.mode}</p>
                    )}
                  </div>

                  {/* Book Button */}
                  <Button
                    className="w-full gradient-bg text-primary-foreground h-12 text-base font-semibold"
                    onClick={handleBook}
                    disabled={loading2}
                  >
                    {loading2 ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Booking...
                      </span>
                    ) : (
                      "Confirm Booking"
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Matchmaking;