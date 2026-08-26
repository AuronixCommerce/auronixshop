'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import {
  ArrowRight,
  Sparkles,
  X,
} from 'lucide-react';

type PopupData = {
  enabled: boolean;
  eyebrow?: string;
  title?: string;
  message?: string;
  buttonText?: string;
  buttonHref?: string;
  secondaryText?: string;
  secondaryHref?: string;
  showOncePerSession?: boolean;
  delay?: number;
};

const STORAGE_KEY =
  'auronix-popup-shown';

export function SiteAnnouncementPopup() {
  const [popup, setPopup] =
    useState<PopupData | null>(null);

  const [visible, setVisible] =
    useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    async function loadPopup() {
      try {
        const path =
          window.location.pathname;

        /*
         * Never show the public announcement
         * inside internal areas.
         */
        const hiddenAreas = [
          '/admin',
          '/seller',
          '/partner',
          '/api',
        ];

        if (
          hiddenAreas.some((area) =>
            path.startsWith(area)
          )
        ) {
          return;
        }

        const response =
          await fetch(
            '/api/public/popup',
            {
              cache: 'no-store',
            }
          );

        if (!response.ok) {
          console.error(
            'Popup API returned:',
            response.status
          );
          return;
        }

        const data =
          (await response.json()) as PopupData;

        if (
          cancelled ||
          data.enabled !== true
        ) {
          return;
        }

        /*
         * Only respect the session lock when the
         * admin explicitly enabled "once per session".
         */
        if (
          data.showOncePerSession === true
        ) {
          const alreadyShown =
            window.sessionStorage.getItem(
              STORAGE_KEY
            );

          if (alreadyShown === '1') {
            return;
          }
        }

        setPopup(data);

        const delay = Math.max(
          0,
          Math.min(
            10000,
            Number(
              data.delay ?? 700
            )
          )
        );

        timer =
          window.setTimeout(() => {
            if (cancelled) {
              return;
            }

            setVisible(true);

            if (
              data.showOncePerSession === true
            ) {
              try {
                window.sessionStorage.setItem(
                  STORAGE_KEY,
                  '1'
                );
              } catch {
                // Ignore session-storage errors.
              }
            }
          }, delay);
      } catch (error) {
        console.error(
          'Unable to load Auronix popup:',
          error
        );
      }
    }

    loadPopup();

    return () => {
      cancelled = true;

      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const onKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === 'Escape') {
        setVisible(false);
      }
    };

    window.addEventListener(
      'keydown',
      onKeyDown
    );

    return () => {
      window.removeEventListener(
        'keydown',
        onKeyDown
      );
    };
  }, [visible]);

  if (
    !popup ||
    !visible ||
    popup.enabled !== true
  ) {
    return null;
  }

  const close = () => {
    setVisible(false);
  };

  const primaryHref =
    popup.buttonHref?.trim() || '';

  const primaryText =
    popup.buttonText?.trim() || '';

  const secondaryHref =
    popup.secondaryHref?.trim() || '';

  const secondaryText =
    popup.secondaryText?.trim() ||
    'Close';

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auronix-popup-title"
    >
      <button
        type="button"
        aria-label="Close announcement"
        onClick={close}
        className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-md"
      />

      <div className="relative w-full max-w-xl overflow-hidden rounded-[28px] border border-white/20 bg-background shadow-2xl">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative p-7 sm:p-9">
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background transition hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-4 pr-10">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-secondary">
              <Sparkles className="h-5 w-5 text-accent" />
            </div>

            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                {popup.eyebrow ||
                  'AURONIX'}
              </div>

              <h2
                id="auronix-popup-title"
                className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
              >
                {popup.title ||
                  'What’s new at Auronix'}
              </h2>
            </div>
          </div>

          <p className="mt-6 whitespace-pre-line text-sm leading-7 text-foreground-muted sm:text-base">
            {popup.message ||
              'Discover the latest improvements from Auronix Commerce.'}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {primaryText &&
              primaryHref &&
              (primaryHref.startsWith('/') ? (
                <Link
                  href={primaryHref}
                  onClick={close}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:gap-3"
                >
                  {primaryText}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <a
                  href={primaryHref}
                  onClick={close}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:gap-3"
                >
                  {primaryText}
                  <ArrowRight className="h-4 w-4" />
                </a>
              ))}

            {secondaryHref ? (
              secondaryHref.startsWith('/') ? (
                <Link
                  href={secondaryHref}
                  onClick={close}
                  className="rounded-full border border-border px-5 py-3 text-sm font-medium transition hover:bg-secondary"
                >
                  {secondaryText}
                </Link>
              ) : (
                <a
                  href={secondaryHref}
                  onClick={close}
                  className="rounded-full border border-border px-5 py-3 text-sm font-medium transition hover:bg-secondary"
                >
                  {secondaryText}
                </a>
              )
            ) : (
              <button
                type="button"
                onClick={close}
                className="rounded-full border border-border px-5 py-3 text-sm font-medium transition hover:bg-secondary"
              >
                {secondaryText}
              </button>
            )}
          </div>

          <div className="mt-5 text-[11px] text-foreground-muted">
            Auronix Commerce LLC
          </div>
        </div>
      </div>
    </div>
  );
}
