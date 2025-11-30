import React, { useState } from 'react';
import { User } from 'lucide-react';

interface UserAvatarProps {
  userId?: string;
  avatarUrl?: string | null;
  userName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

export default function UserAvatar({
  userId,
  avatarUrl,
  userName = 'User',
  size = 'md',
  className = '',
  onClick,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Size configurations
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  // Generate initials from userName
  const getInitials = (name: string): string => {
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Generate consistent color based on userId or userName
  const getBackgroundColor = (): string => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500',
    ];
    const seed = userId || userName;
    const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const shouldShowImage = avatarUrl && !imageError;

  return (
    <div
      className={`relative flex items-center justify-center rounded-full overflow-hidden flex-shrink-0 ${
        sizeClasses[size]
      } ${!shouldShowImage ? getBackgroundColor() : 'bg-gray-200'} ${
        onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
      } ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `View ${userName}'s profile` : undefined}
    >
      {shouldShowImage ? (
        <img
          src={avatarUrl}
          alt={userName}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      ) : (
        <span className="text-white font-semibold select-none">
          {getInitials(userName)}
        </span>
      )}

      {/* Online indicator (optional - for future use) */}
      {/* <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div> */}
    </div>
  );
}

// Skeleton loader for UserAvatar
export function UserAvatarSkeleton({
  size = 'md',
  className = '',
}: Pick<UserAvatarProps, 'size' | 'className'>) {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div
      className={`rounded-full bg-gray-200 animate-pulse flex-shrink-0 ${sizeClasses[size]} ${className}`}
    />
  );
}
