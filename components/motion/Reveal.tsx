"use client";

/**
 * Reveal — scroll-triggered fade/slide-up animation wrapper.
 * Wrap any block: <Reveal><YourSection /></Reveal>
 * Fires once when the element enters the viewport, then stays settled
 * (re-triggering on every scroll gets annoying fast, so `once: true`).
 */

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
  once?: boolean;
}

export default function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  duration = 0.55,
  once = true,
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.2 }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
