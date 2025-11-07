import { Shield, Users, MapPin, BellOff, MessageCircle, Mail, ChevronRight, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

const Help = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  const tutorials = [
    { icon: Shield, key: "onboarding.slides.0" , color: "bg-emergency/10 text-emergency" },
    { icon: Users, key: "onboarding.slides.1", color: "bg-primary/10 text-primary" },
    { icon: MapPin, key: "onboarding.slides.2", color: "bg-info/10 text-info" },
    { icon: BellOff, key: "help.tutorials.3", color: "bg-warning/10 text-warning" }
  ];

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
  <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-foreground flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="font-medium">{t("back")}</span>
        </Button>
  <h1 className="text-xl font-bold text-foreground">{t("help.title")}</h1>
        <div className="w-10" />
      </div>

      {/* Tutorials */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          {t("help.tutorials")}
        </h3>
        
        <div className="space-y-3">
          {tutorials.map((tutorial, index) => {
            const slide: any = t(tutorial.key) || {};
            const title = slide?.title ?? "";
            const description = slide?.description ?? "";
            return (
              <button
                key={index}
                onClick={() => navigate(`/help/tutorial/${index}`)}
                className="w-full bg-card p-4 rounded-2xl shadow-soft border border-border hover:shadow-medium transition-all flex items-center gap-4"
              >
                <div className={`w-12 h-12 rounded-xl ${tutorial.color} flex items-center justify-center flex-shrink-0`}>
                  <tutorial.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-foreground">{title}</h4>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          {t("help.faqTitle")}
        </h3>
        
        <div className="bg-card p-6 rounded-2xl shadow-soft border border-border space-y-4">
          <div>
            <h4 className="font-semibold text-foreground mb-2">{t("help.howItWorks")}</h4>
            <p className="text-sm text-muted-foreground">
              {t("help.howItWorksDesc") || "Press and hold the SOS button to instantly alert your emergency contacts with your location."}
            </p>
          </div>
          
          <div className="h-px bg-border" />
          
          <div>
            <h4 className="font-semibold text-foreground mb-2">{t("help.isLocationShared")}</h4>
            <p className="text-sm text-muted-foreground">
              {t("help.isLocationSharedDesc") || "Your location is only shared when you activate SOS or manually share it from the map screen."}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          {t("help.contactUs")}
        </h3>
        
        <div className="space-y-3">
          <button
            onClick={() => window.location.href = 'mailto:helpteam@secureyou.com'}
            className="w-full bg-card p-4 rounded-2xl shadow-soft border border-border hover:shadow-medium transition-all flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-semibold text-foreground">{t("help.emailSupport")}</h4>
              <p className="text-sm text-muted-foreground">helpteam@secureyou.com</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/help/chat')}
            className="w-full bg-card p-4 rounded-2xl shadow-soft border border-border hover:shadow-medium transition-all flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-success" />
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-semibold text-foreground">{t("help.liveChat")}</h4>
              <p className="text-sm text-muted-foreground">{t("help.available247")}</p>
            </div>
          </button>
        </div>
      </div>

      {/* Feedback */}
      <div className="mt-8 bg-accent p-6 rounded-2xl text-center">
  <h3 className="font-semibold text-foreground mb-2">{t("help.feedbackTitle")}</h3>
  <p className="text-sm text-muted-foreground mb-4">{t("help.feedbackDesc")}</p>
  <Button
    className="gradient-primary text-white rounded-full"
    onClick={() => window.location.href = 'mailto:feedback@secureyou.com?subject=App%20Feedback'}
  >
    {t("help.giveFeedback")}
  </Button>
      </div>
    </div>
  );
};

export default Help;
