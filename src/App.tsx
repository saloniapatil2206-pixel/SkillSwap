import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth pages - no bottom nav */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* App pages - with bottom nav */}
          <Route element={<AppLayout />}>
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

export default App;
