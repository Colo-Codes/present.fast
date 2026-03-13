'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useCallback, useEffect } from 'react';

interface ImageLightboxProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageLightbox({ src, alt, isOpen, onClose }: ImageLightboxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown, true);
      return () => window.removeEventListener('keydown', handleKeyDown, true);
    }
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <motion.div
            className="bg-background/90 absolute inset-0 backdrop-blur-xl"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Close button */}
          <motion.button
            className="bg-secondary border-border/50 text-foreground/70 hover:text-foreground hover:bg-secondary/80 absolute top-6 right-6 z-[110] flex h-10 w-10 items-center justify-center rounded-full border transition-colors"
            onClick={onClose}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.1 }}
            aria-label="Close enlarged image"
          >
            <X className="h-5 w-5" />
          </motion.button>

          {/* Image */}
          <motion.div
            className="relative z-[105] max-h-[90vh] max-w-[90vw] overflow-hidden rounded-xl shadow-2xl"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={src}
              alt={alt}
              className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain"
            />
          </motion.div>

          {/* Hint */}
          <motion.p
            className="text-muted-foreground/60 absolute bottom-6 left-1/2 z-[110] -translate-x-1/2 font-mono text-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.3 }}
          >
            Press ESC or click outside to close
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
