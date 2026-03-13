'use client';

import { motion } from 'framer-motion';

import type { SlideData } from '@/lib/slides';

import { SourceFooter } from './source-footer';
import { renderTextWithHighlights } from './text-highlights';

const letterVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.04,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

export function SlideTitle({ slide }: { slide: SlideData }) {
  const words = slide.title.split(' ');

  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <motion.h1
        className="text-foreground text-5xl leading-tight font-bold tracking-tight md:text-7xl lg:text-8xl"
        initial="hidden"
        animate="visible"
      >
        {words.map((word, i) => (
          <motion.span
            key={i}
            custom={i}
            variants={letterVariants}
            className="mr-[0.3em] inline-block"
          >
            {word}
          </motion.span>
        ))}
      </motion.h1>
      {slide.subtitle && (
        <motion.p
          className="text-muted-foreground mt-8 max-w-2xl text-xl leading-relaxed md:text-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {renderTextWithHighlights(slide.subtitle)}
        </motion.p>
      )}
      <motion.div
        className="bg-primary mt-12 h-1 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: 120 }}
        transition={{ delay: 1, duration: 0.8, ease: 'easeOut' }}
      />
      <SourceFooter sources={slide.sources} />
    </div>
  );
}
