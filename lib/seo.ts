import type { Metadata } from 'next';

export const SEO_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://auronixcommerce.com';

export const SEO_SITE_NAME =
  'Auronix Commerce LLC';

export const SEO_SOCIAL_IMAGE =
  'https://pub-6d8ed6ce9591489c885eda64cf2ea10f.r2.dev/AuronixCommerceLLC/auronix%20banner.png';

export const DEFAULT_KEYWORDS = [
  'Auronix Commerce LLC',
  'eCommerce',
  'e-commerce',
  'marketplace operations',
  'product sourcing',
  'procurement',
  'supplier partnerships',
  'wholesale',
  'distribution',
];

type BuildSeoOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
  image?: string;
  type?: 'website' | 'article';
};

export function buildSeo({
  title,
  description,
  path,
  keywords = [],
  noIndex = false,
  image,
  type = 'website',
}: BuildSeoOptions): Metadata {
  const canonical =
    path === '/'
      ? SEO_SITE_URL
      : `${SEO_SITE_URL}${path}`;

  const imageUrl =
    image
      ? image.startsWith('http')
        ? image
        : `${SEO_SITE_URL}${image}`
      : SEO_SOCIAL_IMAGE;

  return {
    title,

    description,

    keywords: [
      ...DEFAULT_KEYWORDS,
      ...keywords,
    ],

    metadataBase:
      new URL(
        SEO_SITE_URL
      ),

    alternates: {
      canonical: path,
    },

    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview':
              'large',
            'max-snippet':
              -1,
            'max-video-preview':
              -1,
          },
        },

    openGraph: {
      type,
      url: canonical,
      siteName:
        SEO_SITE_NAME,
      locale: 'en_US',
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },

    twitter: {
      card:
        'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },

    authors: [
      {
        name:
          SEO_SITE_NAME,
      },
    ],

    creator:
      SEO_SITE_NAME,

    publisher:
      SEO_SITE_NAME,

    category: 'eCommerce',

    referrer: 'origin-when-cross-origin',
  };
}

export function buildNoIndexSeo(
  title: string,
  description: string,
  path: string
): Metadata {
  return buildSeo({
    title,
    description,
    path,
    noIndex: true,
  });
}
