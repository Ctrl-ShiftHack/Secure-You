import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Users, User, Phone, Home, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { contactsService, profileService } from "@/services/api";
import { isValidBDPhone, formatBDPhone, normalizeBDPhone, getPhoneErrorMessage, isValidName, sanitizeText, isValidEmail, normalizeEmail } from "@/lib/validation";

interface EmergencyContactForm {
  name: string;
  phone: string;
  email?: string;
  relationship: string;
}

const Setup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    bloodGroup: "",
    address: "",
    permanentAddress: "",
  });
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContactForm[]>([
    { name: "", phone: "", email: "", relationship: "" },
  ]);
  const [saving, setSaving] = useState(false);
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
      // Just navigate to dashboard - skip setup entirely
      toast({
        title: "Welcome! 👋",
        description: "You can add emergency contacts from the Contacts page anytime"
      });
      navigate("/dashboard", { replace: true });
    }
  };

  const handleChange = (field: string, value: string) => {
    // Format phone number as user types
    if (field === 'phone') {
      // Remove non-digit characters for validation
      const cleaned = value.replace(/\D/g, '');
      // Format if valid BD number structure
      if (cleaned.length >= 10 && isValidBDPhone(value)) {
        setFormData(prev => ({ ...prev, [field]: formatBDPhone(value) }));
        return;
      }
    }
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
                placeholder="+880 1XXX XXX XXX or 01XXXXXXXXX"
                className="pl-10 h-12 rounded-xl"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                type="tel"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Enter Bangladesh mobile number (11 digits)
            </p>
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
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="bg-card p-4 rounded-xl border border-border space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-semibold">
                    {t("setup.emergencyContact")} {index + 1}
                    {index > 0 && <span className="text-xs text-muted-foreground ml-2">({t("setup.optional") || "Optional"})</span>}
                  </Label>
                  {index > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const updated = emergencyContacts.filter((_, i) => i !== index);
                        setEmergencyContacts(updated);
                      }}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div>
                  <Input
                    placeholder="Full name"
                    className="h-12 rounded-xl"
                    value={contact.name}
                    onChange={(e) => {
                      const updated = [...emergencyContacts];
                      updated[index].name = e.target.value;
                      setEmergencyContacts(updated);
                    }}
                    required={index === 0}
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="+880 1XXX XXX XXX"
                    className="pl-10 h-12 rounded-xl"
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => {
                      const updated = [...emergencyContacts];
                      const value = e.target.value;
                      // Auto-format if valid
                      if (value.replace(/\D/g, '').length >= 10 && isValidBDPhone(value)) {
                        updated[index].phone = formatBDPhone(value);
                      } else {
                        updated[index].phone = value;
                      }
                      setEmergencyContacts(updated);
                    }}
                    required={index === 0}
                  />
                </div>

                <div>
                  <Input
                    placeholder="Email (optional)"
                    type="email"
                    className="h-12 rounded-xl"
                    value={contact.email || ''}
                    onChange={(e) => {
                      const updated = [...emergencyContacts];
                      updated[index].email = e.target.value;
                      setEmergencyContacts(updated);
                    }}
                  />
                </div>

                <div>
                  <Input
                    placeholder="Relationship (e.g., Father, Mother, Friend)"
                    className="h-12 rounded-xl"
                    value={contact.relationship}
                    onChange={(e) => {
                      const updated = [...emergencyContacts];
                      updated[index].relationship = e.target.value;
                      setEmergencyContacts(updated);
                    }}
                  />
                </div>
              </div>
            ))}

            {emergencyContacts.length < 5 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEmergencyContacts([
                    ...emergencyContacts,
                    { name: "", phone: "", email: "", relationship: "" },
                  ]);
                }}
                className="w-full h-12 rounded-xl border-2 border-dashed"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Another Contact
              </Button>
            )}
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
        {step > 1 ? (
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            className="flex-1 h-12 rounded-full border-2"
            disabled={saving}
          >
            {t("setup.back")}
          </Button>
        ) : (
          <Button
            variant="ghost"
            onClick={() => {
              toast({
                title: "Setup Skipped",
                description: "You can set up your profile from Settings later"
              });
              navigate("/dashboard", { replace: true });
            }}
            className="flex-1 h-12 rounded-full"
            disabled={saving}
          >
            Skip Setup
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={saving}
          className="flex-1 h-12 rounded-full gradient-primary text-white font-semibold"
        >
          {saving ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </div>
          ) : (
            step === 3 ? "Complete" : t("setup.continue")
          )}
        </Button>
      </div>
    </div>
  );
};

export default Setup;
