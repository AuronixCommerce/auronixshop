import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ExternalLink } from 'lucide-react';
import { ProductArt } from '@/components/shop/product-art';
import { buildAmazonUrl, getShopProduct, SHOP_PRODUCTS, SHOP_SITE_URL } from '@/lib/shop';

export function generateStaticParams() { return SHOP_PRODUCTS.map(({ slug }) => ({ slug })); }

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = getShopProduct(params.slug);
  if (!product) return {};
  const description = `${product.overview} Review the current listing details on Amazon.`;
  return { title: product.name, description, alternates: { canonical: `${SHOP_SITE_URL}/products/${product.slug}` }, openGraph: { type: 'website', url: `${SHOP_SITE_URL}/products/${product.slug}`, title: product.name, description }, robots: { index: true, follow: true } };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getShopProduct(params.slug);
  if (!product) notFound();
  const amazonUrl = buildAmazonUrl(product);
  const schema = { '@context': 'https://schema.org', '@type': 'Product', name: product.name, brand: { '@type': 'Brand', name: product.brand }, category: product.category, description: product.overview };
  return <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8 lg:py-16"><Link href="/shop#catalog" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-black dark:hover:text-white"><ArrowLeft className="h-4 w-4" />Back to catalog</Link><div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16"><ProductArt product={product} large /><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-blue-600">{product.brand} · {product.category}</p><h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-.045em] sm:text-6xl">{product.name}</h1><p className="mt-6 text-lg leading-8 text-zinc-500">{product.overview}</p><div className="mt-8 rounded-[1.5rem] border border-black/[.07] bg-white p-6 dark:border-white/10 dark:bg-zinc-950"><h2 className="font-semibold">Confirm before purchasing</h2><ul className="mt-4 space-y-3">{product.considerations.map((item) => <li key={item} className="flex gap-3 text-sm text-zinc-500"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />{item}</li>)}</ul></div><a href={amazonUrl} target="_blank" rel="sponsored nofollow noopener noreferrer" className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 py-4 text-sm font-semibold text-white transition hover:scale-[1.01] dark:bg-white dark:text-black">View current listing on Amazon <ExternalLink className="h-4 w-4" /></a><p className="mt-4 text-center text-xs leading-5 text-zinc-400">Affiliate link. As an Amazon Associate, Auronix Commerce earns from qualifying purchases. Price and availability are confirmed on Amazon.</p></div></div><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /></div>;
}
