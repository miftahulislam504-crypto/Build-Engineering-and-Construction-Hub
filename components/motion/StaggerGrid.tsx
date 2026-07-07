"use client";

/**
 * StaggerGrid — wraps a grid of items so children animate in one-by-one
 * as the grid scrolls into view, instead of popping in all at once.
 *
 * Usage:
 *   <StaggerGrid className="grid grid-cols-4 gap-4">
 *     {items.map(item => <StaggerItem key={item.id}><Card {...item} /></StaggerItem>)}
 *   </StaggerGrid>
 *
 * Keep the className identical to what the grid had before (grid-cols-*, gap-*),
 * since StaggerGrid renders as the grid container itself — no extra wrapper div.
 */

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

interface StaggerGridProps {
  children: ReactNode;
  className?: string;
}

export function StaggerGrid({ children, className }: StaggerGridProps) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: StaggerGridProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={reduceMotion ? { hidden: { opacity: 0 }, show: { opacity: 1 } } : itemVariants}
    >
      {children}
    </motion.div>
  );
}
