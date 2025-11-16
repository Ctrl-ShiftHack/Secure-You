import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, MapPin, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const slides = [
  { icon: Shield },
  { icon: MapPin },
  { icon: Bell }
];

const Onboarding = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("/signup");
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/setup`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
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

  const { icon: Icon } = slides[currentSlide];
  const { t } = useI18n();
  const slidesData: any[] = t("onboarding.slides") || [];
  const title = slidesData[currentSlide]?.title || "";
  const description = slidesData[currentSlide]?.description || "";

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-background px-6 py-12">
      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mt-12">
        <div className="w-32 h-32 rounded-full bg-accent flex items-center justify-center mb-8">
          <Icon className="w-16 h-16 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-4">{title}</h2>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>

      {/* Navigation */}
      <div className="w-full max-w-sm">
        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide 
                  ? 'w-8 bg-primary' 
                  : 'w-2 bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Social Login Buttons (only on last slide) */}
        {currentSlide === slides.length - 1 && (
          <div className="space-y-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Quick Sign Up</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
              className="w-full h-12 rounded-xl border-2"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-2" />
              Continue with Google
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialLogin('facebook')}
              disabled={loading}
              className="w-full h-12 rounded-xl border-2"
            >
              <img src="https://www.facebook.com/favicon.ico" alt="Facebook" className="w-5 h-5 mr-2" />
              Continue with Facebook
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or use email</span>
              </div>
            </div>
          </div>
        )}

        {/* Next/Get Started button */}
        <Button
          onClick={handleNext}
          disabled={loading}
          className="w-full h-12 rounded-full gradient-primary text-white font-semibold"
        >
          {currentSlide === slides.length - 1 ? t("onboarding.getStarted") : t("onboarding.next")}
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
