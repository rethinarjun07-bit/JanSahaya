"use client";

import confetti from "canvas-confetti";
import { sound } from "@/lib/sound";

export function triggerConfetti() {
  sound.playCelebration();

  // Multi-stage fireworks burst
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ["#F57C00", "#138808", "#0B2545", "#FFD700"],
  });
  fire(0.2, {
    spread: 60,
    colors: ["#F57C00", "#138808", "#0B2545", "#FFD700"],
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ["#F57C00", "#138808", "#0B2545", "#FFD700"],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors: ["#F57C00", "#138808", "#0B2545", "#FFD700"],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ["#F57C00", "#138808", "#0B2545", "#FFD700"],
  });
}

export function triggerFanfare() {
  sound.playFanfare();
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#FFD700", "#F57C00", "#138808"],
    zIndex: 9999,
  });
}
