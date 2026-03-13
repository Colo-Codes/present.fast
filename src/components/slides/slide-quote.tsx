'use client';

import { motion } from 'framer-motion';

import type { SlideData } from '@/lib/slides';

import { SourceFooter } from './source-footer';

export function SlideQuote({ slide }: { slide: SlideData }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 md:px-16 lg:px-24">
      <motion.h2
        className="text-foreground mb-6 text-center text-2xl font-bold tracking-tight md:text-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {slide.title}
      </motion.h2>

      {slide.content?.map((text, i) => (
        <motion.p
          key={i}
          className="text-muted-foreground mb-8 max-w-2xl text-center text-2xl leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
        >
          {text}
        </motion.p>
      ))}

      <motion.div
        className="relative max-w-3xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.7 }}
      >
        <motion.div
          className="bg-primary absolute top-0 bottom-0 -left-4 w-1 rounded-full md:-left-8"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
          style={{ transformOrigin: 'top' }}
        />
        <blockquote className="pl-6 md:pl-10">
          <p className="text-foreground/90 text-xl leading-relaxed font-light italic md:text-2xl lg:text-3xl">
            {slide.quote}
          </p>
        </blockquote>
      </motion.div>

      {slide.quoteSource && (
        <motion.p
          className="text-muted-foreground mt-8 text-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          {'— '}
          {slide.quoteSource}
        </motion.p>
      )}

      <SourceFooter sources={slide.sources} />
    </div>
  );
}
