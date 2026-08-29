'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, Search, SlidersHorizontal } from 'lucide-react';
import { ProductArt } from './product-art';
import { SHOP_CATEGORIES, SHOP_PRODUCTS } from '@/lib/shop';

export function ShopCatalog() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const products = useMemo(() => SHOP_PRODUCTS.filter((product) => (category === 'All' || product.category === category) && `${product.brand} ${product.name}`.toLowerCase().includes(query.toLowerCase().trim())), [category, query]);

  return (
    <section id="catalog" className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Curated catalog</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">Find the right fit.</h2></div><p className="max-w-md text-sm leading-6 text-zinc-500">Browse by product name or category. Current commercial details are always confirmed on Amazon.</p></div>
      <div className="mt-10 flex flex-col gap-4 rounded-[1.5rem] border border-black/[0.06] bg-white p-3 shadow-sm dark:border-white/10 dark:bg-zinc-950 md:flex-row">
        <label className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-zinc-100 px-4 dark:bg-zinc-900"><Search className="h-4 w-4 text-zinc-400" /><span className="sr-only">Search products</span><input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Search products" className="h-12 w-full bg-transparent text-sm outline-none" /></label>
        <div id="categories" className="flex items-center gap-2 overflow-x-auto" aria-label="Filter by category"><SlidersHorizontal className="ml-2 hidden h-4 w-4 text-zinc-400 sm:block" />{['All', ...SHOP_CATEGORIES].map((item) => <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={`whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-semibold transition ${category === item ? 'bg-zinc-950 text-white dark:bg-white dark:text-black' : 'bg-zinc-100 text-zinc-600 hover:text-black dark:bg-zinc-900 dark:text-zinc-300'}`}>{item}</button>)}</div>
      </div>
      <p className="mt-5 text-sm text-zinc-500" aria-live="polite">{products.length} {products.length === 1 ? 'product' : 'products'}</p>
      {products.length > 0 ? <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <article key={product.slug} className="group rounded-[2rem] border border-black/[0.06] bg-white p-3 shadow-[0_12px_40px_rgba(0,0,0,.04)] transition hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,.09)] dark:border-white/10 dark:bg-zinc-950"><Link href={`/shop/products/${product.slug}`} aria-label={`View ${product.name}`}><ProductArt product={product} /><div className="p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">{product.brand} · {product.category}</p><h3 className="mt-2 text-xl font-semibold tracking-tight">{product.name}</h3><p className="mt-3 text-sm leading-6 text-zinc-500">{product.overview}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">View details <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></div></Link></article>)}</div> : <div className="mt-6 rounded-[2rem] border border-dashed border-zinc-300 py-20 text-center dark:border-zinc-700"><p className="font-medium">No products match this search.</p><button type="button" onClick={() => { setQuery(''); setCategory('All'); }} className="mt-3 text-sm font-semibold text-blue-600">Clear filters</button></div>}
    </section>
  );
}
