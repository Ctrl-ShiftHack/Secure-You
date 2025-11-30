import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Trash2, MoreVertical } from 'lucide-react';
import { commentsService } from '../services/api';
import UserAvatar from './UserAvatar';
import { CompactRelativeTime } from './RelativeTime';
import { useAuth } from '../contexts/AuthContext';

interface Comment {
  id: string;
  created_at: string;
  user_id: string;
  post_id: string;
  content: string;
  user_name?: string;
  user_avatar?: string;
}

interface CommentSectionProps {
  postId: string;
  initialCommentCount?: number;
  onCommentCountChange?: (count: number) => void;
}

export default function CommentSection({
  postId,
  initialCommentCount = 0,
  onCommentCountChange,
}: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentCount, setCommentCount] = useState(initialCommentCount);
  const [showDeleteMenu, setShowDeleteMenu] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load comments when expanded
  useEffect(() => {
    if (isExpanded && comments.length === 0) {
      loadComments();
    }
  }, [isExpanded]);

  // Subscribe to new comments
  useEffect(() => {
    if (!isExpanded) return;

    const unsubscribe = commentsService.subscribeToPostComments(
      postId,
      (comment, event) => {
        if (event === 'INSERT') {
          loadComments(); // Reload to get full comment with user data
        } else if (event === 'DELETE') {
          setComments((prev) => prev.filter((c) => c.id !== comment.id));
          setCommentCount((prev) => Math.max(0, prev - 1));
          onCommentCountChange?.(Math.max(0, commentCount - 1));
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isExpanded, postId]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const data = await commentsService.getPostComments(postId);
      setComments(data);
      setCommentCount(data.length);
      onCommentCountChange?.(data.length);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await commentsService.createComment({
        post_id: postId,
        user_id: user.id,
        content: newComment.trim(),
        is_deleted: false,
      });

      setNewComment('');
      inputRef.current?.blur();
      await loadComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentsService.deleteComment(commentId);
      setShowDeleteMenu(null);
      setComments(prev => prev.filter(c => c.id !== commentId));
      setCommentCount(prev => Math.max(0, prev - 1));
      onCommentCountChange?.(Math.max(0, commentCount - 1));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  return (
    <div className="border-t border-gray-200 pt-3">
      {/* Comment count and toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-3"
      >
        <MessageCircle size={20} />
        <span className="text-sm font-medium">
          {commentCount === 0
            ? 'Be the first to comment'
            : `${commentCount} ${commentCount === 1 ? 'comment' : 'comments'}`}
        </span>
      </button>

      {/* Expanded comment section */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Comment input */}
          <form onSubmit={handleSubmitComment} className="flex gap-2">
            <UserAvatar
              userId={user?.id}
              userName={user?.user_metadata?.full_name || user?.email || 'You'}
              size="sm"
            />
            <div className="flex-1 flex gap-2">
              <textarea
                ref={inputRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
                rows={1}
                maxLength={500}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = target.scrollHeight + 'px';
                }}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Send size={16} />
              </button>
            </div>
          </form>

          {/* Comments list */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-4 text-gray-500">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No comments yet</div>
            ) : (
              comments.map((comment) => (
              <div className="flex gap-2 group">
                  <UserAvatar
                    userId={comment.user_id}
                    avatarUrl={comment.user_avatar}
                    userName={comment.user_name || 'Unknown User'}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-100 rounded-lg px-3 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-gray-900">
                          {comment.user_name || 'Unknown User'}
                        </span>
                        {comment.user_id === user?.id && (
                          <div className="relative">
                            <button
                              onClick={() =>
                                setShowDeleteMenu(
                                  showDeleteMenu === comment.id ? null : comment.id
                                )
                              }
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                            >
                              <MoreVertical size={14} />
                            </button>
                            {showDeleteMenu === comment.id && (
                              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg whitespace-nowrap"
                                >
                                  <Trash2 size={14} />
                                  <span className="text-sm">Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 break-words">{comment.content}</p>
                    </div>
                    <CompactRelativeTime
                      timestamp={comment.created_at}
                      className="ml-3 mt-1"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
