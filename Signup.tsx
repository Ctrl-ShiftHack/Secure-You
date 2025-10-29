import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import useProfile from "@/hooks/use-profile";
import { useI18n } from "@/i18n";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreed: false
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useI18n();
  const { setProfile } = useProfile();

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: t("signup.errors.fillFields") || "Error",
        description: t("signup.errors.fillFields"),
        variant: "destructive"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive"
      });
      return;
    }

    if (!formData.agreed) {
      toast({
        title: "Error",
        description: "Please agree to terms and conditions",
        variant: "destructive"
      });
      return;
    }

      toast({
        title: t("signup.errors.accountCreatedTitle"),
        description: t("signup.errors.accountCreatedMsg")
      });
      // persist basic profile so app shows the correct name immediately
      setProfile({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      navigate("/setup");
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
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder={t("signup.fullName")}
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="pl-10 h-12 rounded-xl"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="text-foreground mb-2 block">
              {t("signup.emailLabel")}
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="text"
                placeholder={t("signup.emailPlaceholder")}
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="pl-10 h-12 rounded-xl"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password" className="text-foreground mb-2 block">
              {t("signup.password")}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder={t("signup.passwordPlaceholder") || "Create a strong password"}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="pl-10 h-12 rounded-xl"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-foreground mb-2 block">
              {t("signup.confirmPassword")}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                className="pl-10 h-12 rounded-xl"
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
          >
            {t("signup.createAccount")}
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
