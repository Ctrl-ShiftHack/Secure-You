import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useI18n();
  const { signIn, user } = useAuth();

  const from = location.state?.from?.pathname || "/dashboard";
  const signupMessage = location.state?.message;

  // Show message from signup if present
  useEffect(() => {
    if (signupMessage) {
      toast({
        title: "Email Verification Required",
        description: signupMessage,
        duration: 8000,
      });
    }
  }, [signupMessage, toast]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trim whitespace
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    
    // Validate required fields
    if (!trimmedEmail || !trimmedPassword) {
      toast({
        title: t("login.errors.fillFields") || "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(trimmedEmail, trimmedPassword);
      
      if (error) {
        toast({
          title: "Login Failed",
          description: error.message || "Invalid email or password",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: t("login.errors.welcomeBackTitle") || "Welcome back!",
        description: t("login.errors.welcomeBackMsg") || "You've successfully logged in"
      });

      navigate(from, { replace: true });
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
              <Input
                id="email"
                type="email"
                placeholder={t("login.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 rounded-xl"
                autoComplete="email"
                required
                disabled={loading}
                aria-label="Email address"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password" className="text-foreground mb-2 block">
              {t("login.passwordLabel")}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
              <Input
                id="password"
                type="password"
                placeholder={t("login.passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12 rounded-xl"
                autoComplete="current-password"
                required
                disabled={loading}
                aria-label="Password"
                minLength={6}
              />
            </div>
          </div>

            <Button
            type="submit"
            className="w-full h-12 rounded-full gradient-primary text-white font-semibold mt-6"
            disabled={loading}
          >
            {loading ? "Signing in..." : t("login.continue")}
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
