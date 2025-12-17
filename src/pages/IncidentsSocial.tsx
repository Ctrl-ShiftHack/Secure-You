import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Image as ImageIcon, MapPin, Navigation, X, AlertCircle, RefreshCw } from "lucide-react";
import { useI18n } from "@/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import IncidentCardSocial from "@/components/IncidentCardSocial";
import { postsService } from "@/services/api";
import type { PostWithCounts } from "@/types/database.types";
import { uploadImage, fileToDataURL } from "@/lib/storage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UserAvatar from "@/components/UserAvatar";

const POSTS_PER_PAGE = 15;
const CACHE_TIME = 30000; // 30 seconds cache

const IncidentsSocial = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const supabaseConfigured = Boolean(
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    !String(import.meta.env.VITE_SUPABASE_URL).includes('placeholder')
  );
  const [posts, setPosts] = useState<PostWithCounts[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [lastFetch, setLastFetch] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Form state
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewPostsBanner, setShowNewPostsBanner] = useState(false);
  const { toast } = useToast();

  // Load initial posts
  useEffect(() => {
    loadPosts(true);
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    if (loading || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, hasMore]);

  // Subscribe to new posts
  useEffect(() => {
    const unsubscribe = postsService.subscribeToNewPosts((newPost) => {
      // Show banner instead of auto-adding to avoid disrupting scroll
      setShowNewPostsBanner(true);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loadPosts = useCallback(async (reset: boolean = false) => {
    if (loading) return;
    
    // Cache check - don't reload if recently fetched
    const now = Date.now();
    if (!reset && now - lastFetch < CACHE_TIME && posts.length > 0) {
      return;
    }
    
    setLoading(true);
    try {
      const data = await postsService.getPosts(POSTS_PER_PAGE, 0);
      setPosts(data);
      setPage(1);
      setHasMore(data.length >= POSTS_PER_PAGE);
      setShowNewPostsBanner(false);
      setLastFetch(now);
      setLoadError(null);
    } catch (error) {
      console.error('Error loading posts:', error);
      setLoadError(error instanceof Error ? error.message : 'Failed to load incidents');
      toast({ 
        title: t("incidents.errorLoad") || "Error", 
        description: "Failed to load posts",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  }, [loading, lastFetch, posts.length, toast, t]);

  const loadMorePosts = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const offset = page * POSTS_PER_PAGE;
      const data = await postsService.getPosts(POSTS_PER_PAGE, offset);
      
      if (data.length < POSTS_PER_PAGE) {
        setHasMore(false);
      }
      
      setPosts(prev => [...prev, ...data]);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ 
        title: t("incidents.errorImageSize") || "Error", 
        description: "Image must be less than 5MB",
        variant: "destructive" 
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ 
        title: t("incidents.errorImageType") || "Error", 
        description: "File must be an image",
        variant: "destructive" 
      });
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({ 
        title: t("incidents.errorLocation") || "Error", 
        description: "Geolocation is not supported",
        variant: "destructive" 
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocode to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          
          setLocation({
            latitude,
            longitude,
            address: data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          });
          
          toast({ 
            title: t("incidents.locationAdded") || "Location added", 
            variant: "default" 
          });
        } catch (error) {
          setLocation({ latitude, longitude });
        }
      },
      (error) => {
        toast({ 
          title: t("incidents.errorLocation") || "Error", 
          description: "Could not get your location",
          variant: "destructive" 
        });
      }
    );
  };

  const handleSubmitPost = async () => {
    if (!text.trim() && !imageFile) {
      toast({ 
        title: t("incidents.errorEmpty") || "Error", 
        description: "Please add text or an image",
        variant: "destructive" 
      });
      return;
    }

    if (!user) {
      toast({ 
        title: t("incidents.loginRequired") || "Login required", 
        description: "You must be logged in to post",
        variant: "destructive" 
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = null;
      
      // Upload image if present
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, `incidents/${user.id}/${Date.now()}`);
      }

      // Create post
      await postsService.createPost({
        user_id: user.id,
        content: text.trim() || null,
        image_url: imageUrl,
        location: location ? {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address,
        } : null,
        visibility: 'public',
        is_deleted: false,
      });

      // Reset form
      setText('');
      setImageFile(null);
      setImagePreview(null);
      setLocation(null);
      setShowCreateDialog(false);

      // Reload posts
      await loadPosts(true);

      toast({ 
        title: t("incidents.postCreated") || "Post created", 
        variant: "default" 
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({ 
        title: t("incidents.errorCreate") || "Error", 
        description: "Failed to create post",
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await postsService.deletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast({ 
        title: t("incidents.postDeleted") || "Post deleted", 
        variant: "default" 
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({ 
        title: t("incidents.errorDelete") || "Error", 
        description: "Failed to delete post",
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("incidents.title") || "Community Feed"}
          </h1>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {t("incidents.createPost") || "Create Post"}
          </Button>
        </div>
      </div>

      {!supabaseConfigured && (
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3 text-sm">
            Showing demo incidents because Supabase credentials are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable live data.
          </div>
        </div>
      )}

      {loadError && (
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5" />
            <div>
              <p className="font-semibold">Could not refresh incidents</p>
              <p className="text-xs text-red-700/80">{loadError}</p>
            </div>
          </div>
        </div>
      )}

      {/* New Posts Banner */}
      {showNewPostsBanner && (
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <button
            onClick={() => loadPosts(true)}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} />
            <span>{t("incidents.newPosts") || "New posts available"}</span>
          </button>
        </div>
      )}

      {/* Posts Feed */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {posts.length === 0 && !loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t("incidents.noPosts") || "No posts yet"}
            </h3>
            <p className="text-gray-600 mb-4">
              {t("incidents.noPostsDesc") || "Be the first to share something with the community"}
            </p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {t("incidents.createPost") || "Create Post"}
            </Button>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <IncidentCardSocial
                key={post.id}
                post={post}
                currentUserId={user?.id}
                onDelete={() => handleDeletePost(post.id)}
                onRefresh={() => loadPosts(true)}
              />
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            )}

            {/* Infinite scroll trigger */}
            {hasMore && !loading && (
              <div ref={loadMoreRef} className="h-20" />
            )}

            {/* End of feed */}
            {!hasMore && posts.length > 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                {t("incidents.endOfFeed") || "You've reached the end"}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Post Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("incidents.createPost") || "Create Post"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* User info */}
            <div className="flex items-center gap-3">
              <UserAvatar
                userId={user?.id}
                userName={user?.user_metadata?.full_name || user?.email || 'You'}
                size="md"
              />
              <div>
                <div className="font-semibold text-gray-900">
                  {user?.user_metadata?.full_name || user?.email || 'You'}
                </div>
                <div className="text-xs text-gray-500">Posting publicly</div>
              </div>
            </div>

            {/* Text input */}
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("incidents.whatHappening") || "What's happening?"}
              className="min-h-[120px] text-base resize-none border-gray-300"
              maxLength={500}
            />

            {/* Character count */}
            <div className="text-right text-xs text-gray-500">
              {text.length}/500
            </div>

            {/* Image preview */}
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-96 object-contain rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-gray-900/70 text-white rounded-full hover:bg-gray-900"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Location display */}
            {location && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-700 flex-1 min-w-0">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{location.address || `${location.latitude}, ${location.longitude}`}</span>
                </div>
                <button
                  onClick={() => setLocation(null)}
                  className="text-gray-400 hover:text-gray-600 ml-2"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileRef}
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fileRef.current?.click()}
                  disabled={isSubmitting}
                >
                  <ImageIcon className="w-5 h-5 text-indigo-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleGetCurrentLocation}
                  disabled={isSubmitting}
                >
                  <Navigation className="w-5 h-5 text-indigo-600" />
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  disabled={isSubmitting}
                >
                  {t("incidents.cancel") || "Cancel"}
                </Button>
                <Button
                  onClick={handleSubmitPost}
                  disabled={isSubmitting || (!text.trim() && !imageFile)}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isSubmitting ? "Posting..." : t("incidents.post") || "Post"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default IncidentsSocial;
