'use client';

import Link from 'next/link';

import NewsletterSignup from './newsletter-signup';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* BRAND */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                A
              </span>

              <span className="font-semibold tracking-tight">
                Auronix Commerce LLC
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-foreground-muted">
              Trusted eCommerce sourcing, supplier
              partnerships, and marketplace solutions.
            </p>
          </div>

          {/* COMPANY */}
          <div>
            <h3 className="text-sm font-semibold">
              Company
            </h3>

            <nav className="mt-4 space-y-3 text-sm text-foreground-muted">
              <Link
                href="/about"
                className="block hover:text-foreground"
              >
                About
              </Link>

              <Link
                href="/our-process"
                className="block hover:text-foreground"
              >
                Our Process
              </Link>

              <Link
                href="/why-work-with-us"
                className="block hover:text-foreground"
              >
                Why Work With Us
              </Link>

              <Link
                href="/company-verification"
                className="block hover:text-foreground"
              >
                Company Verification
              </Link>

              <Link
                href="/careers"
                className="block hover:text-foreground"
              >
                Careers
              </Link>
            </nav>
          </div>

          {/* SELLERS */}
          <div>
            <h3 className="text-sm font-semibold">
              Sellers & Partners
            </h3>

            <nav className="mt-4 space-y-3 text-sm text-foreground-muted">
              <Link
                href="/seller"
                className="block hover:text-foreground"
              >
                Seller Access
              </Link>

              <Link
                href="/seller/policy"
                className="block font-medium text-accent hover:underline"
              >
                Seller Policy
              </Link>

              <Link
                href="/supplier"
                className="block hover:text-foreground"
              >
                Become a Supplier
              </Link>

              <Link
                href="/partner-portal"
                className="block hover:text-foreground"
              >
                Partner Portal
              </Link>

              <Link
                href="/contact"
                className="block hover:text-foreground"
              >
                Contact Us
              </Link>
            </nav>
          </div>

          {/* LEGAL */}
          <div>
            <h3 className="text-sm font-semibold">
              Legal
            </h3>

            <nav className="mt-4 space-y-3 text-sm text-foreground-muted">
              <Link
                href="/privacy"
                className="block hover:text-foreground"
              >
                Privacy Policy
              </Link>

              <Link
                href="/terms"
                className="block hover:text-foreground"
              >
                Terms of Service
              </Link>

              <Link
                href="/disclaimer"
                className="block hover:text-foreground"
              >
                Disclaimer
              </Link>

              <Link
                href="/cookie-policy"
                className="block hover:text-foreground"
              >
                Cookie Policy
              </Link>

              <Link
                href="/seller/policy"
                className="block hover:text-foreground"
              >
                Seller Policy
              </Link>
            </nav>
          </div>
        </div>

        {/* NEWSLETTER */}
        <NewsletterSignup />

        {/* BOTTOM */}
        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-xs text-foreground-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Auronix Commerce LLC.
            All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link
              href="/seller"
              className="font-medium hover:text-foreground"
            >
              Seller Login or Apply
            </Link>

            <Link
              href="/seller/policy"
              className="font-medium text-accent hover:underline"
            >
              Seller Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
