import type { ReactNode } from 'react';

const MARKER_PATTERN = /(\[\[.+?\]\]|==.+?==)/g;
const LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

const DEFAULT_HIGHLIGHT_CLASS_NAME = 'rounded-sm bg-primary px-1 py-0.5 text-primary-foreground';
const DEFAULT_LINK_CLASS_NAME =
  'text-primary underline underline-offset-4 decoration-primary/60 hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm';

const renderTextWithLinks = (text: string, keyPrefix: string): ReactNode[] => {
  const nodes: ReactNode[] = [];
  let currentIndex = 0;
  let linkMatch = LINK_PATTERN.exec(text);

  while (linkMatch) {
    const [rawMatch, label, href] = linkMatch;
    const matchIndex = linkMatch.index;

    if (matchIndex > currentIndex) {
      nodes.push(
        <span key={`${keyPrefix}-text-${currentIndex}`}>
          {text.slice(currentIndex, matchIndex)}
        </span>,
      );
    }

    nodes.push(
      <a
        key={`${keyPrefix}-link-${matchIndex}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={DEFAULT_LINK_CLASS_NAME}
      >
        {label}
      </a>,
    );

    currentIndex = matchIndex + rawMatch.length;
    linkMatch = LINK_PATTERN.exec(text);
  }

  if (currentIndex < text.length) {
    nodes.push(<span key={`${keyPrefix}-text-${currentIndex}`}>{text.slice(currentIndex)}</span>);
  }

  if (nodes.length === 0) {
    return [<span key={`${keyPrefix}-text-empty`}>{text}</span>];
  }

  return nodes;
};

export const renderTextWithHighlights = (
  text: string,
  highlightClassName: string = DEFAULT_HIGHLIGHT_CLASS_NAME,
): ReactNode[] => {
  const segments = text.split(MARKER_PATTERN).filter(Boolean);

  return segments.map((segment, index) => {
    const isBracketHighlight = segment.startsWith('[[') && segment.endsWith(']]');
    const isEqualsHighlight = segment.startsWith('==') && segment.endsWith('==');

    if (!isBracketHighlight && !isEqualsHighlight) {
      return (
        <span key={`${segment}-${index}`}>{renderTextWithLinks(segment, `plain-${index}`)}</span>
      );
    }

    const highlightedText = segment.slice(2, -2);
    if (!highlightedText) {
      return <span key={`${segment}-${index}`}>{segment}</span>;
    }

    return (
      <mark key={`${segment}-${index}`} className={highlightClassName}>
        {renderTextWithLinks(highlightedText, `highlight-${index}`)}
      </mark>
    );
  });
};
