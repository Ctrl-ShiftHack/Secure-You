/**
 * Onboarding Page
 * Two-step signup flow:
 * 1. Intro slides showing app features
 * 2. Signup form with email/password or OAuth (Google/Facebook)
 * 
 * Features:
 * - Email validation with real-time feedback
 * - Password strength validation
 * - Optional profile fields (name, phone, blood type)
 * - OAuth social login support
 * - Auto-redirect if already logged in
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, MapPin, Bell, Eye, EyeOff, User, Phone, Calendar, Droplet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Logo } from "@/components/Logo";

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useI18n();  // Translation function

  // UI State
  const [step, setStep] = useState<'intro' | 'signup'>('intro');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Form Data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    dateOfBirth: '',
    bloodType: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Intro slide content
  const slides = [
    { icon: Shield, key: 'safety' },
    { icon: MapPin, key: 'location' },
    { icon: Bell, key: 'alerts' }
  ];

  /**
   * Redirect to dashboard if user is already logged in
   */
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard", { replace: true });
      }
    };
    checkAuth();
  }, [navigate]);

  /**
   * Auto-advance intro slides every 3 seconds
   */
  useEffect(() => {
    if (step !== 'intro') return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [step, slides.length]);

  // ========== Validation Functions ==========

  /**
   * Validate email format
   */
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  /**
   * Validate password strength
   * Requirements: 8+ chars, uppercase, lowercase, number, special char
   */
  const validatePassword = useCallback((password: string): string | null => {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Must contain uppercase letter";
    if (!/[a-z]/.test(password)) return "Must contain lowercase letter";
    if (!/[0-9]/.test(password)) return "Must contain a number";
    if (!/[!@#$%^&*]/.test(password)) return "Must contain special character (!@#$%^&*)";
    return null;
  }, []);

  /**
   * Validate phone number format (optional field)
   */
  const validatePhone = useCallback((phone: string): boolean => {
    if (!phone) return true;
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
  }, []);

  /**
   * Handle input changes with real-time validation
   */
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Real-time validation for password
    if (field === 'password' && value) {
      const passwordError = validatePassword(value);
      if (passwordError) {
        setErrors(prev => ({ ...prev, password: passwordError }));
      }
    }

    // Real-time validation for confirm password
    if (field === 'confirmPassword' && value !== formData.password) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
    } else if (field === 'confirmPassword' && value === formData.password) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.confirmPassword;
        return newErrors;
      });
    }
  }, [errors, formData.password, validatePassword]);

  /**
   * Validate all form fields before submission
   * Checks required fields and validates optional fields if provided
   * @returns true if form is valid, false otherwise
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const passwordError = validatePassword(formData.password);
      if (passwordError) newErrors.password = passwordError;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Optional but validated fields
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      const dayDiff = today.getDate() - dob.getDate();
      
      const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
      
      if (actualAge < 13) {
        newErrors.dateOfBirth = "You must be at least 13 years old";
      } else if (actualAge > 120) {
        newErrors.dateOfBirth = "Invalid date of birth";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateEmail, validatePassword, validatePhone]);

  // ========== Signup Functions ==========

  /**
   * Handle OAuth social login (Google/Facebook)
   * Redirects to provider's auth page
   * @param provider - 'google' or 'facebook'
   */
  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      setLoading(true);
      
      const redirectUrl = import.meta.env.PROD 
        ? 'https://secure-you.vercel.app/setup'
        : `${window.location.origin}/setup`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      
      // OAuth redirects, so no need for toast
    } catch (err: any) {
      console.error(`${provider} login error:`, err);
      toast({
        title: "Login Failed",
        description: err?.message || `Could not login with ${provider}. Please try again.`,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  /**
   * Create user profile in database with retry logic
   * Retries up to 3 times with exponential backoff
   * @param profileData - User profile data
   * @param retries - Number of retry attempts (default: 3)
   */
  const createProfileWithRetry = async (profileData: any, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      const { error } = await supabase
        .from('profiles')
        .insert(profileData);

      if (!error) return { success: true };
      
      if (i === retries - 1) {
        console.error('Profile creation failed after retries:', error);
        return { success: false, error };
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
    return { success: false };
  };

  /**
   * Handle user signup
   * 1. Validates form
   * 2. Creates auth user in Supabase
   * 3. Creates profile in database
   * 4. Redirects to setup or login based on email confirmation
   */
  const handleSignup = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Sign up the user - Supabase auth will handle duplicate email check
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim() || undefined,
          },
          emailRedirectTo: import.meta.env.PROD 
            ? 'https://secure-you.vercel.app/setup'
            : `${window.location.origin}/setup`,
        },
      });

      if (signUpError) throw signUpError;

      if (!authData.user) {
        throw new Error("Signup failed - no user returned. Please try again.");
      }

      // Save profile details (with retry logic)
      const profileData = {
        user_id: authData.user.id,
        full_name: formData.fullName.trim() || 'User',
        phone_number: formData.phone.trim() || '',
        blood_type: formData.bloodType || null,
      };

      // Try to create profile, but don't block signup if it fails
      const profileResult = await createProfileWithRetry(profileData);
      
      if (!profileResult.success) {
        console.warn('Profile creation failed, but signup succeeded. User can update profile later.');
      }

      // Mark onboarding as complete
      localStorage.setItem('hasSeenOnboarding', 'true');

      const isEmailConfirmed = authData.user.email_confirmed_at !== null;

      toast({
        title: "Account Created! 🎉",
        description: isEmailConfirmed
          ? "Welcome to SecureYou! Redirecting..."
          : "Please check your email to verify your account.",
        duration: 3000,
      });

      // Navigate after a short delay
      setTimeout(() => {
        if (isEmailConfirmed) {
          navigate("/setup", { replace: true });
        } else {
          navigate("/login", { 
            replace: true,
            state: { message: "Please verify your email to continue" }
          });
        }
      }, 1500);

    } catch (err: any) {
      console.error('Signup error:', err);
      
      let errorMessage = "Failed to create account. Please try again.";
      
      if (err.message?.includes("already registered")) {
        errorMessage = "This email is already registered. Please login instead.";
      } else if (err.message?.includes("Invalid email")) {
        errorMessage = "Invalid email address. Please check and try again.";
      } else if (err.message?.includes("Password")) {
        errorMessage = err.message;
      } else if (err.message?.includes("network") || err.message?.includes("fetch")) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Skip to app (for quick access)
  const handleSkipDetails = () => {
    if (!formData.email || !formData.password) {
      toast({
        title: "Required Fields Missing",
        description: "Email and password are required to continue",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.confirmPassword) {
      toast({
        title: "Confirm Password",
        description: "Please confirm your password",
        variant: "destructive",
      });
      return;
    }
    
    handleSignup();
  };

  // Render intro slides
  if (step === 'intro') {
    const { icon: Icon } = slides[currentSlide];
    const slidesData: any[] = t("onboarding.slides") || [];
    const title = slidesData[currentSlide]?.title || "Welcome to SecureYou";
    const description = slidesData[currentSlide]?.description || "Your safety companion";

    return (
      <div className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-b from-background to-accent/10 px-4 sm:px-6 py-8 sm:py-12">
        {/* Logo at top */}
        <div className="w-full flex justify-center pt-4">
          <Logo size="lg" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md w-full mt-8 sm:mt-12">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-primary/10 flex items-center justify-center mb-6 sm:mb-8 animate-pulse">
            <Icon className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">{title}</h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed px-4">{description}</p>
        </div>

        <div className="w-full max-w-md space-y-4">
          <div className="flex justify-center gap-2 mb-6 sm:mb-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-muted hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <Button
            onClick={() => setStep('signup')}
            className="w-full h-11 sm:h-12 rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold shadow-lg transition-all hover:shadow-xl"
          >
            Get Started
          </Button>

          <Button
            variant="ghost"
            onClick={() => {
              localStorage.setItem('hasSeenOnboarding', 'true');
              navigate("/login");
            }}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            Already have an account? <span className="font-semibold ml-1">Sign In</span>
          </Button>
        </div>
      </div>
    );
  }

  // Render signup form
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/10 px-4 sm:px-6 py-6 sm:py-8 overflow-y-auto">
      <div className="max-w-lg mx-auto pb-8">
        {/* Logo at top */}
        <div className="flex justify-center mb-6">
          <Logo size="md" />
        </div>

        <Card className="border-2 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Sign up to start protecting yourself and your loved ones
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
                className="h-10 sm:h-11"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <img src="https://www.google.com/favicon.ico" alt="" className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="hidden sm:inline">Google</span>
                    <span className="sm:hidden">Google</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('facebook')}
                disabled={loading}
                className="h-10 sm:h-11"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <img src="https://www.facebook.com/favicon.ico" alt="" className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="hidden sm:inline">Facebook</span>
                    <span className="sm:hidden">Facebook</span>
                  </>
                )}
              </Button>
            </div>

            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                or continue with email
              </span>
            </div>

            {/* Email & Password */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={loading}
                  className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  autoComplete="email"
                />
                {errors.email && (
                  <p id="email-error" className="text-xs text-destructive flex items-center gap-1" role="alert">
                    <span className="text-base">⚠️</span> {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    disabled={loading}
                    className={errors.password ? 'border-destructive focus-visible:ring-destructive pr-10' : 'pr-10'}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-xs text-destructive flex items-center gap-1" role="alert">
                    <span className="text-base">⚠️</span> {errors.password}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Must be 8+ characters with uppercase, lowercase, number & special character
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    disabled={loading}
                    className={errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive pr-10' : 'pr-10'}
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p id="confirm-password-error" className="text-xs text-destructive flex items-center gap-1" role="alert">
                    <span className="text-base">⚠️</span> {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Optional Profile Details */}
            <Alert className="bg-accent/50 border-primary/20">
              <AlertDescription className="text-xs sm:text-sm">
                <strong>Optional:</strong> Add your details now or update them later in your profile settings.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-sm font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  disabled={loading}
                  autoComplete="name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={loading}
                    className={errors.phone ? 'border-destructive' : ''}
                    aria-invalid={!!errors.phone}
                    autoComplete="tel"
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive flex items-center gap-1" role="alert">
                      <span className="text-base">⚠️</span> {errors.phone}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bloodType" className="text-sm font-medium flex items-center gap-1.5">
                    <Droplet className="w-3.5 h-3.5" />
                    Blood Type
                  </Label>
                  <Select
                    value={formData.bloodType}
                    onValueChange={(value) => handleInputChange('bloodType', value)}
                    disabled={loading}
                  >
                    <SelectTrigger id="bloodType" className="h-10">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOOD_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dateOfBirth" className="text-sm font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Date of Birth
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  disabled={loading}
                  max={new Date().toISOString().split('T')[0]}
                  className={errors.dateOfBirth ? 'border-destructive' : ''}
                  aria-invalid={!!errors.dateOfBirth}
                />
                {errors.dateOfBirth && (
                  <p className="text-xs text-destructive flex items-center gap-1" role="alert">
                    <span className="text-base">⚠️</span> {errors.dateOfBirth}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <Button
                onClick={handleSignup}
                disabled={loading || Object.keys(errors).length > 0}
                className="w-full h-11 sm:h-12 rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              <Button
                onClick={handleSkipDetails}
                disabled={loading || !formData.email || !formData.password || !formData.confirmPassword}
                variant="outline"
                className="w-full h-10"
              >
                Skip Optional Details
              </Button>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground pt-2">
              By signing up, you agree to our{' '}
              <button 
                className="underline hover:text-foreground transition-colors" 
                onClick={() => window.open('/terms', '_blank')}
                type="button"
              >
                Terms of Service
              </button>{' '}
              and{' '}
              <button 
                className="underline hover:text-foreground transition-colors" 
                onClick={() => window.open('/privacy', '_blank')}
                type="button"
              >
                Privacy Policy
              </button>
            </div>

            <Button
              variant="ghost"
              onClick={() => {
                localStorage.setItem('hasSeenOnboarding', 'true');
                navigate("/login");
              }}
              disabled={loading}
              className="w-full text-sm hover:bg-accent"
            >
              Already have an account? <span className="font-semibold ml-1 text-primary">Sign In</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
