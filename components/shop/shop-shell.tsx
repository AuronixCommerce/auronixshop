'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, Search, ShoppingBag, X } from 'lucide-react';

export function ShopShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-zinc-950 dark:bg-[#090909] dark:text-zinc-50">
      <a href="#shop-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-black">Skip to products</a>
      <div className="bg-zinc-950 px-4 py-2 text-center text-[11px] font-medium tracking-wide text-zinc-200 dark:bg-white dark:text-zinc-900">
        As an Amazon Associate, Auronix Commerce earns from qualifying purchases.
      </div>
      <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-[#f7f7f5]/85 backdrop-blur-xl dark:border-white/10 dark:bg-[#090909]/85">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <Link href="/shop" className="flex items-center gap-3" aria-label="Auronix Select home">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-950 text-white dark:bg-white dark:text-black"><ShoppingBag className="h-4 w-4" /></span>
            <span><span className="block text-sm font-bold tracking-[0.12em]">AURONIX</span><span className="block text-[9px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Select</span></span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium md:flex" aria-label="Shop navigation">
            <Link href="/shop#catalog" className="hover:text-blue-600">Catalog</Link>
            <Link href="/shop#categories" className="hover:text-blue-600">Categories</Link>
            <Link href="/shop/about" className="hover:text-blue-600">How it works</Link>
          </nav>
          <button type="button" className="rounded-full p-2 md:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button>
        </div>
        {open && <nav className="border-t border-black/5 px-5 py-4 md:hidden" aria-label="Mobile shop navigation"><div className="flex flex-col gap-4 text-sm"><Link href="/shop#catalog" onClick={() => setOpen(false)}>Catalog</Link><Link href="/shop#categories" onClick={() => setOpen(false)}>Categories</Link><Link href="/shop/about" onClick={() => setOpen(false)}>How it works</Link></div></nav>}
      </header>
      <main id="shop-content">{children}</main>
      <footer className="border-t border-black/[0.07] bg-white dark:border-white/10 dark:bg-zinc-950">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-6 md:grid-cols-2 lg:px-8">
          <div><p className="text-sm font-bold tracking-[0.12em]">AURONIX SELECT</p><p className="mt-3 max-w-md text-sm leading-6 text-zinc-500">A focused catalog that helps you discover products on Amazon. We do not sell, fulfill, price, or warrant the products shown.</p></div>
          <div className="md:text-right"><p className="text-sm font-semibold">Affiliate disclosure</p><p className="mt-3 text-sm leading-6 text-zinc-500">As an Amazon Associate, Auronix Commerce earns from qualifying purchases. Product details, prices, and availability are provided by Amazon and may change.</p><Link href="/shop/about" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600"><Search className="h-4 w-4" />How selection works</Link></div>
        </div>
      </footer>
    </div>
  );
}
