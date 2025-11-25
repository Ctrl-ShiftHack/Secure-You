import React, { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, Trash, MoreVertical, Copy, Send, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
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
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { reactionsService, commentsService } from "@/services/api";
import type { PostWithCounts, PostCommentWithUser } from "@/types/database.types";

interface IncidentCardProps {
  post: PostWithCounts;
  currentUserId?: string;
  onDelete: () => void;
  onRefresh: () => void;
}

const IncidentCard = ({ post, currentUserId, onDelete, onRefresh }: IncidentCardProps) => {
  const { t } = useI18n();
  const { toast } = useToast();
  
  // All state declarations at the top
  const [reactionCount, setReactionCount] = useState(post.reaction_count);
  const [hasReacted, setHasReacted] = useState(post.user_has_reacted);
  const [openComments, setOpenComments] = useState(false);
  const [comments, setComments] = useState<PostCommentWithUser[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  // Helper function to load comments
  const loadComments = async () => {
    try {
      setLoadingComments(true);
      const data = await commentsService.getPostComments(post.id);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  // Load comments when dialog opens
  useEffect(() => {
    if (openComments) {
      loadComments();
    }
  }, [openComments]);

  // Real-time reaction updates (if available)
  useEffect(() => {
    if (!currentUserId) return;

    try {
      const unsubscribe = reactionsService.subscribeToPostReactions(
        post.id,
        (reaction, event) => {
          if (event === 'INSERT') {
            setReactionCount(prev => prev + 1);
            if (reaction.user_id === currentUserId) {
              setHasReacted(true);
            }
          } else if (event === 'DELETE') {
            setReactionCount(prev => Math.max(0, prev - 1));
            if (reaction.user_id === currentUserId) {
              setHasReacted(false);
            }
          }
        }
      );

      return () => unsubscribe();
    } catch (error) {
      // Realtime not available for reactions
    }
  }, [post.id, currentUserId]);

  // Real-time comment updates (if available)
  useEffect(() => {
    if (!openComments) return;

    try {
      const unsubscribe = commentsService.subscribeToPostComments(
        post.id,
        (comment, event) => {
          if (event === 'INSERT' && !comment.is_deleted) {
            loadComments();
          } else if (event === 'DELETE' || (event === 'UPDATE' && comment.is_deleted)) {
            setComments(prev => prev.filter(c => c.id !== comment.id));
          }
        }
      );

      return () => unsubscribe();
    } catch (error) {
      // Realtime not available for comments
    }
  }, [post.id, openComments]);

  const handleReaction = async () => {
    if (!currentUserId) {
      toast({ 
        title: t("incidents.loginRequired") || "Login required", 
        description: t("incidents.loginToReact") || "You must be logged in to react",
        variant: "destructive" 
      });
      return;
    }

    try {
      await reactionsService.toggleReaction(post.id, currentUserId);
      onRefresh();
    } catch (error) {
      console.error('Error toggling reaction:', error);
      toast({ 
        title: t("incidents.errorReaction") || "Error", 
        description: error instanceof Error ? error.message : "Could not update reaction",
        variant: "destructive" 
      });
    }
  };

  const handleAddComment = async () => {
    if (!currentUserId) {
      toast({ 
        title: t("incidents.loginRequired") || "Login required", 
        description: t("incidents.loginToComment") || "You must be logged in to comment",
        variant: "destructive" 
      });
      return;
    }

    if (!newComment.trim()) return;

    try {
      await commentsService.createComment({
        post_id: post.id,
        user_id: currentUserId,
        content: newComment.trim(),
        is_deleted: false
      });
      setNewComment("");
      await loadComments();
      onRefresh();
      toast({ 
        title: t("incidents.commentAdded") || "Comment added", 
        variant: "default" 
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({ 
        title: t("incidents.errorComment") || "Error", 
        description: error instanceof Error ? error.message : "Could not add comment",
        variant: "destructive" 
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentsService.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      onRefresh();
      toast({ 
        title: t("incidents.commentDeleted") || "Comment deleted", 
        variant: "default" 
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({ 
        title: t("incidents.errorDelete") || "Error", 
        description: error instanceof Error ? error.message : "Could not delete comment",
        variant: "destructive" 
      });
    }
  };

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const location = post.location as { latitude?: number; longitude?: number; address?: string } | null;

  return (
    <div className="bg-card p-4 rounded-2xl shadow-soft border border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
            {post.user_avatar ? (
              <img src={post.user_avatar} alt={post.user_name || 'User'} className="w-full h-full rounded-full object-cover" />
            ) : (
              (post.user_name || 'U').charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="font-medium text-foreground">{post.user_name || 'Anonymous'}</div>
            <div className="text-xs text-muted-foreground">{formatDate(post.created_at)}</div>
          </div>
        </div>
        
        {currentUserId === post.user_id && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={handleCopyLink}>
                <Copy className="w-4 h-4 mr-2" /> {t("incidents.copyLink") || "Copy Link"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setOpenDelete(true)} className="text-destructive">
                <Trash className="w-4 h-4 mr-2" /> {t("incidents.delete") || "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Content */}
      {post.content && <p className="text-sm text-foreground mb-3 whitespace-pre-wrap">{post.content}</p>}

      {/* Location */}
      {location && location.address && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <MapPin className="w-3 h-3" />
          <span>{location.address}</span>
        </div>
      )}

      {/* Image */}
      {post.image_url && (
        <div className="w-full mb-3">
          <img 
            src={post.image_url} 
            alt="Post content" 
            className="w-full max-h-96 rounded-lg object-contain bg-muted/10" 
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <Button 
          variant={hasReacted ? "default" : "ghost"} 
          size="sm" 
          onClick={handleReaction}
          className="gap-2"
        >
          <Heart className={`w-4 h-4 ${hasReacted ? 'fill-current' : ''}`} /> 
          {reactionCount > 0 && reactionCount}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setOpenComments(true)}
          className="gap-2"
        >
          <MessageCircle className="w-4 h-4" /> 
          {post.comment_count > 0 && post.comment_count}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleCopyLink}
          className="gap-2"
        >
          <Share2 className="w-4 h-4" />
        </Button>
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
              className="bg-destructive hover:bg-destructive/90"
            >
              {t("incidents.delete") || "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Comments Dialog */}
      <Dialog open={openComments} onOpenChange={setOpenComments}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{t("incidents.comments") || "Comments"} ({comments.length})</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {loadingComments ? (
              <div className="text-center py-4 text-muted-foreground">
                {t("incidents.loadingComments") || "Loading comments..."}
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("incidents.noComments") || "No comments yet. Be the first!"}
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">
                    {comment.user_avatar ? (
                      <img src={comment.user_avatar} alt={comment.user_name || 'User'} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      (comment.user_name || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{comment.user_name || 'Anonymous'}</span>
                        {currentUserId === comment.user_id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <Trash className="w-3 h-3 text-destructive" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-foreground">{comment.content}</p>
                    </div>
                    <span className="text-xs text-muted-foreground ml-3 mt-1 block">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Comment */}
          <div className="flex gap-2 pt-4 border-t">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t("incidents.addComment") || "Write a comment..."}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
              className="flex-1"
            />
            <Button 
              onClick={handleAddComment} 
              disabled={!newComment.trim()}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IncidentCard;
