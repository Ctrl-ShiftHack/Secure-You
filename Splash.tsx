import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { useI18n } from "@/i18n";

const Splash = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/onboarding");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

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
