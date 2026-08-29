import Link from 'next/link';
import type { ReactNode } from 'react';

function safeHref(raw: string) {
  const value = raw.trim();
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  try { const url = new URL(value); return ['https:', 'http:', 'mailto:'].includes(url.protocol) ? url.toString() : null; }
  catch { return null; }
}

function inline(value: string): ReactNode[] {
  const tokens = value.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g);
  return tokens.filter(Boolean).map((token, index) => {
    if (token.startsWith('**') && token.endsWith('**')) return <strong key={index} className="font-semibold text-foreground">{token.slice(2, -2)}</strong>;
    if (token.startsWith('*') && token.endsWith('*')) return <em key={index} className="italic text-foreground/90">{token.slice(1, -1)}</em>;
    const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const href = safeHref(link[2]);
      if (!href) return <span key={index}>{link[1]}</span>;
      const external = /^https?:/.test(href);
      return <Link key={index} href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} className="font-medium text-accent underline decoration-accent/35 underline-offset-4 hover:decoration-accent">{link[1]}</Link>;
    }
    return <span key={index}>{token}</span>;
  });
}

export function LegalRichText({ value }: { value: string }) {
  const blocks = value.trim().split(/\n{2,}/).filter(Boolean);
  return (
    <div className="space-y-4 text-base leading-7 text-foreground-muted">
      {blocks.map((block, index) => {
        const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
        if (lines.length && lines.every((line) => /^[-*]\s+/.test(line))) {
          return <ul key={index} className="ml-5 list-disc space-y-2 marker:text-accent">{lines.map((line, itemIndex) => <li key={itemIndex}>{inline(line.replace(/^[-*]\s+/, ''))}</li>)}</ul>;
        }
        if (lines.length && lines.every((line) => /^\d+[.)]\s+/.test(line))) {
          return <ol key={index} className="ml-5 list-decimal space-y-2 marker:font-semibold marker:text-foreground">{lines.map((line, itemIndex) => <li key={itemIndex}>{inline(line.replace(/^\d+[.)]\s+/, ''))}</li>)}</ol>;
        }
        return <p key={index}>{lines.map((line, lineIndex) => <span key={lineIndex}>{inline(line)}{lineIndex < lines.length - 1 && <br />}</span>)}</p>;
      })}
    </div>
  );
}
