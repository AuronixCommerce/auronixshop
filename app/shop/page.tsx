import Link from 'next/link';
import { ArrowDown, ShieldCheck, Sparkles } from 'lucide-react';
import { ShopCatalog } from '@/components/shop/shop-catalog';

export default function ShopPage() {
  return (
    <>
      <section className="relative overflow-hidden px-5 pb-20 pt-24 sm:px-6 sm:pt-32 lg:px-8">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,.13),transparent_68%)]" />
        <div className="relative mx-auto max-w-7xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-black/[0.07] bg-white/70 px-4 py-2 text-xs font-semibold shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-900/70"><Sparkles className="h-3.5 w-3.5 text-blue-500" />Useful products. Less noise.</span>
          <h1 className="mx-auto mt-8 max-w-5xl text-balance text-[clamp(3.5rem,9vw,7.75rem)] font-semibold leading-[.88] tracking-[-0.07em]">The considered<br /><span className="bg-gradient-to-r from-blue-600 via-violet-500 to-cyan-500 bg-clip-text text-transparent">everyday edit.</span></h1>
          <p className="mx-auto mt-8 max-w-2xl text-balance text-lg leading-8 text-zinc-500 sm:text-xl">A compact catalog for work, home, travel, and daily life—designed to help you compare thoughtfully before continuing to Amazon.</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"><Link href="#catalog" className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:scale-[1.02] dark:bg-white dark:text-black">Browse the edit <ArrowDown className="h-4 w-4" /></Link><Link href="/shop/about" className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3.5 text-sm font-semibold dark:border-white/10 dark:bg-zinc-900"><ShieldCheck className="h-4 w-4" />Our standards</Link></div>
          <p className="mt-8 text-xs leading-5 text-zinc-400">Affiliate links are clearly identified. No invented ratings, pricing, or availability.</p>
        </div>
      </section>
      <ShopCatalog />
      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-6 lg:px-8"><div className="rounded-[2.5rem] bg-zinc-950 px-6 py-14 text-white sm:px-12 lg:flex lg:items-center lg:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-400">Clarity at every step</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">The final decision stays yours.</h2></div><p className="mt-6 max-w-xl text-sm leading-7 text-zinc-400 lg:mt-0">We link you to Amazon to review the live offer, seller, price, delivery terms, availability, and full product information before purchasing.</p></div></section>
    </>
  );
}
