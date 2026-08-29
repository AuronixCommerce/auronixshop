export const SHOP_SITE_URL = (
  process.env.NEXT_PUBLIC_SHOP_SITE_URL ||
  'https://shop.auronixcommerce.com'
).replace(/\/+$/, '');

export const AMAZON_STOREFRONT_URL = (
  process.env.NEXT_PUBLIC_AMAZON_STOREFRONT_URL ||
  'https://www.amazon.com'
).replace(/\/+$/, '');

export const AMAZON_ASSOCIATE_TAG =
  process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG?.trim() || '';

export const SHOP_CATEGORIES = [
  'Work',
  'Everyday tech',
  'Home',
  'Travel',
] as const;

export type ShopCategory = (typeof SHOP_CATEGORIES)[number];

export type ShopProduct = {
  slug: string;
  brand: string;
  name: string;
  category: ShopCategory;
  searchTerm: string;
  accent: string;
  shortLabel: string;
  overview: string;
  considerations: string[];
};

// Intentionally limited to stable catalog fields. Price, availability, ratings,
// reviews and promotional claims must be read on Amazon at the time of purchase.
export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    slug: 'logitech-mx-master-3s',
    brand: 'Logitech',
    name: 'MX Master 3S Wireless Mouse',
    category: 'Work',
    searchTerm: 'Logitech MX Master 3S Wireless Mouse',
    accent: 'from-sky-400/30 via-blue-500/10 to-transparent',
    shortLabel: 'MX',
    overview: 'A wireless computer mouse in Logitech’s MX product family.',
    considerations: ['Operating-system compatibility', 'Preferred color and configuration', 'Items included with the selected offer'],
  },
  {
    slug: 'apple-airtag-four-pack',
    brand: 'Apple',
    name: 'AirTag Four Pack',
    category: 'Everyday tech',
    searchTerm: 'Apple AirTag 4 Pack',
    accent: 'from-zinc-300/40 via-slate-300/10 to-transparent',
    shortLabel: 'AT',
    overview: 'A four-item pack of Apple AirTag accessories for the Find My ecosystem.',
    considerations: ['Device and account compatibility', 'Accessory requirements', 'The exact pack configuration'],
  },
  {
    slug: 'amazon-kindle-paperwhite-16gb',
    brand: 'Amazon',
    name: 'Kindle Paperwhite 16 GB',
    category: 'Travel',
    searchTerm: 'Amazon Kindle Paperwhite 16 GB',
    accent: 'from-amber-300/30 via-orange-400/10 to-transparent',
    shortLabel: 'KP',
    overview: 'A 16 GB model in Amazon’s Kindle Paperwhite e-reader family.',
    considerations: ['Generation and release year', 'With-ads or without-ads configuration', 'Included accessories and warranty terms'],
  },
  {
    slug: 'anker-nano-20w-usb-c-charger',
    brand: 'Anker',
    name: 'Nano 20 W USB-C Charger',
    category: 'Travel',
    searchTerm: 'Anker Nano 20W USB C Charger',
    accent: 'from-violet-400/30 via-fuchsia-400/10 to-transparent',
    shortLabel: '20W',
    overview: 'A compact 20 W wall charger with a USB-C connection.',
    considerations: ['Cable inclusion', 'Device charging requirements', 'Plug type for your destination'],
  },
  {
    slug: 'lodge-cast-iron-skillet-10-25',
    brand: 'Lodge',
    name: '10.25-Inch Cast Iron Skillet',
    category: 'Home',
    searchTerm: 'Lodge 10.25 Inch Cast Iron Skillet',
    accent: 'from-rose-400/25 via-orange-300/10 to-transparent',
    shortLabel: '10¼',
    overview: 'A 10.25-inch cast iron skillet from Lodge.',
    considerations: ['Dimensions and weight', 'Care instructions', 'Selected listing and seller'],
  },
  {
    slug: 'owala-freesip-24oz',
    brand: 'Owala',
    name: 'FreeSip 24 oz Water Bottle',
    category: 'Everyday tech',
    searchTerm: 'Owala FreeSip 24 oz Water Bottle',
    accent: 'from-emerald-300/30 via-teal-400/10 to-transparent',
    shortLabel: '24',
    overview: 'A 24-ounce bottle in Owala’s FreeSip product line.',
    considerations: ['Color and capacity', 'Care instructions', 'The exact lid and bottle configuration'],
  },
];

export function getShopProduct(slug: string) {
  return SHOP_PRODUCTS.find((product) => product.slug === slug);
}

export function buildAmazonUrl(product: ShopProduct) {
  const url = new URL('/s', `${AMAZON_STOREFRONT_URL}/`);
  url.searchParams.set('k', product.searchTerm);
  if (AMAZON_ASSOCIATE_TAG) url.searchParams.set('tag', AMAZON_ASSOCIATE_TAG);
  return url.toString();
}
