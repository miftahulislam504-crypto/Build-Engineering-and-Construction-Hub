"use client";

/**
 * TiltCard — subtle 3D tilt on mouse move, following cursor position.
 * Desktop/mouse only by design: on touch devices there's no hover to track,
 * so it renders children unchanged (no perf cost, no janky touch behavior).
 *
 * Tilt range is intentionally small (max 8deg) — this is a product card in
 * a shopping grid, not a showcase piece. Too much tilt makes prices/text
 * hard to read and feels gimmicky in a dense grid of 8-12 cards.
 */

import { useRef, useState, type ReactNode, type MouseEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}

export default function TiltCard({ children, className, maxTilt = 6 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0..1
    const py = (e.clientY - rect.top) / rect.height; // 0..1
    setTilt({
      x: (py - 0.5) * -2 * maxTilt, // vertical mouse pos → rotateX
      y: (px - 0.5) * 2 * maxTilt, // horizontal mouse pos → rotateY
    });
  }

  function handleLeave() {
    setIsHovering(false);
    setTilt({ x: 0, y: 0 });
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleLeave}
      animate={{
        rotateX: tilt.x,
        rotateY: tilt.y,
        scale: isHovering && !reduceMotion ? 1.02 : 1,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      style={{ transformStyle: "preserve-3d", willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
}
