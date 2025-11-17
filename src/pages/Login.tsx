import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield, Mail, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { isValidEmail, normalizeEmail } from "@/lib/validation";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
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

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message || `Could not login with ${provider}`,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedEmail = resetEmail.trim();
    
    if (!trimmedEmail) {
      toast({
        title: t("login.errors.fillFields"),
        description: t("login.errors.invalidEmail"),
        variant: "destructive"
      });
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      toast({
        title: "Invalid Email",
        description: t("login.errors.invalidEmail"),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const normalizedEmail = normalizeEmail(trimmedEmail);
      
      // First check if user exists
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" which we handle below
        throw checkError;
      }

      if (!existingUser) {
        toast({
          title: "No Account Found",
          description: "No account exists with this email address. Please sign up first.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // User exists, send reset email
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: t("login.errors.resetFailed"),
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: t("login.errors.resetEmailSent"),
          description: t("login.errors.resetEmailSentMsg"),
        });
        setShowForgotPassword(false);
        setResetEmail("");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
    if (!isValidEmail(trimmedEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Normalize email
      const normalizedEmail = normalizeEmail(trimmedEmail);
      const { error } = await signIn(normalizedEmail, trimmedPassword);
      
      if (error) {
        console.error('Login error:', error);
        
        // Provide specific error messages
        let errorTitle = "Login Failed";
        let errorDescription = error.message || "Invalid email or password";
        
        // Handle specific error cases
        if (error.message?.toLowerCase().includes('network') || error.message?.toLowerCase().includes('fetch')) {
          errorTitle = "Connection Error";
          errorDescription = "Unable to connect to the server. Please check your internet connection and try again.";
        } else if (error.message?.toLowerCase().includes('invalid') || error.message?.toLowerCase().includes('credentials')) {
          errorTitle = "Invalid Credentials";
          errorDescription = "The email or password you entered is incorrect. Please try again.";
        } else if (error.message?.toLowerCase().includes('email not confirmed')) {
          errorTitle = "Email Not Verified";
          errorDescription = "Please check your email and click the verification link before logging in.";
        }
        
        toast({
          title: errorTitle,
          description: errorDescription,
          variant: "destructive",
          duration: 6000,
        });
        return;
      }

      toast({
        title: t("login.errors.welcomeBackTitle") || "Welcome back!",
        description: t("login.errors.welcomeBackMsg") || "You've successfully logged in"
      });

      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Unexpected login error:', err);
      toast({
        title: "Error",
        description: err?.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with Logo */}
      <div className="flex flex-col items-center pt-16 pb-8 px-6">
        <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mb-6">
          <Shield className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {t("login.welcome") || "Welcome Back"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("login.subtitle") || "Sign in to your account"}
        </p>
      </div>

      {/* Login Form */}
      <div className="flex-1 px-6">
        <div className="max-w-md mx-auto w-full">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div>
              <Label htmlFor="email" className="sr-only">
                {t("login.emailLabel")}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t("login.emailPlaceholder") || "Phone number, username, or email"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-muted/30 border-border"
                  autoComplete="email"
                  required
                  disabled={loading}
                  aria-label="Email address"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <Label htmlFor="password" className="sr-only">
                {t("login.passwordLabel")}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("login.passwordPlaceholder") || "Password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 rounded-xl bg-muted/30 border-border"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  aria-label="Password"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold"
              disabled={loading}
            >
              {loading ? "Signing in..." : t("login.continue") || "Log in"}
            </Button>
          </form>

          {/* Forgot Password */}
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-muted-foreground hover:text-foreground"
              disabled={loading}
            >
              {t("login.forgotPassword") || "Forgot Password?"}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-muted-foreground">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-xl border-border hover:bg-muted/50"
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-2" />
              Continue with Google
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              className="w-full h-12 rounded-xl text-primary hover:bg-primary/5"
              onClick={() => handleSocialLogin('facebook')}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Log in with Facebook
            </Button>
          </div>

          {/* Sign up link */}
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-primary font-semibold hover:underline"
                disabled={loading}
              >
                {t("login.signupLink") || "Sign up"}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              {t("login.resetPassword")}
            </DialogTitle>
            <DialogDescription>
              {t("login.resetPasswordSubtitle")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="reset-email" className="text-foreground mb-2 block">
                {t("login.emailLabel")}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder={t("login.emailPlaceholder")}
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                  autoComplete="email"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmail("");
                }}
                disabled={loading}
                className="flex-1 h-12 rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("login.backToLogin")}
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-12 rounded-xl gradient-primary text-white font-semibold"
              >
                {loading ? "Sending..." : t("login.sendResetLink")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
