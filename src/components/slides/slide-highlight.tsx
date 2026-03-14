'use client';

import { motion } from 'framer-motion';

import type { SlideData } from '@/features/presentations/model/slides';

import { SourceFooter } from './source-footer';
import { renderTextWithHighlights } from './text-highlights';

export function SlideHighlight({ slide }: { slide: SlideData }) {
  const letters = slide.highlight?.split('  ') ?? [];

  return (
    <div className="flex h-full flex-col items-center justify-center px-8">
      <motion.p
        className="text-muted-foreground mb-4 text-lg md:text-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {slide.subtitle ? renderTextWithHighlights(slide.subtitle) : null}
      </motion.p>

      <motion.h2
        className="text-foreground mb-10 text-3xl font-bold tracking-tight md:text-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {slide.title}
      </motion.h2>

      <div className="mb-12 flex items-center gap-6 md:gap-10">
        {letters.map((letter, i) => (
          <motion.div
            key={i}
            className="bg-primary/15 border-primary/40 flex h-24 w-24 items-center justify-center rounded-2xl border-2 md:h-32 md:w-32 lg:h-40 lg:w-40"
            initial={{ opacity: 0, scale: 0, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{
              delay: 0.4 + i * 0.2,
              duration: 0.6,
              type: 'spring',
              stiffness: 200,
              damping: 15,
            }}
          >
            <span className="text-primary text-5xl font-bold md:text-6xl lg:text-7xl">
              {letter}
            </span>
          </motion.div>
        ))}
      </div>

      {slide.highlightSub && (
        <motion.p
          className="text-muted-foreground max-w-2xl text-center text-lg leading-relaxed md:text-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          {renderTextWithHighlights(slide.highlightSub)}
        </motion.p>
      )}

      <SourceFooter sources={slide.sources} />
    </div>
  );
}
