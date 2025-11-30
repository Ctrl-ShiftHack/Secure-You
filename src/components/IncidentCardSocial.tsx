import React, { useState, useEffect } from "react";
import { Share2, Trash, MoreVertical, Copy, MapPin, Image as ImageIcon } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
} from "./ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { reactionsService } from "@/services/api";
import type { PostWithCounts } from "@/types/database.types";
import LikeButton from "./LikeButton";
import CommentSection from "./CommentSection";
import UserAvatar from "./UserAvatar";
import { CompactRelativeTime } from "./RelativeTime";

interface IncidentCardProps {
  post: PostWithCounts;
  currentUserId?: string;
  onDelete: () => void;
  onRefresh: () => void;
}

const IncidentCard = ({ post, currentUserId, onDelete, onRefresh }: IncidentCardProps) => {
  const { t } = useI18n();
  const { toast } = useToast();
  
  // State declarations
  const [likeCount, setLikeCount] = useState(post.reaction_count || 0);
  const [hasLiked, setHasLiked] = useState(post.user_has_reacted || false);
  const [commentCount, setCommentCount] = useState(post.comment_count || 0);
  const [openDelete, setOpenDelete] = useState(false);
  const [openImageDialog, setOpenImageDialog] = useState(false);

  // Check if current user has liked this post
  useEffect(() => {
    const checkUserReaction = async () => {
      if (!currentUserId) return;
      
      try {
        const reactions = await reactionsService.getUserReactions(currentUserId);
        const hasReacted = reactions.some(
          r => r.post_id === post.id && r.reaction_type === 'like'
        );
        setHasLiked(hasReacted);
      } catch (error) {
        console.error('Error checking user reaction:', error);
      }
    };

    checkUserReaction();
  }, [post.id, currentUserId]);

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/incidents/${post.id}`;
      await navigator.clipboard.writeText(url);
      toast({ 
        variant: "default", 
        title: t("incidents.shareAction") || "Share", 
        description: t("incidents.linkCopied") || "Link copied to clipboard" 
      });
    } catch (e) {
      toast({ 
        variant: "destructive", 
        title: t("incidents.shareAction") || "Share", 
        description: t("incidents.copyFailed") || "Failed to copy link" 
      });
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/incidents/${post.id}`;
    const text = post.content ? `${post.content.substring(0, 100)}...` : 'Check out this incident on SecureYou';

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SecureYou Incident',
          text: text,
          url: url,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const location = post.location as { latitude?: number; longitude?: number; address?: string } | null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-3">
          <UserAvatar
            userId={post.user_id}
            avatarUrl={post.user_avatar}
            userName={post.user_name || 'Anonymous'}
            size="md"
          />
          <div>
            <div className="font-semibold text-gray-900">{post.user_name || 'Anonymous'}</div>
            <CompactRelativeTime 
              timestamp={post.created_at} 
              className="text-gray-500"
            />
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={handleCopyLink}>
              <Copy className="w-4 h-4 mr-2" /> {t("incidents.copyLink") || "Copy Link"}
            </DropdownMenuItem>
            {currentUserId === post.user_id && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onSelect={() => setOpenDelete(true)} 
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash className="w-4 h-4 mr-2" /> {t("incidents.delete") || "Delete"}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-gray-900 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {post.content}
          </p>
        </div>
      )}

      {/* Location */}
      {location && location.address && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 inline-flex">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-1">{location.address}</span>
          </div>
        </div>
      )}

      {/* Image */}
      {post.image_url && (
        <div className="w-full">
          <img 
            src={post.image_url} 
            alt="Post content" 
            className="w-full max-h-[500px] object-cover cursor-pointer hover:opacity-95 transition-opacity bg-gray-100" 
            onClick={() => setOpenImageDialog(true)}
            loading="lazy"
          />
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <LikeButton
            postId={post.id}
            initialLikeCount={likeCount}
            initialIsLiked={hasLiked}
            userId={currentUserId || ''}
            onLikeChange={(liked, count) => {
              setHasLiked(liked);
              setLikeCount(count);
              onRefresh();
            }}
          />
          
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-gray-600 hover:text-indigo-600 transition-colors group"
            aria-label="Share post"
          >
            <Share2 size={22} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Comment Section */}
      <div className="px-4 pb-4">
        <CommentSection
          postId={post.id}
          initialCommentCount={commentCount}
          onCommentCountChange={(count) => {
            setCommentCount(count);
            onRefresh();
          }}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("incidents.delete") || "Delete Post"}?</AlertDialogTitle>
            <AlertDialogDescription>
              {t("incidents.deleteConfirm") || "Are you sure you want to delete this post? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <AlertDialogCancel>{t("incidents.cancel") || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setOpenDelete(false);
                onDelete();
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {t("incidents.delete") || "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Fullscreen Dialog */}
      <Dialog open={openImageDialog} onOpenChange={setOpenImageDialog}>
        <DialogContent className="max-w-6xl w-[95vw] h-[95vh] p-0 bg-black/95">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <button
              onClick={() => setOpenImageDialog(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              aria-label="Close"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            {post.image_url && (
              <img
                src={post.image_url}
                alt="Post content fullscreen"
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IncidentCard;
