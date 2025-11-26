import { Phone, Mail, MoreVertical, Edit, Trash, Star } from "lucide-react";
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
  email?: string | null;
  isPrimary?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onCall?: () => void;
}

export const ContactCard = ({ name, relation, phone, email, isPrimary, onEdit, onDelete, onCall }: ContactCardProps) => {
  const [openDelete, setOpenDelete] = useState(false);

  return (
    <div className="bg-card p-4 rounded-2xl shadow-soft border border-border hover:shadow-md transition-shadow flex items-center gap-3 sm:gap-4">
      {/* Avatar */}
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 relative">
        <span className="text-lg sm:text-xl font-semibold text-primary">
          {name.charAt(0).toUpperCase()}
        </span>
        {isPrimary && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
            <Star className="w-3 h-3 text-white fill-white" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-foreground truncate">{name}</h4>
          {isPrimary && (
            <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full font-medium hidden sm:inline">
              Primary
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground capitalize">{relation}</p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="w-3.5 h-3.5" />
            <span className="font-medium">{phone}</span>
          </div>
          {email && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="w-3.5 h-3.5" />
              <span className="truncate max-w-[150px]">{email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-1">
        {/* Call button */}
        <Button 
          variant="ghost" 
          size="icon"
          className="text-green-600 hover:bg-green-50 hover:text-green-700 h-9 w-9"
          onClick={onCall}
          title="Call"
        >
          <Phone className="w-4 h-4" />
        </Button>
        
        {/* More options dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onEdit}>
              <Edit className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onSelect={() => setOpenDelete(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Confirmation dialog for delete */}
        <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete contact?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setOpenDelete(false);
                  onDelete?.();
                }}
                className="bg-destructive hover:bg-destructive/90"
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
