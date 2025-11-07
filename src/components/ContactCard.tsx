import { Phone, Mail, MoreVertical, Edit, Trash } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "./ui/alert-dialog";
import { useState } from "react";

interface ContactCardProps {
  name: string;
  relation: string;
  phone: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ContactCard = ({ name, relation, phone, onEdit, onDelete }: ContactCardProps) => {
  const [openDelete, setOpenDelete] = useState(false);

  return (
    <div className="bg-card p-4 rounded-2xl shadow-soft border border-border flex items-center gap-4">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <span className="text-lg font-semibold text-primary">{name.charAt(0).toUpperCase()}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-foreground truncate">{name}</h4>
        <p className="text-sm text-muted-foreground">{relation}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <Phone className="w-3 h-3" />
          <span>{phone}</span>
        </div>
      </div>

      {/* Actions: dropdown menu */}
      <div className="flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={onEdit}>
              <Edit className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setOpenDelete(true)}>
              <Trash className="w-4 h-4 mr-2 text-destructive" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Confirmation dialog for delete */}
        <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete contact?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setOpenDelete(false);
                  onDelete?.();
                }}
              >
                Delete
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
