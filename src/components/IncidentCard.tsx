import React, { useState } from "react";
import { Heart, MessageCircle, Share2, Trash, MoreVertical, Edit, Copy } from "lucide-react";
import { Button } from "./ui/button";
import { useI18n } from "@/i18n";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "./ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const IncidentCard = ({ incident, onLike, onDelete, onEdit }: any) => {
  const { t } = useI18n();
  const { toast } = useToast();
  const [openDelete, setOpenDelete] = useState(false);

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/incidents/${incident.id}`;
      await navigator.clipboard.writeText(url);
      toast({ variant: "success", title: t("incidents.shareAction") || "Share", description: t("incidents.linkCopied") || "Link copied to clipboard" });
    } catch (e) {
      toast({ variant: "error", title: t("incidents.shareAction") || "Share", description: t("incidents.copyFailed") || "Failed to copy link" });
    }
  };

  return (
    <div className="bg-card p-4 rounded-2xl shadow-soft border border-border">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">{incident.user?.charAt(0)}</div>
          <div>
            <div className="font-medium text-foreground">{incident.user}</div>
            {incident.location && <div className="text-xs text-muted-foreground">{incident.location}</div>}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">{new Date(incident.id).toLocaleString()}</div>
      </div>

      {incident.image && (
        <div className="w-full mb-3">
          <img src={incident.image} alt="incident" className="w-full max-h-56 mx-auto rounded-md mb-3 object-contain" />
        </div>
      )}

      {incident.text && <p className="text-sm text-muted-foreground mb-3">{incident.text}</p>}

      <div className="flex items-center gap-3">
        <Button variant={incident.liked ? "secondary" : "ghost"} size="sm" onClick={onLike}>
          <Heart className="w-4 h-4 mr-2" /> {incident.likes || 0}
        </Button>
        <Button variant="ghost" size="sm">
          <MessageCircle className="w-4 h-4 mr-2" /> {incident.comments?.length || 0}
        </Button>
        <Button variant="ghost" size="sm">
          <Share2 className="w-4 h-4 mr-2" /> {t("incidents.shareAction") || "Share"}
        </Button>

        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={onEdit}>
                <Edit className="w-4 h-4 mr-2" /> {t("incidents.edit") || "Edit Post"}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleCopyLink}>
                <Copy className="w-4 h-4 mr-2" /> {t("incidents.copyLink") || "Copy Link"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setOpenDelete(true)}>
                <Trash className="w-4 h-4 mr-2 text-destructive" /> {t("incidents.delete") || "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("incidents.delete") || "Delete"}?</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("incidents.deleteConfirm") || "Are you sure you want to delete this post? This action cannot be undone."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex justify-end gap-2 mt-4">
                <AlertDialogCancel>{t("incidents.cancel") || "Cancel"}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    setOpenDelete(false);
                    onDelete?.();
                  }}
                >
                  {t("incidents.delete") || "Delete"}
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default IncidentCard;
