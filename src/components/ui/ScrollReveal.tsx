import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { easings, durations, viewportOnce } from '@/lib/animations';

interface ScrollRevealProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = durations.slow,
  className = '',
  once = true,
}: ScrollRevealProps) {
  const directions = {
    up: { y: 30, x: 0 },
    down: { y: -30, x: 0 },
    left: { y: 0, x: 30 },
    right: { y: 0, x: -30 },
  };

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        ...directions[direction] 
      }}
      whileInView={{ 
        opacity: 1, 
        y: 0, 
        x: 0 
      }}
      viewport={{ once, margin: '-60px', amount: 0.15 }}
      transition={{ 
        duration, 
        delay, 
        ease: easings.outQuart 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
