import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { reactionsService } from '../services/api';

interface LikeButtonProps {
  postId: string;
  initialLikeCount: number;
  initialIsLiked: boolean;
  userId: string;
  onLikeChange?: (liked: boolean, count: number) => void;
}

export default function LikeButton({
  postId,
  initialLikeCount,
  initialIsLiked,
  userId,
  onLikeChange,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleLike = async () => {
    if (isLoading || !userId) return;

    // Optimistic UI update
    const newIsLiked = !isLiked;
    const newCount = newIsLiked ? likeCount + 1 : likeCount - 1;
    
    setIsLiked(newIsLiked);
    setLikeCount(newCount);
    setIsAnimating(true);
    setIsLoading(true);

    // Trigger haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }

    try {
      await reactionsService.toggleReaction(postId, userId, 'like');
      onLikeChange?.(newIsLiked, newCount);
    } catch (error) {
      // Revert on error
      console.error('Error toggling like:', error);
      setIsLiked(!newIsLiked);
      setLikeCount(newIsLiked ? newCount - 1 : newCount + 1);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  return (
    <button
      onClick={toggleLike}
      disabled={isLoading}
      className="flex items-center gap-1.5 group transition-all"
      aria-label={isLiked ? 'Unlike post' : 'Like post'}
    >
      <Heart
        className={`transition-all duration-300 ${
          isLiked
            ? 'fill-red-500 text-red-500'
            : 'text-gray-600 hover:text-red-500 group-hover:scale-110'
        } ${
          isAnimating ? 'scale-125' : 'scale-100'
        }`}
        size={22}
      />
      <span
        className={`text-sm font-medium transition-colors ${
          isLiked ? 'text-red-500' : 'text-gray-600'
        }`}
      >
        {likeCount > 0 ? likeCount.toLocaleString() : ''}
      </span>

      {/* Animation particle effect */}
      {isAnimating && isLiked && (
        <>
          <style>{`
            @keyframes heart-burst {
              0% {
                transform: scale(0) rotate(0deg);
                opacity: 1;
              }
              50% {
                transform: scale(1.5) rotate(180deg);
                opacity: 0.8;
              }
              100% {
                transform: scale(2) rotate(360deg);
                opacity: 0;
              }
            }
            .heart-burst {
              animation: heart-burst 0.6s ease-out forwards;
            }
          `}</style>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <Heart
                key={i}
                className="absolute fill-red-500 text-red-500 heart-burst"
                size={14}
                style={{
                  transform: `rotate(${i * 72}deg) translateY(-20px)`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>
        </>
      )}
    </button>
  );
}
