// Shared motion language for the whole product.
// Rule from the brief: every interaction stays under ~300ms, no harsh motion.
// These are composed into components rather than redefined inline, so the
// feel stays consistent across Landing, Editor, and the Card reveal.

export const easeOut = [0.16, 1, 0.3, 1]; // calm deceleration, no bounce

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: easeOut } },
};

// Wrap a list of children with this on the parent, fadeUp on each child.
export const staggerContainer = (staggerChildren = 0.08, delayChildren = 0) => ({
  hidden: {},
  show: {
    transition: { staggerChildren, delayChildren },
  },
});

export const cardHover = {
  rest: { y: 0, boxShadow: "0 12px 24px -8px rgba(16,38,63,0.18)" },
  hover: {
    y: -4,
    boxShadow: "0 20px 40px -12px rgba(16,38,63,0.28)",
    transition: { duration: 0.25, ease: easeOut },
  },
};

export const buttonTap = {
  rest: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.18, ease: easeOut } },
  tap: { scale: 0.97, transition: { duration: 0.12, ease: easeOut } },
};

// Gentle ambient drift for background elements (palm silhouettes, light glow).
// Loops slowly — this is atmosphere, not a focal animation.
export const ambientFloat = (delay = 0) => ({
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 6,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
});

// Used by the loading experience: frame pieces assembling + ripple + glow.
export const frameAssemblePiece = (delay = 0) => ({
  hidden: { opacity: 0, scale: 0.85, rotate: -4 },
  show: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { duration: 0.5, delay, ease: easeOut },
  },
});

export const rippleExpand = {
  hidden: { opacity: 0.6, scale: 0.4 },
  show: {
    opacity: 0,
    scale: 1.6,
    transition: { duration: 1.4, ease: "easeOut", repeat: Infinity },
  },
};

// Step-by-step reveal for the HowItWorks timeline as it scrolls into view.
export const stepReveal = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: easeOut },
  }),
};
