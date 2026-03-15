import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Smartphone } from "lucide-react";
import { supabase } from "@/lib/supabase";

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"email" | "phone" | "otp" | "forgot">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otpTimer, setOtpTimer] = useState(0);
  const passwordRef = useRef<HTMLInputElement>(null);

  const startTimer = () => {
    setOtpTimer(60);
    const interval = setInterval(() => {
      setOtpTimer((t) => { if (t <= 1) { clearInterval(interval); return 0; } return t - 1; });
    }, 1000);
  };

  const validateEmail = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!isValidEmail(email)) e.email = "Invalid email format";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Minimum 8 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleEmailLogin = async () => {
    if (!validateEmail()) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setErrors({ general: error.message }); return; }
    navigate("/home");
  };

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/home" }
    });
    if (error) { setErrors({ general: error.message }); setLoading(false); }
  };

  const handleSendOtp = async () => {
    if (!phone.trim() || phone.length < 10) {
      setErrors({ phone: "Valid phone number required" }); return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setLoading(false);
    if (error) { setErrors({ phone: error.message }); return; }
    setMode("otp");
    startTimer();
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.length !== 6) {
      setErrors({ otp: "Enter 6-digit OTP" }); return;
    }
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
    setLoading(false);
    if (error) { setErrors({ otp: error.message }); return; }
    navigate("/home");
  };

  const handleForgotPassword = async () => {
    if (!email.trim() || !isValidEmail(email)) {
      setErrors({ email: "Enter a valid email address" }); return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset"
    });
    setLoading(false);
    if (error) { setErrors({ general: error.message }); return; }
    setErrors({ success: "Password reset email sent! Check your inbox." });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-16 pb-8 max-w-lg mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-heading font-bold gradient-text mb-2">SkillSwap</h1>
        <p className="text-muted-foreground text-sm">Exchange skills, grow together</p>
      </div>

      {/* Error / Success */}
      {errors.general && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {errors.general}
        </div>
      )}
      {errors.success && (
        <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
          {errors.success}
        </div>
      )}

      {/* EMAIL LOGIN */}
      {mode === "email" && (
        <div className="space-y-5 flex-1">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
              onKeyDown={(e) => { if (e.key === "Enter") passwordRef.current?.focus(); }}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                ref={passwordRef}
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors({}); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleEmailLogin(); }}
                className={errors.password ? "border-red-500" : ""}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs">{errors.password}</p>}
          </div>

          <button
            onClick={() => setMode("forgot")}
            className="text-sm text-primary hover:underline block ml-auto"
          >
            Forgot Password?
          </button>

          <Button
            className="w-full gradient-bg text-primary-foreground h-12 text-base font-semibold"
            onClick={handleEmailLogin}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Log In"}
          </Button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-4 text-xs text-muted-foreground">OR</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-12 gap-3"
            onClick={handleGoogle}
            disabled={loading}
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            Continue with Google
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 gap-3"
            onClick={() => { setMode("phone"); setErrors({}); }}
          >
            <Smartphone className="w-5 h-5" />
            Continue with Phone
          </Button>
        </div>
      )}

      {/* FORGOT PASSWORD */}
      {mode === "forgot" && (
        <div className="space-y-5 flex-1">
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input
              placeholder="Enter your email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
          </div>
          <Button
            className="w-full gradient-bg text-primary-foreground h-12"
            onClick={handleForgotPassword}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
          <button
            onClick={() => { setMode("email"); setErrors({}); }}
            className="text-sm text-primary hover:underline block text-center w-full"
          >
            Back to Login
          </button>
        </div>
      )}

      {/* PHONE */}
      {mode === "phone" && (
        <div className="space-y-5 flex-1">
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input
              placeholder="+91 9876543210"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setErrors({}); }}
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && <p className="text-red-400 text-xs">{errors.phone}</p>}
            <p className="text-xs text-muted-foreground">Include country code e.g. +91</p>
          </div>
          <Button
            className="w-full gradient-bg text-primary-foreground h-12"
            onClick={handleSendOtp}
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </Button>
          <button
            onClick={() => { setMode("email"); setErrors({}); }}
            className="text-sm text-primary hover:underline block text-center w-full"
          >
            Back to Login
          </button>
        </div>
      )}

      {/* OTP VERIFY */}
      {mode === "otp" && (
        <div className="space-y-5 flex-1">
          <p className="text-sm text-muted-foreground text-center">
            OTP sent to <span className="text-foreground font-semibold">{phone}</span>
          </p>
          <div className="space-y-2">
            <Label>Enter OTP</Label>
            <Input
              placeholder="6-digit OTP"
              value={otp}
              maxLength={6}
              onChange={(e) => { setOtp(e.target.value); setErrors({}); }}
              className={errors.otp ? "border-red-500" : ""}
            />
            {errors.otp && <p className="text-red-400 text-xs">{errors.otp}</p>}
          </div>
          <Button
            className="w-full gradient-bg text-primary-foreground h-12"
            onClick={handleVerifyOtp}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>
          <button
            onClick={() => { if (otpTimer === 0) handleSendOtp(); }}
            disabled={otpTimer > 0}
            className={`text-sm block text-center w-full ${otpTimer > 0 ? "text-muted-foreground" : "text-primary hover:underline"}`}
          >
            {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : "Resend OTP"}
          </button>
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground mt-8">
        Don't have an account?{" "}
        <button onClick={() => navigate("/signup")} className="text-primary font-semibold hover:underline">
          Sign Up
        </button>
      </p>
    </div>
  );
};

export default Login;