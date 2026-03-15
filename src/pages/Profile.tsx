import { useNavigate } from "react-router-dom";
import { ArrowLeft, Settings, Star, Award, Edit, MapPin } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const Profile = () => {
  const navigate = useNavigate();

  return (
    <div className="px-4 pt-4">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-card border border-border"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-heading font-semibold">Profile</h1>
        <button onClick={() => navigate("/settings")} className="p-2 rounded-full bg-card border border-border"><Settings className="w-5 h-5" /></button>
      </div>

      {/* Profile Card */}
      <div className="text-center mb-6">
        <Avatar className="w-20 h-20 mx-auto mb-3">
          <AvatarFallback className="gradient-bg text-primary-foreground text-xl font-bold">JS</AvatarFallback>
        </Avatar>
        <h2 className="text-lg font-heading font-bold">Jordan Smith</h2>
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1"><MapPin className="w-3 h-3" />San Francisco, CA</p>
        <div className="flex justify-center gap-4 mt-3">
          <div className="text-center"><p className="font-bold text-lg">4.8</p><p className="text-[10px] text-muted-foreground">Rating</p></div>
          <div className="w-px bg-border" />
          <div className="text-center"><p className="font-bold text-lg">24</p><p className="text-[10px] text-muted-foreground">Sessions</p></div>
          <div className="w-px bg-border" />
          <div className="text-center"><p className="font-bold text-lg">150</p><p className="text-[10px] text-muted-foreground">Credits</p></div>
        </div>
      </div>

      <Button variant="outline" className="w-full mb-6 gap-2" onClick={() => navigate("/add-skill")}><Edit className="w-4 h-4" />Edit Profile</Button>

      {/* Bio */}
      <div className="bg-card rounded-xl p-4 border border-border mb-4">
        <h3 className="font-heading font-semibold text-sm mb-2">About</h3>
        <p className="text-sm text-muted-foreground">Full-stack developer passionate about sharing knowledge. Love teaching web development and learning creative skills.</p>
      </div>

      {/* Skills Offered */}
      <div className="bg-card rounded-xl p-4 border border-border mb-4">
        <h3 className="font-heading font-semibold text-sm mb-3">Skills I Teach</h3>
        <div className="space-y-3">
          {[{ skill: "JavaScript", level: 90 }, { skill: "React", level: 85 }, { skill: "Node.js", level: 75 }].map((s) => (
            <div key={s.skill}>
              <div className="flex justify-between text-xs mb-1"><span>{s.skill}</span><span className="text-muted-foreground">{s.level}%</span></div>
              <Progress value={s.level} className="h-1.5" />
            </div>
          ))}
        </div>
      </div>

      {/* Skills Required */}
      <div className="bg-card rounded-xl p-4 border border-border mb-4">
        <h3 className="font-heading font-semibold text-sm mb-3">Skills I Want to Learn</h3>
        <div className="flex flex-wrap gap-2">
          {["Guitar", "Photography", "Cooking"].map((s) => (
            <Badge key={s} variant="secondary">{s}</Badge>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-card rounded-xl p-4 border border-border mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-semibold text-sm">Reviews</h3>
          <button onClick={() => navigate("/ratings")} className="text-xs text-primary">See all</button>
        </div>
        {[{ name: "Priya M.", text: "Amazing teacher! Very patient.", rating: 5 }, { name: "Alex K.", text: "Great session, learned a lot.", rating: 4 }].map((r) => (
          <div key={r.name} className="mb-3 last:mb-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{r.name}</span>
              <div className="flex">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-yellow-500 text-yellow-500" />)}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
