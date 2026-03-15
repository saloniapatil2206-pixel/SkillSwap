import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Smartphone } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-16 pb-8 max-w-lg mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-heading font-bold gradient-text mb-2">SkillSwap</h1>
        <p className="text-muted-foreground text-sm">Exchange skills, grow together</p>
      </div>

      <div className="space-y-5 flex-1">
        <div className="space-y-2">
          <Label htmlFor="email">Email or Mobile</Label>
          <Input id="email" placeholder="Enter email or mobile" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button onClick={() => {}} className="text-sm text-primary hover:underline block ml-auto">Forgot Password?</button>

        <Button className="w-full gradient-bg text-primary-foreground h-12 text-base font-semibold" onClick={() => navigate("/home")}>
          Log In
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center"><span className="bg-background px-4 text-xs text-muted-foreground">OR</span></div>
        </div>

        <Button variant="outline" className="w-full h-12 gap-3" onClick={() => navigate("/home")}>
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          Continue with Google
        </Button>
        <Button variant="outline" className="w-full h-12 gap-3" onClick={() => navigate("/home")}>
          <Smartphone className="w-5 h-5" />
          Continue with Phone
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-8">
        Don't have an account?{" "}
        <button onClick={() => navigate("/signup")} className="text-primary font-semibold hover:underline">Sign Up</button>
      </p>
    </div>
  );
};

export default Login;
