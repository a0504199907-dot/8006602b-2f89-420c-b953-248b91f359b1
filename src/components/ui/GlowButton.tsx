import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { buttonPrimary, buttonVariants, transitions, easings } from '@/lib/animations';

interface GlowButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export default function GlowButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false
}: GlowButtonProps) {
  const variantStyles = {
    primary: 'bg-secondary text-primary shadow-gold',
    secondary: 'bg-primary text-white shadow-card',
    ghost: 'bg-transparent text-secondary border-2 border-secondary'
  };

  const hoverStyles = {
    primary: 'hover:bg-secondary-light hover:shadow-[0_8px_24px_-4px_rgba(212,175,55,0.5)]',
    secondary: 'hover:bg-primary-light hover:shadow-elevated',
    ghost: 'hover:bg-secondary hover:text-primary'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      variants={variant === 'primary' ? buttonPrimary : buttonVariants}
      initial="rest"
      whileHover={!disabled ? "hover" : undefined}
      whileTap={!disabled ? "tap" : undefined}
      className={`
        relative overflow-hidden rounded-[10px] font-bold
        transition-colors duration-[250ms] ease-[cubic-bezier(0.25,1,0.5,1)]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${!disabled ? hoverStyles[variant] : ''}
        ${sizes[size]}
        ${className}
      `}>

      {/* Subtle glow effect on hover */}
      <motion.span
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 60%)'
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        whileHover={{ opacity: 1, scale: 1.2 }}
        transition={{ duration: 0.35, ease: easings.outQuart }} />

      <span data-ev-id="ev_9491af35fb" className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>);

}