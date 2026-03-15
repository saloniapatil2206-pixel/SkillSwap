import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const AddSkill = () => {
  const navigate = useNavigate();
  const [type, setType] = useState<"teach" | "learn">("teach");
  const [method, setMethod] = useState<"online" | "offline" | "both">("online");

  return (
    <div className="px-4 pt-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-card border border-border"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-heading font-semibold">Add Skill</h1>
      </div>

      {/* Type Toggle */}
      <div className="flex gap-2 mb-6">
        {(["teach", "learn"] as const).map((t) => (
          <button key={t} onClick={() => setType(t)} className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors ${type === t ? "gradient-bg text-primary-foreground" : "bg-card border border-border text-muted-foreground"}`}>
            {t === "teach" ? "I Can Teach" : "I Want to Learn"}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label>Skill Name</Label>
          <Input placeholder="e.g., Python Programming" />
        </div>

        <div className="space-y-2">
          <Label>Experience Level</Label>
          <div className="flex gap-2">
            {["Beginner", "Intermediate", "Expert"].map((l) => (
              <button key={l} className="flex-1 py-2.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors">{l}</button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Teaching Method</Label>
          <div className="flex gap-2">
            {(["online", "offline", "both"] as const).map((m) => (
              <button key={m} onClick={() => setMethod(m)} className={`flex-1 py-2.5 rounded-lg text-xs font-medium border transition-colors capitalize ${method === m ? "gradient-bg text-primary-foreground border-transparent" : "border-border text-muted-foreground"}`}>{m}</button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea placeholder="Describe what you'll teach or want to learn..." rows={4} />
        </div>

        <div className="space-y-2">
          <Label>Upload Certificate (Optional)</Label>
          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors">
            <p className="text-sm text-muted-foreground">Tap to upload</p>
            <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (max 5MB)</p>
          </div>
        </div>

        <Button className="w-full gradient-bg text-primary-foreground h-12 text-base font-semibold" onClick={() => navigate(-1)}>
          Add Skill
        </Button>
      </div>
    </div>
  );
};

export default AddSkill;
