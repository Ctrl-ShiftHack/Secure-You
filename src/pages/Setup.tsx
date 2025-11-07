import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Users, User, Phone, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n";
import { useAuth } from "@/contexts/AuthContext";

const Setup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    bloodGroup: "",
    address: "",
    permanentAddress: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useI18n();
  const { user, profile, updateProfile } = useAuth();

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      const fullName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || '';
      const phone = profile?.phone_number || '';
      const bloodGroup = profile?.blood_type || '';
      const address = profile?.address || '';
      
      setFormData(prev => ({
        ...prev,
        fullName,
        phone,
        bloodGroup,
        address,
      }));
    }
  }, [user, profile]);

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Save profile on final step
      try {
        if (user && formData.fullName) {
          await updateProfile({
            full_name: formData.fullName,
            phone_number: formData.phone,
            blood_type: formData.bloodGroup,
            address: formData.address,
          });
          
          toast({
            title: "Setup Complete! 🎉",
            description: "Your profile has been saved"
          });
          navigate("/dashboard");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not save profile. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      {/* Header */}
      <div className="mb-8">
  <h1 className="text-2xl font-bold text-foreground mb-2">{t("setup.title")}</h1>
  <p className="text-muted-foreground">{t("setup.stepOf").replace("{step}", String(step))}</p>
        
        {/* Progress bar */}
        <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full gradient-primary transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Personal Info */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">{t("setup.fullName")}</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder={t("setup.fullName")}
                className="pl-10 h-12 rounded-xl"
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label className="mb-2 block">{t("setup.personalNumber")}</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder={t("setup.personalNumberPlaceholder") || "Enter your phone number"}
                className="pl-10 h-12 rounded-xl"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                type="tel"
                required
              />
            </div>
          </div>

          <div>
            <Label className="mb-2 block">{t("setup.bloodGroup")}</Label>
            <Input
              placeholder="e.g., A+, B-, O+"
              className="h-12 rounded-xl"
              value={formData.bloodGroup}
              onChange={(e) => handleChange("bloodGroup", e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Step 2: Address */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">{t("setup.presentAddress")}</Label>
            <div className="relative">
              <Home className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <textarea
                placeholder={t("setup.presentAddressPlaceholder") || "Enter your present address"}
                className="w-full pl-10 p-3 rounded-xl border border-input bg-background min-h-24 resize-none"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label className="mb-2 block">{t("setup.permanentAddress")}</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <textarea
                placeholder="Enter your permanent address"
                className="w-full pl-10 p-3 rounded-xl border border-input bg-background min-h-24 resize-none"
                value={formData.permanentAddress}
                onChange={(e) => handleChange("permanentAddress", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Emergency Contacts */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-accent p-4 rounded-xl">
            <p className="text-sm text-muted-foreground">
              Add at least one emergency contact who will receive your SOS alerts
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">{t("setup.emergencyContact") + " 1"}</Label>
              <Input
                placeholder="Contact name"
                className="h-12 rounded-xl mb-2"
              />
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Phone number"
                  className="pl-10 h-12 rounded-xl"
                  defaultValue="+880 1712 345678"
                />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">{t("setup.emergencyContact") + " 2 (" + (t("setup.optional") || "Optional") + ")"}</Label>
              <Input
                placeholder="Contact name"
                className="h-12 rounded-xl mb-2"
              />
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Phone number"
                  className="pl-10 h-12 rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="bg-card p-4 rounded-xl border border-border">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-foreground">{t("setup.locationPermissionTitle")}</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("setup.locationPermissionDesc")}
            </p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="fixed bottom-8 left-6 right-6 flex gap-3">
        {step > 1 && (
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            className="flex-1 h-12 rounded-full border-2"
          >
            {t("setup.back")}
          </Button>
        )}
        <Button
          onClick={handleNext}
          className="flex-1 h-12 rounded-full gradient-primary text-white font-semibold"
        >
          {step === 3 ? t("setup.completeSetup") : t("setup.continue")}
        </Button>
      </div>
    </div>
  );
};

export default Setup;
