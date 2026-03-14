'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { CursorTrail } from '@/components/slides/cursor-trail';
import { SlideContent } from '@/components/slides/slide-content';
import { SlideHighlight } from '@/components/slides/slide-highlight';
import { SlideImage } from '@/components/slides/slide-image';
import { SlideNav } from '@/components/slides/slide-nav';
import { SlideProgress } from '@/components/slides/slide-progress';
import { SlideQuote } from '@/components/slides/slide-quote';
import { SlideSplit } from '@/components/slides/slide-split';
import { SlideThreeColumn } from '@/components/slides/slide-three-column';
import { SlideTitle } from '@/components/slides/slide-title';
import type { SlideData } from '@/features/presentations/model/slides';
import { slides as defaultSlides } from '@/features/presentations/model/slides';

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-50%' : '50%',
    opacity: 0,
    scale: 0.95,
  }),
};

const SlideRenderer = ({ slide }: { slide: SlideData }) => {
  if (!slide) return null;

  switch (slide.type) {
    case 'title':
      return <SlideTitle slide={slide} />;
    case 'content':
      return <SlideContent slide={slide} />;
    case 'image':
      return <SlideImage slide={slide} />;
    case 'split':
      return <SlideSplit slide={slide} />;
    case 'quote':
      return <SlideQuote slide={slide} />;
    case 'three-column':
      return <SlideThreeColumn slide={slide} />;
    case 'highlight':
      return <SlideHighlight slide={slide} />;
    default: {
      const exhaustiveSlideType: never = slide.type;
      return exhaustiveSlideType;
    }
  }
};

const getSlideParentTopic = (slideId: number) => {
  if (slideId === 1) return 'Research Plan Implement (RPI) framework for working with AI agents';
  if (slideId >= 2 && slideId <= 6) return 'Introduction';
  if (slideId >= 7 && slideId <= 12) return 'Suboptimal vs optimal agent usage';
  if (slideId >= 13 && slideId <= 19) return 'The Research -> Plan -> Implement (RPI) framework';
  if (slideId >= 20 && slideId <= 21) return 'Closing thoughts';
  return 'Antares Presentation';
};

type PresentationSlidesProps = {
  slides?: SlideData[];
  presentationTitle?: string;
  onExitPresentation?: () => void | Promise<void>;
};

export const PresentationSlides = ({
  slides: slidesProp,
  presentationTitle,
  onExitPresentation,
}: PresentationSlidesProps) => {
  const router = useRouter();
  const slides = slidesProp ?? defaultSlides;
  const HOVER_OUT_DEBOUNCE_MS = 140;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [hoveredDot, setHoveredDot] = useState<number | null>(null);
  const [isPointerModeActive, setIsPointerModeActive] = useState(false);
  const [isFullscreenActive, setIsFullscreenActive] = useState(false);
  const isAnimating = useRef(false);
  const hoverOutAnimationFrame = useRef<number | null>(null);
  const hoverOutStart = useRef<number | null>(null);
  const pendingHoverOutDot = useRef<number | null>(null);

  const isUsingDefaultSlides = slidesProp === undefined;

  useEffect(() => {
    if (slides.length === 0) {
      setCurrentSlide(0);
      return;
    }

    if (currentSlide <= slides.length - 1) {
      return;
    }

    setCurrentSlide(slides.length - 1);
  }, [currentSlide, slides.length]);

  const goToSlide = useCallback(
    (index: number) => {
      if (isAnimating.current) return;
      if (index < 0 || index >= slides.length) return;
      setDirection(index > currentSlide ? 1 : -1);
      setCurrentSlide(index);
    },
    [currentSlide, slides.length],
  );

  const nextSlide = useCallback(() => {
    goToSlide(currentSlide + 1);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentSlide - 1);
  }, [currentSlide, goToSlide]);

  const togglePointerMode = useCallback(() => {
    setIsPointerModeActive((previousValue) => !previousValue);
  }, []);

  const deactivatePointerMode = useCallback(() => {
    setIsPointerModeActive(false);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenEnabled) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await document.documentElement.requestFullscreen();
  }, []);

  const handleExitPresentation = useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }

    if (onExitPresentation) {
      await onExitPresentation();
      return;
    }

    router.push('/dashboard');
  }, [onExitPresentation, router]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreenActive(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    handleFullscreenChange();

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'p') {
        event.preventDefault();
        togglePointerMode();
        return;
      }

      if (event.key === 'Escape') {
        if (!isPointerModeActive) return;
        event.preventDefault();
        deactivatePointerMode();
        return;
      }

      if (event.key === 'ArrowRight' || event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        nextSlide();
      } else if (event.key === 'ArrowLeft' || event.key === 'Backspace') {
        event.preventDefault();
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deactivatePointerMode, isPointerModeActive, nextSlide, prevSlide, togglePointerMode]);

  const touchStart = useRef<number | null>(null);
  const currentSlideData = slides[currentSlide];
  const fallbackPresentationTitle = 'Antares Presentation';
  const presentationLabel = presentationTitle?.trim() || fallbackPresentationTitle;
  const parentTopic = getSlideParentTopic(currentSlideData?.id ?? 0);
  const breadcrumbParts = isUsingDefaultSlides
    ? [presentationLabel, parentTopic, currentSlideData?.title ?? 'Slide']
    : [presentationLabel, currentSlideData?.title ?? 'Slide'];

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    touchStart.current = event.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      if (touchStart.current === null) return;
      const diff = touchStart.current - event.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) nextSlide();
        else prevSlide();
      }
      touchStart.current = null;
    },
    [nextSlide, prevSlide],
  );

  useEffect(() => {
    return () => {
      if (hoverOutAnimationFrame.current !== null) {
        cancelAnimationFrame(hoverOutAnimationFrame.current);
      }
    };
  }, []);

  const handleDotPointerEnter = useCallback((dotIndex: number) => {
    pendingHoverOutDot.current = null;
    hoverOutStart.current = null;

    if (hoverOutAnimationFrame.current !== null) {
      cancelAnimationFrame(hoverOutAnimationFrame.current);
      hoverOutAnimationFrame.current = null;
    }

    setHoveredDot(dotIndex);
  }, []);

  const handleDotPointerLeave = useCallback((dotIndex: number) => {
    pendingHoverOutDot.current = dotIndex;
    hoverOutStart.current = null;

    const debounceHoverOut = (timestamp: number) => {
      if (pendingHoverOutDot.current !== dotIndex) {
        hoverOutAnimationFrame.current = null;
        return;
      }

      if (hoverOutStart.current === null) {
        hoverOutStart.current = timestamp;
      }

      const elapsed = timestamp - hoverOutStart.current;
      if (elapsed >= HOVER_OUT_DEBOUNCE_MS) {
        setHoveredDot((previousHoveredDot) =>
          previousHoveredDot === dotIndex ? null : previousHoveredDot,
        );
        hoverOutAnimationFrame.current = null;
        return;
      }

      hoverOutAnimationFrame.current = requestAnimationFrame(debounceHoverOut);
    };

    if (hoverOutAnimationFrame.current !== null) {
      cancelAnimationFrame(hoverOutAnimationFrame.current);
    }

    hoverOutAnimationFrame.current = requestAnimationFrame(debounceHoverOut);
  }, []);

  return (
    <div
      className="bg-background relative h-screen w-screen overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <nav
        aria-label="Slide breadcrumb"
        className="border-border/50 bg-background/70 text-muted-foreground fixed top-4 left-6 z-50 flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium backdrop-blur-sm"
      >
        {breadcrumbParts.map((part, index) => (
          <span key={`${part}-${index}`} className="flex items-center gap-2 text-base">
            <span className={index === breadcrumbParts.length - 1 ? 'text-foreground' : ''}>
              {part}
            </span>
            {index < breadcrumbParts.length - 1 && <span aria-hidden="true">/</span>}
          </span>
        ))}
      </nav>
      <div className="fixed top-4 right-6 z-50 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleFullscreen}
          className={`focus-visible:ring-primary/50 rounded-md border px-3 py-1.5 text-sm font-medium backdrop-blur-sm transition-colors focus-visible:ring-2 focus-visible:outline-none ${
            isFullscreenActive
              ? 'border-primary/70 bg-primary/20 text-primary'
              : 'border-border/50 bg-background/70 text-muted-foreground hover:border-primary/40 hover:text-foreground'
          }`}
          aria-label={isFullscreenActive ? 'Exit fullscreen mode' : 'Enter fullscreen mode'}
          aria-pressed={isFullscreenActive}
        >
          Fullscreen {isFullscreenActive ? 'On' : 'Off'}
        </button>
        <button
          type="button"
          onClick={togglePointerMode}
          className={`focus-visible:ring-primary/50 rounded-md border px-3 py-1.5 text-sm font-medium backdrop-blur-sm transition-colors focus-visible:ring-2 focus-visible:outline-none ${
            isPointerModeActive
              ? 'border-primary/70 bg-primary/20 text-primary'
              : 'border-border/50 bg-background/70 text-muted-foreground hover:border-primary/40 hover:text-foreground'
          }`}
          aria-label={isPointerModeActive ? 'Disable pointer mode' : 'Enable pointer mode'}
          aria-pressed={isPointerModeActive}
        >
          Pointer {isPointerModeActive ? 'On' : 'Off'}
        </button>
        <button
          type="button"
          onClick={handleExitPresentation}
          className="border-border/50 bg-background/70 text-muted-foreground hover:border-primary/40 hover:text-foreground focus-visible:ring-primary/50 rounded-md border px-3 py-1.5 text-sm font-medium backdrop-blur-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
          aria-label="Exit presentation"
        >
          Exit presentation
        </button>
      </div>

      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <motion.div
        className="absolute top-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full opacity-[0.04]"
        style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }}
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {isPointerModeActive && <CursorTrail />}

      <AnimatePresence
        initial={false}
        custom={direction}
        mode="wait"
        onExitComplete={() => {
          isAnimating.current = false;
        }}
      >
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.3 },
            scale: { duration: 0.3 },
          }}
          onAnimationStart={() => {
            isAnimating.current = true;
          }}
          onAnimationComplete={() => {
            isAnimating.current = false;
          }}
          className="absolute inset-0 flex items-center justify-center pb-16"
        >
          {currentSlideData ? <SlideRenderer slide={currentSlideData} /> : null}
        </motion.div>
      </AnimatePresence>

      <SlideProgress current={currentSlide} total={slides.length} />
      <SlideNav
        onPrev={prevSlide}
        onNext={nextSlide}
        hasPrev={currentSlide > 0}
        hasNext={currentSlide < slides.length - 1}
      />

      <div className="fixed bottom-10 left-1/2 z-50 flex h-[30px] -translate-x-1/2 items-center gap-1.5">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            onPointerEnter={(event) => {
              if (event.pointerType !== 'mouse') return;
              handleDotPointerEnter(index);
            }}
            onPointerLeave={(event) => {
              if (event.pointerType !== 'mouse') return;
              handleDotPointerLeave(index);
            }}
            onFocus={() => {
              handleDotPointerEnter(index);
            }}
            onBlur={() => {
              setHoveredDot((previousHoveredDot) =>
                previousHoveredDot === index ? null : previousHoveredDot,
              );
            }}
            className={`group focus-visible:ring-primary/50 flex items-center justify-center rounded-full transition-all duration-300 hover:cursor-pointer focus-visible:ring-2 focus-visible:outline-none ${
              index === currentSlide
                ? 'bg-primary'
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            } ${hoveredDot === index ? 'h-[30px] w-[30px]' : 'h-3 w-3'}`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentSlide ? 'true' : undefined}
          >
            <span
              className={`text-primary-foreground text-[16px] leading-none font-medium transition-opacity duration-200 ${
                hoveredDot === index ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {index + 1}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
