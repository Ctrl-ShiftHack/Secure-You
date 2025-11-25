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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary to-primary-dark px-4">
      <div className="animate-pulse-slow">
        <Shield className="w-24 h-24 text-white mb-6" />
      </div>
  <h1 className="text-4xl font-bold text-white mb-2">{t("splash.title")}</h1>
  <p className="text-white/90 text-center">{t("splash.subtitle")}</p>
    </div>
  );
};

export default Splash;
