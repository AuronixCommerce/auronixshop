import {
  AIChat,
} from '@/components/site/ai-chat';

type MaintenanceShellProps = {
  globalActive: boolean;

  pageActive: boolean;

  pathname: string;

  globalEndAt:
    | number
    | null;

  pageEndAt:
    | number
    | null;
};

function formatDate(
  value:
    | number
    | null
) {
  if (
    typeof value !==
      'number' ||
    !Number.isFinite(
      value
    )
  ) {
    return null;
  }

  return new Date(
    value
  ).toLocaleString(
    'en-US',
    {
      dateStyle:
        'medium',

      timeStyle:
        'short',
    }
  );
}

export function MaintenanceShell({
  globalActive,
  pageActive,
  pathname,
  globalEndAt,
  pageEndAt,
}: MaintenanceShellProps) {
  const isGlobal =
    globalActive;

  const endAt =
    isGlobal
      ? formatDate(
          globalEndAt
        )
      : formatDate(
          pageEndAt
        );

  const title =
    isGlobal
      ? 'Website Maintenance'
      : 'Page Temporarily Unavailable';

  const message =
    isGlobal
      ? 'Auronix Commerce is currently undergoing maintenance. Our website is temporarily unavailable while scheduled work is completed.'
      : `The page ${pathname} is currently undergoing maintenance. Other areas of Auronix Commerce may remain available.`;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background font-sans text-foreground">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-220px] h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/10 blur-[110px]" />

        <div className="absolute bottom-[-180px] left-[-100px] h-[360px] w-[360px] rounded-full bg-accent/10 blur-[100px]" />

        <div className="absolute right-[-100px] top-1/3 h-[360px] w-[360px] rounded-full bg-white/[0.035] blur-[100px]" />
      </div>

      <main className="relative flex min-h-screen items-center justify-center px-5 py-16">
        <section className="w-full max-w-xl overflow-hidden rounded-[34px] border border-white/15 bg-card/90 p-7 shadow-[0_30px_120px_rgba(0,0,0,0.24)] backdrop-blur-3xl sm:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl">
              <div className="h-4 w-4 rounded-full bg-white" />
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-foreground-muted">
                Auronix Commerce LLC
              </div>

              <div className="mt-1 text-sm font-semibold">
                {isGlobal
                  ? 'Full Website Maintenance'
                  : 'Page Maintenance'}
              </div>
            </div>
          </div>

          <div className="mt-9">
            <div className="inline-flex rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground-muted">
              {isGlobal
                ? 'Temporarily Offline'
                : 'Temporarily Unavailable'}
            </div>

            <h1 className="mt-5 text-4xl font-extrabold leading-[0.98] tracking-[-0.06em] sm:text-5xl">
              {title}
            </h1>

            <p className="mt-5 text-sm leading-7 text-foreground-muted sm:text-base">
              {message}
            </p>

            {endAt ? (
              <div className="mt-7 rounded-2xl border border-border bg-background/50 px-4 py-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground-muted">
                  Expected completion
                </div>

                <div className="mt-1 text-sm font-bold sm:text-base">
                  {endAt}
                </div>
              </div>
            ) : (
              <div className="mt-7 rounded-2xl border border-border bg-background/50 px-4 py-4 text-sm leading-6 text-foreground-muted">
                No exact completion time has been provided.
              </div>
            )}

            <div className="mt-7 rounded-2xl border border-border bg-secondary/20 px-4 py-4 text-xs leading-5 text-foreground-muted">
              Maintenance information is controlled by the Auronix Commerce operations system.
            </div>
          </div>
        </section>
      </main>

      <AIChat />
    </div>
  );
}

export default MaintenanceShell;
