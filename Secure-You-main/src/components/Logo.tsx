import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { Shield } from "lucide-react";

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'h-8',
  md: 'h-12',
  lg: 'h-16',
  xl: 'h-20',
};

export const Logo = ({ className = '', size = 'md' }: LogoProps) => {
  const { resolvedTheme } = useTheme();
  const [imageError, setImageError] = useState(false);
  
  // Try to load the logo, fallback to text logo if images fail
  const logoSrc = resolvedTheme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg';
  
  if (imageError) {
    // Fallback to text logo with icon
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Shield className={`${sizeClasses[size]} w-auto text-primary`} />
        <span className={`font-bold text-foreground ${
          size === 'sm' ? 'text-lg' : 
          size === 'md' ? 'text-xl' : 
          size === 'lg' ? 'text-2xl' : 'text-3xl'
        }`}>
          SecureYou
        </span>
      </div>
    );
  }
  
  return (
    <img 
      src={logoSrc}
      alt="Secure You - Your Safety Companion" 
      className={`${sizeClasses[size]} w-auto object-contain ${className}`}
      loading="eager"
      onError={() => setImageError(true)}
    />
  );
};

export default Logo;
