import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Star, Clock, MapPin, Filter } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const matches = [
  { name: "Priya M.", teaches: "Guitar", wants: "Python", rating: 4.8, match: 95, availability: "Weekends", location: "2 km", avatar: "PM" },
  { name: "Alex K.", teaches: "UI Design", wants: "Photography", rating: 4.6, match: 90, availability: "Evenings", location: "5 km", avatar: "AK" },
  { name: "Sam R.", teaches: "Cooking", wants: "JavaScript", rating: 4.9, match: 87, availability: "Mornings", location: "1 km", avatar: "SR" },
  { name: "Mia L.", teaches: "Yoga", wants: "React", rating: 4.7, match: 82, availability: "Flexible", location: "3 km", avatar: "ML" },
];

const Matchmaking = () => {
  const navigate = useNavigate();

  return (
    <div className="px-4 pt-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-card border border-border"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="font-heading font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" />AI Matches</h1>
            <p className="text-xs text-muted-foreground">Best matches for you</p>
          </div>
        </div>
        <button className="p-2 rounded-full bg-card border border-border"><Filter className="w-5 h-5" /></button>
      </div>

      <div className="space-y-3">
        {matches.map((m) => (
          <div key={m.name} className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-start gap-3">
              <Avatar className="w-14 h-14">
                <AvatarFallback className="gradient-bg text-primary-foreground font-semibold">{m.avatar}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{m.name}</h3>
                  <Badge className="gradient-bg text-xs">{m.match}%</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Teaches <span className="text-foreground font-medium">{m.teaches}</span> · Wants <span className="text-foreground font-medium">{m.wants}</span></p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />{m.rating}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{m.availability}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{m.location}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate("/chat")}>Message</Button>
              <Button size="sm" className="flex-1 gradient-bg text-primary-foreground" onClick={() => navigate("/booking")}>Book Session</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Matchmaking;
