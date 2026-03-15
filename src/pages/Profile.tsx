import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Star, Edit, Save, X, Plus, Github, Linkedin, Twitter } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";

const LEVELS = ["Beginner", "Intermediate", "Expert"];
const LEVEL_COLORS: Record<string, string> = {
  Beginner: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Intermediate: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Expert: "bg-green-500/20 text-green-400 border-green-500/30",
};
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_SLOTS = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];
const SKILLS_LIST = ["React", "Python", "Guitar", "Photography", "Cooking", "Design", "Marketing", "Yoga", "JavaScript", "Node.js", "Flutter", "DevOps", "Public Speaking", "Music Production"];

const Profile = () => {
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeStatFilter, setActiveStatFilter] = useState<string | null>(null);
  const [skillSearch, setSkillSearch] = useState("");
  const [learnSearch, setLearnSearch] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    avatar_url: "",
    teach_skills: [] as { name: string; level: string }[],
    learn_skills: [] as string[],
    preferred_mode: "Online",
    available_days: [] as string[],
    available_slots: [] as string[],
    linkedin: "",
    github: "",
    twitter: "",
  });

  const [editData, setEditData] = useState({ ...profile });

  const reviews = [
    { author: "Priya M.", text: "Amazing teacher! Very patient.", stars: 5 },
    { author: "Alex K.", text: "Great session, learned a lot.", stars: 4 },
  ];

  useEffect(() => {
    fetchProfile();
    fetchBookings();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (data) {
      const p = {
        name: data.name || "",
        email: data.email || user.email || "",
        bio: data.bio || "",
        avatar_url: data.avatar_url || "",
        teach_skills: data.teach_skills || [],
        learn_skills: data.learn_skills || [],
        preferred_mode: data.preferred_mode || "Online",
        available_days: data.available_days || [],
        available_slots: data.available_slots || [],
        linkedin: data.linkedin || "",
        github: data.github || "",
        twitter: data.twitter || "",
      };
      setProfile(p);
      setEditData(p);
    }
    setLoading(false);
  };

  const fetchBookings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("bookings").select("*").eq("learner_id", user.id);
    if (data) setBookings(data);
  };

  const completion = [
    profile.bio.length >= 20,
    profile.teach_skills.length >= 1,
    profile.learn_skills.length >= 1,
    profile.available_days.length >= 1,
    !!(profile.linkedin || profile.github || profile.twitter),
  ].filter(Boolean).length * 20;

  const saveProfile = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("profiles").update({
      bio: editData.bio,
      teach_skills: editData.teach_skills,
      learn_skills: editData.learn_skills,
      preferred_mode: editData.preferred_mode,
      available_days: editData.available_days,
      available_slots: editData.available_slots,
      linkedin: editData.linkedin,
      github: editData.github,
      twitter: editData.twitter,
    }).eq("id", user.id);
    setSaving(false);
    if (!error) { setProfile(editData); setEditMode(false); }
  };

  const toggleTeachSkill = (skillName: string) => {
    const exists = editData.teach_skills.find((s) => s.name === skillName);
    if (exists) {
      setEditData((p) => ({ ...p, teach_skills: p.teach_skills.filter((s) => s.name !== skillName) }));
    } else {
      setEditData((p) => ({ ...p, teach_skills: [...p.teach_skills, { name: skillName, level: "Beginner" }] }));
    }
  };

  const setSkillLevel = (skillName: string, level: string) => {
    setEditData((p) => ({ ...p, teach_skills: p.teach_skills.map((s) => s.name === skillName ? { ...s, level } : s) }));
  };

  const toggleLearnSkill = (skill: string) => {
    const exists = editData.learn_skills.includes(skill);
    setEditData((p) => ({ ...p, learn_skills: exists ? p.learn_skills.filter((s) => s !== skill) : [...p.learn_skills, skill] }));
  };

  const toggleDay = (day: string) => {
    setEditData((p) => ({ ...p, available_days: p.available_days.includes(day) ? p.available_days.filter((d) => d !== day) : [...p.available_days, day] }));
  };

  const toggleSlot = (slot: string) => {
    setEditData((p) => ({ ...p, available_slots: p.available_slots.includes(slot) ? p.available_slots.filter((s) => s !== slot) : [...p.available_slots, slot] }));
  };

  const filteredBookings = activeStatFilter
    ? bookings.filter((b) => b.status === activeStatFilter)
    : bookings;

  const avgRating = reviews.reduce((a, r) => a + r.stars, 0) / reviews.length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-muted-foreground animate-pulse">Loading profile...</p>
    </div>
  );

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading font-semibold text-lg">Profile</h1>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <Button size="sm" variant="outline" onClick={() => { setEditData(profile); setEditMode(false); }}>
                <X className="w-4 h-4 mr-1" /> Cancel
              </Button>
              <Button size="sm" className="gradient-bg text-primary-foreground" onClick={saveProfile} disabled={saving}>
                <Save className="w-4 h-4 mr-1" /> {saving ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={() => setEditMode(true)}>
                <Edit className="w-4 h-4 mr-1" /> Edit
              </Button>
              <button onClick={() => navigate("/settings")} className="p-2 rounded-full bg-card border border-border">
                <Settings className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Profile Completion */}
      <div className="bg-card rounded-xl p-4 border border-border mb-4">
        <div className="flex justify-between text-xs mb-2">
          <span className="font-medium">Profile Completion</span>
          <span className={completion >= 80 ? "text-green-400" : completion >= 50 ? "text-amber-400" : "text-red-400"}>
            {completion}%
          </span>
        </div>
        <Progress value={completion} className="h-2" />
        {completion < 100 && (
          <p className="text-xs text-muted-foreground mt-2">
            Complete your profile to get better skill matches ✨
          </p>
        )}
      </div>

      {/* Avatar + Name */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <Avatar className="w-20 h-20 mx-auto mb-3">
            {profile.avatar_url && <AvatarImage src={profile.avatar_url} />}
            <AvatarFallback className="gradient-bg text-primary-foreground text-xl font-bold">
              {profile.name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
        <h2 className="text-lg font-heading font-bold">{profile.name}</h2>
        <p className="text-sm text-muted-foreground">{profile.email}</p>
        <div className="flex items-center justify-center gap-1 mt-1">
          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
          <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">({reviews.length} reviews)</span>
        </div>
      </div>

      {/* Clickable Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "Sessions", value: bookings.length, filter: null },
          { label: "Pending", value: bookings.filter((b) => b.status === "Pending").length, filter: "Pending" },
          { label: "Completed", value: bookings.filter((b) => b.status === "Completed").length, filter: "Completed" },
        ].map((stat) => (
          <button
            key={stat.label}
            onClick={() => setActiveStatFilter(activeStatFilter === stat.filter ? null : stat.filter)}
            className={cn(
              "bg-card rounded-xl p-3 border text-center transition-all",
              activeStatFilter === stat.filter ? "border-primary" : "border-border hover:border-primary/50"
            )}
          >
            <p className="font-bold text-xl gradient-text">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Bookings List (shown when stat clicked) */}
      {activeStatFilter !== undefined && (activeStatFilter !== null || bookings.length > 0) && (
        <div className="bg-card rounded-xl border border-border mb-4 overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex justify-between items-center">
            <h3 className="font-heading font-semibold text-sm">
              {activeStatFilter ? `${activeStatFilter} Sessions` : "All Sessions"}
            </h3>
            <button onClick={() => setActiveStatFilter(null)} className="text-xs text-muted-foreground">
              <X className="w-3 h-3" />
            </button>
          </div>
          {filteredBookings.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-6">No sessions found</p>
          ) : (
            filteredBookings.map((b) => (
              <div key={b.id} className="px-4 py-3 border-b border-border last:border-0 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{b.mentor_name}</p>
                  <p className="text-xs text-muted-foreground">{b.skill} · {b.date} · {b.time}</p>
                </div>
                <Badge className={
                  b.status === "Confirmed" ? "bg-green-500/20 text-green-400" :
                    b.status === "Pending" ? "bg-amber-500/20 text-amber-400" :
                      "bg-indigo-500/20 text-indigo-400"
                }>{b.status}</Badge>
              </div>
            ))
          )}
        </div>
      )}

      {/* Bio */}
      <div className="bg-card rounded-xl p-4 border border-border mb-4">
        <h3 className="font-heading font-semibold text-sm mb-2">About</h3>
        {editMode ? (
          <div>
            <textarea
              value={editData.bio}
              onChange={(e) => setEditData((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Tell others about yourself (min. 20 characters)..."
              className="w-full bg-background border border-border rounded-lg p-3 text-sm resize-none h-24 outline-none focus:border-primary"
            />
            <p className="text-xs text-muted-foreground text-right">{editData.bio.length} chars</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {profile.bio || "No bio added yet. Click Edit to add one."}
          </p>
        )}
      </div>

      {/* Skills I Teach */}
      <div className="bg-card rounded-xl p-4 border border-border mb-4">
        <h3 className="font-heading font-semibold text-sm mb-3">Skills I Teach</h3>
        {editMode ? (
          <div>
            <Input
              placeholder="Search skills..."
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              className="mb-3"
            />
            <div className="flex flex-wrap gap-1.5 mb-3">
              {SKILLS_LIST.filter((s) => s.toLowerCase().includes(skillSearch.toLowerCase())).map((s) => (
                <button
                  key={s}
                  onClick={() => toggleTeachSkill(s)}
                  className={cn(
                    "text-xs px-3 py-1 rounded-full border transition-colors",
                    editData.teach_skills.find((ts) => ts.name === s)
                      ? "gradient-bg text-primary-foreground border-transparent"
                      : "border-border text-muted-foreground hover:border-primary"
                  )}
                >{s}</button>
              ))}
            </div>
            {editData.teach_skills.map((s) => (
              <div key={s.name} className="flex items-center gap-2 mb-2">
                <span className="text-sm flex-1">{s.name}</span>
                <div className="flex gap-1">
                  {LEVELS.map((l) => (
                    <button key={l} onClick={() => setSkillLevel(s.name, l)}
                      className={cn("text-xs px-2 py-1 rounded-lg border transition-colors",
                        s.level === l ? "gradient-bg text-primary-foreground border-transparent" : "border-border text-muted-foreground"
                      )}>{l}</button>
                  ))}
                </div>
                <button onClick={() => toggleTeachSkill(s.name)}><X className="w-3 h-3 text-muted-foreground" /></button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.teach_skills.length === 0 ? (
              <p className="text-sm text-muted-foreground">No skills added yet</p>
            ) : (
              profile.teach_skills.map((s) => (
                <span key={s.name} className={cn("text-xs px-3 py-1 rounded-full border", LEVEL_COLORS[s.level] || LEVEL_COLORS.Beginner)}>
                  {s.name} · {s.level}
                </span>
              ))
            )}
          </div>
        )}
      </div>

      {/* Skills I Want to Learn */}
      <div className="bg-card rounded-xl p-4 border border-border mb-4">
        <h3 className="font-heading font-semibold text-sm mb-3">Skills I Want to Learn</h3>
        {editMode ? (
          <div>
            <Input placeholder="Search skills..." value={learnSearch} onChange={(e) => setLearnSearch(e.target.value)} className="mb-3" />
            <div className="flex flex-wrap gap-1.5">
              {SKILLS_LIST.filter((s) => s.toLowerCase().includes(learnSearch.toLowerCase())).map((s) => (
                <button key={s} onClick={() => toggleLearnSkill(s)}
                  className={cn("text-xs px-3 py-1 rounded-full border transition-colors",
                    editData.learn_skills.includes(s)
                      ? "gradient-bg text-primary-foreground border-transparent"
                      : "border-border text-muted-foreground hover:border-primary"
                  )}>{s}</button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.learn_skills.length === 0 ? (
              <p className="text-sm text-muted-foreground">No skills added yet</p>
            ) : (
              profile.learn_skills.map((s) => (
                <Badge key={s} variant="secondary">{s}</Badge>
              ))
            )}
          </div>
        )}
      </div>

      {/* Availability */}
      <div className="bg-card rounded-xl p-4 border border-border mb-4">
        <h3 className="font-heading font-semibold text-sm mb-3">Availability</h3>
        {editMode ? (
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Available Days</Label>
            <div className="flex flex-wrap gap-2 mb-4">
              {DAYS.map((d) => (
                <button key={d} onClick={() => toggleDay(d)}
                  className={cn("text-xs px-3 py-1.5 rounded-lg border transition-colors",
                    editData.available_days.includes(d)
                      ? "gradient-bg text-primary-foreground border-transparent"
                      : "border-border text-muted-foreground"
                  )}>{d.slice(0, 3)}</button>
              ))}
            </div>
            <Label className="text-xs text-muted-foreground mb-2 block">Available Time Slots</Label>
            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map((t) => (
                <button key={t} onClick={() => toggleSlot(t)}
                  className={cn("text-xs py-2 rounded-lg border transition-colors",
                    editData.available_slots.includes(t)
                      ? "gradient-bg text-primary-foreground border-transparent"
                      : "border-border text-muted-foreground"
                  )}>{t}</button>
              ))}
            </div>
            <Label className="text-xs text-muted-foreground mb-2 block mt-4">Preferred Mode</Label>
            <div className="flex gap-2">
              {["Online", "Offline", "Both"].map((m) => (
                <button key={m} onClick={() => setEditData((p) => ({ ...p, preferred_mode: m }))}
                  className={cn("flex-1 py-2 rounded-lg text-xs border transition-colors",
                    editData.preferred_mode === m
                      ? "gradient-bg text-primary-foreground border-transparent"
                      : "border-border text-muted-foreground"
                  )}>{m}</button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {profile.available_days.length === 0 ? (
              <p className="text-sm text-muted-foreground">Not set yet</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {profile.available_days.map((d) => (
                    <span key={d} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{d.slice(0, 3)}</span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {profile.available_slots.map((s) => (
                    <span key={s} className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">{s}</span>
                  ))}
                </div>
                <Badge variant="outline">{profile.preferred_mode}</Badge>
              </>
            )}
          </div>
        )}
      </div>

      {/* Social Links */}
      <div className="bg-card rounded-xl p-4 border border-border mb-4">
        <h3 className="font-heading font-semibold text-sm mb-3">Social Links</h3>
        {editMode ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Linkedin className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <Input placeholder="LinkedIn URL" value={editData.linkedin} onChange={(e) => setEditData((p) => ({ ...p, linkedin: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2">
              <Github className="w-4 h-4 text-foreground flex-shrink-0" />
              <Input placeholder="GitHub URL" value={editData.github} onChange={(e) => setEditData((p) => ({ ...p, github: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2">
              <Twitter className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <Input placeholder="Twitter URL" value={editData.twitter} onChange={(e) => setEditData((p) => ({ ...p, twitter: e.target.value }))} />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {!profile.linkedin && !profile.github && !profile.twitter ? (
              <p className="text-sm text-muted-foreground">No social links added yet</p>
            ) : (
              <>
                {profile.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-400 hover:underline">
                    <Linkedin className="w-4 h-4" /> LinkedIn
                  </a>
                )}
                {profile.github && (
                  <a href={profile.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm hover:underline">
                    <Github className="w-4 h-4" /> GitHub
                  </a>
                )}
                {profile.twitter && (
                  <a href={profile.twitter} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-sky-400 hover:underline">
                    <Twitter className="w-4 h-4" /> Twitter
                  </a>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="bg-card rounded-xl p-4 border border-border mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-semibold text-sm">Reviews</h3>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
            <span className="text-xs font-semibold">{avgRating.toFixed(1)}</span>
          </div>
        </div>
        {reviews.map((r) => (
          <div key={r.author} className="mb-3 last:mb-0 pb-3 last:pb-0 border-b last:border-0 border-border">
            <div className="flex items-center gap-2 mb-1">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-[10px] gradient-bg text-primary-foreground">{r.author[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-semibold">{r.author}</span>
              <div className="flex ml-auto">
                {Array.from({ length: r.stars }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default Profile;