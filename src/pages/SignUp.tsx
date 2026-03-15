import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

const skillSuggestions = ["JavaScript", "Python", "Guitar", "Photography", "Cooking", "Design", "Marketing", "Yoga", "Dancing", "Writing"];
const levels = ["Beginner", "Intermediate", "Expert"];
const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

const SignUp = () => {
  const navigate = useNavigate();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [teachSkills, setTeachSkills] = useState<string[]>([]);
  const [learnSkills, setLearnSkills] = useState<string[]>([]);
  const [level, setLevel] = useState("");
  const [teachInput, setTeachInput] = useState("");
  const [learnInput, setLearnInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Full name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!isValidEmail(email)) e.email = "Invalid email format";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Minimum 8 characters";
    if (teachSkills.length === 0) e.teachSkills = "Add at least 1 skill you can teach";
    if (learnSkills.length === 0) e.learnSkills = "Add at least 1 skill you want to learn";
    if (!level) e.level = "Select your experience level";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addSkill = (skill: string, type: "teach" | "learn") => {
    if (type === "teach" && !teachSkills.includes(skill)) setTeachSkills([...teachSkills, skill]);
    if (type === "learn" && !learnSkills.includes(skill)) setLearnSkills([...learnSkills, skill]);
  };

  const removeSkill = (skill: string, type: "teach" | "learn") => {
    if (type === "teach") setTeachSkills(teachSkills.filter((s) => s !== skill));
    else setLearnSkills(learnSkills.filter((s) => s !== skill));
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
    if (error) {
      setErrors({ general: error.message });
      setLoading(false);
      return;
    }
    if (data.user) {
      // Wait a moment for the trigger to create the profile first
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const { error: profileError } = await supabase.from("profiles").update({
        name,
        teach_skills: teachSkills.map((s) => ({ name: s, level })),
        learn_skills: learnSkills,
        is_onboarded: false,
      }).eq("id", data.user.id);

      if (profileError) {
        setErrors({ general: profileError.message });
        setLoading(false);
        return;
      }
    }
    setLoading(false);
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-background px-6 pt-4 pb-8 max-w-lg mx-auto">
      <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground mb-6">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>
      <h1 className="text-2xl font-heading font-bold mb-1">Create Account</h1>
      <p className="text-sm text-muted-foreground mb-6">Join the skill exchange community</p>

      {errors.general && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {errors.general}
        </div>
      )}

      <div className="space-y-5">
        {/* Name */}
        <div className="space-y-2">
          <Label>Full Name *</Label>
          <Input
            placeholder="Your name"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors({}); }}
            onKeyDown={(e) => { if (e.key === "Enter") emailRef.current?.focus(); }}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label>Email *</Label>
          <Input
            ref={emailRef}
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
            onKeyDown={(e) => { if (e.key === "Enter") passwordRef.current?.focus(); }}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label>Password *</Label>
          <Input
            ref={passwordRef}
            type="password"
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors({}); }}
            className={errors.password ? "border-red-500" : ""}
          />
          {errors.password && <p className="text-red-400 text-xs">{errors.password}</p>}
        </div>

        {/* Teach Skills */}
        <div className="space-y-2">
          <Label>Skills you can teach *</Label>
          <Input
            placeholder="Type a skill and press Enter..."
            value={teachInput}
            onChange={(e) => setTeachInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && teachInput.trim()) {
                addSkill(teachInput.trim(), "teach");
                setTeachInput("");
                setErrors({});
              }
            }}
          />
          <div className="flex flex-wrap gap-2">
            {teachSkills.map((s) => (
              <Badge key={s} className="gradient-bg gap-1 pr-1">
                {s}
                <button onClick={() => removeSkill(s, "teach")}><X className="w-3 h-3" /></button>
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {skillSuggestions.filter((s) => !teachSkills.includes(s)).slice(0, 5).map((s) => (
              <button
                key={s}
                onClick={() => { addSkill(s, "teach"); setErrors({}); }}
                className="text-xs border border-border rounded-full px-3 py-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
          {errors.teachSkills && <p className="text-red-400 text-xs">{errors.teachSkills}</p>}
        </div>

        {/* Learn Skills */}
        <div className="space-y-2">
          <Label>Skills you want to learn *</Label>
          <Input
            placeholder="Type a skill and press Enter..."
            value={learnInput}
            onChange={(e) => setLearnInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && learnInput.trim()) {
                addSkill(learnInput.trim(), "learn");
                setLearnInput("");
                setErrors({});
              }
            }}
          />
          <div className="flex flex-wrap gap-2">
            {learnSkills.map((s) => (
              <Badge key={s} variant="secondary" className="gap-1 pr-1">
                {s}
                <button onClick={() => removeSkill(s, "learn")}><X className="w-3 h-3" /></button>
              </Badge>
            ))}
          </div>
          {errors.learnSkills && <p className="text-red-400 text-xs">{errors.learnSkills}</p>}
        </div>

        {/* Level */}
        <div className="space-y-2">
          <Label>Experience Level *</Label>
          <div className="flex gap-2">
            {levels.map((l) => (
              <button
                key={l}
                onClick={() => { setLevel(l); setErrors({}); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${level === l
                  ? "gradient-bg text-primary-foreground border-transparent"
                  : "border-border text-muted-foreground hover:border-primary"
                  }`}
              >
                {l}
              </button>
            ))}
          </div>
          {errors.level && <p className="text-red-400 text-xs">{errors.level}</p>}
        </div>

        <Button
          className="w-full gradient-bg text-primary-foreground h-12 text-base font-semibold mt-4"
          onClick={handleSignUp}
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create Account"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button onClick={() => navigate("/")} className="text-primary font-semibold hover:underline">
            Log In
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;