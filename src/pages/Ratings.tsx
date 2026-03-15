import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const pastReviews = [
  { name: "Alex K.", skill: "JavaScript", rating: 5, text: "Excellent teacher!", date: "Feb 18" },
  { name: "Sam R.", skill: "React", rating: 4, text: "Very helpful session.", date: "Feb 16" },
];

const Ratings = () => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  return (
    <div className="px-4 pt-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-card border border-border"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-heading font-semibold">Ratings & Reviews</h1>
      </div>

      {/* Give Rating */}
      <div className="bg-card rounded-xl p-4 border border-border mb-6">
        <h3 className="font-heading font-semibold text-sm mb-3">Rate Your Last Session</h3>
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-10 h-10"><AvatarFallback className="gradient-bg text-primary-foreground text-sm font-semibold">PM</AvatarFallback></Avatar>
          <div><p className="font-semibold text-sm">Priya M.</p><p className="text-xs text-muted-foreground">Guitar Session · Feb 19</p></div>
        </div>
        <div className="flex gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} onClick={() => setRating(s)}>
              <Star className={`w-8 h-8 transition-colors ${(hover || rating) >= s ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
            </button>
          ))}
        </div>
        <Textarea placeholder="Write your feedback..." rows={3} className="mb-3" />
        <Button className="w-full gradient-bg text-primary-foreground">Submit Review</Button>
      </div>

      {/* Past */}
      <h3 className="font-heading font-semibold text-sm mb-3">Past Reviews</h3>
      <div className="space-y-3">
        {pastReviews.map((r, i) => (
          <div key={i} className="bg-card rounded-xl p-3 border border-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold">{r.name}</span>
              <span className="text-[10px] text-muted-foreground">{r.date}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-1">{r.skill} session</p>
            <div className="flex gap-0.5 mb-1">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-3 h-3 fill-yellow-500 text-yellow-500" />)}</div>
            <p className="text-sm text-muted-foreground">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ratings;
