import { useNavigate } from "react-router-dom";
import { Search, Bell, MapPin, TrendingUp, Star, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const recommendedMatches = [
  { name: "Priya M.", skill: "Guitar", wants: "Python", rating: 4.8, match: 92, avatar: "PM" },
  { name: "Alex K.", skill: "UI Design", wants: "Photography", rating: 4.6, match: 88, avatar: "AK" },
  { name: "Sam R.", skill: "Cooking", wants: "JavaScript", rating: 4.9, match: 85, avatar: "SR" },
];

const trendingSkills = ["AI & ML", "Guitar", "Photography", "Web Dev", "Cooking", "Yoga"];

const nearbyUsers = [
  { name: "Riya S.", skill: "Dance", distance: "0.5 km", avatar: "RS" },
  { name: "John D.", skill: "Marketing", distance: "1.2 km", avatar: "JD" },
  { name: "Lisa P.", skill: "Painting", distance: "2 km", avatar: "LP" },
  { name: "Mike T.", skill: "Music", distance: "3 km", avatar: "MT" },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-muted-foreground">Hello 👋</p>
          <h1 className="text-xl font-heading font-bold">Welcome back!</h1>
        </div>
        <button onClick={() => navigate("/notifications")} className="relative p-2 rounded-full bg-card border border-border">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent" />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search skills, people..." className="pl-10 h-11 bg-card" />
      </div>

      {/* Trending */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h2 className="font-heading font-semibold text-sm">Trending Skills</h2>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {trendingSkills.map((skill) => (
            <Badge key={skill} variant="secondary" className="whitespace-nowrap px-3 py-1.5 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      {/* Recommended Matches */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-semibold text-sm">Recommended Matches</h2>
          <button onClick={() => navigate("/matchmaking")} className="text-xs text-primary flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></button>
        </div>
        <div className="space-y-3">
          {recommendedMatches.map((user) => (
            <div key={user.name} onClick={() => navigate("/matchmaking")} className="bg-card rounded-xl p-4 border border-border flex items-center gap-3 cursor-pointer hover:border-primary/50 transition-colors">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="gradient-bg text-primary-foreground font-semibold text-sm">{user.avatar}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{user.name}</h3>
                  <Badge className="gradient-bg text-[10px] px-2">{user.match}% match</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Teaches <span className="text-foreground">{user.skill}</span> · Wants <span className="text-foreground">{user.wants}</span></p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  <span className="text-xs text-muted-foreground">{user.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nearby */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-accent" />
          <h2 className="font-heading font-semibold text-sm">Nearby Users</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {nearbyUsers.map((u) => (
            <div key={u.name} className="bg-card rounded-xl p-3 border border-border min-w-[120px] text-center cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate("/profile")}>
              <Avatar className="w-12 h-12 mx-auto mb-2">
                <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold text-sm">{u.avatar}</AvatarFallback>
              </Avatar>
              <p className="text-xs font-semibold truncate">{u.name}</p>
              <p className="text-[10px] text-muted-foreground">{u.skill}</p>
              <p className="text-[10px] text-primary mt-1">{u.distance}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
