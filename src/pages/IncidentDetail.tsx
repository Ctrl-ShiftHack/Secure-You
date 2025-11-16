import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import IncidentCard from "@/components/IncidentCard";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// helper to read file into data URL
const readFileAsDataURL = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(file);
  });

type Incident = {
  id: number;
  user: string;
  location?: string;
  text?: string;
  image?: string;
  likes?: number;
  liked?: boolean;
  comments?: Array<{ user: string; text: string }>;
};

const IncidentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { toast } = useToast();

  const [incident, setIncident] = useState<Incident | null>(null);

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem("secureyou_incidents");
        const list: Incident[] = raw ? JSON.parse(raw) : [];
        const found = list.find((it) => String(it.id) === String(id));
        if (found) setIncident(found);
        else setIncident(null);
      } catch (e) {
        setIncident(null);
      }
    };
    load();
  }, [id]);

  const updateIncident = (updated: Incident) => {
    try {
      const raw = localStorage.getItem("secureyou_incidents");
      const list: Incident[] = raw ? JSON.parse(raw) : [];
      const next = list.map((it) => (String(it.id) === String(updated.id) ? updated : it));
      localStorage.setItem("secureyou_incidents", JSON.stringify(next));
      setIncident(updated);
    } catch (e) {}
  };

  // edit dialog state
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [editImage, setEditImage] = useState<string | null>(null);

  useEffect(() => {
    if (incident) {
      setEditText(incident.text || "");
      setEditImage(incident.image || null);
    }
  }, [incident]);

  const handleReplaceImage = async (file?: File) => {
    if (!file) return;
    try {
      const data = await readFileAsDataURL(file);
      setEditImage(data);
    } catch (e) {}
  };

  const saveEdit = () => {
    if (!incident) return;
    const updated: Incident = { ...incident, text: editText, image: editImage };
    updateIncident(updated);
    toast({ variant: "success", title: t("incidents.editSaved") || "Saved", description: t("incidents.editSavedDesc") || "Post updated" });
    setEditing(false);
  };

  const handleLike = () => {
    if (!incident) return;
    const updated = { ...incident, liked: !incident.liked, likes: incident.liked ? (incident.likes || 0) - 1 : (incident.likes || 0) + 1 };
    updateIncident(updated);
  };

  const handleDelete = () => {
    if (!incident) return;
    try {
      const raw = localStorage.getItem("secureyou_incidents");
      const list: Incident[] = raw ? JSON.parse(raw) : [];
      const next = list.filter((it) => String(it.id) !== String(incident.id));
      localStorage.setItem("secureyou_incidents", JSON.stringify(next));
      toast({ variant: "success", title: t("incidents.delete") || "Deleted", description: t("incidents.deletedDesc") || "Post removed" });
    } catch (e) {
      toast({ variant: "error", title: t("incidents.delete") || "Delete Failed", description: t("incidents.deleteFailed") || "Could not delete post" });
    }
    navigate("/incidents");
  };

  if (!incident) {
    return (
      <div className="min-h-screen bg-background px-6 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          {t("back")}
        </Button>
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-foreground">{t("incidents.noIncidents")}</h2>
          <p className="text-sm text-muted-foreground mt-2">{t("incidents.noIncidentsDesc") || "The incident you're looking for could not be found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mb-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          {t("back")}
        </Button>
      </div>

      <div className="bg-card p-4 rounded-2xl shadow-soft border border-border">
        {incident.image && (
          <div className="w-full mb-4">
            <img src={incident.image} alt="incident" className="w-full max-h-[60vh] object-contain rounded-md" />
          </div>
        )}

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">{incident.user?.charAt(0)}</div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-foreground">{incident.user}</div>
                {incident.location && <div className="text-xs text-muted-foreground">{incident.location}</div>}
              </div>
              <div className="text-xs text-muted-foreground">{new Date(incident.id).toLocaleString()}</div>
            </div>

            <p className="mt-3 text-sm text-muted-foreground">{incident.text}</p>

            <div className="flex items-center gap-3 mt-4">
              <Button variant={incident.liked ? "secondary" : "ghost"} size="sm" onClick={handleLike}>
                {incident.likes || 0} ❤️
              </Button>
              <Button variant="ghost" size="sm">{incident.comments?.length || 0} 💬</Button>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" onClick={() => setEditing(true)}>{t("incidents.edit") || "Edit"}</Button>
                <Button variant="destructive" onClick={handleDelete}>{t("incidents.delete") || "Delete"}</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("incidents.edit") || "Edit Post"}</DialogTitle>
            <DialogDescription>{t("incidents.editDesc") || "Update the text and replace the photo if needed."}</DialogDescription>
          </DialogHeader>
          <div className="mt-2">
            <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full p-3 border rounded-md min-h-[120px]" />
            <div className="mt-3">
              <input type="file" accept="image/*" onChange={(e) => handleReplaceImage(e.target.files?.[0])} />
              {editImage && <img src={editImage} alt="preview" className="w-full mt-3 max-h-48 object-contain rounded-md" />}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" onClick={() => setEditing(false)}>{t("cancel") || "Cancel"}</Button>
              <Button onClick={saveEdit}>{t("save") || "Save"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IncidentDetail;
