/**
 * Premium Animation Utilities
 * Consistent, purposeful animations following best practices
 */

// Easing Curves - Natural, refined motion
export const easings = {
  outQuart: [0.25, 1, 0.5, 1] as const,
  outQuint: [0.22, 1, 0.36, 1] as const,
  outExpo: [0.16, 1, 0.3, 1] as const,
  inQuart: [0.5, 0, 0.75, 0] as const,
} as const;

// Durations
export const durations = {
  instant: 0.1,
  fast: 0.15,
  normal: 0.25,
  smooth: 0.35,
  slow: 0.5,
} as const;

// Transitions
export const transitions = {
  hover: { duration: durations.fast, ease: easings.outQuart },
  default: { duration: durations.normal, ease: easings.outQuart },
  smooth: { duration: durations.smooth, ease: easings.outQuint },
  enter: { duration: durations.slow, ease: easings.outExpo },
  exit: { duration: durations.normal, ease: easings.inQuart },
} as const;

// Stagger utilities
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: transitions.default },
};

// Card variants
export const cardVariants = {
  rest: { y: 0, boxShadow: '0 4px 12px -2px rgba(0,0,0,0.08)' },
  hover: { 
    y: -6, 
    boxShadow: '0 16px 32px -8px rgba(0,0,0,0.12)',
    transition: { duration: durations.normal, ease: easings.outQuart },
  },
};

export const cardImageVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 0.6, ease: easings.outQuart } },
};

// Button variants
export const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.02, transition: transitions.hover },
  tap: { scale: 0.97, transition: { duration: 0.1 } },
};

export const buttonPrimary = {
  rest: { scale: 1, boxShadow: '0 4px 14px -4px rgba(212, 175, 55, 0.4)' },
  hover: { 
    scale: 1.02, 
    boxShadow: '0 8px 20px -4px rgba(212, 175, 55, 0.5)',
    transition: transitions.hover,
  },
  tap: { scale: 0.97, transition: { duration: 0.1 } },
};

// Scroll animations
export const scrollReveal = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: transitions.enter },
};

// Utility functions
export const staggerDelay = (index: number, baseDelay = 0.05) => index * baseDelay;

export const viewportOnce = { once: true, margin: '-50px', amount: 0.2 };
