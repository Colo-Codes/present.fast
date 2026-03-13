'use client';

import { motion } from 'framer-motion';

import type { SlideData } from '@/lib/slides';

import { SourceFooter } from './source-footer';
import { renderTextWithHighlights } from './text-highlights';

const colVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3 + i * 0.2,
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

export function SlideThreeColumn({ slide }: { slide: SlideData }) {
  return (
    <div className="flex h-full flex-col justify-center px-8 md:px-16 lg:px-24">
      <motion.h2
        className="text-foreground mb-3 text-center text-3xl font-bold tracking-tight text-balance md:text-4xl lg:text-5xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {slide.title}
      </motion.h2>

      {slide.subtitle && (
        <motion.p
          className="text-muted-foreground mx-auto mb-10 max-w-2xl text-center text-2xl leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          {renderTextWithHighlights(slide.subtitle)}
        </motion.p>
      )}

      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
        {slide.columns?.map((col, i) => (
          <motion.div
            key={i}
            className="bg-card border-border/50 rounded-xl border p-6 lg:p-8"
            custom={i}
            initial="hidden"
            animate="visible"
            variants={colVariants}
          >
            <h3 className="text-primary mb-5 text-xl font-bold md:text-2xl">{col.title}</h3>
            <ul className="space-y-3">
              {col.items.map((item, j) => (
                <motion.li
                  key={j}
                  className="text-foreground/85 flex items-start gap-3 text-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.2 + j * 0.08 }}
                >
                  <span className="bg-primary/60 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                  <span className="leading-relaxed">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <SourceFooter sources={slide.sources} />
    </div>
  );
}
