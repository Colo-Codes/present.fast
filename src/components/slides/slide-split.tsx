'use client';

import { motion } from 'framer-motion';
import { Maximize2 } from 'lucide-react';
import { useState } from 'react';

import type { SlideData } from '@/lib/slides';

import { ImageLightbox } from './image-lightbox';
import { SourceFooter } from './source-footer';
import { renderTextWithHighlights } from './text-highlights';

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.4 + i * 0.1,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

export function SlideSplit({ slide }: { slide: SlideData }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 px-8 md:px-16 lg:flex-row lg:gap-12">
      <div className="max-w-xl flex-1">
        <div className="mb-6 flex items-center gap-3">
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
        </div>
        <motion.h2
          className="text-foreground mb-4 text-3xl font-bold tracking-tight text-balance md:text-4xl lg:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {slide.title}
        </motion.h2>

        {slide.subtitle && (
          <motion.p
            className="text-primary/80 mb-4 text-base font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {renderTextWithHighlights(slide.subtitle)}
          </motion.p>
        )}

        {slide.content?.map((text, i) => (
          <motion.p
            key={i}
            className="text-muted-foreground mb-4 text-2xl leading-relaxed"
            custom={i}
            initial="hidden"
            animate="visible"
            variants={itemVariants}
          >
            {text}
          </motion.p>
        ))}

        {slide.bullets && (
          <ul className="mt-4 space-y-3">
            {slide.bullets.map((bullet, i) => (
              <motion.li
                key={i}
                className="text-foreground/90 flex items-start gap-3 text-2xl"
                custom={i + (slide.content?.length ?? 0)}
                initial="hidden"
                animate="visible"
                variants={itemVariants}
              >
                <span className="bg-primary mt-2 h-1.5 w-1.5 shrink-0 rounded-full" />
                <span className="leading-relaxed">{bullet}</span>
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      <motion.div
        className="w-full max-w-xl flex-1"
        initial={{ opacity: 0, scale: 0.9, x: 40 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.7,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      >
        <div className="space-y-4">
          {slide.codeBlock && (
            <div className="border-border/50 bg-card/70 shadow-primary/5 rounded-xl border p-4 shadow-2xl">
              <pre className="text-foreground text-sm leading-relaxed wrap-break-word whitespace-pre-wrap">
                <code>
                  {renderTextWithHighlights(
                    slide.codeBlock,
                    'rounded-sm bg-primary/30 px-0.5 py-px text-foreground',
                  )}
                </code>
              </pre>
            </div>
          )}

          {slide.image && (
            <div
              className="border-border/50 shadow-primary/5 group relative cursor-pointer overflow-hidden rounded-xl border shadow-2xl"
              onClick={() => setLightboxOpen(true)}
              role="button"
              tabIndex={0}
              aria-label="Click to enlarge image"
              onKeyDown={(e) => {
                if (e.key === 'Enter') setLightboxOpen(true);
              }}
            >
              <img
                src={slide.image}
                alt={slide.imageAlt || ''}
                className="h-auto w-full transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="bg-foreground/0 group-hover:bg-foreground/5 absolute inset-0 flex items-center justify-center transition-colors duration-300">
                <div className="bg-background/80 border-border/50 rounded-full border p-2.5 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                  <Maximize2 className="text-foreground/70 h-4 w-4" />
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {slide.image && (
        <ImageLightbox
          src={slide.image}
          alt={slide.imageAlt || ''}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      <SourceFooter sources={slide.sources} />
    </div>
  );
}
