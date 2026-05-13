import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ShimmerTextProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function ShimmerText({ children, className = '', delay = 0 }: ShimmerTextProps) {
  return (
    <motion.span
      className={`relative inline-block ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}>

      <span data-ev-id="ev_af15e64f3f" className="relative">
        {children}
        <motion.span
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{
            duration: 1.5,
            delay: delay + 0.5,
            repeat: Infinity,
            repeatDelay: 3
          }} />

      </span>
    </motion.span>);

}