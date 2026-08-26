'use client';

import { useEffect } from 'react';

type Mode =
  | 'underline'
  | 'highlight'
  | 'mixed';

const STYLE_ID =
  'auronix-safe-scroll-typography';

const SKIP_SELECTOR = [
  'script',
  'style',
  'noscript',
  'nav',
  'button',
  'input',
  'textarea',
  'select',
  'option',
  'code',
  'pre',
  'svg',
  '[data-no-text-animation]',
  '[data-text-static]',
  '[aria-hidden="true"]',
].join(',');

const TARGET_SELECTOR = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'blockquote',
  'figcaption',
  '[data-text-animate]',
].join(',');

const IMPORTANT_WORDS = new Set([
  'auronix',
  'commerce',
  'quality',
  'trusted',
  'modern',
  'smarter',
  'products',
  'product',
  'brands',
  'brand',
  'supplier',
  'suppliers',
  'partnership',
  'partnerships',
  'procurement',
  'sourcing',
  'distribution',
  'marketplace',
  'marketplaces',
  'ecommerce',
  'e-commerce',
  'strategy',
  'growth',
  'technology',
  'operations',
  'solutions',
  'business',
  'opportunities',
  'performance',
  'catalog',
  'inventory',
]);

const PHRASES = [
  'trusted partnerships',
  'long-term partnerships',
  'smarter operations',
  'strategic sourcing',
  'quality products',
  'modern commerce',
  'marketplace expertise',
  'supplier partnerships',
  'product sourcing',
  'marketplace growth',
  'built to scale',
  'made for growth',
];

function hash(
  input: string
) {
  let value = 0;

  for (
    let i = 0;
    i < input.length;
    i += 1
  ) {
    value =
      (
        value * 31 +
        input.charCodeAt(i)
      ) >>> 0;
  }

  return value % 1000;
}

function clean(
  value: string
) {
  return value
    .toLowerCase()
    .replace(
      /[^a-z0-9-]/g,
      ''
    );
}

function injectStyles() {
  if (
    document.getElementById(
      STYLE_ID
    )
  ) {
    return;
  }

  const style =
    document.createElement(
      'style'
    );

  style.id =
    STYLE_ID;

  style.textContent = `
    .auronix-safe-type {
      position: relative;
    }

    .auronix-safe-underline {
      position: relative;
      display: inline-block;
    }

    .auronix-safe-underline::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: -0.12em;
      height: 2px;
      border-radius: 999px;
      background: currentColor;
      opacity: 0.85;
      transform: scaleX(0);
      transform-origin: left center;
      transition:
        transform 850ms cubic-bezier(.22,1,.36,1),
        opacity 350ms ease;
    }

    .auronix-safe-underline[data-visible="true"]::after {
      transform: scaleX(1);
      opacity: 1;
    }

    .auronix-safe-highlight {
      position: relative;
      display: inline;
      padding: 0 0.08em;
      z-index: 0;
      border-radius: 0.18em;
    }

    .auronix-safe-highlight::before {
      content: "";
      position: absolute;
      z-index: -1;
      left: -0.08em;
      right: -0.08em;
      bottom: 0.04em;
      height: 0.48em;
      border-radius: 999px;
      background: rgba(255,255,255,0.20);
      transform: scaleX(0);
      transform-origin: left center;
      opacity: 0;
      transition:
        transform 900ms cubic-bezier(.22,1,.36,1),
        opacity 400ms ease;
    }

    .auronix-safe-highlight[data-visible="true"]::before {
      transform: scaleX(1);
      opacity: 1;
    }

    .auronix-safe-highlight::after {
      content: "";
      position: absolute;
      left: -30%;
      top: 0;
      width: 18%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255,255,255,0.55),
        transparent
      );
      opacity: 0;
      pointer-events: none;
    }

    .auronix-safe-highlight[data-visible="true"]::after {
      animation:
        auronix-safe-highlight-shine
        1100ms
        cubic-bezier(.22,1,.36,1)
        100ms
        both;
    }

    @keyframes auronix-safe-highlight-shine {
      0% {
        transform: translateX(0);
      }

      100% {
        transform: translateX(720%);
      }
    }

    .auronix-safe-mixed {
      display: inline-block;
      font-style: italic;
      font-weight: 800;
      letter-spacing: -0.045em;
      transform: translateY(0.03em) rotate(-0.5deg);
      transition:
        transform 650ms cubic-bezier(.22,1,.36,1),
        letter-spacing 650ms cubic-bezier(.22,1,.36,1);
    }

    .auronix-safe-mixed[data-visible="true"] {
      transform: translateY(-0.04em) rotate(-0.15deg);
      letter-spacing: -0.06em;
    }

    @media (prefers-reduced-motion: reduce) {
      .auronix-safe-underline::after,
      .auronix-safe-highlight::before,
      .auronix-safe-mixed {
        transition: none !important;
        transform: none !important;
      }

      .auronix-safe-underline::after,
      .auronix-safe-highlight::before {
        transform: scaleX(1) !important;
        opacity: 1 !important;
      }

      .auronix-safe-highlight::after {
        animation: none !important;
      }
    }
  `;

  document.head.appendChild(
    style
  );
}

function shouldSkip(
  element: HTMLElement
) {
  return Boolean(
    element.closest(
      SKIP_SELECTOR
    )
  );
}

function createStyledSpan(
  text: string,
  mode: Mode
) {
  const span =
    document.createElement(
      'span'
    );

  span.textContent =
    text;

  span.className =
    `auronix-safe-type auronix-safe-${mode}`;

  span.setAttribute(
    'data-visible',
    'false'
  );

  return span;
}

function chooseWordMode(
  word: string,
  seed: number,
  heading: boolean
): Mode | null {
  const value =
    clean(word);

  if (
    value.length < 5
  ) {
    return null;
  }

  if (
    IMPORTANT_WORDS.has(
      value
    )
  ) {
    if (
      heading &&
      seed % 8 === 0
    ) {
      return 'mixed';
    }

    if (
      seed % 3 === 0
    ) {
      return 'highlight';
    }

    return 'underline';
  }

  /*
   * Normal body text:
   * predominantly underline.
   */
  if (
    seed % 9 === 0
  ) {
    return 'underline';
  }

  if (
    seed % 17 === 0
  ) {
    return 'highlight';
  }

  return null;
}

function findPhrase(
  text: string
) {
  const lower =
    text.toLowerCase();

  for (
    const phrase of PHRASES
  ) {
    const index =
      lower.indexOf(
        phrase
      );

    if (
      index !== -1
    ) {
      return {
        index,
        phrase,
      };
    }
  }

  return null;
}

function processTextNode(
  node: Text,
  element: HTMLElement,
  index: number
) {
  const raw =
    node.nodeValue || '';

  if (
    !raw.trim()
  ) {
    return;
  }

  const parent =
    node.parentElement;

  if (
    !parent
  ) {
    return;
  }

  if (
    parent.closest(
      [
        'nav',
        'button',
        'input',
        'textarea',
        'select',
        'option',
        'code',
        'pre',
        'script',
        'style',
        'noscript',
        'svg',
        '[data-no-text-animation]',
        '[data-text-static]',
        '[aria-hidden="true"]',
        '.auronix-safe-type',
      ].join(',')
    )
  ) {
    return;
  }

  if (
    raw.length >
    1600
  ) {
    return;
  }

  const fragment =
    document.createDocumentFragment();

  const isHeading =
    /^H[1-6]$/.test(
      element.tagName
    );

  /*
   * Full phrase highlight first.
   */
  const phrase =
    findPhrase(
      raw
    );

  if (
    phrase
  ) {
    const before =
      raw.slice(
        0,
        phrase.index
      );

    const highlighted =
      raw.slice(
        phrase.index,
        phrase.index +
          phrase.phrase.length
      );

    const after =
      raw.slice(
        phrase.index +
          phrase.phrase.length
      );

    if (
      before
    ) {
      fragment.append(
        document.createTextNode(
          before
        )
      );
    }

    fragment.append(
      createStyledSpan(
        highlighted,
        'highlight'
      )
    );

    if (
      after
    ) {
      fragment.append(
        document.createTextNode(
          after
        )
      );
    }

    node.replaceWith(
      fragment
    );

    return;
  }

  /*
   * Headings:
   * stronger treatment, but only one
   * visual treatment per heading.
   */
  if (
    isHeading
  ) {
    const seed =
      hash(
        `${index}:${raw}`
      );

    const mode: Mode =
      seed % 4 === 0
        ? 'highlight'
        : seed % 3 === 0
        ? 'mixed'
        : 'underline';

    fragment.append(
      createStyledSpan(
        raw,
        mode
      )
    );

    node.replaceWith(
      fragment
    );

    return;
  }

  /*
   * Paragraphs:
   * selective individual words.
   */
  const parts =
    raw.split(
      /(\s+|[,.!?;:()[\]"'\/]+)/g
    );

  let token =
    0;

  for (
    const part of parts
  ) {
    if (
      !part
    ) {
      continue;
    }

    if (
      /^\s+$/.test(
        part
      ) ||
      /^[,.!?;:()[\]"'\/]+$/.test(
        part
      )
    ) {
      fragment.append(
        document.createTextNode(
          part
        )
      );

      continue;
    }

    const seed =
      hash(
        `${index}:${token}:${part}`
      );

    const mode =
      chooseWordMode(
        part,
        seed,
        false
      );

    if (
      mode
    ) {
      fragment.append(
        createStyledSpan(
          part,
          mode
        )
      );
    } else {
      fragment.append(
        document.createTextNode(
          part
        )
      );
    }

    token +=
      1;
  }

  node.replaceWith(
    fragment
  );
}

function processElement(
  element: HTMLElement,
  index: number
) {
  if (
    shouldSkip(
      element
    )
  ) {
    return;
  }

  if (
    element.hasAttribute(
      'data-auronix-safe-processed'
    )
  ) {
    return;
  }

  const text =
    element.innerText.trim();

  if (
    text.length < 8 ||
    text.length > 1800
  ) {
    return;
  }

  /*
   * Capture text nodes BEFORE marking
   * the element as processed.
   */
  const walker =
    document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT
    );

  const nodes: Text[] =
    [];

  let current =
    walker.nextNode();

  while (
    current
  ) {
    nodes.push(
      current as Text
    );

    current =
      walker.nextNode();
  }

  element.setAttribute(
    'data-auronix-safe-processed',
    'true'
  );

  nodes.forEach(
    (
      node,
      nodeIndex
    ) => {
      processTextNode(
        node,
        element,
        index * 101 +
          nodeIndex
      );
    }
  );
}

function processPage() {
  const elements =
    Array.from(
      document.querySelectorAll<HTMLElement>(
        TARGET_SELECTOR
      )
    );

  elements.forEach(
    (
      element,
      index
    ) => {
      processElement(
        element,
        index
      );
    }
  );
}

function observeStyledText() {
  const elements =
    Array.from(
      document.querySelectorAll<HTMLElement>(
        '.auronix-safe-type[data-visible="false"]'
      )
    );

  if (
    elements.length ===
    0
  ) {
    return () => {};
  }

  const observer =
    new IntersectionObserver(
      (
        entries
      ) => {
        entries.forEach(
          (
            entry
          ) => {
            if (
              !entry.isIntersecting
            ) {
              return;
            }

            (
              entry.target as HTMLElement
            ).setAttribute(
              'data-visible',
              'true'
            );

            observer.unobserve(
              entry.target
            );
          }
        );
      },
      {
        threshold:
          0.15,
        rootMargin:
          '-5% 0px -5% 0px',
      }
    );

  elements.forEach(
    (
      element
    ) => {
      observer.observe(
        element
      );
    }
  );

  return () =>
    observer.disconnect();
}

export function ScrollTextEffects() {
  useEffect(() => {
    injectStyles();

    let visibilityCleanup:
      (() => void) | null =
      null;

    let mutationObserver:
      MutationObserver | null =
      null;

    const start =
      window.setTimeout(
        () => {
          processPage();

          visibilityCleanup =
            observeStyledText();

          /*
           * Support pages whose content
           * arrives after hydration.
           */
          mutationObserver =
            new MutationObserver(
              () => {
                processPage();

                if (
                  visibilityCleanup
                ) {
                  visibilityCleanup();
                }

                visibilityCleanup =
                  observeStyledText();
              }
            );

          mutationObserver.observe(
            document.body,
            {
              childList:
                true,
              subtree:
                true,
            }
          );
        },
        400
      );

    return () => {
      window.clearTimeout(
        start
      );

      if (
        visibilityCleanup
      ) {
        visibilityCleanup();
      }

      if (
        mutationObserver
      ) {
        mutationObserver.disconnect();
      }
    };
  }, []);

  return null;
}

export default ScrollTextEffects;
