'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function SlideNav({
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  return (
    <div className="fixed right-6 bottom-4 z-50 flex items-center gap-2">
      <motion.button
        className="bg-secondary/80 border-border/50 text-foreground/70 hover:text-foreground hover:bg-secondary flex h-10 w-10 items-center justify-center rounded-lg border backdrop-blur-sm transition-colors disabled:cursor-not-allowed disabled:opacity-30"
        onClick={onPrev}
        disabled={!hasPrev}
        whileTap={{ scale: 0.9 }}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </motion.button>
      <motion.button
        className="bg-secondary/80 border-border/50 text-foreground/70 hover:text-foreground hover:bg-secondary flex h-10 w-10 items-center justify-center rounded-lg border backdrop-blur-sm transition-colors disabled:cursor-not-allowed disabled:opacity-30"
        onClick={onNext}
        disabled={!hasNext}
        whileTap={{ scale: 0.9 }}
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </motion.button>
    </div>
  );
}
