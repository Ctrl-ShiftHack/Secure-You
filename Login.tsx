import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n";
import useProfile from "@/hooks/use-profile";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useI18n();
  const { profile, setProfile } = useProfile();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: t("login.errors.fillFields") ? "Error" : "Error",
        description: t("login.errors.fillFields"),
        variant: "destructive"
      });
      return;
    }

    // Simulate login
    toast({
      title: t("login.errors.welcomeBackTitle"),
      description: t("login.errors.welcomeBackMsg")
    });
    // update stored profile for this user (keep existing name if present)
    try {
      const name = profile?.name || (email.split("@")[0] || email);
      setProfile({
        ...(profile || {}),
        name,
        email,
      });
    } catch (e) {}

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background px-6 py-8">
      {/* Header */}
      <div className="flex flex-col items-center mb-12 mt-8">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
          <Shield className="w-10 h-10 text-white" />
        </div>
  <h1 className="text-3xl font-bold text-foreground">{t("login.welcome")}</h1>
  <p className="text-muted-foreground mt-2">{t("login.subtitle")}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="flex-1 max-w-md mx-auto w-full">
        <div className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-foreground mb-2 block">
              {t("login.emailLabel")}
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="text"
                placeholder={t("login.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 rounded-xl"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password" className="text-foreground mb-2 block">
              {t("login.passwordLabel")}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder={t("login.passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12 rounded-xl"
              />
            </div>
          </div>

            <Button
            type="submit"
            className="w-full h-12 rounded-full gradient-primary text-white font-semibold mt-6"
          >
            {t("login.continue")}
          </Button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-muted-foreground">{t("login.orContinueWith")}</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Social Login */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 rounded-xl border-2"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-2" />
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 rounded-xl border-2"
          >
            <img src="https://www.facebook.com/favicon.ico" alt="Facebook" className="w-5 h-5 mr-2" />
            Facebook
          </Button>
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          {t("login.signupPrompt")} {" "}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="text-primary font-semibold hover:underline"
          >
            {t("login.signup")}
          </button>
        </p>

        {/* Skip link */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="text-muted-foreground hover:text-foreground"
          >
            {t("login.skip")}
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;
