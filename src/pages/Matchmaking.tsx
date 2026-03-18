import { useState, useEffect } from "react";
import { Sparkles, Star, Clock, X, Check, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const TIME_SLOTS = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "7:00 PM"];
const today = new Date().toISOString().split("T")[0];

const LEVEL_COLORS: Record<string, string> = {
  Beginner: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Intermediate: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Expert: "bg-green-500/20 text-green-400 border-green-500/30",
};

type Profile = {
  id: string;
  name: string;
  email: string;
  bio: string;
  teach_skills: { name: string; level: string }[];
  learn_skills: string[];
  preferred_mode: string;
  available_days: string[];
  available_slots: string[];
};

type Review = {
  id: string;
  rating: number;
  comment: string;
  reviewer_name: string;
  created_at: string;
};

const getInitials = (name: string) =>
  name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";

const Matchmaking = () => {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<Profile[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState("");
  const [userLearnSkills, setUserLearnSkills] = useState<string[]>([]);

  const [viewProfile, setViewProfile] = useState<Profile | null>(null);
  const [profileReviews, setProfileReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

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

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    const { data: myProfile } = await supabase
      .from("profiles").select("learn_skills").eq("id", user.id).single();
    if (myProfile?.learn_skills) setUserLearnSkills(myProfile.learn_skills);
    const { data: profiles } = await supabase
      .from("profiles").select("*").neq("id", user.id);
    if (profiles) {
      const sorted = profiles.sort((a, b) =>
        getMatchScore(myProfile?.learn_skills || [], b) -
        getMatchScore(myProfile?.learn_skills || [], a)
      );
      setMentors(sorted);
      setFilteredMentors(sorted);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!search.trim()) { setFilteredMentors(mentors); return; }
    const q = search.toLowerCase();
    setFilteredMentors(mentors.filter((m) =>
      m.name?.toLowerCase().includes(q) ||
      m.teach_skills?.some((s) => s.name.toLowerCase().includes(q)) ||
      m.learn_skills?.some((s) => s.toLowerCase().includes(q)) ||
      m.bio?.toLowerCase().includes(q)
    ));
  }, [search, mentors]);

  const getMatchScore = (learnSkills: string[], mentor: Profile) => {
    if (!learnSkills?.length || !mentor.teach_skills?.length) return 0;
    return learnSkills.some((s) =>
      mentor.teach_skills.map((t) => t.name.toLowerCase()).includes(s.toLowerCase())
    ) ? 100 : 0;
  };

  const openProfile = async (mentor: Profile) => {
    setViewProfile(mentor);
    setLoadingReviews(true);
    const { data } = await supabase
      .from("reviews").select("*").eq("reviewee_id", mentor.id)
      .order("created_at", { ascending: false });
    setProfileReviews(data || []);
    setLoadingReviews(false);
  };

  const openBooking = (mentor: Profile) => {
    setViewProfile(null);
    setSelectedMentor(mentor);
    setSelectedDate(""); setSelectedSlot(""); setSelectedMode("");
    setErrors({}); setDone(false);
  };

  const validateBooking = () => {
    const e: Record<string, string> = {};
    if (!selectedDate) e.date = "Please select a date";
    if (!selectedSlot) e.slot = "Please select a time slot";
    if (!selectedMode) e.mode = "Please select a mode";
    if (selectedDate && selectedSlot &&
      new Date(`${selectedDate} ${selectedSlot}`) < new Date())
      e.date = "Cannot book for past date/time";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleBook = async () => {
    if (!validateBooking() || !selectedMentor) return;
    setLoading2(true);
    const jitsiRoom = `skillswap-${selectedMentor.id.slice(0, 8)}-${Date.now()}`;
    const primarySkill = selectedMentor.teach_skills?.[0]?.name || "Skill Session";
    const { data: myProfile } = await supabase
      .from("profiles").select("name").eq("id", userId).single();
    const { error } = await supabase.from("bookings").insert({
      learner_id: userId,
      learner_name: myProfile?.name || "A learner",
      mentor_id: selectedMentor.id,
      mentor_name: selectedMentor.name,
      mentor_avatar: getInitials(selectedMentor.name),
      skill: primarySkill,
      date: selectedDate, time: selectedSlot, mode: selectedMode,
      status: "Pending",
      notes: `Session for ${primarySkill} with ${selectedMentor.name}`,
      duration: "60 min", jitsi_room: jitsiRoom,
    });
    setLoading2(false);
    if (error) { showToast(error.message, "error"); return; }
    setDone(true);
    showToast("🎉 Session booked successfully!");
  };

  const avgRating = (reviews: Review[]) =>
    reviews.length
      ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  if (loading) return (
    <div className="pb-8">
      <div className="h-8 w-48 bg-card rounded-lg animate-pulse mb-5" />
      <div className="h-10 bg-card rounded-xl animate-pulse mb-5" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 bg-card rounded-xl border border-border animate-pulse mb-3" />
      ))}
    </div>
  );

  return (
    <div className="pb-8">
      {toast && (
        <div className={`fixed top-4 right-4 z-[9999] px-4 py-3 rounded-xl text-sm font-medium shadow-lg ${toast.type === "error" ? "bg-red-500/90" : "bg-green-500/90"} text-white`}>
          {toast.message}
        </div>
      )}

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

      <div className="relative mb-5">
        <Input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or skill..." className="bg-card pr-8" />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {filteredMentors.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold text-muted-foreground">No mentors found</p>
          <button onClick={() => setSearch("")} className="text-xs text-primary mt-3 hover:underline">
            Clear search
          </button>
        </div>
      )}

      <div className="space-y-3">
        {filteredMentors.map((m) => {
          const isMatch = getMatchScore(userLearnSkills, m) === 100;
          const primarySkill = m.teach_skills?.[0]?.name;
          const wantsSkill = m.learn_skills?.[0];
          return (
            <div key={m.id} className="bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-all">
              <button className="w-full text-left" onClick={() => openProfile(m)}>
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
                        {isMatch && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 font-medium">
                            ✓ Match
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {primarySkill ? (
                        <>Teaches <span className="text-foreground font-medium">{primarySkill}</span>
                          {wantsSkill && <> · Wants <span className="text-foreground font-medium">{wantsSkill}</span></>}
                        </>
                      ) : "No skills listed yet"}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {m.preferred_mode && (
                        <span className="text-xs text-muted-foreground">
                          {m.preferred_mode === "Online" ? "🌐" : "📍"} {m.preferred_mode}
                        </span>
                      )}
                      {m.available_days?.length > 0 && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {m.available_days.slice(0, 2).map(d => d.slice(0, 3)).join(", ")}
                          {m.available_days.length > 2 ? ` +${m.available_days.length - 2}` : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" className="flex-1"
                  onClick={() => navigate("/chat")}>
                  💬 Message
                </Button>
                <Button size="sm" className="flex-1 gradient-bg text-primary-foreground"
                  onClick={() => openBooking(m)}>
                  Book Session
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* PROFILE MODAL */}
      {viewProfile && (
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={() => setViewProfile(null)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-card border border-border rounded-2xl z-50 overflow-y-auto max-h-[90vh]">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-bold">Profile</h2>
                <button onClick={() => setViewProfile(null)}
                  className="p-1.5 rounded-full hover:bg-accent/10">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center mb-4">
                <Avatar className="w-20 h-20 mx-auto mb-3">
                  <AvatarFallback className="gradient-bg text-primary-foreground text-2xl font-bold">
                    {getInitials(viewProfile.name)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-lg">{viewProfile.name}</h3>
                {avgRating(profileReviews) && (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold">{avgRating(profileReviews)}</span>
                    <span className="text-xs text-muted-foreground">
                      ({profileReviews.length} reviews)
                    </span>
                  </div>
                )}
              </div>

              {viewProfile.bio && (
                <div className="bg-background rounded-xl p-3 mb-4">
                  <p className="text-xs text-muted-foreground mb-1">About</p>
                  <p className="text-sm">{viewProfile.bio}</p>
                </div>
              )}

              {viewProfile.teach_skills?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                    Skills I Teach
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {viewProfile.teach_skills.map((s) => (
                      <span key={s.name}
                        className={`text-xs px-3 py-1 rounded-full border ${LEVEL_COLORS[s.level] || LEVEL_COLORS.Beginner}`}>
                        {s.name} · {s.level}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {viewProfile.learn_skills?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                    Wants to Learn
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {viewProfile.learn_skills.map((s) => (
                      <Badge key={s} variant="secondary">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {viewProfile.available_days?.length > 0 && (
                <div className="bg-background rounded-xl p-3 mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Availability</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {viewProfile.available_days.map((d) => (
                      <span key={d}
                        className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {d.slice(0, 3)}
                      </span>
                    ))}
                  </div>
                  {viewProfile.available_slots?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {viewProfile.available_slots.map((s) => (
                        <span key={s}
                          className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  {viewProfile.preferred_mode && (
                    <Badge variant="outline">{viewProfile.preferred_mode}</Badge>
                  )}
                </div>
              )}

              <div className="mb-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                  Reviews ({profileReviews.length})
                </p>
                {loadingReviews ? (
                  <div className="h-16 bg-background rounded-xl animate-pulse" />
                ) : profileReviews.length === 0 ? (
                  <div className="bg-background rounded-xl p-3 text-center">
                    <p className="text-sm text-muted-foreground">No reviews yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {profileReviews.slice(0, 3).map((r) => (
                      <div key={r.id} className="bg-background rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold">{r.reviewer_name}</span>
                          <div className="flex">
                            {Array.from({ length: r.rating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            ))}
                          </div>
                        </div>
                        {r.comment && (
                          <p className="text-xs text-muted-foreground">{r.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button className="w-full gradient-bg text-primary-foreground h-11"
                onClick={() => openBooking(viewProfile)}>
                Book Session with {viewProfile.name.split(" ")[0]}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* BOOKING MODAL */}
      {selectedMentor && (
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={() => !loading2 && setSelectedMentor(null)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-card border border-border rounded-2xl z-50 overflow-y-auto max-h-[90vh]">
            <div className="p-5">
              {done ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="font-bold text-lg text-green-400 mb-2">Booking Confirmed!</h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    Session with{" "}
                    <span className="text-foreground font-semibold">{selectedMentor.name}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mb-1">{selectedDate} at {selectedSlot}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedMode === "Online" ? "🌐 Online" : "📍 Offline"}
                  </p>
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs border border-amber-500/30">
                    Status: Pending
                  </span>
                  <div className="flex gap-2 mt-5">
                    <Button variant="outline" className="flex-1"
                      onClick={() => setSelectedMentor(null)}>
                      Close
                    </Button>
                    <Button className="flex-1 gradient-bg text-primary-foreground"
                      onClick={() => { setSelectedMentor(null); navigate("/booking"); }}>
                      View Bookings
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-heading font-bold">Book a Session</h2>
                    <button onClick={() => setSelectedMentor(null)}
                      className="p-1.5 rounded-full hover:bg-accent/10">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

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

                  <div className="mb-4">
                    <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-2">
                      Session Date *
                    </label>
                    <input type="date" min={today} value={selectedDate}
                      onChange={(e) => { setSelectedDate(e.target.value); setErrors((p) => ({ ...p, date: "" })); }}
                      className={`w-full bg-background border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary ${errors.date ? "border-red-500" : "border-border"}`} />
                    {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
                  </div>

                  <div className="mb-4">
                    <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-2">
                      Time Slot *
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {TIME_SLOTS.map((t) => (
                        <button key={t}
                          onClick={() => { setSelectedSlot(t); setErrors((p) => ({ ...p, slot: "" })); }}
                          className={`text-xs py-2 rounded-lg border transition-colors ${selectedSlot === t
                            ? "gradient-bg text-primary-foreground border-transparent"
                            : "border-border text-muted-foreground hover:border-primary"
                            }`}>
                          {t}
                        </button>
                      ))}
                    </div>
                    {errors.slot && <p className="text-red-400 text-xs mt-1">{errors.slot}</p>}
                  </div>

                  <div className="mb-5">
                    <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-2">
                      Session Mode *
                    </label>
                    <div className="flex gap-2">
                      {[{ key: "Online", icon: "🌐" }, { key: "Offline", icon: "📍" }].map((m) => (
                        <button key={m.key}
                          onClick={() => { setSelectedMode(m.key); setErrors((p) => ({ ...p, mode: "" })); }}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors flex items-center justify-center gap-2 ${selectedMode === m.key
                            ? "gradient-bg text-primary-foreground border-transparent"
                            : "border-border text-muted-foreground hover:border-primary"
                            }`}>
                          {m.icon} {m.key}
                        </button>
                      ))}
                    </div>
                    {errors.mode && <p className="text-red-400 text-xs mt-1">{errors.mode}</p>}
                  </div>

                  <Button className="w-full gradient-bg text-primary-foreground h-12 text-base font-semibold"
                    onClick={handleBook} disabled={loading2}>
                    {loading2 ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Booking...
                      </span>
                    ) : "Confirm Booking"}
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