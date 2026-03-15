import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, X } from "lucide-react";

const skillSuggestions = ["JavaScript", "Python", "Guitar", "Photography", "Cooking", "Design", "Marketing", "Yoga", "Dancing", "Writing"];
const levels = ["Beginner", "Intermediate", "Expert"];

const SignUp = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [teachSkills, setTeachSkills] = useState<string[]>([]);
  const [learnSkills, setLearnSkills] = useState<string[]>([]);
  const [level, setLevel] = useState("");
  const [teachInput, setTeachInput] = useState("");
  const [learnInput, setLearnInput] = useState("");

  const addSkill = (skill: string, type: "teach" | "learn") => {
    if (type === "teach" && !teachSkills.includes(skill)) setTeachSkills([...teachSkills, skill]);
    if (type === "learn" && !learnSkills.includes(skill)) setLearnSkills([...learnSkills, skill]);
  };

  const removeSkill = (skill: string, type: "teach" | "learn") => {
    if (type === "teach") setTeachSkills(teachSkills.filter((s) => s !== skill));
    else setLearnSkills(learnSkills.filter((s) => s !== skill));
  };

  return (
    <div className="min-h-screen bg-background px-6 pt-4 pb-8 max-w-lg mx-auto">
      <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground mb-6">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>
      <h1 className="text-2xl font-heading font-bold mb-1">Create Account</h1>
      <p className="text-sm text-muted-foreground mb-6">Join the skill exchange community</p>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Password</Label>
          <Input type="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Skills you can teach</Label>
          <Input placeholder="Type a skill..." value={teachInput} onChange={(e) => setTeachInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && teachInput.trim()) { addSkill(teachInput.trim(), "teach"); setTeachInput(""); }}} />
          <div className="flex flex-wrap gap-2">
            {teachSkills.map((s) => (
              <Badge key={s} className="gradient-bg gap-1 pr-1">{s}<button onClick={() => removeSkill(s, "teach")}><X className="w-3 h-3" /></button></Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {skillSuggestions.filter((s) => !teachSkills.includes(s)).slice(0, 5).map((s) => (
              <button key={s} onClick={() => addSkill(s, "teach")} className="text-xs border border-border rounded-full px-3 py-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors">{s}</button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Skills you want to learn</Label>
          <Input placeholder="Type a skill..." value={learnInput} onChange={(e) => setLearnInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && learnInput.trim()) { addSkill(learnInput.trim(), "learn"); setLearnInput(""); }}} />
          <div className="flex flex-wrap gap-2">
            {learnSkills.map((s) => (
              <Badge key={s} variant="secondary" className="gap-1 pr-1">{s}<button onClick={() => removeSkill(s, "learn")}><X className="w-3 h-3" /></button></Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Experience Level</Label>
          <div className="flex gap-2">
            {levels.map((l) => (
              <button key={l} onClick={() => setLevel(l)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${level === l ? "gradient-bg text-primary-foreground border-transparent" : "border-border text-muted-foreground hover:border-primary"}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <Button className="w-full gradient-bg text-primary-foreground h-12 text-base font-semibold mt-4" onClick={() => navigate("/home")}>
          Create Account
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button onClick={() => navigate("/")} className="text-primary font-semibold hover:underline">Log In</button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
