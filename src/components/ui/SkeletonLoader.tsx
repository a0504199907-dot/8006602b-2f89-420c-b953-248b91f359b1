interface SkeletonLoaderProps {
  variant?: 'card' | 'article' | 'text' | 'avatar' | 'image';
  className?: string;
}

// CSS-based shimmer for better performance
const ShimmerBox = ({ className = '' }: {className?: string;}) =>
<div data-ev-id="ev_7532c69bcc" className={`skeleton-shimmer rounded ${className}`} />;




export default function SkeletonLoader({ variant = 'card', className = '' }: SkeletonLoaderProps) {
  if (variant === 'card') {
    return (
      <div data-ev-id="ev_c62ba976c5" className={`bg-surface rounded-[12px] overflow-hidden shadow-card ${className}`}>
        <ShimmerBox className="aspect-[16/10]" />
        <div data-ev-id="ev_f7a0e1257c" className="p-4 flex flex-col gap-3">
          <ShimmerBox className="h-4 w-20" />
          <ShimmerBox className="h-5 w-full" />
          <ShimmerBox className="h-5 w-3/4" />
          <div data-ev-id="ev_cdbe2e4096" className="flex justify-between pt-2 border-t border-border/50">
            <ShimmerBox className="h-3 w-20" />
            <ShimmerBox className="h-3 w-16" />
          </div>
        </div>
      </div>);

  }

  if (variant === 'article') {
    return (
      <div data-ev-id="ev_8df0406c32" className={`flex gap-4 p-3 ${className}`}>
        <ShimmerBox className="w-28 h-20 rounded-[8px] shrink-0" />
        <div data-ev-id="ev_94c2c7c0cd" className="flex-1 flex flex-col gap-2">
          <ShimmerBox className="h-4 w-16" />
          <ShimmerBox className="h-4 w-full" />
          <ShimmerBox className="h-4 w-2/3" />
          <ShimmerBox className="h-3 w-24 mt-auto" />
        </div>
      </div>);

  }

  if (variant === 'avatar') {
    return <ShimmerBox className={`w-12 h-12 rounded-full ${className}`} />;
  }

  if (variant === 'image') {
    return <ShimmerBox className={`aspect-[16/10] rounded-[12px] ${className}`} />;
  }

  // Text variant
  return <ShimmerBox className={`h-4 ${className}`} />;

}