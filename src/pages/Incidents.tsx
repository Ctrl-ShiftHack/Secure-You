import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Image as ImageIcon } from "lucide-react";
import { useI18n } from "@/i18n";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import IncidentCard from "@/components/IncidentCard";

type Incident = {
  id: number;
  user: string;
  location?: string;
  text?: string;
  image?: string; // data URL
  likes?: number;
  liked?: boolean;
  comments?: Array<{ user: string; text: string }>;
};

const Incidents = () => {
  const { t } = useI18n();
  const [incidents, setIncidents] = useState<Incident[]>(() => {
    try {
      const raw = localStorage.getItem("secureyou_incidents");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  // form state
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [text, setText] = useState("");
  const [imageData, setImageData] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem("secureyou_incidents", JSON.stringify(incidents));
    } catch (e) {}
  }, [incidents]);

  const handleImage = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      setImageData(data);
      try {
        toast({ title: t("incidents.uploaded") || "Uploaded", description: t("incidents.uploadedDesc") || "Image is ready to share" });
      } catch (e) {}
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    // Require some content: either text (non-empty) or an image
    if (!text.trim() && !imageData) {
      try {
        toast({ title: t("incidents.errorNoContent") || "Please add text or a photo before sharing.", variant: "error" });
      } catch (e) {}
      return;
    }

    const newIncident: Incident = {
      id: Date.now(),
      user: "You",
      text: text.trim() || undefined,
      image: imageData || undefined,
      likes: 0,
      liked: false,
      comments: []
    };
    setIncidents((s) => [newIncident, ...s]);
    setText("");
    setImageData(null);
  };

  const handleLike = (id: number) => {
    setIncidents((prev) => prev.map((it) => it.id === id ? { ...it, liked: !it.liked, likes: (it.liked ? (it.likes||0)-1 : (it.likes||0)+1) } : it));
  };

  const handleDelete = (id: number) => setIncidents((p) => p.filter((it) => it.id !== id));

  return (
    <div className="min-h-screen bg-background pb-20 px-4">
      <header className="py-4">
        <h1 className="text-xl font-bold text-foreground dark:text-black">{t("incidents.title") || "Recent Incidents"}</h1>
        <p className="text-sm text-muted-foreground dark:text-black">{t("incidents.subtitle") || "Share incidents you faced"}</p>
      </header>

      {/* Post composer */}
      <form onSubmit={handleSubmit} className="bg-card p-4 rounded-2xl shadow-soft border border-border mb-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("incidents.placeholder") || "What's happened? Share details..."}
          className="w-full p-3 rounded-md border border-input min-h-[80px] mb-3 text-destructive placeholder:text-destructive/70 focus:border-destructive-2 focus:ring-destructive-2/20 focus:ring-2 focus:outline-none"
        />
        <div className="flex items-center gap-3">
          <input
            ref={fileRef}
            id="incident-image"
            type="file"
            accept="image/*"
            onChange={(e) => handleImage(e.target.files?.[0])}
            className="hidden"
          />
          <Button
            type="button"
            variant="ghost"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 border border-border rounded-md"
          >
            <ImageIcon className="w-4 h-4" />
            <span className="text-sm">{t("incidents.upload") || "Upload Photo"}</span>
          </Button>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
            <Button type="button" onClick={() => handleSubmit()} disabled={!text.trim() && !imageData}>{t("incidents.share") || "Share"}</Button>
          </div>
        </div>
        {imageData && (
          <div className="mt-3">
            <img src={imageData} alt="preview" className="w-full max-h-64 object-cover rounded-md" />
          </div>
        )}
      </form>

      {/* Grid of incidents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {incidents.map((inc) => (
          <IncidentCard
            key={inc.id}
            incident={inc}
            onLike={() => handleLike(inc.id)}
            onDelete={() => handleDelete(inc.id)}
            onEdit={() => navigate(`/incidents/${inc.id}`)}
          />
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Incidents;
