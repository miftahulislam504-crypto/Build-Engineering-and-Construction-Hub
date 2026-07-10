"use client";

/**
 * TapScale — drop-in replacement for a <div> or <button> wrapper that adds
 * a satisfying press-down effect on tap/click. Built for mobile shoppers
 * (most of EngineX Mart's traffic is phone-based) where tactile feedback on
 * buttons like "Add to Cart" makes the UI feel responsive instead of flat.
 *
 * Does NOT change layout, hover, or existing className — just adds motion.
 * Use `as="span"` when wrapping something that must stay inline (e.g. inside a <Link>).
 */

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode, MouseEventHandler } from "react";

interface TapScaleProps {
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler;
  scale?: number;
  as?: "div" | "span";
  ariaLabel?: string;
  disabled?: boolean;
}

export default function TapScale({
  children,
  className,
  onClick,
  scale = 0.94,
  as = "div",
  ariaLabel,
  disabled,
}: TapScaleProps) {
  const reduceMotion = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      className={className}
      onClick={disabled ? undefined : onClick}
      whileTap={reduceMotion || disabled ? undefined : { scale }}
      transition={{ duration: 0.12, ease: "easeOut" }}
      aria-label={ariaLabel}
      style={disabled ? { pointerEvents: "none" } : undefined}
    >
      {children}
    </Component>
  );
}
