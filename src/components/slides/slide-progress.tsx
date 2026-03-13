'use client';

import { motion } from 'framer-motion';

export function SlideProgress({ current, total }: { current: number; total: number }) {
  const progress = ((current + 1) / total) * 100;

  return (
    <div className="bg-background/80 border-border/30 fixed right-0 bottom-14 left-0 z-50 flex items-center gap-4 border-t px-6 py-4 backdrop-blur-md">
      <div className="bg-secondary h-1 flex-1 overflow-hidden rounded-full">
        <motion.div
          className="bg-primary h-full rounded-full"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <span className="text-muted-foreground min-w-[4ch] text-right font-mono text-sm tabular-nums">
        {current + 1}/{total}
      </span>
    </div>
  );
}
