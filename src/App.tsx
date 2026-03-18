import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import AppLayout from "./components/AppLayout";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import AddSkill from "./pages/AddSkill";
import Matchmaking from "./pages/Matchmaking";
import Booking from "./pages/Booking";
import WalletPage from "./pages/WalletPage";
import Chat from "./pages/Chat";
import Ratings from "./pages/Ratings";
import Notifications from "./pages/Notifications";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute = ({ children, session }: { children: React.ReactNode; session: Session | null }) => {
  if (!session) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold gradient-text mb-2">SkillSwap</h1>
          <p className="text-muted-foreground text-sm animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename="/SkillSwap">
          <Routes>
            {/* Auth pages - redirect to home if already logged in */}
            <Route path="/" element={session ? <Navigate to="/home" replace /> : <Login />} />
            <Route path="/signup" element={session ? <Navigate to="/home" replace /> : <SignUp />} />

            {/* Protected app pages */}
            <Route element={
              <ProtectedRoute session={session}>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route path="/home" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/add-skill" element={<AddSkill />} />
              <Route path="/matchmaking" element={<Matchmaking />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/ratings" element={<Ratings />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;