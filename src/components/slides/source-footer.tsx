'use client';

import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

import type { SlideSource } from '@/features/presentations/model/slides';

export function SourceFooter({ sources }: { sources?: SlideSource[] }) {
  if (!sources || sources.length === 0) return null;

  return (
    <motion.div
      className="absolute right-8 bottom-32 left-8 z-10 md:right-16 md:left-16"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.5 }}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-base">
        <span className="text-muted-foreground/80 font-mono text-base tracking-wider uppercase">
          Sources
        </span>
        {sources.map((source, i) => (
          <span key={i} className="inline-flex items-center gap-1">
            {source.url ? (
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground/85 hover:text-primary/90 decoration-muted-foreground/50 hover:decoration-primary/70 inline-flex items-center gap-1 text-base underline underline-offset-2 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {source.label}
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <span className="text-muted-foreground/85 text-base">{source.label}</span>
            )}
            {i < sources.length - 1 && <span className="text-muted-foreground/55 ml-2">|</span>}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
