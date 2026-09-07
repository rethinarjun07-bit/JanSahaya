"use client";

import React from "react";
import { motion, AnimatePresence, type Transition, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

export type PresetType = "blur" | "fade-in-blur" | "scale" | "fade" | "slide";
export type PerType = "word" | "char" | "line";

export type TextEffectProps = {
  children: string;
  per?: PerType;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  preset?: PresetType;
  delay?: number;
  trigger?: boolean;
  onAnimationComplete?: () => void;
  style?: React.CSSProperties;
};

const defaultContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
  exit: {
    transition: { staggerChildren: 0.04, staggerDirection: -1 },
  },
};

const presetVariants: Record<
  PresetType,
  { container: Variants; item: Variants }
> = {
  blur: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, filter: "blur(12px)" },
      visible: { opacity: 1, filter: "blur(0px)" },
      exit: { opacity: 0, filter: "blur(12px)" },
    },
  },
  "fade-in-blur": {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, y: 16, filter: "blur(8px)" },
      visible: { opacity: 1, y: 0, filter: "blur(0px)" },
      exit: { opacity: 0, y: 16, filter: "blur(8px)" },
    },
  },
  scale: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.8 },
    },
  },
  fade: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 },
    },
  },
  slide: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
  },
};

export function TextEffect({
  children,
  per = "word",
  as: Component = "span",
  className,
  preset = "fade-in-blur",
  delay = 0,
  trigger = true,
  onAnimationComplete,
  style,
}: TextEffectProps) {
  const segments = React.useMemo(() => {
    if (per === "char") return children.split("");
    if (per === "word") return children.split(/(\s+)/);
    return children.split("\n");
  }, [children, per]);

  const variants = presetVariants[preset];
  const MotionComponent = motion(Component as any);

  return (
    <AnimatePresence>
      {trigger && (
        <MotionComponent
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={{
            ...variants.container,
            visible: {
              ...variants.container.visible,
              transition: {
                delayChildren: delay,
                staggerChildren: per === "char" ? 0.02 : 0.05,
              },
            },
          }}
          className={cn("inline-block", className)}
          onAnimationComplete={onAnimationComplete}
          style={style}
        >
          {segments.map((segment, index) => (
            <motion.span
              key={`${segment}-${index}`}
              variants={variants.item}
              transition={{ duration: 0.35, ease: [0.2, 0.65, 0.3, 0.9] }}
              className={cn("inline-block", segment === " " ? "whitespace-pre" : "")}
            >
              {segment}
            </motion.span>
          ))}
        </MotionComponent>
      )}
    </AnimatePresence>
  );
}
