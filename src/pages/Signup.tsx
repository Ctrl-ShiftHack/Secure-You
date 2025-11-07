import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreed: false
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useI18n();
  const { signUp, user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trim all inputs
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedPassword = formData.password.trim();
    const trimmedConfirmPassword = formData.confirmPassword.trim();
    
    // Validate required fields
    if (!trimmedName || !trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
      toast({
        title: t("signup.errors.fillFields") || "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    // Validate name length
    if (trimmedName.length < 2) {
      toast({
        title: "Invalid Name",
        description: "Name must be at least 2 characters long",
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

    // Validate password length
    if (trimmedPassword.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    // Validate password strength (optional but recommended)
    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(trimmedPassword)) {
      toast({
        title: "Weak Password",
        description: "Password should contain both letters and numbers",
        variant: "destructive"
      });
      return;
    }

    // Validate passwords match
    if (trimmedPassword !== trimmedConfirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords are identical",
        variant: "destructive"
      });
      return;
    }

    // Validate terms agreement
    if (!formData.agreed) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions to continue",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(trimmedEmail, trimmedPassword, trimmedName);
      
      if (error) {
        toast({
          title: "Signup Failed",
          description: error.message || "Could not create account",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: t("signup.errors.accountCreatedTitle") || "Account Created! 🎉",
        description: "Please check your email and click the verification link to activate your account. After verifying, you can login.",
        duration: 10000, // Show for 10 seconds
      });

      // Stay on signup page or redirect to login with a message
      // Don't navigate to setup yet - user needs to verify email first
      setTimeout(() => {
        navigate("/login", { 
          state: { 
            message: "Please verify your email and then login to continue" 
          } 
        });
      }, 3000);
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
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
          <Shield className="w-10 h-10 text-white" />
        </div>
  <h1 className="text-3xl font-bold text-foreground">{t("signup.title")}</h1>
  <p className="text-muted-foreground mt-2">{t("signup.subtitle")}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSignup} className="flex-1 max-w-md mx-auto w-full">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-foreground mb-2 block">
              {t("signup.fullName")}
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
              <Input
                id="name"
                type="text"
                placeholder={t("signup.fullName")}
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="pl-10 h-12 rounded-xl"
                autoComplete="name"
                required
                disabled={loading}
                aria-label="Full name"
                minLength={2}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="text-foreground mb-2 block">
              {t("signup.emailLabel")}
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
              <Input
                id="email"
                type="email"
                placeholder={t("signup.emailPlaceholder")}
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
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
              {t("signup.password")}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
              <Input
                id="password"
                type="password"
                placeholder={t("signup.passwordPlaceholder") || "Create a strong password"}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="pl-10 h-12 rounded-xl"
                autoComplete="new-password"
                required
                disabled={loading}
                aria-label="Password"
                minLength={6}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-foreground mb-2 block">
              {t("signup.confirmPassword")}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                className="pl-10 h-12 rounded-xl"
                autoComplete="new-password"
                required
                disabled={loading}
                aria-label="Confirm password"
                minLength={6}
              />
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-3 pt-2">
            <Checkbox
              id="terms"
              checked={formData.agreed}
              onCheckedChange={(checked) => handleChange("agreed", checked as boolean)}
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
              {t("signup.terms")}
            </label>
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-full gradient-primary text-white font-semibold mt-6"
            disabled={loading}
          >
            {loading ? "Creating account..." : t("signup.createAccount")}
          </Button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-muted-foreground">Or Continue With</span>
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

        {/* Login link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-primary font-semibold hover:underline"
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
};

export default Signup;
