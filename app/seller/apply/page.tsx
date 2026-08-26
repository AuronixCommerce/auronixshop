'use client';

import {
  FormEvent,
  useState,
} from 'react';

import Link from 'next/link';

import {
  push,
  ref,
  set,
} from 'firebase/database';

import {
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Loader2,
  Send,
  ShieldCheck,
} from 'lucide-react';

import { db } from '@/lib/firebase';

const BUSINESS_TYPES = [
  'Manufacturer',
  'Distributor',
  'Wholesaler',
  'Brand',
  'Retailer',
  'Service Provider',
  'Other',
];

const SELLER_POLICY_VERSION =
  '2026-08-15';

const APPLICATION_VERSION =
  'seller-application-v5';

type PreferredContact =
  | 'business'
  | 'personal'
  | '';

type PolicyAgreement =
  | true
  | false
  | null;

interface FormState {
  fullName: string;
  businessName: string;

  businessEmail: string;
  personalEmail: string;

  phone: string;
  country: string;

  address: string;
  city: string;
  state: string;
  zipCode: string;

  website: string;
  businessType: string;
  yearsInBusiness: string;
  productCategories: string;

  businessInformation: string;
  whyWorkWithAuronix: string;
  catalogUrl: string;

  preferredContact:
    PreferredContact;

  contactAgreement: boolean;

  sellerPolicyAgreement:
    PolicyAgreement;
}

const INITIAL_FORM: FormState = {
  fullName: '',
  businessName: '',

  businessEmail: '',
  personalEmail: '',

  phone: '',
  country: '',

  address: '',
  city: '',
  state: '',
  zipCode: '',

  website: '',
  businessType: '',
  yearsInBusiness: '',
  productCategories: '',

  businessInformation: '',
  whyWorkWithAuronix: '',
  catalogUrl: '',

  preferredContact: '',

  contactAgreement:
    false,

  sellerPolicyAgreement:
    null,
};

function clean(
  value: string
): string {
  return value.trim();
}

function validEmail(
  value: string
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value.trim()
  );
}

export default function SellerApplyPage() {
  const [
    form,
    setForm,
  ] =
    useState<FormState>(
      INITIAL_FORM
    );

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    submitted,
    setSubmitted,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState('');

  const updateField = <
    K extends keyof FormState
  >(
    field: K,
    value: FormState[K]
  ) => {
    setForm(
      (current) => ({
        ...current,
        [field]:
          value,
      })
    );
  };

  const submitApplication =
    async (
      event: FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      if (
        submitting
      ) {
        return;
      }

      if (!db) {
        setError(
          'Application service is currently unavailable.'
        );

        return;
      }

      setError('');

      const requiredFields: Array<
        [string, string]
      > = [
        [
          'Full Name',
          form.fullName,
        ],
        [
          'Business Name',
          form.businessName,
        ],
        [
          'Business Email',
          form.businessEmail,
        ],
        [
          'Personal Email',
          form.personalEmail,
        ],
        [
          'Phone',
          form.phone,
        ],
        [
          'Country',
          form.country,
        ],
        [
          'Street Address',
          form.address,
        ],
        [
          'City',
          form.city,
        ],
        [
          'State / Province',
          form.state,
        ],
        [
          'ZIP / Postal Code',
          form.zipCode,
        ],
        [
          'Business Type',
          form.businessType,
        ],
        [
          'Product Categories',
          form.productCategories,
        ],
        [
          'Business Information',
          form.businessInformation,
        ],
        [
          'Why do you want to work with Auronix?',
          form.whyWorkWithAuronix,
        ],
      ];

      for (
        const [
          label,
          value,
        ] of requiredFields
      ) {
        if (
          !clean(value)
        ) {
          setError(
            `${label} is required.`
          );

          return;
        }
      }

      if (
        !validEmail(
          form.businessEmail
        )
      ) {
        setError(
          'Please enter a valid business email address.'
        );

        return;
      }

      if (
        !validEmail(
          form.personalEmail
        )
      ) {
        setError(
          'Please enter a valid personal email address.'
        );

        return;
      }

      if (
        !form.preferredContact
      ) {
        setError(
          'Please select which email you want Auronix to use for communication.'
        );

        return;
      }

      if (
        form.sellerPolicyAgreement !==
        true
      ) {
        setError(
          'You must select "Yes, I agree" to the Seller Policy before submitting your application.'
        );

        return;
      }

      if (
        !form.contactAgreement
      ) {
        setError(
          'Please agree to be contacted by Auronix Commerce LLC.'
        );

        return;
      }

      const businessInformation =
        clean(
          form.businessInformation
        );

      const whyWorkWithAuronix =
        clean(
          form.whyWorkWithAuronix
        );

      if (
        businessInformation.length <
        30
      ) {
        setError(
          'Please provide more detail in Business Information.'
        );

        return;
      }

      if (
        whyWorkWithAuronix.length <
        20
      ) {
        setError(
          'Please explain why you want to work with Auronix.'
        );

        return;
      }

      const yearsInBusiness =
        clean(
          form.yearsInBusiness
        );

      if (
        yearsInBusiness
      ) {
        const years =
          Number(
            yearsInBusiness
          );

        if (
          !Number.isFinite(
            years
          ) ||
          years < 0 ||
          years > 200
        ) {
          setError(
            'Years in Business must be between 0 and 200.'
          );

          return;
        }
      }

      const businessEmail =
        clean(
          form.businessEmail
        );

      const personalEmail =
        clean(
          form.personalEmail
        );

      const preferredContactEmail =
        form.preferredContact ===
        'personal'
          ? personalEmail
          : businessEmail;

      setSubmitting(
        true
      );

      try {
        const applicationRef =
          push(
            ref(
              db,
              'sellerApplications'
            )
          );

        const applicationId =
          applicationRef.key;

        if (
          !applicationId
        ) {
          throw new Error(
            'Unable to create application ID.'
          );
        }

        const timestamp =
          Date.now();

        const application = {
          id:
            applicationId,

          applicationVersion:
            APPLICATION_VERSION,

          source:
            'seller-application',

          status:
            'pending',

          /*
           * APPLICANT
           */
          fullName:
            clean(
              form.fullName
            ),

          businessName:
            clean(
              form.businessName
            ),

          /*
           * EMAILS
           */
          businessEmail,

          personalEmail,

          preferredContactType:
            form.preferredContact,

          preferredContactEmail,

          /*
           * CONTACT
           */
          phone:
            clean(
              form.phone
            ),

          country:
            clean(
              form.country
            ),

          /*
           * ADDRESS
           */
          address:
            clean(
              form.address
            ),

          city:
            clean(
              form.city
            ),

          state:
            clean(
              form.state
            ),

          zipCode:
            clean(
              form.zipCode
            ),

          /*
           * BUSINESS PROFILE
           */
          website:
            clean(
              form.website
            ),

          businessType:
            clean(
              form.businessType
            ),

          yearsInBusiness,

          productCategories:
            clean(
              form.productCategories
            ),

          businessInformation,

          whyWorkWithAuronix,

          catalogUrl:
            clean(
              form.catalogUrl
            ),

          /*
           * CONTACT CONSENT
           */
          contactAgreement:
            true,

          /*
           * SELLER POLICY
           */
          sellerPolicyAgreed:
            true,

          sellerPolicyVersion:
            SELLER_POLICY_VERSION,

          sellerPolicyAgreedAt:
            timestamp,

          /*
           * AI SCREENING
           */
          aiStatus:
            'PENDING',

          aiScore:
            0,

          aiAutoEligible:
            false,

          aiAutoApproved:
            false,

          aiScreening:
            null,

          /*
           * ACCOUNT
           */
          accountCreated:
            false,

          accountCreationStatus:
            'not_started',

          invitationSentAt:
            null,

          invitationSentBy:
            null,

          /*
           * AUDIT
           */
          createdAt:
            timestamp,

          updatedAt:
            timestamp,
        };

        await set(
          applicationRef,
          application
        );

        setForm(
          INITIAL_FORM
        );

        setSubmitted(
          true
        );
      } catch (
        submitError
      ) {
        console.error(
          'Seller application submission failed:',
          submitError
        );

        setError(
          submitError instanceof Error
            ? submitError.message
            : 'Unable to submit your application. Please try again.'
        );
      } finally {
        setSubmitting(
          false
        );
      }
    };

  if (
    submitted
  ) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-5 py-16">
          <div className="w-full rounded-[32px] border border-border bg-card p-8 text-center shadow-xl sm:p-12">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>

            <div className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              APPLICATION RECEIVED
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              Thank you for applying.
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-foreground-muted">
              Your seller application has been received successfully.
              The information you submitted will now go through the
              Auronix application screening process.
            </p>

            <div className="mt-8 rounded-2xl border border-border bg-secondary/40 p-5 text-left">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" />

                <div>
                  <h2 className="font-semibold">
                    What happens next?
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-foreground-muted">
                    Auronix will review the submitted business,
                    contact, product, and application information.
                    Additional information may be requested when
                    necessary.
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/"
              className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              Return to Auronix
            </Link>

          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">

      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">

        {/* HERO */}
        <div className="mx-auto max-w-3xl text-center">

          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            SELLER PARTNERSHIPS
          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Apply to work with Auronix.
          </h1>

          <p className="mt-5 text-base leading-7 text-foreground-muted sm:text-lg">
            Tell us about your business, products, and
            marketplace opportunities.
          </p>

        </div>

        <form
          onSubmit={
            submitApplication
          }
          className="mx-auto mt-12 max-w-4xl space-y-6"
        >

          {/* CONTACT */}
          <Section
            eyebrow="01"
            title="Contact Information"
            description="Provide both business and personal contact information."
          >

            <div className="grid gap-5 md:grid-cols-2">

              <Field
                label="Full Name"
                required
                value={
                  form.fullName
                }
                onChange={(value) =>
                  updateField(
                    'fullName',
                    value
                  )
                }
                placeholder="John Smith"
              />

              <Field
                label="Business Email"
                required
                type="email"
                value={
                  form.businessEmail
                }
                onChange={(value) =>
                  updateField(
                    'businessEmail',
                    value
                  )
                }
                placeholder="john@company.com"
              />

              <Field
                label="Personal Email"
                required
                type="email"
                value={
                  form.personalEmail
                }
                onChange={(value) =>
                  updateField(
                    'personalEmail',
                    value
                  )
                }
                placeholder="johnsmith@gmail.com"
              />

              <Field
                label="Phone"
                required
                value={
                  form.phone
                }
                onChange={(value) =>
                  updateField(
                    'phone',
                    value
                  )
                }
                placeholder="+1 555 000 0000"
              />

              <Field
                label="Country"
                required
                value={
                  form.country
                }
                onChange={(value) =>
                  updateField(
                    'country',
                    value
                  )
                }
                placeholder="United States"
              />

            </div>

            {/* PREFERRED EMAIL */}
            <div className="mt-6 rounded-2xl border border-border bg-secondary/30 p-5">

              <h3 className="text-sm font-semibold">
                Preferred Email for Auronix Communication
                <span className="ml-1 text-red-500">
                  *
                </span>
              </h3>

              <p className="mt-1 text-xs leading-5 text-foreground-muted">
                Seller account invitations, application updates,
                and important Auronix communications will be sent
                to the email you select.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">

                <RadioCard
                  selected={
                    form.preferredContact ===
                    'business'
                  }
                  title="Business Email"
                  description={
                    form.businessEmail ||
                    'Enter your business email above'
                  }
                  onSelect={() =>
                    updateField(
                      'preferredContact',
                      'business'
                    )
                  }
                />

                <RadioCard
                  selected={
                    form.preferredContact ===
                    'personal'
                  }
                  title="Personal Email"
                  description={
                    form.personalEmail ||
                    'Enter your personal email above'
                  }
                  onSelect={() =>
                    updateField(
                      'preferredContact',
                      'personal'
                    )
                  }
                />

              </div>
            </div>

          </Section>

          {/* BUSINESS */}
          <Section
            eyebrow="02"
            title="Business Information"
            description="Tell us about your company and business activity."
          >

            <div className="grid gap-5 md:grid-cols-2">

              <Field
                label="Business Name"
                required
                value={
                  form.businessName
                }
                onChange={(value) =>
                  updateField(
                    'businessName',
                    value
                  )
                }
                placeholder="Your Business LLC"
              />

              <SelectField
                label="Business Type"
                required
                value={
                  form.businessType
                }
                onChange={(value) =>
                  updateField(
                    'businessType',
                    value
                  )
                }
                options={
                  BUSINESS_TYPES
                }
              />

              <Field
                label="Years in Business"
                type="number"
                min="0"
                max="200"
                value={
                  form.yearsInBusiness
                }
                onChange={(value) =>
                  updateField(
                    'yearsInBusiness',
                    value
                  )
                }
                placeholder="5"
              />

              <Field
                label="Website"
                type="url"
                value={
                  form.website
                }
                onChange={(value) =>
                  updateField(
                    'website',
                    value
                  )
                }
                placeholder="https://example.com"
              />

            </div>

            <div className="mt-5">

              <Field
                label="Product Categories"
                required
                value={
                  form.productCategories
                }
                onChange={(value) =>
                  updateField(
                    'productCategories',
                    value
                  )
                }
                placeholder="Home & Kitchen, Electronics, Office Products"
              />

            </div>

          </Section>

          {/* ADDRESS */}
          <Section
            eyebrow="03"
            title="Business Address"
            description="Provide the primary business address."
          >

            <Field
              label="Street Address"
              required
              value={
                form.address
              }
              onChange={(value) =>
                updateField(
                  'address',
                  value
                )
              }
              placeholder="123 Market Street, Suite 200"
            />

            <div className="mt-5 grid gap-5 md:grid-cols-3">

              <Field
                label="City"
                required
                value={
                  form.city
                }
                onChange={(value) =>
                  updateField(
                    'city',
                    value
                  )
                }
                placeholder="Miami"
              />

              <Field
                label="State / Province"
                required
                value={
                  form.state
                }
                onChange={(value) =>
                  updateField(
                    'state',
                    value
                  )
                }
                placeholder="Florida"
              />

              <Field
                label="ZIP / Postal Code"
                required
                value={
                  form.zipCode
                }
                onChange={(value) =>
                  updateField(
                    'zipCode',
                    value
                  )
                }
                placeholder="33101"
              />

            </div>

          </Section>

          {/* BUSINESS PROFILE */}
          <Section
            eyebrow="04"
            title="Products & Business Profile"
            description="Give us enough information to understand your business."
          >

            <TextAreaField
              label="Business Information"
              required
              value={
                form.businessInformation
              }
              onChange={(value) =>
                updateField(
                  'businessInformation',
                  value
                )
              }
              rows={8}
              placeholder="Tell us about your business, products, customers, sourcing, distribution, operations, and commercial capabilities."
            />

            <div className="mt-5">

              <TextAreaField
                label="Why do you want to work with Auronix?"
                required
                value={
                  form.whyWorkWithAuronix
                }
                onChange={(value) =>
                  updateField(
                    'whyWorkWithAuronix',
                    value
                  )
                }
                rows={6}
                placeholder="Explain why you want to establish a relationship with Auronix Commerce LLC and what type of partnership you are seeking."
              />

            </div>

            <div className="mt-5">

              <Field
                label="Catalog URL"
                type="url"
                value={
                  form.catalogUrl
                }
                onChange={(value) =>
                  updateField(
                    'catalogUrl',
                    value
                  )
                }
                placeholder="https://example.com/catalog"
              />

            </div>

          </Section>

          {/* POLICY */}
          <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">

            <div className="mb-6">

              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                05
              </div>

              <h2 className="mt-2 text-xl font-semibold">
                Seller Policy & Agreements
              </h2>

              <p className="mt-1 text-sm leading-6 text-foreground-muted">
                Review the Seller Policy before deciding whether
                to submit your application.
              </p>

            </div>

            {/* POLICY LINK */}
            <div className="rounded-2xl border border-border bg-secondary/30 p-5">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background">
                  <ShieldCheck className="h-5 w-5 text-accent" />
                </div>

                <div className="min-w-0">

                  <h3 className="font-semibold">
                    Auronix Seller Policy
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-foreground-muted">
                    The policy explains seller eligibility,
                    information accuracy, product requirements,
                    prohibited conduct, application screening,
                    account creation, and seller responsibilities.
                  </p>

                  <Link
                    href="/seller/policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
                  >
                    Read the Seller Policy
                    <ExternalLink className="h-4 w-4" />
                  </Link>

                </div>

              </div>

            </div>

            {/* YES / NO */}
            <div className="mt-5 rounded-2xl border border-border p-5">

              <h3 className="text-sm font-semibold">
                Do you agree to the Auronix Seller Policy?
                <span className="ml-1 text-red-500">
                  *
                </span>
              </h3>

              <p className="mt-1 text-xs leading-5 text-foreground-muted">
                You must select Yes to submit your seller application.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">

                <label
                  className={`cursor-pointer rounded-xl border p-5 transition ${
                    form.sellerPolicyAgreement ===
                    true
                      ? 'border-green-500 bg-green-500/5'
                      : 'border-border bg-background hover:bg-secondary/30'
                  }`}
                >

                  <div className="flex items-start gap-3">

                    <input
                      type="radio"
                      name="sellerPolicyAgreement"
                      value="yes"
                      checked={
                        form.sellerPolicyAgreement ===
                        true
                      }
                      onChange={() =>
                        updateField(
                          'sellerPolicyAgreement',
                          true
                        )
                      }
                      className="mt-1 h-4 w-4 accent-primary"
                    />

                    <div>

                      <div className="font-medium">
                        Yes, I agree
                      </div>

                      <div className="mt-1 text-xs leading-5 text-foreground-muted">
                        I have read and agree to the Auronix Seller Policy.
                      </div>

                    </div>

                  </div>

                </label>

                <label
                  className={`cursor-pointer rounded-xl border p-5 transition ${
                    form.sellerPolicyAgreement ===
                    false
                      ? 'border-red-500 bg-red-500/5'
                      : 'border-border bg-background hover:bg-secondary/30'
                  }`}
                >

                  <div className="flex items-start gap-3">

                    <input
                      type="radio"
                      name="sellerPolicyAgreement"
                      value="no"
                      checked={
                        form.sellerPolicyAgreement ===
                        false
                      }
                      onChange={() =>
                        updateField(
                          'sellerPolicyAgreement',
                          false
                        )
                      }
                      className="mt-1 h-4 w-4 accent-primary"
                    />

                    <div>

                      <div className="font-medium">
                        No, I do not agree
                      </div>

                      <div className="mt-1 text-xs leading-5 text-foreground-muted">
                        You cannot submit an application without agreeing.
                      </div>

                    </div>

                  </div>

                </label>

              </div>

            </div>

            {/* CONTACT AGREEMENT */}
            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-border p-5">

              <input
                type="checkbox"
                checked={
                  form.contactAgreement
                }
                onChange={(event) =>
                  updateField(
                    'contactAgreement',
                    event.target.checked
                  )
                }
                className="mt-1 h-4 w-4 accent-primary"
              />

              <span className="text-sm leading-6 text-foreground-muted">

                I agree to be contacted by Auronix Commerce LLC
                regarding my seller application.

                <span className="ml-1 text-red-500">
                  *
                </span>

              </span>

            </label>

          </section>

          {/* ERROR */}
          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm leading-6 text-red-700">
              {error}
            </div>
          )}

          {/* SUBMIT */}
          <div className="flex flex-col items-center gap-4 pt-2">

            <button
              type="submit"
              disabled={
                submitting
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[240px]"
            >

              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Application
                </>
              )}

            </button>

            <p className="max-w-xl text-center text-xs leading-5 text-foreground-muted">
              By submitting, you confirm that the information
              provided is accurate and that you agree to the
              Auronix Seller Policy.
            </p>

          </div>

        </form>

      </div>
    </main>
  );
}

function Section({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">

      <div className="mb-6">

        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
          {eyebrow}
        </div>

        <h2 className="mt-2 text-xl font-semibold tracking-tight">
          {title}
        </h2>

        <p className="mt-1 text-sm leading-6 text-foreground-muted">
          {description}
        </p>

      </div>

      {children}

    </section>
  );
}

function Field({
  label,
  required = false,
  type = 'text',
  value,
  onChange,
  placeholder,
  min,
  max,
}: {
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder?: string;
  min?: string;
  max?: string;
}) {
  return (
    <div>

      <label className="text-sm font-medium">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type={
          type
        }
        required={
          required
        }
        value={
          value
        }
        min={
          min
        }
        max={
          max
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        placeholder={
          placeholder
        }
        className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
      />

    </div>
  );
}

function TextAreaField({
  label,
  required = false,
  value,
  onChange,
  placeholder,
  rows = 5,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>

      <label className="text-sm font-medium">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <textarea
        required={
          required
        }
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        rows={
          rows
        }
        placeholder={
          placeholder
        }
        className="mt-2 w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm leading-6 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
      />

    </div>
  );
}

function SelectField({
  label,
  required = false,
  value,
  onChange,
  options,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (
    value: string
  ) => void;
  options: string[];
}) {
  return (
    <div>

      <label className="text-sm font-medium">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <div className="relative">

        <select
          required={
            required
          }
          value={
            value
          }
          onChange={(
            event
          ) =>
            onChange(
              event.target.value
            )
          }
          className="mt-2 h-12 w-full appearance-none rounded-xl border border-border bg-background px-4 pr-10 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        >

          <option value="">
            Select type
          </option>

          {options.map(
            (
              option
            ) => (
              <option
                key={
                  option
                }
                value={
                  option
                }
              >
                {
                  option
                }
              </option>
            )
          )}

        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-8 h-4 w-4 text-foreground-muted" />

      </div>

    </div>
  );
}

function RadioCard({
  selected,
  title,
  description,
  onSelect,
}: {
  selected: boolean;
  title: string;
  description: string;
  onSelect: () => void;
}) {
  return (
    <label
      className={`cursor-pointer rounded-xl border p-4 transition ${
        selected
          ? 'border-accent bg-accent/5'
          : 'border-border bg-background hover:bg-secondary/30'
      }`}
    >

      <div className="flex items-start gap-3">

        <input
          type="radio"
          name="preferredContact"
          checked={
            selected
          }
          onChange={
            onSelect
          }
          className="mt-1 h-4 w-4 accent-primary"
        />

        <div className="min-w-0">

          <div className="text-sm font-medium">
            {title}
          </div>

          <div className="mt-1 break-all text-xs leading-5 text-foreground-muted">
            {description}
          </div>

        </div>

      </div>

    </label>
  );
}
