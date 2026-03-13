'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface TrailPoint {
  x: number;
  y: number;
  birth: number;
  strokeId: number;
}

const POINT_LIFETIME_MS = 2000;
const MIN_SAMPLE_INTERVAL_MS = 10;
const MIN_SAMPLE_DISTANCE_PX = 3;
const SEGMENT_MAX_DISTANCE_PX = 80;
const GLOW_LINE_WIDTH = 24;
const CORE_LINE_WIDTH = 8;

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const points = useRef<TrailPoint[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const activePointerId = useRef<number | null>(null);
  const isDrawing = useRef(false);
  const currentStrokeId = useRef(0);
  const lastSample = useRef<{ x: number; y: number; time: number } | null>(null);
  const primaryColor = useRef('oklch(0.7 0.15 180)');
  const pointerPosition = useRef<{ x: number; y: number } | null>(null);
  const pointerType = useRef<string | null>(null);
  const [isInteractionBlocked, setIsInteractionBlocked] = useState(false);
  const isInteractionBlockedRef = useRef(false);

  const updateInteractionBlock = useCallback((blocked: boolean) => {
    if (isInteractionBlockedRef.current === blocked) {
      return;
    }
    isInteractionBlockedRef.current = blocked;
    setIsInteractionBlocked(blocked);
  }, []);

  const addPoint = useCallback((x: number, y: number, strokeId: number, force = false) => {
    const now = performance.now();
    const previousSample = lastSample.current;

    if (!force && previousSample) {
      const elapsed = now - previousSample.time;
      const deltaX = x - previousSample.x;
      const deltaY = y - previousSample.y;
      const distance = Math.hypot(deltaX, deltaY);

      if (elapsed < MIN_SAMPLE_INTERVAL_MS || distance < MIN_SAMPLE_DISTANCE_PX) {
        return;
      }
    }

    points.current.push({
      x,
      y,
      birth: now,
      strokeId,
    });
    lastSample.current = { x, y, time: now };
  }, []);

  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) return;
      pointerType.current = event.pointerType;
      if (event.pointerType === 'mouse') {
        pointerPosition.current = { x: event.clientX, y: event.clientY };
      }
      activePointerId.current = event.pointerId;
      isDrawing.current = true;
      updateInteractionBlock(true);
      currentStrokeId.current += 1;
      addPoint(event.clientX, event.clientY, currentStrokeId.current, true);
    },
    [addPoint, updateInteractionBlock],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      pointerType.current = event.pointerType;
      if (event.pointerType === 'mouse') {
        pointerPosition.current = { x: event.clientX, y: event.clientY };
      } else {
        pointerPosition.current = null;
      }

      if (!event.isPrimary || activePointerId.current !== event.pointerId) return;
      if (!isDrawing.current) return;
      addPoint(event.clientX, event.clientY, currentStrokeId.current);
    },
    [addPoint],
  );

  const handlePointerUpOrCancel = useCallback(
    (event: PointerEvent) => {
      if (!event.isPrimary || activePointerId.current !== event.pointerId) return;
      if (isDrawing.current) {
        addPoint(event.clientX, event.clientY, currentStrokeId.current);
      }
      isDrawing.current = false;
      activePointerId.current = null;
      lastSample.current = null;
    },
    [addPoint],
  );

  const handlePointerLeaveWindow = useCallback((event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    pointerPosition.current = null;
  }, []);

  const getColorWithAlpha = useCallback((alpha: number) => {
    const clampedAlpha = Math.max(0, Math.min(1, alpha));
    const color = primaryColor.current.trim();

    if (color.startsWith('oklch(') && color.endsWith(')')) {
      return `${color.slice(0, -1)} / ${clampedAlpha})`;
    }

    if (color.startsWith('rgb(') && color.endsWith(')')) {
      return color.replace('rgb(', 'rgba(').replace(')', `, ${clampedAlpha})`);
    }

    return `rgba(80, 200, 190, ${clampedAlpha})`;
  }, []);

  const drawSmoothPath = useCallback(
    (ctx: CanvasRenderingContext2D, strokePoints: TrailPoint[]) => {
      if (strokePoints.length < 2) {
        return;
      }

      ctx.beginPath();
      ctx.moveTo(strokePoints[0].x, strokePoints[0].y);

      if (strokePoints.length === 2) {
        ctx.lineTo(strokePoints[1].x, strokePoints[1].y);
        return;
      }

      for (let index = 1; index < strokePoints.length - 1; index += 1) {
        const current = strokePoints[index];
        const next = strokePoints[index + 1];
        const midpointX = (current.x + next.x) / 2;
        const midpointY = (current.y + next.y) / 2;
        ctx.quadraticCurveTo(current.x, current.y, midpointX, midpointY);
      }

      const penultimate = strokePoints[strokePoints.length - 2];
      const last = strokePoints[strokePoints.length - 1];
      ctx.quadraticCurveTo(penultimate.x, penultimate.y, last.x, last.y);
    },
    [],
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const now = performance.now();
    points.current = points.current.filter((point) => now - point.birth <= POINT_LIFETIME_MS);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = 'lighter';

    const strokeGroups: TrailPoint[][] = [];
    let activeStroke: TrailPoint[] = [];

    for (const point of points.current) {
      if (activeStroke.length === 0) {
        activeStroke.push(point);
        continue;
      }

      const previous = activeStroke[activeStroke.length - 1];
      const sameStroke = previous.strokeId === point.strokeId;
      const distance = Math.hypot(point.x - previous.x, point.y - previous.y);
      const shouldSplit = !sameStroke || distance > SEGMENT_MAX_DISTANCE_PX;

      if (shouldSplit) {
        if (activeStroke.length > 1) {
          strokeGroups.push(activeStroke);
        }
        activeStroke = [point];
        continue;
      }

      activeStroke.push(point);
    }

    if (activeStroke.length > 1) {
      strokeGroups.push(activeStroke);
    }

    for (const strokePoints of strokeGroups) {
      const oldestBirth = strokePoints[0].birth;
      const newestBirth = strokePoints[strokePoints.length - 1].birth;
      const oldestLife = Math.max(0, 1 - (now - oldestBirth) / POINT_LIFETIME_MS);
      const newestLife = Math.max(0, 1 - (now - newestBirth) / POINT_LIFETIME_MS);
      const life = Math.max(0, (oldestLife + newestLife) / 2);
      if (life <= 0) {
        continue;
      }

      const easedLife = life * life;

      ctx.lineWidth = GLOW_LINE_WIDTH * easedLife + 3;
      ctx.strokeStyle = getColorWithAlpha(easedLife * 0.55);
      drawSmoothPath(ctx, strokePoints);
      ctx.stroke();

      ctx.lineWidth = CORE_LINE_WIDTH * easedLife + 1.5;
      ctx.strokeStyle = getColorWithAlpha(Math.max(0.1, life) * 0.95);
      drawSmoothPath(ctx, strokePoints);
      ctx.stroke();
    }

    if (pointerType.current === 'mouse' && pointerPosition.current) {
      const glowRadius = 18;
      const pointerGlow = ctx.createRadialGradient(
        pointerPosition.current.x,
        pointerPosition.current.y,
        2,
        pointerPosition.current.x,
        pointerPosition.current.y,
        glowRadius,
      );
      pointerGlow.addColorStop(0, getColorWithAlpha(0.42));
      pointerGlow.addColorStop(0.45, getColorWithAlpha(0.18));
      pointerGlow.addColorStop(1, getColorWithAlpha(0));

      ctx.beginPath();
      ctx.arc(pointerPosition.current.x, pointerPosition.current.y, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = pointerGlow;
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';

    updateInteractionBlock(isDrawing.current || points.current.length > 0);

    animationFrameRef.current = requestAnimationFrame(draw);
  }, [drawSmoothPath, getColorWithAlpha, updateInteractionBlock]);

  useEffect(() => {
    const rootStyles = getComputedStyle(document.documentElement);
    const resolvedPrimary = rootStyles.getPropertyValue('--primary').trim();
    if (resolvedPrimary) {
      primaryColor.current = resolvedPrimary;
    }

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUpOrCancel);
    window.addEventListener('pointercancel', handlePointerUpOrCancel);
    window.addEventListener('pointerout', handlePointerLeaveWindow);
    animationFrameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUpOrCancel);
      window.removeEventListener('pointercancel', handlePointerUpOrCancel);
      window.removeEventListener('pointerout', handlePointerLeaveWindow);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      updateInteractionBlock(false);
    };
  }, [
    draw,
    handlePointerDown,
    handlePointerLeaveWindow,
    handlePointerMove,
    handlePointerUpOrCancel,
    updateInteractionBlock,
  ]);

  return (
    <>
      {isInteractionBlocked && (
        <div className="pointer-events-auto fixed inset-0 z-170 touch-none" aria-hidden="true" />
      )}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-180"
        aria-hidden="true"
      />
    </>
  );
}
