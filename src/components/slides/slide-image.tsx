'use client';

import { motion } from 'framer-motion';
import { Maximize2 } from 'lucide-react';
import { useState } from 'react';

import type { SlideData } from '@/lib/slides';

import { ImageLightbox } from './image-lightbox';
import { SourceFooter } from './source-footer';
import { renderTextWithHighlights } from './text-highlights';

export function SlideImage({ slide }: { slide: SlideData }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <div className="flex h-full flex-col items-center justify-center px-8 md:px-16">
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
          className="text-muted-foreground mb-8 max-w-3xl text-center text-base leading-relaxed md:text-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {renderTextWithHighlights(slide.subtitle)}
        </motion.p>
      )}

      <motion.div
        className="border-border/50 shadow-primary/5 group relative w-full max-w-4xl cursor-pointer overflow-hidden rounded-xl border shadow-2xl"
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.7,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
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
          className="h-auto w-full rounded-xl transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <div className="bg-foreground/0 group-hover:bg-foreground/5 absolute inset-0 flex items-center justify-center transition-colors duration-300">
          <div className="bg-background/80 border-border/50 rounded-full border p-3 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
            <Maximize2 className="text-foreground/70 h-5 w-5" />
          </div>
        </div>
      </motion.div>

      {slide.imageCaption && (
        <motion.p
          className="text-muted-foreground/80 mt-6 max-w-2xl text-center text-sm leading-relaxed italic md:text-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          {slide.imageCaption}
        </motion.p>
      )}

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
