'use client';

import { motion } from 'framer-motion';

import type { SlideData } from '@/lib/slides';

import { SourceFooter } from './source-footer';
import { renderTextWithHighlights } from './text-highlights';

const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.3 + i * 0.12,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

export function SlideContent({ slide }: { slide: SlideData }) {
  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col justify-center px-8 md:px-16 lg:px-24">
      <div className="mb-4 flex items-center gap-4">
        {slide.badge && (
          <motion.span
            className="bg-primary/15 text-primary border-primary/30 rounded-full border px-4 py-1.5 font-mono text-sm font-semibold"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            {slide.badge}
          </motion.span>
        )}
        <motion.h2
          className="text-foreground text-3xl font-bold tracking-tight text-balance md:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {slide.title}
        </motion.h2>
      </div>

      {slide.subtitle && (
        <motion.p
          className="text-primary/80 mb-6 text-base font-medium md:text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          {renderTextWithHighlights(slide.subtitle)}
        </motion.p>
      )}

      {slide.content?.map((text, i) => (
        <motion.p
          key={i}
          className="text-muted-foreground mb-5 max-w-3xl text-lg leading-relaxed md:text-2xl"
          custom={i}
          initial="hidden"
          animate="visible"
          variants={itemVariants}
        >
          {renderTextWithHighlights(text)}
        </motion.p>
      ))}

      {slide.bullets && (
        <ul className="mt-2 space-y-4">
          {slide.bullets.map((bullet, i) => (
            <motion.li
              key={i}
              className="text-foreground/90 flex items-start gap-4 text-lg md:text-2xl"
              custom={i + (slide.content?.length ?? 0)}
              initial="hidden"
              animate="visible"
              variants={itemVariants}
            >
              <span className="bg-primary mt-2 h-2 w-2 shrink-0 rounded-full" />
              <span className="leading-relaxed">{renderTextWithHighlights(bullet)}</span>
            </motion.li>
          ))}
        </ul>
      )}

      {slide.content2?.map((text, i) => (
        <motion.p
          key={`c2-${i}`}
          className="text-muted-foreground mt-6 mb-2 max-w-3xl text-lg leading-relaxed md:text-2xl"
          custom={i + (slide.content?.length ?? 0) + (slide.bullets?.length ?? 0)}
          initial="hidden"
          animate="visible"
          variants={itemVariants}
        >
          {renderTextWithHighlights(text)}
        </motion.p>
      ))}

      <SourceFooter sources={slide.sources} />
    </div>
  );
}
