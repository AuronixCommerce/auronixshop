'use client';

import Link from 'next/link';

import {
  ArrowRight,
  Search,
  Store,
  Handshake,
  Truck,
} from 'lucide-react';

import { SiteLayout } from '@/components/site/site-layout';

import {
  Section,
  SectionHeading,
} from '@/components/site/section';

import {
  Reveal,
  StaggerGroup,
  StaggerItem,
} from '@/components/site/reveal';

import { CommerceFlow } from '@/components/site/commerce-flow';

import { CTASection } from '@/components/site/cta-section';

import {
  CAPABILITIES,
  PROCESS_STEPS,
  WHY_AURONIX,
} from '@/lib/constants';

import { motion } from 'framer-motion';

const ICON_MAP = {
  Search,
  Store,
  Handshake,
  Truck,
};

export default function HomePage() {
  return (
    <SiteLayout>

      {/* HERO */}
      <section className="relative overflow-hidden pt-20 pb-20 lg:pt-28 lg:pb-32">
        <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />

        <div className="absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-accent/5 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">

            {/* LEFT */}
            <div className="lg:col-span-7">

              <Reveal>
                <span className="mb-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Auronix Commerce LLC
                </span>
              </Reveal>

              <Reveal delay={0.05}>
                <h1 className="text-balance text-[clamp(2.75rem,6vw,5.5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-foreground">
                  Powering the next generation of commerce.
                </h1>
              </Reveal>

              <Reveal delay={0.1}>
                <p className="mt-7 max-w-xl text-pretty text-lg leading-relaxed text-foreground-muted lg:text-xl">
                  Auronix Commerce LLC connects quality suppliers,
                  brands, and online marketplaces through smarter
                  procurement, distribution, and e-commerce operations.
                </p>
              </Reveal>

              <Reveal delay={0.15}>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">

                  <Link
                    href="/contact"
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
                  >
                    Partner With Us

                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>

                  <Link
                    href="/our-process"
                    className="group inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-medium text-foreground transition-all hover:border-border-strong hover:bg-secondary"
                  >
                    Explore Our Process

                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>

                </div>
              </Reveal>
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-5">
              <Reveal delay={0.2} className="lg:pl-4">
                <CommerceFlow />
              </Reveal>
            </div>

          </div>
        </div>
      </section>

      {/* INTRO */}
      <Section className="border-t border-border">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">

          <Reveal>
            <h2 className="text-balance text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
              Commerce built around better connections.
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="space-y-5">

              <p className="text-lg leading-relaxed text-foreground-muted">
                Auronix operates at the intersection of procurement,
                marketplace operations, and distribution. We work with
                suppliers and brands to move quality products through
                the right channels Ã¢â‚¬â€ efficiently, profitably, and with
                the operational discipline that modern commerce demands.
              </p>

              <p className="text-lg leading-relaxed text-foreground-muted">
                Our approach is structured: we evaluate every
                opportunity, build relationships with the right partners,
                and manage the full lifecycle from sourcing to
                marketplace performance.
              </p>

              <Link
                href="/about"
                className="group inline-flex items-center gap-2 text-sm font-medium text-foreground transition-all hover:gap-3"
              >
                Learn more about Auronix
                <ArrowRight className="h-4 w-4" />
              </Link>

            </div>
          </Reveal>

        </div>
      </Section>

      {/* CAPABILITIES */}
      <Section className="border-t border-border bg-background-subtle">
        <SectionHeading
          eyebrow="Capabilities"
          title="What we do."
          description="Four core capabilities that define how Auronix creates value across the commerce lifecycle."
        />

        <StaggerGroup className="mt-14 grid gap-5 sm:grid-cols-2">

          {CAPABILITIES.map(
            (
              cap,
              index
            ) => {
              const Icon =
                ICON_MAP[
                  cap.icon as keyof typeof ICON_MAP
                ];

              return (
                <StaggerItem
                  key={
                    cap.title
                  }
                >
                  <div
                    className={`group relative rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:shadow-premium-lg ${
                      index % 2 ===
                      0
                        ? 'lg:translate-y-0'
                        : 'lg:translate-y-6'
                    }`}
                  >

                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-primary/5 transition-colors group-hover:border-accent/20 group-hover:bg-accent/10">
                      <Icon className="h-5 w-5 text-foreground transition-colors group-hover:text-accent" />
                    </div>

                    <h3 className="mb-3 text-xl font-semibold tracking-tight">
                      {cap.title}
                    </h3>

                    <p className="text-sm leading-relaxed text-foreground-muted">
                      {cap.description}
                    </p>

                    <ArrowRight className="mt-5 h-4 w-4 text-foreground-muted transition-all group-hover:translate-x-1 group-hover:text-foreground" />

                  </div>
                </StaggerItem>
              );
            }
          )}

        </StaggerGroup>
      </Section>

      {/* PROCESS */}
      <ProcessSection />

      {/* WHY AURONIX */}
      <Section className="border-t border-border bg-background-subtle">
        <SectionHeading
          eyebrow="Why Auronix"
          title="Built for modern commerce."
          description="The principles that guide how we operate, evaluate opportunities, and build partnerships."
        />

        <StaggerGroup className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">

          {WHY_AURONIX.map(
            (
              item,
              index
            ) => (
              <StaggerItem
                key={
                  item.title
                }
              >
                <div className="group h-full bg-card p-8 transition-colors hover:bg-secondary/50">

                  <div className="mb-4 font-mono text-[11px] tracking-wider text-accent">
                    {String(
                      index + 1
                    ).padStart(
                      2,
                      '0'
                    )}
                  </div>

                  <h3 className="mb-3 text-lg font-semibold tracking-tight">
                    {item.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-foreground-muted">
                    {item.description}
                  </p>

                </div>
              </StaggerItem>
            )
          )}

        </StaggerGroup>
      </Section>

      {/* SUPPLIER CTA */}
      <SupplierCTA />

      {/* FINAL CTA */}
      <CTASection
        title="Let's build what's next."
        description="Whether you are a supplier looking for a marketplace partner or a brand seeking distribution expertise, we would like to hear from you."
        buttonText="Contact Auronix"
        buttonHref="/contact"
      />

    </SiteLayout>
  );
}

function ProcessSection() {
  return (
    <Section className="border-t border-border">

      <SectionHeading
        eyebrow="Process"
        title="From supplier to marketplace, with precision."
        description="A structured path that turns opportunity into marketplace performance."
      />

      {/* DESKTOP TIMELINE */}
      <div className="mt-16 hidden lg:block">

        <div className="relative">

          <div className="absolute left-0 right-0 top-7 h-px bg-border" />

          <motion.div
            className="absolute left-0 top-7 h-px bg-accent"
            initial={{
              width: '0%',
            }}
            whileInView={{
              width: '100%',
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 1.5,
              ease: 'easeInOut',
            }}
          />

          <div className="grid grid-cols-5 gap-4">

            {PROCESS_STEPS.map(
              (
                step,
                index
              ) => (
                <motion.div
                  key={
                    step.number
                  }
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    duration: 0.5,
                    delay:
                      index *
                      0.1,
                  }}
                  className="relative"
                >

                  <div className="relative z-10 mb-5 flex h-14 w-14 items-center justify-center rounded-full border-2 border-border bg-card">
                    <span className="text-sm font-semibold text-foreground-muted">
                      {
                        step.number
                      }
                    </span>
                  </div>

                  <h3 className="mb-2 text-base font-semibold tracking-tight">
                    {
                      step.title
                    }
                  </h3>

                  <p className="text-sm leading-relaxed text-foreground-muted">
                    {
                      step.description
                    }
                  </p>

                </motion.div>
              )
            )}

          </div>
        </div>
      </div>

      {/* MOBILE TIMELINE */}
      <div className="mt-12 space-y-8 lg:hidden">

        {PROCESS_STEPS.map(
          (
            step,
            index
          ) => (
            <Reveal
              key={
                step.number
              }
              delay={
                index *
                0.05
              }
            >

              <div className="flex gap-5">

                <div className="flex flex-col items-center">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-border bg-card">
                    <span className="text-sm font-semibold text-foreground-muted">
                      {
                        step.number
                      }
                    </span>
                  </div>

                  {index <
                    PROCESS_STEPS.length -
                      1 && (
                    <div className="mt-2 w-px flex-1 bg-border" />
                  )}

                </div>

                <div className="pb-2">

                  <h3 className="mb-2 text-base font-semibold tracking-tight">
                    {
                      step.title
                    }
                  </h3>

                  <p className="text-sm leading-relaxed text-foreground-muted">
                    {
                      step.description
                    }
                  </p>

                </div>

              </div>

            </Reveal>
          )
        )}

      </div>

    </Section>
  );
}

function SupplierCTA() {
  return (
    <section className="relative overflow-hidden bg-primary py-24 lg:py-32">

      {/* ANIMATED BACKGROUND */}
      <div className="absolute inset-0">

        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary-foreground/5"
        />

        <motion.div
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 80,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary-foreground/5"
        />

        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[80px]" />

      </div>

      <div className="relative mx-auto max-w-7xl px-5 text-center sm:px-6 lg:px-8">

        <Reveal>

          <span className="mb-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-foreground/60">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground/60" />
            For Suppliers
          </span>

          <h2 className="mx-auto max-w-3xl text-balance text-3xl font-semibold leading-[1.1] tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
            Have products that belong in the marketplace?
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-primary-foreground/70">
            We are interested in connecting with legitimate
            suppliers, distributors, manufacturers,
            wholesalers, and quality brands.
          </p>

          <Link
            href="/become-a-supplier"
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-primary-foreground px-6 py-3.5 text-sm font-medium text-primary transition-all hover:bg-primary-foreground/90"
          >
            Become a Supplier

            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>

        </Reveal>

      </div>
    </section>
  );
}


