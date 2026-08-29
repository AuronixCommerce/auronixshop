import { cn } from '@/lib/utils';

export function AuronixMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-950 shadow-md ring-1 ring-white/20 dark:bg-white dark:ring-black/10', className)}
    >
      <span className="h-[42%] w-[42%] rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.42)] dark:bg-zinc-950 dark:shadow-[0_0_12px_rgba(0,0,0,0.20)]" />
    </span>
  );
}
