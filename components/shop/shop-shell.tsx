'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, Search, ShoppingBag, X } from 'lucide-react';

export function ShopShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-950">
      <a href="#shop-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-black">Skip to products</a>
      <div className="bg-[#102a43] px-4 py-2 text-center text-[11px] font-medium tracking-wide text-white">
        Shop curated Amazon finds · As an Amazon Associate, Auronix Commerce earns from qualifying purchases.
      </div>
      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="mx-auto flex h-20 max-w-[1480px] items-center justify-between gap-6 px-5 sm:px-6 lg:px-8">
          <Link href="/shop" className="flex shrink-0 items-center gap-3" aria-label="Auronix Commerce shop home">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#102a43] text-white"><ShoppingBag className="h-5 w-5" /></span>
            <span><span className="block text-base font-black tracking-[0.1em]">AURONIX</span><span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-amber-600">Commerce Shop</span></span>
          </Link>
          <form action="/shop" className="hidden h-11 max-w-xl flex-1 items-center rounded-lg border bg-zinc-50 px-4 md:flex"><Search className="h-4 w-4 text-zinc-400"/><input name="q" placeholder="Search the Auronix catalog" className="h-full w-full bg-transparent px-3 text-sm outline-none"/></form>
          <nav className="hidden items-center gap-7 text-sm font-medium md:flex" aria-label="Shop navigation">
            <Link href="/shop#catalog" className="hover:text-amber-700">All Products</Link>
            <Link href="/shop#catalog" className="hover:text-amber-700">Categories</Link>
            <Link href="/shop/about" className="hover:text-amber-700">Affiliate Disclosure</Link>
          </nav>
          <button type="button" className="rounded-full p-2 md:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button>
        </div>
        {open && <nav className="border-t border-black/5 px-5 py-4 md:hidden" aria-label="Mobile shop navigation"><div className="flex flex-col gap-4 text-sm"><Link href="/shop#catalog" onClick={() => setOpen(false)}>Catalog</Link><Link href="/shop#categories" onClick={() => setOpen(false)}>Categories</Link><Link href="/shop/about" onClick={() => setOpen(false)}>How it works</Link></div></nav>}
      </header>
      <main id="shop-content">{children}</main>
      <footer className="border-t bg-[#102a43] text-white">
        <div className="mx-auto grid max-w-[1480px] gap-8 px-5 py-14 sm:px-6 md:grid-cols-2 lg:px-8">
          <div><p className="text-sm font-bold tracking-[0.12em]">AURONIX COMMERCE</p><p className="mt-3 max-w-md text-sm leading-6 text-slate-300">A professionally managed catalog that helps you discover products on Amazon. Auronix does not sell, fulfill, price, or warrant the linked products.</p></div>
          <div className="md:text-right"><p className="text-sm font-semibold">Affiliate disclosure</p><p className="mt-3 text-sm leading-6 text-slate-300">As an Amazon Associate, Auronix Commerce earns from qualifying purchases. Product details, prices, and availability may change.</p><Link href="/shop/about" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-amber-300"><Search className="h-4 w-4" />How shopping works</Link></div>
        </div>
      </footer>
    </div>
  );
}
