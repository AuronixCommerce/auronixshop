'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import Link from 'next/link';

import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Globe,
  Loader2,
  Search,
  Sparkles,
  Wrench,
  Zap,
} from 'lucide-react';

import {
  SITE_PAGES,
} from '@/lib/site-pages';

import {
  auth,
} from '@/lib/firebase';

import {
  AdminLayout,
} from '@/components/admin/admin-layout';

type PageControl = {
  path: string;

  maintenanceEnabled: boolean;
  maintenanceTitle: string;
  maintenanceMessage: string;

  scheduleEnabled: boolean;
  scheduleStartAt:
    | number
    | null;
  scheduleEndAt:
    | number
    | null;

  popupEnabled: boolean;
  popupTitle: string;
  popupMessage: string;
  popupButtonText: string;
  popupButtonUrl: string;

  popupFrequency:
    | 'once'
    | 'session'
    | 'always';

  popupUntilAt:
    | number
    | null;

  automaticMaintenanceEnabled: boolean;
  automaticRecoveryEnabled: boolean;

  failureThreshold:
    number;

  adminBypassEnabled:
    boolean;

  healthScore:
    number;

  healthStatus:
    string;

  consecutiveFailures:
    number;

  lastError:
    string;
  updatedAt?:
    number;
};

type GlobalControl = {
  maintenanceEnabled:
    boolean;

  maintenanceTitle:
    string;

  maintenanceMessage:
    string;

  scheduleEnabled:
    boolean;

  scheduleStartAt:
    | number
    | null;

  scheduleEndAt:
    | number
    | null;

  automaticFullSiteShutdown:
    boolean;

  automaticRecovery:
    boolean;
};

const EMPTY_PAGE:
  PageControl = {
  path: '',

  maintenanceEnabled:
    false,

  maintenanceTitle:
    'This page is temporarily unavailable',

  maintenanceMessage:
    'We are making improvements to this page. Please check back shortly.',

  scheduleEnabled:
    false,

  scheduleStartAt:
    null,

  scheduleEndAt:
    null,

  popupEnabled:
    false,

  popupTitle:
    'Important update',

  popupMessage:
    '',

  popupButtonText:
    'Learn More',

  popupButtonUrl:
    '',

  popupFrequency:
    'session',

  popupUntilAt:
    null,

  automaticMaintenanceEnabled:
    true,

  automaticRecoveryEnabled:
    false,

  failureThreshold:
    3,

  adminBypassEnabled:
    true,

  healthScore:
    100,

  healthStatus:
    'unknown',

  consecutiveFailures:
    0,

  lastError:
    '',
};

const EMPTY_GLOBAL:
  GlobalControl = {
  maintenanceEnabled:
    false,

  maintenanceTitle:
    'Auronix Commerce is temporarily unavailable',

  maintenanceMessage:
    'We are performing scheduled maintenance. Please check back soon.',

  scheduleEnabled:
    false,

  scheduleStartAt:
    null,

  scheduleEndAt:
    null,

  automaticFullSiteShutdown:
    false,

  automaticRecovery:
    false,
};

function toDateInput(
  timestamp:
    | number
    | null
) {
  if (
    !timestamp
  ) {
    return '';
  }

  const date =
    new Date(
      timestamp
    );

  const offset =
    date.getTimezoneOffset();

  const local =
    new Date(
      date.getTime() -
        offset *
          60000
    );

  return local
    .toISOString()
    .slice(
      0,
      16
    );
}

function fromDateInput(
  value: string
) {
  if (
    !value
  ) {
    return null;
  }

  const timestamp =
    new Date(
      value
    ).getTime();

  return Number.isFinite(
    timestamp
  )
    ? timestamp
    : null;
}

export default function AdminPagesManagerPage() {
  const [
    search,
    setSearch,
  ] =
    useState('');

  const [
    pages,
    setPages,
  ] =
    useState<
      Record<
        string,
        PageControl
      >
    >({});

  const [
    global,
    setGlobal,
  ] =
    useState<
      GlobalControl
    >(
      EMPTY_GLOBAL
    );

  const [
    selected,
    setSelected,
  ] =
    useState(
      SITE_PAGES[0]
        ?.path ||
        '/'
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );

  const [
    saving,
    setSaving,
  ] =
    useState(
      false
    );

  const [
    aiLoading,
    setAiLoading,
  ] =
    useState(
      false
    );

  const [
    notice,
    setNotice,
  ] =
    useState('');

  const filtered =
    useMemo(
      () => {
        const term =
          search
            .trim()
            .toLowerCase();

        if (
          !term
        ) {
          return SITE_PAGES;
        }

        return SITE_PAGES.filter(
          (
            page
          ) =>
            page.title
              .toLowerCase()
              .includes(
                term
              ) ||
            page.path
              .toLowerCase()
              .includes(
                term
              ) ||
            page.category
              .toLowerCase()
              .includes(
                term
              )
        );
      },
      [
        search,
      ]
    );

  const selectedPage =
    SITE_PAGES.find(
      (
        page
      ) =>
        page.path ===
        selected
    );

  const current =
    selectedPage
      ? {
          ...EMPTY_PAGE,
          ...(
            pages[
              selectedPage.path
            ] ||
            {}
          ),
          path:
            selectedPage.path,
        }
      : EMPTY_PAGE;

  async function api(
    url: string,
    init?: RequestInit
  ) {
    const token =
      await auth.currentUser?.getIdToken();

    return fetch(
      url,
      {
        ...init,

        headers: {
          'Content-Type':
            'application/json',

          ...(token
            ? {
                Authorization:
                  `Bearer ${token}`,
              }
            : {}),

          ...(init?.headers ||
            {}),
        },
      }
    );
  }

  async function load() {
    setLoading(
      true
    );

    try {
      const response =
        await api(
          '/api/admin/page-controls'
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            'Unable to load page controls.'
        );
      }

      setPages(
        data.pages ||
          {}
      );

      setGlobal({
        ...EMPTY_GLOBAL,
        ...(data.global ||
          {}),
      });
    } catch (
      error
    ) {
      setNotice(
        error instanceof Error
          ? error.message
          : 'Unable to load page controls.'
      );
    } finally {
      setLoading(
        false
      );
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateGlobal(
    field:
      keyof GlobalControl,
    value:
      unknown
  ) {
    setGlobal(
      (
        old
      ) => ({
        ...old,

        [field]:
          value,
      })
    );
  }

  function updatePage(
    field:
      keyof PageControl,
    value:
      unknown
  ) {
    if (
      !selectedPage
    ) {
      return;
    }

    setPages(
      (
        old
      ) => ({
        ...old,

        [selectedPage.path]:
          {
            ...EMPTY_PAGE,

            ...(
              old[
                selectedPage.path
              ] ||
              {}
            ),

            path:
              selectedPage.path,

            [field]:
              value,
          },
      })
    );
  }

  async function saveGlobal() {
    if (
      global.scheduleEnabled &&
      global.scheduleStartAt &&
      global.scheduleEndAt &&
      global.scheduleEndAt <=
        global.scheduleStartAt
    ) {
      setNotice(
        'Full-site maintenance end time must be after the start time.'
      );

      return;
    }

    setSaving(
      true
    );

    try {
      const response =
        await api(
          '/api/admin/page-controls',
          {
            method:
              'POST',

            body:
              JSON.stringify({
                action:
                  'global',

                ...global,
              }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            'Unable to save full-site schedule.'
        );
      }

      setGlobal(
        data.global
      );

      setNotice(
        'Full-site maintenance settings saved.'
      );
    } catch (
      error
    ) {
      setNotice(
        error instanceof Error
          ? error.message
          : 'Unable to save schedule.'
      );
    } finally {
      setSaving(
        false
      );
    }
  }

  async function toggleInstantFullSiteMaintenance() {
    const nextEnabled = !global.maintenanceEnabled;
    setGlobal((old) => ({ ...old, maintenanceEnabled: nextEnabled }));
    setSaving(true);

    try {
      const response = await api('/api/admin/page-controls', {
        method: 'POST',
        body: JSON.stringify({
          action: 'global',
          ...global,
          maintenanceEnabled: nextEnabled,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Unable to change full-site maintenance.');
      }

      setGlobal(data.global);
      setNotice(nextEnabled ? '🚨 Full website maintenance is now ON.' : '✅ Full website maintenance is now OFF.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to change maintenance mode.');
    } finally {
      setSaving(false);
    }
  }

  async function savePage() {
    if (
      !selectedPage
    ) {
      return;
    }

    if (
      current.scheduleEnabled &&
      current.scheduleStartAt &&
      current.scheduleEndAt &&
      current.scheduleEndAt <=
        current.scheduleStartAt
    ) {
      setNotice(
        'Page maintenance end time must be after the start time.'
      );

      return;
    }

    setSaving(
      true
    );

    try {
      const response =
        await api(
          '/api/admin/page-controls',
          {
            method:
              'POST',

            body:
              JSON.stringify({
                action:
                  'page',

                ...current,
              }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            'Unable to save page settings.'
        );
      }

      setPages(
        (
          old
        ) => ({
          ...old,

          [selectedPage.path]:
            data.page,
        })
      );

      setNotice(
        `${selectedPage.title} settings saved.`
      );
    } catch (
      error
    ) {
      setNotice(
        error instanceof Error
          ? error.message
          : 'Unable to save page.'
      );
    } finally {
      setSaving(
        false
      );
    }
  }

  async function generateGlobalMessage() {
    setAiLoading(
      true
    );

    try {
      const response =
        await api(
          '/api/admin/page-controls/generate',
          {
            method:
              'POST',

            body:
              JSON.stringify({
                page:
                  '*',

                pageTitle:
                  'Auronix Commerce website',

                incident:
                  'Scheduled full-site maintenance.',
              }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            'AI generation failed.'
        );
      }

      setGlobal(
        (
          old
        ) => ({
          ...old,

          maintenanceTitle:
            data.title,

          maintenanceMessage:
            data.message,
        })
      );

      setNotice(
        'AI generated the full-site maintenance message.'
      );
    } catch (
      error
    ) {
      setNotice(
        error instanceof Error
          ? error.message
          : 'AI generation failed.'
      );
    } finally {
      setAiLoading(
        false
      );
    }
  }

  async function generatePageMessage() {
    if (
      !selectedPage
    ) {
      return;
    }

    setAiLoading(
      true
    );

    try {
      const response =
        await api(
          '/api/admin/page-controls/generate',
          {
            method:
              'POST',

            body:
              JSON.stringify({
                page:
                  selectedPage.path,

                pageTitle:
                  selectedPage.title,

                incident:
                  current.lastError ||
                  'Scheduled page maintenance.',
              }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            'AI generation failed.'
        );
      }

      updatePage(
        'maintenanceTitle',
        data.title
      );

      updatePage(
        'maintenanceMessage',
        data.message
      );

      setNotice(
        'AI generated the page maintenance message.'
      );
    } catch (
      error
    ) {
      setNotice(
        error instanceof Error
          ? error.message
          : 'AI generation failed.'
      );
    } finally {
      setAiLoading(
        false
      );
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">

        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
              AURONIX ADMIN
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              Pages Manager
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-foreground-muted">
              Schedule maintenance, monitor every page, manage
              announcements, and control the public website.
            </p>
          </div>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold hover:bg-secondary"
          >
            <ExternalLink className="h-4 w-4" />
            View Website
          </Link>

        </div>

        {notice && (
          <div className="rounded-2xl border border-border bg-card p-4 text-sm">
            {notice}
          </div>
        )}

        {/* FULL SITE SCHEDULE */}
        <section
          className={`rounded-3xl border p-6 ${
            global.maintenanceEnabled ||
            (
              global.scheduleEnabled &&
              global.scheduleStartAt
            )
              ? 'border-accent/30 bg-accent/5'
              : 'border-border bg-card'
          }`}
        >

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary">
              <Globe className="h-6 w-6 text-accent" />
            </div>

            <div className="min-w-0 flex-1">

              <div className="flex flex-wrap items-center gap-2">

                <h2 className="text-lg font-semibold">
                  Full Website Maintenance
                </h2>

                {global.scheduleEnabled && (
                  <span className="rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
                    Scheduled
                  </span>
                )}

              </div>

              <p className="mt-2 text-sm leading-6 text-foreground-muted">
                Schedule downtime for the entire public website.
                Admin remains available.
              </p>

              <div className="mt-5 space-y-4">

                <ToggleRow
                  label="Schedule full-site maintenance"
                  description="Visitors will see the schedule notice before the start time, then maintenance mode during the window."
                  enabled={
                    global.scheduleEnabled
                  }
                  onChange={(
                    value
                  ) =>
                    updateGlobal(
                      'scheduleEnabled',
                      value
                    )
                  }
                />

                <div className="grid gap-4 md:grid-cols-2">

                  <div>
                    <label className="text-xs font-semibold">
                      Start
                    </label>

                    <input
                      type="datetime-local"
                      value={toDateInput(
                        global.scheduleStartAt
                      )}
                      onChange={(
                        event
                      ) =>
                        updateGlobal(
                          'scheduleStartAt',
                          fromDateInput(
                            event.target.value
                          )
                        )
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold">
                      Finish
                    </label>

                    <input
                      type="datetime-local"
                      value={toDateInput(
                        global.scheduleEndAt
                      )}
                      onChange={(
                        event
                      ) =>
                        updateGlobal(
                          'scheduleEndAt',
                          fromDateInput(
                            event.target.value
                          )
                        )
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
                    />
                  </div>

                </div>

                <input
                  value={
                    global.maintenanceTitle
                  }
                  onChange={(
                    event
                  ) =>
                    updateGlobal(
                      'maintenanceTitle',
                      event.target.value
                    )
                  }
                  placeholder="Maintenance title"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
                />

                <textarea
                  value={
                    global.maintenanceMessage
                  }
                  onChange={(
                    event
                  ) =>
                    updateGlobal(
                      'maintenanceMessage',
                      event.target.value
                    )
                  }
                  rows={4}
                  placeholder="Maintenance message"
                  className="w-full rounded-xl border border-border bg-background px-3 py-3 text-sm leading-6"
                />

                <div className="flex flex-wrap gap-3">

                  <button
                    type="button"
                    disabled={saving}
                    onClick={toggleInstantFullSiteMaintenance}
                    className={global.maintenanceEnabled
                      ? 'inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-700 disabled:opacity-50'
                      : 'inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-red-500/15 disabled:opacity-50'}
                  >
                    <Zap className="h-4 w-4" />
                    {global.maintenanceEnabled ? '🚨 Turn Full-Site Maintenance OFF' : '🚨 Instant Full-Site Maintenance ON'}
                  </button>

                  <button
                    type="button"
                    disabled={
                      aiLoading
                    }
                    onClick={
                      generateGlobalMessage
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-xs font-semibold hover:bg-secondary disabled:opacity-50"
                  >
                    {aiLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}

                    Generate with AI
                  </button>

                  <button
                    type="button"
                    disabled={
                      saving
                    }
                    onClick={
                      saveGlobal
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}

                    Save Full-Site Schedule
                  </button>

                </div>

              </div>
            </div>
          </div>
        </section>

        {/* SEARCH */}
        <div className="relative">

          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />

          <input
            value={
              search
            }
            onChange={(
              event
            ) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search pages..."
            className="h-12 w-full rounded-2xl border border-border bg-card pl-11 pr-4 text-sm"
          />

        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_450px]">

          {/* PAGE LIST */}
          <div className="space-y-3">

            {filtered.map(
              (
                page
              ) => {

                const control = {
                  ...EMPTY_PAGE,

                  ...(
                    pages[
                      page.path
                    ] ||
                    {}
                  ),

                  path:
                    page.path,
                };

                return (
                  <button
                    type="button"
                    key={
                      page.path
                    }
                    onClick={() =>
                      setSelected(
                        page.path
                      )
                    }
                    className={`w-full rounded-2xl border p-5 text-left ${
                      selected ===
                      page.path
                        ? 'border-accent bg-accent/5'
                        : 'border-border bg-card hover:bg-secondary/30'
                    }`}
                  >

                    <div className="flex items-center justify-between gap-4">

                      <div>

                        <div className="font-semibold">
                          {
                            page.title
                          }
                        </div>

                        <div className="mt-1 font-mono text-xs text-foreground-muted">
                          {
                            page.path
                          }
                        </div>

                      </div>

                      <div className="flex items-center gap-2">

                        {control.scheduleEnabled && (
                          <CalendarClock className="h-4 w-4 text-accent" />
                        )}

                        {control.maintenanceEnabled ? (
                          <Wrench className="h-4 w-4 text-red-600" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        )}

                      </div>

                    </div>

                  </button>
                );
              }
            )}

          </div>

          {/* PAGE EDITOR */}
          <div className="rounded-3xl border border-border bg-card p-6">

            {selectedPage && (
              <>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
                    PAGE CONTROL
                  </div>

                  <h2 className="mt-2 text-xl font-semibold">
                    {
                      selectedPage.title
                    }
                  </h2>

                  <p className="mt-1 font-mono text-xs text-foreground-muted">
                    {
                      selectedPage.path
                    }
                  </p>
                </div>

                {/* PAGE SCHEDULE */}
                <div className="mt-6 rounded-2xl border border-border p-5">

                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-accent" />

                    <h3 className="font-semibold">
                      Dedicated Page Schedule
                    </h3>
                  </div>

                  <p className="mt-1 text-xs leading-5 text-foreground-muted">
                    This schedule applies only to this page. The schedule
                    banner is also shown on Home so visitors know this
                    page will be unavailable.
                  </p>

                  <div className="mt-5 space-y-4">

                    <ToggleRow
                      label="Schedule this page"
                      description="Show a countdown before maintenance and an expected-finish timer during maintenance."
                      enabled={
                        current.scheduleEnabled
                      }
                      onChange={(
                        value
                      ) =>
                        updatePage(
                          'scheduleEnabled',
                          value
                        )
                      }
                    />

                    <div className="grid gap-4">

                      <div>
                        <label className="text-xs font-semibold">
                          Start
                        </label>

                        <input
                          type="datetime-local"
                          value={toDateInput(
                            current.scheduleStartAt
                          )}
                          onChange={(
                            event
                          ) =>
                            updatePage(
                              'scheduleStartAt',
                              fromDateInput(
                                event.target.value
                              )
                            )
                          }
                          className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold">
                          Finish
                        </label>

                        <input
                          type="datetime-local"
                          value={toDateInput(
                            current.scheduleEndAt
                          )}
                          onChange={(
                            event
                          ) =>
                            updatePage(
                              'scheduleEndAt',
                              fromDateInput(
                                event.target.value
                              )
                            )
                          }
                          className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
                        />
                      </div>

                    </div>

                  </div>

                </div>

                {/* MAINTENANCE */}
                <div className="mt-5 rounded-2xl border border-border p-5">

                  <ToggleRow
                    label="Maintenance"
                    description="Manually keep this page under maintenance."
                    enabled={
                      current.maintenanceEnabled
                    }
                    onChange={(
                      value
                    ) =>
                      updatePage(
                        'maintenanceEnabled',
                        value
                      )
                    }
                  />

                  <input
                    value={
                      current.maintenanceTitle
                    }
                    onChange={(
                      event
                    ) =>
                      updatePage(
                        'maintenanceTitle',
                        event.target.value
                      )
                    }
                    placeholder="Maintenance title"
                    className="mt-4 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
                  />

                  <textarea
                    value={
                      current.maintenanceMessage
                    }
                    onChange={(
                      event
                    ) =>
                      updatePage(
                        'maintenanceMessage',
                        event.target.value
                      )
                    }
                    rows={4}
                    placeholder="Maintenance message"
                    className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm leading-6"
                  />

                  <button
                    type="button"
                    disabled={
                      aiLoading
                    }
                    onClick={
                      generatePageMessage
                    }
                    className="mt-3 inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-xs font-semibold hover:bg-secondary disabled:opacity-50"
                  >
                    {aiLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}

                    Generate Maintenance Message
                  </button>

                </div>

                {/* POPUP */}
                <div className="mt-5 rounded-2xl border border-border p-5">

                  <ToggleRow
                    label="Page Popup"
                    description="Show a dedicated popup on this page."
                    enabled={
                      current.popupEnabled
                    }
                    onChange={(
                      value
                    ) =>
                      updatePage(
                        'popupEnabled',
                        value
                      )
                    }
                  />

                  <input
                    value={
                      current.popupTitle
                    }
                    onChange={(
                      event
                    ) =>
                      updatePage(
                        'popupTitle',
                        event.target.value
                      )
                    }
                    placeholder="Popup title"
                    className="mt-4 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
                  />

                  <textarea
                    value={
                      current.popupMessage
                    }
                    onChange={(
                      event
                    ) =>
                      updatePage(
                        'popupMessage',
                        event.target.value
                      )
                    }
                    rows={4}
                    placeholder="Popup content"
                    className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm"
                  />

                </div>

                <div className="mt-5 flex flex-wrap gap-3">

                  <Link
                    href={
                      selectedPage.path
                    }
                    target="_blank"
                    className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold hover:bg-secondary"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Preview Page
                  </Link>

                  <button
                    type="button"
                    disabled={
                      saving
                    }
                    onClick={
                      savePage
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}

                    Save Page
                  </button>

                </div>

              </>
            )}

          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-5 text-xs text-foreground-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading page controls...
          </div>
        )}

      </div>
    </AdminLayout>
  );
}

function ToggleRow({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (
    value: boolean
  ) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">

      <div>
        <div className="text-sm font-semibold">
          {
            label
          }
        </div>

        <p className="mt-1 max-w-md text-xs leading-5 text-foreground-muted">
          {
            description
          }
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          onChange(
            !enabled
          )
        }
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          enabled
            ? 'bg-green-500'
            : 'border border-gray-300 bg-white'
        }`}
        aria-pressed={
          enabled
        }
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full shadow-sm transition ${
            enabled
              ? 'left-6 bg-white'
              : 'left-1 bg-gray-400'
          }`}
        />
      </button>

    </div>
  );
}


