"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Sparkles, X, Check } from "lucide-react";
import { triggerFanfare } from "./celebration-effects";

interface BadgeModalProps {
  badge: {
    id: string;
    name: string;
    description: string;
    icon?: string;
    karmaBonus?: number;
  } | null;
  onClose: () => void;
}

export function BadgeUnlockModal({ badge, onClose }: BadgeModalProps) {
  React.useEffect(() => {
    if (badge) {
      triggerFanfare();
    }
  }, [badge]);

  if (!badge) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border-4 border-amber-400 overflow-hidden text-center p-6"
        >
          {/* Decorative background glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-200/50 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-orange-200/50 rounded-full blur-3xl pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 15 }}
            className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-tr from-amber-500 via-orange-400 to-yellow-300 p-1 shadow-lg flex items-center justify-center"
          >
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-amber-600">
              <Award className="w-12 h-12 stroke-[2.2]" />
            </div>
          </motion.div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Badge Unlocked!
          </div>

          <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
            {badge.name}
          </h3>

          <p className="text-slate-600 text-sm mb-4 leading-relaxed">
            {badge.description}
          </p>

          {badge.karmaBonus && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl py-2 px-4 mb-5 text-emerald-800 text-sm font-semibold flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              +{badge.karmaBonus} Karma Points Credited to Profile
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gradient-to-r from-gov-navy to-gov-navyLight text-white font-medium rounded-xl shadow hover:shadow-lg transition-all transform active:scale-95"
          >
            Claim Badge & Continue
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
