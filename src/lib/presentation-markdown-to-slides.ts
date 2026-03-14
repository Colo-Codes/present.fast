import type { SlideData } from '@/lib/slides';

const SLIDE_DELIMITER_REGEX = /^---\s*$/m;
const HEADING_REGEX = /^#{1,6}\s+(.+)$/;
const BULLET_REGEX = /^\s*[-*]\s+(.+)$/;
const QUOTE_REGEX = /^\s*>\s?(.*)$/;
const TYPE_REGEX = /^\s*type:\s*(title|content|image|split|quote|three-column|highlight)\s*$/i;
const IMAGE_REGEX = /!\[([^\]]*)\]\(([^)\s]+)\)/;
const HORIZONTAL_RULE_REGEX = /^\s*-{3,}\s*$/;

const splitMarkdownIntoSections = (markdown: string) => {
  const normalized = markdown.replace(/\r\n/g, '\n');
  return normalized.split(SLIDE_DELIMITER_REGEX);
};

const compactContent = (values: string[]) => {
  return values
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
};

const parseSectionToSlide = (section: string, index: number): SlideData | null => {
  const trimmedSection = section.trim();
  if (!trimmedSection) {
    return null;
  }

  const lines = trimmedSection.split('\n').map((line) => line.trimEnd());
  const nonEmptyLines = lines.map((line) => line.trim()).filter((line) => line.length > 0);

  if (nonEmptyLines.length === 0) {
    return null;
  }

  const explicitTypeLine = nonEmptyLines.find((line) => TYPE_REGEX.test(line));
  const explicitTypeMatch = explicitTypeLine?.match(TYPE_REGEX);
  const explicitType = explicitTypeMatch?.[1]?.toLowerCase() as SlideData['type'] | undefined;

  const headingLine = nonEmptyLines.find((line) => HEADING_REGEX.test(line));
  const headingMatch = headingLine?.match(HEADING_REGEX);
  const headingText = headingMatch?.[1]?.trim() ?? '';

  const bulletItems = compactContent(
    lines
      .map((line) => line.match(BULLET_REGEX)?.[1] ?? '')
      .filter((line) => line.length > 0),
  );

  const quoteLines = compactContent(
    lines
      .map((line) => line.match(QUOTE_REGEX)?.[1] ?? '')
      .filter((line) => line.length > 0),
  );

  const imageMatch = trimmedSection.match(IMAGE_REGEX);
  const imageAlt = imageMatch?.[1]?.trim() ?? '';
  const imageUrl = imageMatch?.[2]?.trim() ?? '';

  const paragraphLines = compactContent(
    nonEmptyLines.filter((line) => {
      if (TYPE_REGEX.test(line)) {
        return false;
      }

      if (HEADING_REGEX.test(line)) {
        return false;
      }

      if (BULLET_REGEX.test(line)) {
        return false;
      }

      if (QUOTE_REGEX.test(line)) {
        return false;
      }

      if (IMAGE_REGEX.test(line)) {
        return false;
      }

      if (HORIZONTAL_RULE_REGEX.test(line)) {
        return false;
      }

      return true;
    }),
  );

  const fallbackTitle = headingText || `Slide ${index + 1}`;

  const paragraphContent = paragraphLines.length > 0 ? paragraphLines : undefined;
  const bulletContent = bulletItems.length > 0 ? bulletItems : undefined;
  const quoteContent = quoteLines.length > 0 ? quoteLines.join(' ') : undefined;

  const hasImage = Boolean(imageUrl);
  const hasQuote = Boolean(quoteContent);
  const hasBullets = Boolean(bulletContent && bulletContent.length > 0);
  const hasParagraphs = Boolean(paragraphContent && paragraphContent.length > 0);

  if (explicitType === 'title') {
    return {
      id: index + 1,
      type: 'title',
      title: fallbackTitle,
      subtitle: paragraphContent?.[0],
    };
  }

  if (explicitType === 'quote' || hasQuote) {
    return {
      id: index + 1,
      type: 'quote',
      title: fallbackTitle,
      content: hasParagraphs ? paragraphContent : undefined,
      quote: quoteContent ?? paragraphContent?.[0] ?? fallbackTitle,
      quoteSource: paragraphContent?.[0],
    };
  }

  if (explicitType === 'image' || (hasImage && !hasBullets && !hasParagraphs)) {
    return {
      id: index + 1,
      type: 'image',
      title: fallbackTitle,
      subtitle: paragraphContent?.[0],
      image: imageUrl,
      imageAlt,
      imageCaption: paragraphContent?.[1] ?? paragraphContent?.[0],
    };
  }

  if (explicitType === 'split' || (hasImage && (hasBullets || hasParagraphs))) {
    return {
      id: index + 1,
      type: 'split',
      title: fallbackTitle,
      content: paragraphContent,
      bullets: bulletContent,
      image: imageUrl || undefined,
      imageAlt,
    };
  }

  if (explicitType === 'content' || hasBullets || hasParagraphs || headingText) {
    return {
      id: index + 1,
      type: 'content',
      title: fallbackTitle,
      content: paragraphContent,
      bullets: bulletContent,
    };
  }

  return {
    id: index + 1,
    type: 'content',
    title: fallbackTitle,
    content: [trimmedSection],
  };
};

export const parsePresentationMarkdownToSlides = (markdown: string): SlideData[] => {
  if (!markdown.trim()) {
    return [];
  }

  const sections = splitMarkdownIntoSections(markdown);
  const parsedSlides: SlideData[] = [];

  for (const section of sections) {
    try {
      const parsedSlide = parseSectionToSlide(section, parsedSlides.length);
      if (!parsedSlide) {
        continue;
      }

      parsedSlides.push(parsedSlide);
    } catch {
      const safeFallbackText = section.trim();
      if (!safeFallbackText) {
        continue;
      }

      parsedSlides.push({
        id: parsedSlides.length + 1,
        type: 'content',
        title: `Slide ${parsedSlides.length + 1}`,
        content: [safeFallbackText],
      });
    }
  }

  if (parsedSlides.length > 0) {
    return parsedSlides;
  }

  return [
    {
      id: 1,
      type: 'content',
      title: 'Slide 1',
      content: [markdown.trim()],
    },
  ];
};
