import { User, Lock, MapPin, Phone, Globe, Bell, HelpCircle, LogOut, ChevronRight, Eye, EyeOff, Mail, AlertCircle, Database, Wifi, MapPinned } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { useI18n, availableLocales } from "@/i18n";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { isValidBDPhone, formatBDPhone, normalizeBDPhone, getPhoneErrorMessage, isValidName, sanitizeText, isValidEmail, normalizeEmail, getPasswordStrength } from "@/lib/validation";
import { getCacheStatus } from "@/lib/offline";
import { isTrackingActive, getLocationHistory } from "@/lib/backgroundTracking";

// Emergency System Status Component
const EmergencySystemStatus = () => {
  const [cacheStatus, setCacheStatus] = useState<any>(null);
  const [trackingActive, setTrackingActive] = useState(false);
  const [locationCount, setLocationCount] = useState(0);

  useEffect(() => {
    const updateStatus = () => {
      const status = getCacheStatus();
      setCacheStatus(status);
      setTrackingActive(isTrackingActive());
      
      try {
        const history = getLocationHistory();
        setLocationCount(history.length);
      } catch {
        setLocationCount(0);
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="divide-y divide-border">
      {/* Cache Status */}
      <div className="p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
          <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground">Offline Cache</p>
          <p className="text-sm text-muted-foreground">
            {cacheStatus?.contactCount || 0} contacts cached
          </p>
          {cacheStatus?.lastSync && (
            <p className="text-xs text-muted-foreground mt-1">
              Last sync: {formatDate(cacheStatus.lastSync)}
            </p>
          )}
        </div>
        <div className={`px-2 py-1 rounded-md text-xs font-medium ${
          cacheStatus?.contactCount > 0 
            ? 'bg-success/10 text-success' 
            : 'bg-muted text-muted-foreground'
        }`}>
          {cacheStatus?.contactCount > 0 ? 'Ready' : 'Empty'}
        </div>
      </div>

      {/* Queued Alerts */}
      {cacheStatus?.queuedAlerts > 0 && (
        <div className="p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <Wifi className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground">Queued Alerts</p>
            <p className="text-sm text-muted-foreground">
              {cacheStatus.queuedAlerts} alert{cacheStatus.queuedAlerts !== 1 ? 's' : ''} waiting to send
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              Will send automatically when online
            </p>
          </div>
        </div>
      )}

      {/* Location Tracking */}
      <div className="p-4 flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          trackingActive 
            ? 'bg-success/10' 
            : 'bg-muted'
        }`}>
          <MapPinned className={`w-5 h-5 ${
            trackingActive 
              ? 'text-success' 
              : 'text-muted-foreground'
          }`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground">Location Tracking</p>
          <p className="text-sm text-muted-foreground">
            {trackingActive 
              ? `Active - ${locationCount} location${locationCount !== 1 ? 's' : ''} recorded` 
              : 'Inactive'
            }
          </p>
          {trackingActive && (
            <p className="text-xs text-success mt-1">
              Background GPS monitoring enabled
            </p>
          )}
        </div>
        <div className={`px-2 py-1 rounded-md text-xs font-medium ${
          trackingActive 
            ? 'bg-success/10 text-success' 
            : 'bg-muted text-muted-foreground'
        }`}>
          {trackingActive ? 'Active' : 'Standby'}
        </div>
      </div>
    </div>
  );
};

const Settings = () => {
  const navigate = useNavigate();
  const { t, locale, setLocale } = useI18n();
  const { user, profile, updateProfile, updatePassword, updateEmail, signOut } = useAuth();
  const { toast } = useToast();

  const initials = (profile?.full_name || "").split(" ").map(s => s[0] || "").slice(0,2).join("").toUpperCase();

  // Theme preference
  const [dark, setDark] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem("secureyou_theme");
      return v === "dark";
    } catch (e) {
      return false;
    }
  });

  const appSettings = [
    { icon: Globe, label: t("settings.language"), value: locale, hasSwitch: false },
    { icon: Bell, label: t("settings.notifications"), hasSwitch: true, defaultChecked: true },
  ];

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState<'name' | 'phone' | 'address' | 'bloodType' | 'password' | 'email' | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [nameValue, setNameValue] = useState("");
  const [phoneValue, setPhoneValue] = useState("");
  const [addressValue, setAddressValue] = useState("");
  const [bloodTypeValue, setBloodTypeValue] = useState("");
  
  // Password update states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Email update states
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [showEmailPassword, setShowEmailPassword] = useState(false);

  useEffect(() => {
    // apply theme when user toggles dark; persisted in localStorage
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    try {
      localStorage.setItem("secureyou_theme", dark ? "dark" : "light");
    } catch (e) {}
  }, [dark]);

  const openDialog = (type: 'name' | 'phone' | 'address' | 'bloodType' | 'password' | 'email') => {
    // Prefill current values
    if (type === 'name') setNameValue(profile?.full_name || '');
    if (type === 'phone') setPhoneValue(profile?.phone_number || '');
    if (type === 'address') setAddressValue(profile?.address || '');
    if (type === 'bloodType') setBloodTypeValue(profile?.blood_type || '');
    if (type === 'email') setNewEmail(user?.email || '');
    
    // Reset password fields
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setEmailPassword('');
    
    setDialogOpen(type);
  };

  const closeDialog = () => {
    setDialogOpen(null);
    setSaving(false);
  };

  const handleSaveName = async () => {
    try {
      if (!nameValue.trim()) {
        toast({
          title: "Validation Error",
          description: "Name cannot be empty",
          variant: "destructive"
        });
        return;
      }

      if (!isValidName(nameValue)) {
        toast({
          title: "Invalid Name",
          description: "Please enter a valid name (at least 2 characters, letters and spaces only)",
          variant: "destructive"
        });
        return;
      }

      setSaving(true);
      // Optimized: Direct update without reload
      await updateProfile({ full_name: sanitizeText(nameValue) });
      
      toast({
        title: "Updated",
        description: "Name updated successfully"
      });
      closeDialog();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update name",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePhone = async () => {
    try {
      if (!phoneValue.trim()) {
        toast({
          title: "Validation Error",
          description: "Phone number cannot be empty",
          variant: "destructive"
        });
        return;
      }

      const phoneError = getPhoneErrorMessage(phoneValue);
      if (phoneError) {
        toast({
          title: "Invalid Phone Number",
          description: phoneError,
          variant: "destructive"
        });
        return;
      }

      setSaving(true);
      await updateProfile({ phone_number: normalizeBDPhone(phoneValue) });
      
      toast({
        title: "Updated",
        description: "Phone number updated successfully"
      });
      closeDialog();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update phone number",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAddress = async () => {
    try {
      if (!addressValue.trim()) {
        toast({
          title: "Validation Error",
          description: "Address cannot be empty",
          variant: "destructive"
        });
        return;
      }

      setSaving(true);
      await updateProfile({ address: sanitizeText(addressValue) });
      
      toast({
        title: "Updated",
        description: "Address updated successfully"
      });
      closeDialog();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update address",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBloodType = async () => {
    try {
      setSaving(true);
      await updateProfile({ blood_type: bloodTypeValue as any || null });
      
      toast({
        title: "Updated",
        description: "Blood type updated successfully"
      });
      closeDialog();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update blood type",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    try {
      // Validation
      if (!currentPassword) {
        toast({
          title: "Validation Error",
          description: "Please enter your current password",
          variant: "destructive"
        });
        return;
      }

      if (!newPassword) {
        toast({
          title: "Validation Error",
          description: "Please enter a new password",
          variant: "destructive"
        });
        return;
      }

      if (newPassword.length < 8) {
        toast({
          title: "Weak Password",
          description: "Password must be at least 8 characters long",
          variant: "destructive"
        });
        return;
      }

      const strength = getPasswordStrength(newPassword);
      if (strength === 'weak') {
        toast({
          title: "Weak Password",
          description: "Please use a stronger password with uppercase, lowercase, numbers, and special characters",
          variant: "destructive"
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        toast({
          title: "Passwords Don't Match",
          description: "New password and confirmation password must match",
          variant: "destructive"
        });
        return;
      }

      if (newPassword === currentPassword) {
        toast({
          title: "Same Password",
          description: "New password must be different from current password",
          variant: "destructive"
        });
        return;
      }

      setSaving(true);
      const { error } = await updatePassword(currentPassword, newPassword);
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Password updated successfully. Please login again with your new password."
      });
      closeDialog();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update password",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmail = async () => {
    try {
      if (!newEmail.trim()) {
        toast({
          title: "Validation Error",
          description: "Email cannot be empty",
          variant: "destructive"
        });
        return;
      }

      if (!isValidEmail(newEmail)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address",
          variant: "destructive"
        });
        return;
      }

      if (!emailPassword) {
        toast({
          title: "Validation Error",
          description: "Please enter your current password to verify",
          variant: "destructive"
        });
        return;
      }

      if (newEmail === user?.email) {
        toast({
          title: "Same Email",
          description: "New email is the same as current email",
          variant: "destructive"
        });
        return;
      }

      setSaving(true);
      const { error } = await updateEmail(normalizeEmail(newEmail), emailPassword);
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Verification Email Sent",
        description: "Please check your new email address to confirm the change"
      });
      closeDialog();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update email",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-soft px-6 py-4">
        <h1 className="text-xl font-bold text-foreground">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("settings.manage")}</p>
      </header>

      {/* Content */}
      <main className="px-6 py-6">
        {/* Profile Section */}
        <div className="mb-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <span className="text-2xl font-bold text-primary">{initials}</span>
            </div>
            <h2 className="text-xl font-bold text-foreground">{profile?.full_name || "User"}</h2>
            <p className="text-sm text-muted-foreground">{user?.email || "No email"}</p>
          </div>

          <div className="space-y-3">
            {[
              { icon: User, label: t("settings.updateName"), value: profile?.full_name || "Not set", type: "name" as const },
              { icon: Mail, label: "Update Email", value: user?.email || "Not set", type: "email" as const },
              { icon: Lock, label: t("settings.updatePassword"), value: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", type: "password" as const },
              { icon: Phone, label: t("settings.updatePhone"), value: profile?.phone_number ? formatBDPhone(profile.phone_number) : "Not set", type: "phone" as const },
              { icon: AlertCircle, label: "Blood Type", value: profile?.blood_type || "Not set", type: "bloodType" as const },
              { icon: MapPin, label: t("settings.updateAddress"), value: profile?.address || "Not set", type: "address" as const },
            ].map((setting, index) => (
              <button
                key={index}
                onClick={() => openDialog(setting.type)}
                className="w-full bg-card p-4 rounded-2xl shadow-soft border border-border hover:shadow-medium hover:border-primary/30 transition-all flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <setting.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">{setting.label}</p>
                  <p className="text-sm text-muted-foreground truncate">{setting.value}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* App Settings */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            App Settings
          </h3>
          
          <div className="space-y-3">
            {appSettings.map((setting, index) => (
              <div
                key={index}
                className="bg-card p-4 rounded-2xl shadow-soft border border-border flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <setting.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{setting.label}</p>
                  {setting.value && (
                    <p className="text-sm text-foreground">{setting.value}</p>
                  )}
                </div>
                {setting.icon === Globe ? (
                  // Inline language selector
                  <select
                    value={locale}
                    onChange={(e) => setLocale(e.target.value as any)}
                    className="bg-card text-foreground text-sm font-medium outline-none border border-border rounded-lg px-3 py-1.5 cursor-pointer hover:bg-accent transition-colors"
                  >
                    {availableLocales.map((l) => (
                      <option key={l.code} value={l.code} className="bg-card text-foreground">
                        {l.label}
                      </option>
                    ))}
                  </select>
                ) : setting.hasSwitch ? (
                  <Switch defaultChecked={setting.defaultChecked} />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            ))}

            {/* Dark mode toggle */}
            <div className="bg-card p-4 rounded-2xl shadow-soft border border-border flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path></svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Toggle app theme</p>
              </div>
              <Switch checked={dark} onCheckedChange={(v) => setDark(Boolean(v))} />
            </div>
          </div>
        </div>

        {/* Help & Support */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Help & Support
          </h3>
          
          <button
            onClick={() => navigate("/help")}
            className="w-full bg-card p-4 rounded-2xl shadow-soft border border-border hover:shadow-medium transition-all flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-5 h-5 text-info" />
            </div>
            <p className="font-medium text-foreground flex-1 text-left">Help Center</p>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Emergency System Status */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Emergency System
          </h3>
          
          <div className="bg-card rounded-2xl shadow-soft border border-border overflow-hidden">
            <EmergencySystemStatus />
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full h-12 rounded-xl border-2 border-destructive text-destructive hover:bg-destructive hover:text-white"
          onClick={async () => {
            try {
              await signOut();
              toast({
                title: "Logged Out",
                description: "You have been successfully logged out",
              });
              navigate("/login", { replace: true });
            } catch (error) {
              toast({
                title: "Logout Failed",
                description: "An error occurred while logging out",
                variant: "destructive",
              });
            }
          }}
        >
          <LogOut className="w-5 h-5 mr-2" />
          {t("settings.logout")}
        </Button>
      </main>

      {/* Name Update Dialog */}
      <Dialog open={dialogOpen === 'name'} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Update Name</DialogTitle>
            <DialogDescription>
              Enter your full name. This will be displayed in your profile.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                placeholder="John Doe"
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">
                At least 2 characters, letters and spaces only
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={closeDialog} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSaveName} disabled={saving} className="min-w-24">
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving
                </div>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Phone Update Dialog */}
      <Dialog open={dialogOpen === 'phone'} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Update Phone Number</DialogTitle>
            <DialogDescription>
              Enter your Bangladesh mobile number for emergency contacts.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phoneValue}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.replace(/\D/g, '').length >= 10 && isValidBDPhone(value)) {
                    setPhoneValue(formatBDPhone(value));
                  } else {
                    setPhoneValue(value);
                  }
                }}
                placeholder="+880 1XXX XXX XXX"
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">
                Bangladesh mobile number (11 digits)
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={closeDialog} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSavePhone} disabled={saving} className="min-w-24">
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving
                </div>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Address Update Dialog */}
      <Dialog open={dialogOpen === 'address'} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Update Address</DialogTitle>
            <DialogDescription>
              Enter your current residential address.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <textarea
                id="address"
                value={addressValue}
                onChange={(e) => setAddressValue(e.target.value)}
                placeholder="House/Flat No, Street, Area, City"
                className="w-full p-3 rounded-xl border border-input bg-background min-h-24 resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={closeDialog} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSaveAddress} disabled={saving} className="min-w-24">
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving
                </div>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Update Dialog */}
      <Dialog open={dialogOpen === 'password'} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Change Password</DialogTitle>
            <DialogDescription>
              Please enter your current password and choose a new strong password.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="h-12 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="h-12 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {newPassword && (
                <div className="flex items-center gap-2 text-xs">
                  <div className={`h-2 flex-1 rounded-full overflow-hidden bg-muted ${
                    getPasswordStrength(newPassword) === 'weak' ? '' :
                    getPasswordStrength(newPassword) === 'medium' ? 'animate-pulse' : ''
                  }`}>
                    <div 
                      className={`h-full transition-all ${
                        getPasswordStrength(newPassword) === 'weak' ? 'w-1/3 bg-destructive' :
                        getPasswordStrength(newPassword) === 'medium' ? 'w-2/3 bg-warning' :
                        'w-full bg-success'
                      }`}
                    />
                  </div>
                  <span className={`font-medium ${
                    getPasswordStrength(newPassword) === 'weak' ? 'text-destructive' :
                    getPasswordStrength(newPassword) === 'medium' ? 'text-warning' :
                    'text-success'
                  }`}>
                    {getPasswordStrength(newPassword).toUpperCase()}
                  </span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                At least 8 characters with uppercase, lowercase, numbers, and special characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="h-12 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  Passwords do not match
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={closeDialog} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSavePassword} disabled={saving} className="min-w-24">
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating
                </div>
              ) : (
                "Update Password"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Update Dialog */}
      <Dialog open={dialogOpen === 'email'} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Change Email Address</DialogTitle>
            <DialogDescription>
              Enter your new email address. You'll need to verify it before the change takes effect.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newEmail">New Email Address</Label>
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="newemail@example.com"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="emailPassword"
                  type={showEmailPassword ? "text" : "password"}
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  placeholder="Enter your password to confirm"
                  className="h-12 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowEmailPassword(!showEmailPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showEmailPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Verify your identity to change email
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={closeDialog} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSaveEmail} disabled={saving} className="min-w-24">
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating
                </div>
              ) : (
                "Update Email"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Blood Type Update Dialog */}
      <Dialog open={dialogOpen === 'bloodType'} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Update Blood Type</DialogTitle>
            <DialogDescription>
              Select your blood type. This information is useful for emergency situations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bloodType">Blood Type</Label>
              <select
                id="bloodType"
                value={bloodTypeValue}
                onChange={(e) => setBloodTypeValue(e.target.value)}
                className="w-full h-12 px-3 rounded-lg border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select blood type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
              <p className="text-xs text-muted-foreground">
                This will be shown to emergency responders
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={closeDialog} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSaveBloodType} disabled={saving} className="min-w-24">
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving
                </div>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default Settings;
