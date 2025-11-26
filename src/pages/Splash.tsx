import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { useI18n } from "@/i18n";
import { useAuth } from "@/contexts/AuthContext";

const Splash = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Wait for auth to initialize
    if (loading) return;

    const timer = setTimeout(() => {
      // If user is logged in, go to dashboard
      if (user) {
        navigate("/dashboard");
      }
      // All non-authenticated users go to login
      else {
        navigate("/login");
      }
    }, 1500); // Reduced from 2000ms for better UX

    return () => clearTimeout(timer);
  }, [navigate, user, loading]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a1628] px-4 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#1a2744] to-[#0a1628] animate-gradient-shift" />
      
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse-slow" />
      
      <div className="relative z-10 flex flex-col items-center animate-fade-in-up">
        {/* Logo with gradient shield */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-3xl blur-xl opacity-60 animate-pulse" />
          <div className="relative bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 p-8 rounded-3xl">
            <Shield className="w-24 h-24 text-white drop-shadow-2xl" strokeWidth={1.5} />
          </div>
        </div>
        
        <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
          Secure You
        </h1>
        <p className="text-cyan-200/80 text-center text-lg">Your Safety, Our Priority</p>
        
        {/* Loading indicator */}
        <div className="mt-12 flex gap-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

export default Splash;
