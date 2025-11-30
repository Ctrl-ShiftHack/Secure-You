import React, { useState, useEffect } from 'react';

interface RelativeTimeProps {
  timestamp: string | Date;
  className?: string;
  showTooltip?: boolean;
}

export default function RelativeTime({
  timestamp,
  className = '',
  showTooltip = true,
}: RelativeTimeProps) {
  const [relativeTime, setRelativeTime] = useState('');
  const [exactTime, setExactTime] = useState('');

  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSeconds < 10) return 'Just now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffWeeks < 4) return `${diffWeeks}w ago`;
    if (diffMonths < 12) return `${diffMonths}mo ago`;
    return `${diffYears}y ago`;
  };

  const formatExactTime = (date: Date): string => {
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    
    if (isNaN(date.getTime())) {
      setRelativeTime('Invalid date');
      setExactTime('Invalid date');
      return;
    }

    const updateTime = () => {
      setRelativeTime(formatRelativeTime(date));
      setExactTime(formatExactTime(date));
    };

    updateTime();

    // Update every minute for recent times, every hour for older times
    const diffMinutes = Math.floor((new Date().getTime() - date.getTime()) / 60000);
    const interval = setInterval(
      updateTime,
      diffMinutes < 60 ? 60000 : 3600000 // 1 minute or 1 hour
    );

    return () => clearInterval(interval);
  }, [timestamp]);

  return (
    <time
      dateTime={typeof timestamp === 'string' ? timestamp : timestamp.toISOString()}
      className={`text-gray-500 ${className}`}
      title={showTooltip ? exactTime : undefined}
    >
      {relativeTime}
    </time>
  );
}

// Compact version for inline use
export function CompactRelativeTime({
  timestamp,
  className = '',
}: Omit<RelativeTimeProps, 'showTooltip'>) {
  return (
    <RelativeTime
      timestamp={timestamp}
      className={`text-xs ${className}`}
      showTooltip={true}
    />
  );
}
