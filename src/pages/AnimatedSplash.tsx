import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const AnimatedSplash = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'hold' | 'exit'>('enter');

  useEffect(() => {
    // Check if this is first load (not seen splash yet in this session)
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    
    if (hasSeenSplash && !authLoading) {
      // Skip splash, go directly to appropriate page
      setShowSplash(false);
      if (user) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
      return;
    }

    // Animation sequence
    const enterTimer = setTimeout(() => {
      setAnimationPhase('hold');
    }, 500); // Logo fade in

    const holdTimer = setTimeout(() => {
      setAnimationPhase('exit');
    }, 2000); // Hold for 2 seconds total

    const exitTimer = setTimeout(() => {
      // Mark splash as seen
      sessionStorage.setItem('hasSeenSplash', 'true');
      
      // Navigate based on auth status
      if (!authLoading) {
        if (user) {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/login", { replace: true });
        }
      }
    }, 2500); // Exit animation

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
    };
  }, [navigate, user, authLoading]);

  if (!showSplash) {
    return null;
  }

  return (
    <div 
      className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0a1628] via-[#1a2744] to-[#0a1628] px-4 relative overflow-hidden transition-opacity duration-500 ${
        animationPhase === 'exit' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#1a2744] to-[#0a1628] animate-gradient-shift" />
      
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      
      <div className={`relative z-10 flex flex-col items-center transition-all duration-700 ${
        animationPhase === 'enter' ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'
      }`}>
        {/* Logo with gradient shield */}
        <div className="relative mb-8">
          {/* Outer glow ring */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-3xl blur-2xl opacity-60 animate-pulse" />
          
          {/* Shield background */}
          <div className="relative bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 p-8 rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <Shield className="w-24 h-24 text-white drop-shadow-2xl animate-shield-pulse" strokeWidth={1.5} />
          </div>
          
          {/* Rotating ring */}
          <div className="absolute inset-0 border-4 border-cyan-400/30 rounded-3xl animate-spin-slow" />
        </div>
        
        {/* Title with gradient text */}
        <h1 className="text-5xl md:text-6xl font-bold mb-3 tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient-x">
          Secure You
        </h1>
        
        <p className="text-cyan-200/90 text-center text-lg md:text-xl font-medium animate-fade-in-delayed">
          Your Safety, One Tap Away
        </p>
        
        {/* Loading indicator */}
        <div className="mt-12 flex gap-2">
          <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce shadow-lg shadow-cyan-400/50" style={{ animationDelay: '0ms' }} />
          <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce shadow-lg shadow-blue-400/50" style={{ animationDelay: '150ms' }} />
          <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce shadow-lg shadow-purple-400/50" style={{ animationDelay: '300ms' }} />
        </div>

        {/* Progress bar */}
        <div className="mt-8 w-64 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 animate-progress-bar rounded-full" />
        </div>
      </div>

      {/* Version text */}
      <div className="absolute bottom-8 text-center">
        <p className="text-white/40 text-xs animate-fade-in-delayed">
          v1.0.0 - Emergency Safety Platform
        </p>
      </div>

      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes shield-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes progress-bar {
          0% { width: 0%; }
          100% { width: 100%; }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }

        @keyframes fade-in-delayed {
          0% { opacity: 0; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }

        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }

        .animate-gradient-x {
          background-size: 200% auto;
          animation: gradient-x 3s linear infinite;
        }

        .animate-shield-pulse {
          animation: shield-pulse 2s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }

        .animate-progress-bar {
          animation: progress-bar 2s ease-in-out forwards;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-fade-in-delayed {
          animation: fade-in-delayed 2s ease-in forwards;
        }
      `}</style>
    </div>
  );
};

export default AnimatedSplash;
