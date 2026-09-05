"use client";

import React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { sound } from "@/lib/sound";

// Spring transition preset for physical, fluid popping motion
export const popSpring = {
  type: "spring" as const,
  stiffness: 280,
  damping: 24,
  mass: 0.8,
};

export const snappyPopSpring = {
  type: "spring" as const,
  stiffness: 340,
  damping: 22,
  mass: 0.6,
};

export const gentlePopSpring = {
  type: "spring" as const,
  stiffness: 220,
  damping: 22,
  mass: 0.85,
};

interface PagePopProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  stagger?: boolean;
}

export function PagePop({
  children,
  className = "",
  delay = 0,
  stagger = false,
  ...rest
}: PagePopProps) {
  if (stagger) {
    return (
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.08,
              delayChildren: delay,
            },
          },
        }}
        className={className}
        {...rest}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        ...popSpring,
        delay,
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

interface PopItemProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hoverEffect?: boolean;
  scaleFrom?: number;
}

export function PopItem({
  children,
  className = "",
  delay = 0,
  hoverEffect = false,
  scaleFrom = 0.9,
  ...rest
}: PopItemProps) {
  const itemVariants = {
    hidden: { opacity: 0, scale: scaleFrom, y: 14 },
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        ...snappyPopSpring,
        delay,
      },
    },
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="show"
      whileHover={
        hoverEffect
          ? {
              y: -4,
              scale: 1.015,
              transition: { duration: 0.2, ease: "easeOut" },
            }
          : undefined
      }
      whileTap={{
        scale: 0.97,
        transition: { duration: 0.1 },
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

interface PopCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function PopCard({
  children,
  className = "",
  delay = 0,
  ...rest
}: PopCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        ...popSpring,
        delay,
      }}
      whileHover={{
        y: -4,
        scale: 1.012,
        transition: { duration: 0.2, ease: "easeOut" },
      }}
      whileTap={{
        scale: 0.97,
        transition: { duration: 0.1 },
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

interface PopButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  className?: string;
  playSound?: boolean;
  soundType?: "click" | "pop";
}

export function PopButton({
  children,
  className = "",
  playSound = true,
  soundType = "click",
  onClick,
  ...rest
}: PopButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (playSound) {
      if (soundType === "pop") {
        sound.playPop();
      } else {
        sound.playClick();
      }
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
      onClick={handleClick}
      className={className}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
