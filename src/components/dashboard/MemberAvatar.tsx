import { cn } from "@/lib/utils";
import { Member } from "@/lib/types";

interface MemberAvatarProps {
  member?: Member;
  name?: string;
  color?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function MemberAvatar({ member, name, color, className, size = 'md' }: MemberAvatarProps) {
  const displayName = member?.name || name || "?";
  const displayColor = member?.color || color || "#94a3b8";
  
  const initials = member?.initials || displayName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 3);

  const sizeClasses = {
    sm: "w-6 h-6 text-[8px]",
    md: "w-10 h-10 text-xs",
    lg: "w-16 h-16 text-lg"
  };

  return (
    <div 
      className={cn(
        "rounded-full flex items-center justify-center text-white font-black shadow-lg shrink-0",
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: displayColor }}
      title={displayName}
    >
      {initials}
    </div>
  );
}
