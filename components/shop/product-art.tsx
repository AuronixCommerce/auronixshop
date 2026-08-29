import { Package } from 'lucide-react';
import type { ShopProduct } from '@/lib/shop';

export function ProductArt({ product, large = false }: { product: ShopProduct; large?: boolean }) {
  return (
    <div className={`relative flex w-full items-center justify-center overflow-hidden bg-gradient-to-br ${product.accent} ${large ? 'min-h-[420px] rounded-[2rem]' : 'aspect-[4/3] rounded-[1.5rem]'}`} aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,.8),transparent_32%)] opacity-60 dark:opacity-20" />
      <div className={`${large ? 'h-48 w-48 text-5xl' : 'h-28 w-28 text-3xl'} relative flex items-center justify-center rounded-[32%] border border-white/60 bg-white/75 font-semibold tracking-[-0.05em] text-zinc-800 shadow-[0_30px_80px_rgba(0,0,0,.14)] backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/75 dark:text-white`}>
        <Package className="absolute left-4 top-4 h-5 w-5 opacity-30" />{product.shortLabel}
      </div>
    </div>
  );
}
