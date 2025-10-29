import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, MapPin, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

const slides = [
  { icon: Shield },
  { icon: MapPin },
  { icon: Bell }
];

const Onboarding = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("/login");
    }
  };

  const handleSkip = () => {
    navigate("/login");
  };

  const { icon: Icon } = slides[currentSlide];
  const { t } = useI18n();
  const slidesData: any[] = t("onboarding.slides") || [];
  const title = slidesData[currentSlide]?.title || "";
  const description = slidesData[currentSlide]?.description || "";

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-background px-6 py-12">
      {/* Skip button */}
      <div className="w-full flex justify-end">
        <Button variant="ghost" onClick={handleSkip}>
          Skip
        </Button>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm">
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

        {/* Next/Get Started button */}
        <Button
          onClick={handleNext}
          className="w-full h-12 rounded-full gradient-primary text-white font-semibold"
        >
          {currentSlide === slides.length - 1 ? t("onboarding.getStarted") : t("onboarding.next")}
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
