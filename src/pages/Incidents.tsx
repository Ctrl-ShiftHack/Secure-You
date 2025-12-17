import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Image as ImageIcon, MapPin, Navigation, MapPinned } from "lucide-react";
import { useI18n } from "@/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import IncidentCard from "@/components/IncidentCard";
import { postsService } from "@/services/api";
import type { PostWithCounts } from "@/types/database.types";
import { uploadImage, fileToDataURL } from "@/lib/storage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Incidents = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostWithCounts[]>([]);
  const [loading, setLoading] = useState(false);
  
  // form state
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address?: string } | null>(null);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [manualLocation, setManualLocation] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const { toast } = useToast();

  // Fetch posts from Supabase
  useEffect(() => {
    loadPosts();
    
    // Auto-refresh every 30 seconds (fallback for free tier without realtime)
    const interval = setInterval(() => {
      loadPosts();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Real-time subscription for new posts (if available)
  useEffect(() => {
    try {
      const unsubscribe = postsService.subscribeToNewPosts((newPost) => {
        // Reload posts when a new one is added
        loadPosts();
      });

      return () => {
        unsubscribe();
      };
    } catch (error) {
      console.log('Realtime not available, using polling instead');
      // Silently fail - we have polling as fallback
    }
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const data = await postsService.getPosts(50, 0, controller.signal);
      clearTimeout(timeoutId);
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
      // Set empty array on error so UI still renders
      setPosts([]);
      // Only show toast if there's actually an error (not just empty result)
      if (error instanceof Error && !error.message.includes('view')) {
        toast({ 
          title: t("incidents.errorLoading") || "Could not load posts", 
          description: error.name === 'AbortError' 
            ? "Request timed out. Please check your connection"
            : "Please check your connection",
          variant: "destructive" 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const searchLocations = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setLocationSuggestions([]);
      return;
    }

    try {
      setSearchingLocation(true);
      // Restrict search to Bangladesh only
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=bd&limit=8&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'SecureYou-App' // Required by Nominatim
          }
        }
      );
      const data = await response.json();
      setLocationSuggestions(data);
    } catch (error) {
      console.error('Error searching locations:', error);
      toast({
        title: t("incidents.searchError") || "Search failed",
        description: "Could not search locations",
        variant: "destructive"
      });
    } finally {
      setSearchingLocation(false);
    }
  };

  const handleManualLocation = () => {
    if (!manualLocation.trim()) {
      toast({ 
        title: t("incidents.errorNoLocation") || "Please enter a location", 
        variant: "destructive" 
      });
      return;
    }
    
    setLocation({ latitude: 0, longitude: 0, address: manualLocation.trim() });
    setShowLocationDialog(false);
    setManualLocation("");
    setLocationSuggestions([]);
    toast({ 
      title: t("incidents.locationAdded") || "Location added", 
      description: manualLocation.trim()
    });
  };

  const selectLocation = (suggestion: { display_name: string; lat: string; lon: string }) => {
    setLocation({
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon),
      address: suggestion.display_name
    });
    setShowLocationDialog(false);
    setManualLocation("");
    setLocationSuggestions([]);
    toast({
      title: t("incidents.locationAdded") || "Location added",
      description: suggestion.display_name
    });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({ 
        title: t("incidents.geoNotSupported") || "Location not supported", 
        variant: "destructive" 
      });
      return;
    }

    toast({ 
      title: t("incidents.gettingLocation") || "Getting location...", 
      description: "Please wait"
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude, address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` });
        toast({ 
          title: t("incidents.locationAdded") || "Location added", 
          description: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({ 
          title: t("incidents.geoError") || "Could not get location", 
          variant: "destructive" 
        });
      }
    );
  };

  const handleImage = async (file?: File) => {
    if (!file) return;
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ 
        title: t("incidents.fileTooLarge") || "File too large", 
        description: "Please select an image under 5MB",
        variant: "destructive" 
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ 
        title: "Invalid file", 
        description: "Please select an image file",
        variant: "destructive" 
      });
      return;
    }
    
    try {
      // Store file for upload later
      setImageFile(file);
      
      // Create preview using data URL
      const dataUrl = await fileToDataURL(file);
      setImageData(dataUrl);
      
      toast({ 
        title: t("incidents.uploaded") || "Image ready", 
        description: t("incidents.uploadedDesc") || "Image will be uploaded when you share" 
      });
    } catch (error) {
      console.error('Error processing image:', error);
      toast({ 
        title: t("incidents.uploadError") || "Upload failed", 
        description: "Could not process the image file",
        variant: "destructive" 
      });
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!user) {
      toast({ 
        title: t("incidents.loginRequired") || "Please log in", 
        description: t("incidents.loginRequiredDesc") || "You must be logged in to share posts",
        variant: "destructive" 
      });
      return;
    }

    // Require some content: either text (non-empty) or an image
    if (!text.trim() && !imageData) {
      toast({ 
        title: t("incidents.errorNoContent") || "Please add text or a photo before sharing.", 
        variant: "destructive" 
      });
      return;
    }

    try {
      setLoading(true);
      
      let imageUrl: string | null = null;
      
      // Upload image to Supabase Storage if available
      if (imageFile && user) {
        toast({ 
          title: "Uploading image...", 
          description: "Please wait"
        });
        
        imageUrl = await uploadImage(imageFile, user.id);
        
        // Fallback to data URL if upload fails
        if (!imageUrl && imageData) {
          console.warn('Storage upload failed, using data URL fallback');
          imageUrl = imageData;
          toast({ 
            title: "Using offline mode", 
            description: "Image stored locally"
          });
        }
      } else if (imageData) {
        // Use data URL if no file (shouldn't happen, but safe fallback)
        imageUrl = imageData;
      }
      
      await postsService.createPost({
        user_id: user.id,
        content: text.trim() || null,
        image_url: imageUrl,
        location: location ? JSON.parse(JSON.stringify(location)) : null,
        visibility: 'public',
        is_deleted: false
      });

      setText("");
      setImageFile(null);
      setImageData(null);
      setLocation(null);
      
      // Reset file input
      if (fileRef.current) {
        fileRef.current.value = '';
      }
      
      toast({ 
        title: t("incidents.posted") || "Posted!", 
        description: t("incidents.postedDesc") || "Your post has been shared"
      });
      
      // Reload posts
      await loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({ 
        title: t("incidents.errorPosting") || "Error posting", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await postsService.deletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast({ 
        title: t("incidents.deleted") || "Deleted", 
        description: t("incidents.deletedDesc") || "Post has been deleted"
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({ 
        title: t("incidents.errorDeleting") || "Error deleting", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 px-4">
      <header className="py-4">
        <h1 className="text-xl font-bold text-foreground">{t("incidents.title") || "Community Feed"}</h1>
        <p className="text-sm text-muted-foreground">{t("incidents.subtitle") || "Share incidents and stay informed"}</p>
      </header>

      {/* Post composer */}
      <form onSubmit={handleSubmit} className="bg-card p-4 rounded-2xl shadow-soft border border-border mb-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("incidents.placeholder") || "What's happening? Share details..."}
          className="w-full p-3 rounded-md border border-input bg-background text-foreground min-h-[80px] mb-3 placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 focus:ring-2 focus:outline-none"
        />
        
        {location && (
          <div className="mb-3 p-2 bg-muted/30 rounded-md flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{location.address}</span>
            <button 
              type="button" 
              onClick={() => setLocation(null)}
              className="ml-auto text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
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
            className="flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm"
          >
            <ImageIcon className="w-4 h-4" />
            <span className="hidden sm:inline">{t("incidents.upload") || "Photo"}</span>
            <span className="sm:hidden">{t("incidents.upload") || "Upload Photo"}</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm"
              >
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">{t("incidents.location") || "Location"}</span>
                <span className="sm:hidden">{t("incidents.location") || "Location"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={getCurrentLocation}>
                <Navigation className="w-4 h-4 mr-2" />
                Use Current Location
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowLocationDialog(true)}>
                <MapPinned className="w-4 h-4 mr-2" />
                Enter Location
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="ml-auto flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <Button variant="outline" onClick={() => navigate(-1)} className="flex-1 sm:flex-initial">
              Back
            </Button>
            <Button 
              type="submit" 
              disabled={(!text.trim() && !imageData) || loading}
              className="flex-1 sm:flex-initial"
            >
              {loading ? t("incidents.posting") || "Posting..." : t("incidents.share") || "Share"}
            </Button>
          </div>
        </div>
        {imageData && (
          <div className="mt-3 relative">
            <img src={imageData} alt="preview" className="w-full max-h-64 object-cover rounded-md" />
            <button 
              type="button"
              onClick={() => {
                setImageData(null);
                setImageFile(null);
              }}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/70"
            >
              ✕
            </button>
          </div>
        )}
      </form>

      {/* Posts Grid */}
      {loading && posts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {t("incidents.loading") || "Loading posts..."}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {t("incidents.noPosts") || "No posts yet. Be the first to share!"}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {posts.map((post) => (
            <IncidentCard
              key={post.id}
              post={post}
              currentUserId={user?.id}
              onDelete={() => handleDelete(post.id)}
              onRefresh={loadPosts}
            />
          ))}
        </div>
      )}

      <BottomNav />

      {/* Manual Location Dialog */}
      <Dialog open={showLocationDialog} onOpenChange={(open) => {
        setShowLocationDialog(open);
        if (!open) {
          setLocationSuggestions([]);
          setManualLocation("");
        }
      }}>
        <DialogContent className="max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{t("incidents.searchLocation") || "Search Location"}</DialogTitle>
          </DialogHeader>
          <div className="py-4 flex-1 overflow-hidden flex flex-col gap-2">
            <Input
              value={manualLocation}
              onChange={(e) => {
                setManualLocation(e.target.value);
                searchLocations(e.target.value);
              }}
              placeholder={t("incidents.locationPlaceholder") || "Search Bangladesh locations (e.g., Dhaka, Chittagong, Gulshan...)"}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && locationSuggestions.length === 0) {
                  e.preventDefault();
                  handleManualLocation();
                }
              }}
            />
            
            {searchingLocation && (
              <p className="text-sm text-muted-foreground">🔍 Searching Bangladesh locations...</p>
            )}
            
            {locationSuggestions.length > 0 && (
              <div className="flex-1 overflow-y-auto border border-border rounded-md max-h-[300px]">
                {locationSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectLocation(suggestion)}
                    className="w-full text-left p-3 hover:bg-muted/50 border-b border-border last:border-b-0 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-primary" />
                      <span className="text-sm line-clamp-2">{suggestion.display_name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {manualLocation && locationSuggestions.length === 0 && !searchingLocation && manualLocation.length >= 2 && (
              <p className="text-sm text-muted-foreground">
                No results found in Bangladesh. You can still add this as custom location.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLocationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleManualLocation} disabled={!manualLocation.trim()}>
              {locationSuggestions.length > 0 ? "Add Custom" : "Add Location"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Incidents;
