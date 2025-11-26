import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Text, Button, Card, IconButton, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import * as ImagePicker from 'expo-image-picker';

interface Post {
  id: string;
  user_id: string;
  content: string | null;
  image_url: string | null;
  location: { latitude: number; longitude: number; address?: string } | null;
  created_at: string;
  reaction_count: number;
  comment_count: number;
  user_has_reacted: boolean;
  profiles?: {
    full_name: string | null;
  };
}

export default function IncidentsScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [postText, setPostText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address?: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const { user, profile } = useAuth();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadPosts();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadPosts();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      
      // Get posts with user info and reaction status
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (full_name),
          post_reactions!left (user_id)
        `)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Process posts to add counts and user_has_reacted
      const processedPosts = await Promise.all(
        (data || []).map(async (post: any) => {
          // Count reactions
          const { count: reactionCount } = await supabase
            .from('post_reactions')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);

          // Count comments
          const { count: commentCount } = await supabase
            .from('post_comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id)
            .eq('is_deleted', false);

          // Check if current user reacted
          const userHasReacted = post.post_reactions?.some(
            (r: any) => r.user_id === user?.id
          );

          return {
            ...post,
            reaction_count: reactionCount || 0,
            comment_count: commentCount || 0,
            user_has_reacted: userHasReacted,
          };
        })
      );

      setPosts(processedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleAddLocation = () => {
    setShowLocationModal(true);
  };

  const searchLocations = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setLocationSuggestions([]);
      return;
    }

    try {
      setSearchingLocation(true);
      // Search locations in Bangladesh using Nominatim API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=bd&limit=8&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'SecureYou-MobileApp',
          },
        }
      );
      const data = await response.json();
      setLocationSuggestions(data);
    } catch (error) {
      console.error('Error searching locations:', error);
      Alert.alert('Search Error', 'Could not search locations');
    } finally {
      setSearchingLocation(false);
    }
  };

  const selectLocation = (suggestion: any) => {
    setLocation({
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon),
      address: suggestion.display_name,
    });
    setShowLocationModal(false);
    setLocationSearch('');
    setLocationSuggestions([]);
    Alert.alert('Location Added', suggestion.display_name.split(',').slice(0, 2).join(','));
  };

  const handleManualLocation = () => {
    if (!locationSearch.trim()) {
      Alert.alert('Error', 'Please enter a location');
      return;
    }

    setLocation({
      latitude: 0,
      longitude: 0,
      address: locationSearch.trim(),
    });
    setShowLocationModal(false);
    setLocationSearch('');
    setLocationSuggestions([]);
    Alert.alert('Location Added', locationSearch.trim());
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is required');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;

      // Reverse geocode to get address
      const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      const address = addresses[0]
        ? `${addresses[0].street || ''}, ${addresses[0].city || ''}, ${addresses[0].country || ''}`
        : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

      setLocation({ latitude, longitude, address });
      setShowLocationModal(false);
      Alert.alert('Location Added', address);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not get your location');
    }
  };

  const handlePost = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to post');
      return;
    }

    if (!postText.trim() && !imageUri) {
      Alert.alert('Empty Post', 'Please add text or a photo');
      return;
    }

    try {
      setLoading(true);

      let imageUrl = null;
      if (imageUri) {
        // For simplicity, we'll store the image URI directly
        // In production, you'd upload to Supabase Storage
        imageUrl = imageUri;
      }

      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        content: postText.trim() || null,
        image_url: imageUrl,
        location: location ? JSON.stringify(location) : null,
        visibility: 'public',
        is_deleted: false,
      });

      if (error) throw error;

      // Clear form
      setPostText('');
      setImageUri(null);
      setLocation(null);

      Alert.alert('Success', 'Post shared!');
      
      // Reload posts
      await loadPosts();
      
      // Scroll to top
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Could not create post');
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (postId: string, hasReacted: boolean) => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to react');
      return;
    }

    try {
      if (hasReacted) {
        // Remove reaction
        await supabase
          .from('post_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        // Add reaction
        await supabase.from('post_reactions').insert({
          post_id: postId,
          user_id: user.id,
          reaction_type: 'like',
        });
      }

      // Update local state
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              user_has_reacted: !hasReacted,
              reaction_count: hasReacted
                ? post.reaction_count - 1
                : post.reaction_count + 1,
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const renderPost = ({ item }: { item: Post }) => {
    const userName = item.profiles?.full_name || 'Anonymous User';
    const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
      <Card style={styles.postCard}>
        <Card.Content>
          {/* User Info */}
          <View style={styles.postHeader}>
            <Avatar.Text
              size={40}
              label={userInitials}
              style={styles.avatar}
              labelStyle={styles.avatarLabel}
            />
            <View style={styles.userInfo}>
              <Text variant="titleMedium" style={styles.userName}>
                {userName}
              </Text>
              <Text variant="bodySmall" style={styles.timestamp}>
                {formatTimeAgo(item.created_at)}
              </Text>
            </View>
          </View>

          {/* Content */}
          {item.content && (
            <Text variant="bodyMedium" style={styles.content}>
              {item.content}
            </Text>
          )}

          {/* Image */}
          {item.image_url && (
            <Image source={{ uri: item.image_url }} style={styles.postImage} />
          )}

          {/* Location */}
          {item.location && (
            <View style={styles.locationBadge}>
              <MaterialCommunityIcons name="map-marker" size={14} color="#6b7280" />
              <Text variant="bodySmall" style={styles.locationText}>
                {typeof item.location === 'string'
                  ? JSON.parse(item.location).address
                  : item.location.address}
              </Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleReaction(item.id, item.user_has_reacted)}
            >
              <MaterialCommunityIcons
                name={item.user_has_reacted ? 'heart' : 'heart-outline'}
                size={20}
                color={item.user_has_reacted ? '#667eea' : '#6b7280'}
              />
              <Text
                variant="bodySmall"
                style={[
                  styles.actionText,
                  item.user_has_reacted && styles.actionTextActive,
                ]}
              >
                {item.reaction_count}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <MaterialCommunityIcons
                name="comment-outline"
                size={20}
                color="#6b7280"
              />
              <Text variant="bodySmall" style={styles.actionText}>
                {item.comment_count}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <MaterialCommunityIcons name="share-outline" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            Community Feed
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Share incidents and stay informed
          </Text>
        </View>

        {/* Post Composer */}
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder="What's happening? Share details..."
            placeholderTextColor="#9ca3af"
            value={postText}
            onChangeText={setPostText}
            multiline
            numberOfLines={3}
          />

          {imageUri && (
            <View style={styles.imagePreview}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeImage}
                onPress={() => setImageUri(null)}
              >
                <MaterialCommunityIcons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {location && (
            <View style={styles.locationPreview}>
              <MaterialCommunityIcons name="map-marker" size={16} color="#6b7280" />
              <Text style={styles.locationPreviewText}>{location.address}</Text>
              <TouchableOpacity onPress={() => setLocation(null)}>
                <MaterialCommunityIcons name="close" size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.composerActions}>
            <View style={styles.composerButtons}>
              <IconButton
                icon="image"
                size={20}
                iconColor="#6b7280"
                onPress={handlePickImage}
              />
              <IconButton
                icon="map-marker"
                size={20}
                iconColor="#6b7280"
                onPress={handleAddLocation}
              />
            </View>
            <Button
              mode="contained"
              buttonColor="#667eea"
              onPress={handlePost}
              disabled={loading || (!postText.trim() && !imageUri)}
              style={styles.postButton}
            >
              {loading ? 'Posting...' : 'Share'}
            </Button>
          </View>
        </View>

        {/* Posts Feed */}
        <FlatList
          ref={flatListRef}
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadPosts();
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="post-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>
                {loading ? 'Loading posts...' : 'No posts yet. Be the first to share!'}
              </Text>
            </View>
          }
        />

        {/* Location Search Modal */}
        <Modal
          visible={showLocationModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowLocationModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text variant="titleLarge" style={styles.modalTitle}>
                  Add Location
                </Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setShowLocationModal(false)}
                />
              </View>

              <View style={styles.locationOptions}>
                <Button
                  mode="contained"
                  icon="crosshairs-gps"
                  onPress={getCurrentLocation}
                  style={styles.locationButton}
                  buttonColor="#667eea"
                >
                  Use Current Location
                </Button>
              </View>

              <Text variant="bodyMedium" style={styles.orText}>
                or search for a location
              </Text>

              <TextInput
                style={styles.searchInput}
                placeholder="Search location in Bangladesh..."
                placeholderTextColor="#9ca3af"
                value={locationSearch}
                onChangeText={(text) => {
                  setLocationSearch(text);
                  searchLocations(text);
                }}
              />

              {searchingLocation && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#667eea" />
                  <Text style={styles.loadingText}>Searching...</Text>
                </View>
              )}

              {locationSuggestions.length > 0 && (
                <FlatList
                  data={locationSuggestions}
                  keyExtractor={(item) => item.place_id}
                  style={styles.suggestionsList}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.suggestionItem}
                      onPress={() => selectLocation(item)}
                    >
                      <MaterialCommunityIcons
                        name="map-marker"
                        size={20}
                        color="#667eea"
                      />
                      <Text style={styles.suggestionText} numberOfLines={2}>
                        {item.display_name}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              )}

              {locationSearch.length > 0 && locationSuggestions.length === 0 && !searchingLocation && (
                <View style={styles.noResults}>
                  <Text style={styles.noResultsText}>No locations found</Text>
                  <Button
                    mode="outlined"
                    onPress={handleManualLocation}
                    style={styles.manualButton}
                  >
                    Use "{locationSearch}"
                  </Button>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    color: '#6b7280',
    marginTop: 4,
  },
  composer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  imagePreview: {
    marginTop: 12,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImage: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  locationPreviewText: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
  },
  composerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  composerButtons: {
    flexDirection: 'row',
  },
  postButton: {
    borderRadius: 20,
  },
  list: {
    padding: 16,
  },
  postCard: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    backgroundColor: '#e8e4f3',
  },
  avatarLabel: {
    color: '#667eea',
    fontWeight: 'bold',
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontWeight: '600',
    color: '#111827',
  },
  timestamp: {
    color: '#9ca3af',
    marginTop: 2,
  },
  content: {
    color: '#111827',
    marginBottom: 12,
    lineHeight: 22,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 4,
  },
  locationText: {
    color: '#6b7280',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: '#6b7280',
    fontSize: 14,
  },
  actionTextActive: {
    color: '#667eea',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#6b7280',
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontWeight: 'bold',
    color: '#111827',
  },
  locationOptions: {
    marginBottom: 16,
  },
  locationButton: {
    borderRadius: 12,
  },
  orText: {
    textAlign: 'center',
    color: '#6b7280',
    marginVertical: 12,
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  loadingText: {
    color: '#6b7280',
  },
  suggestionsList: {
    maxHeight: 300,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  noResults: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    color: '#6b7280',
    marginBottom: 12,
  },
  manualButton: {
    borderRadius: 12,
  },
});