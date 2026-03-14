import { describe, expect, it } from 'vitest';

import { parsePresentationMarkdownToSlides } from '@/features/presentations/lib/presentation-markdown-to-slides';

const VALID_SLIDE_TYPES = new Set([
  'title',
  'content',
  'image',
  'split',
  'quote',
  'three-column',
  'highlight',
]);

describe('parsePresentationMarkdownToSlides', () => {
  it('returns empty slide set for blank markdown', () => {
    expect(parsePresentationMarkdownToSlides('   \n\n')).toEqual([]);
  });

  it('maps heading and bullets into content slide', () => {
    const markdown = `
# Presentation title
This is the intro paragraph.
- First point
- Second point
`;

    const slides = parsePresentationMarkdownToSlides(markdown);

    expect(slides).toHaveLength(1);
    expect(slides[0]).toEqual(
      expect.objectContaining({
        id: 1,
        type: 'content',
        title: 'Presentation title',
        bullets: ['First point', 'Second point'],
      }),
    );
  });

  it('splits slides on --- and keeps stable ids and valid types', () => {
    const markdown = `
# First slide
Alpha
---
# Second slide
> Quote text
`;

    const slides = parsePresentationMarkdownToSlides(markdown);

    expect(slides.map((slide) => slide.id)).toEqual([1, 2]);
    expect(slides.every((slide) => VALID_SLIDE_TYPES.has(slide.type))).toBe(true);
  });

  it('does not throw on malformed markdown and returns safe output', () => {
    const markdown = `
---
---
![image-without-end
some random text
`;

    expect(() => parsePresentationMarkdownToSlides(markdown)).not.toThrow();

    const slides = parsePresentationMarkdownToSlides(markdown);
    expect(slides.length).toBeGreaterThan(0);
    expect(slides[0]).toEqual(
      expect.objectContaining({
        id: 1,
        type: 'content',
      }),
    );
  });
});
