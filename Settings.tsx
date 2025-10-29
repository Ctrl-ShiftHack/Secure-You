import { User, Lock, MapPin, Phone, Globe, Bell, HelpCircle, LogOut, ChevronRight } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { useI18n, availableLocales } from "@/i18n";
import { useEffect, useState } from "react";
import useProfile from "@/hooks/use-profile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const Settings = () => {
  const navigate = useNavigate();

  const { t, locale, setLocale } = useI18n();

  // shared profile hook (persisted to localStorage)
  const { profile, setProfile } = useProfile();

  const initials = (profile?.name || "").split(" ").map(s => s[0] || "").slice(0,2).join("").toUpperCase();

  // Theme preference: default OFF unless user previously selected 'dark'
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

  // edit dialog state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");

  useEffect(() => {
    // apply theme when user toggles dark; persisted in localStorage
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    try {
      localStorage.setItem("secureyou_theme", dark ? "dark" : "light");
    } catch (e) {}
  }, [dark]);

  const openEditor = (field: string) => {
    setEditingField(field);
    setEditingValue((profile as any)[field] ?? "");
  };

  const saveEdit = () => {
    if (!editingField) return;
    const updated = { ...profile, [editingField]: editingValue };
    setProfile(updated);
    setEditingField(null);
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
            <h2 className="text-xl font-bold text-foreground">{profile?.name}</h2>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
          </div>

          <div className="space-y-3">
            {[
              { icon: User, label: t("settings.updateName"), value: profile.name, field: "name" },
              { icon: Lock, label: t("settings.updatePassword"), value: profile.password ? "••••••••" : "••••••••", field: "password" },
              { icon: Phone, label: t("settings.updatePhone"), value: profile.phone, field: "phone" },
              { icon: MapPin, label: t("settings.updateAddress"), value: profile.address, field: "address" },
            ].map((setting, index) => (
              <button
                key={index}
                onClick={() => openEditor(setting.field)}
                className="w-full bg-card p-4 rounded-2xl shadow-soft border border-border hover:shadow-medium transition-all flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <setting.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">{setting.label}</p>
                  <p className="text-sm text-foreground truncate">{setting.value}</p>
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
                    className="bg-transparent text-sm text-muted-foreground outline-none"
                  >
                    {availableLocales.map((l) => (
                      <option key={l.code} value={l.code} className="text-foreground">
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

        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full h-12 rounded-xl border-2 border-destructive text-destructive hover:bg-destructive hover:text-white"
          onClick={() => navigate("/login")}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Log Out
        </Button>
      </main>

      {/* Edit Dialog */}
      <Dialog open={Boolean(editingField)} onOpenChange={() => setEditingField(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editingField}</DialogTitle>
            <DialogDescription>Update the value and click Save.</DialogDescription>
          </DialogHeader>

          <div>
            <input
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              className="w-full border border-input rounded-md p-2 mt-2 dark:text-black"
              type={editingField === "password" ? "password" : "text"}
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setEditingField(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default Settings;
