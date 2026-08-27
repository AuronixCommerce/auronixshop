export type CampaignPageType =
  | 'product-launch'
  | 'service-launch'
  | 'announcement'
  | 'early-access'
  | 'launch-event'
  | 'webinar'
  | 'waitlist'
  | 'promotion'
  | 'supplier-opportunity'
  | 'seller-opportunity'
  | 'partnership'
  | 'company-update'
  | 'article'
  | 'resource'
  | 'download'
  | 'careers'
  | 'contact'
  | 'faq'
  | 'countdown'
  | 'registration'
  | 'general';

export type CampaignBlock =
  | {
      type: 'hero';
      badge?: string;
      eyebrow?: string;
      headline: string;
      subheadline?: string;
      description?: string;
      primaryCtaText?: string;
      primaryCtaUrl?: string;
      secondaryCtaText?: string;
      secondaryCtaUrl?: string;
    }
  | {
      type: 'text';
      title?: string;
      body: string;
    }
  | {
      type: 'features';
      title?: string;
      items: Array<{
        title: string;
        description: string;
      }>;
    }
  | {
      type: 'steps';
      title?: string;
      items: Array<{
        number?: string;
        title: string;
        description: string;
      }>;
    }
  | {
      type: 'stats';
      title?: string;
      items: Array<{
        value: string;
        label: string;
      }>;
    }
  | {
      type: 'quote';
      quote: string;
      author?: string;
      role?: string;
    }
  | {
      type: 'faq';
      title?: string;
      items: Array<{
        question: string;
        answer: string;
      }>;
    }
  | {
      type: 'cta';
      title: string;
      description?: string;
      buttonText: string;
      buttonUrl?: string;
    }
  | {
      type: 'image';
      title?: string;
      imageUrl: string;
      alt?: string;
      caption?: string;
    }
  | {
      type: 'countdown';
      title?: string;
      label?: string;
      targetAt: number;
    }
  | {
      type: 'notice';
      title?: string;
      message: string;
    };

export type CampaignFormField =
  | 'name'
  | 'email'
  | 'company'
  | 'phone'
  | 'attendees'
  | 'message'
  | 'notes';

export type CampaignPageData = {
  campaignName: string;

  pageType: CampaignPageType;

  badge: string;

  eyebrow: string;

  headline: string;

  subheadline: string;

  description: string;

  primaryCtaText: string;

  primaryCtaUrl: string;

  secondaryCtaText: string;

  secondaryCtaUrl: string;

  blocks: CampaignBlock[];

  formEnabled: boolean;

  formType:
    | 'contact'
    | 'registration'
    | 'waitlist'
    | 'reservation'
    | 'application'
    | 'general';

  formTitle: string;

  formDescription: string;

  formSubmitText: string;

  formFields: CampaignFormField[];

  successTitle: string;

  successMessage: string;

  expiresAt: number;
};

export const ALLOWED_FORM_FIELDS: CampaignFormField[] = [
  'name',
  'email',
  'company',
  'phone',
  'attendees',
  'message',
  'notes',
];

export const ALLOWED_PAGE_TYPES: CampaignPageType[] = [
  'product-launch',
  'service-launch',
  'announcement',
  'early-access',
  'launch-event',
  'webinar',
  'waitlist',
  'promotion',
  'supplier-opportunity',
  'seller-opportunity',
  'partnership',
  'company-update',
  'article',
  'resource',
  'download',
  'careers',
  'contact',
  'faq',
  'countdown',
  'registration',
  'general',
];

export function normalizeCampaignPageData(
  input: any,
  expiresAt: number
): CampaignPageData {
  const pageType =
    ALLOWED_PAGE_TYPES.includes(
      input?.pageType
    )
      ? input.pageType
      : 'general';

  const formFields =
    Array.isArray(
      input?.formFields
    )
      ? input.formFields.filter(
          (field: unknown): field is CampaignFormField =>
            typeof field === 'string' &&
            ALLOWED_FORM_FIELDS.includes(
              field as CampaignFormField
            )
        )
      : [];

  const blocks =
    Array.isArray(
      input?.blocks
    )
      ? input.blocks
          .filter(
            (block: any) =>
              block &&
              typeof block === 'object' &&
              typeof block.type === 'string'
          )
          .slice(0, 20)
      : [];

  return {
    campaignName:
      typeof input?.campaignName === 'string' &&
      input.campaignName.trim()
        ? input.campaignName.trim()
        : 'Auronix Commerce Campaign',

    pageType,

    badge:
      typeof input?.badge === 'string'
        ? input.badge.trim()
        : 'AURONIX COMMERCE',

    eyebrow:
      typeof input?.eyebrow === 'string'
        ? input.eyebrow.trim()
        : '',

    headline:
      typeof input?.headline === 'string'
        ? input.headline.trim()
        : 'Discover what is coming next.',

    subheadline:
      typeof input?.subheadline === 'string'
        ? input.subheadline.trim()
        : '',

    description:
      typeof input?.description === 'string'
        ? input.description.trim()
        : '',

    primaryCtaText:
      typeof input?.primaryCtaText === 'string'
        ? input.primaryCtaText.trim()
        : 'Learn More',

    primaryCtaUrl:
      typeof input?.primaryCtaUrl === 'string'
        ? input.primaryCtaUrl.trim()
        : '',

    secondaryCtaText:
      typeof input?.secondaryCtaText === 'string'
        ? input.secondaryCtaText.trim()
        : '',

    secondaryCtaUrl:
      typeof input?.secondaryCtaUrl === 'string'
        ? input.secondaryCtaUrl.trim()
        : '',

    blocks,

    formEnabled:
      input?.formEnabled === true,

    formType:
      [
        'contact',
        'registration',
        'waitlist',
        'reservation',
        'application',
        'general',
      ].includes(
        input?.formType
      )
        ? input.formType
        : 'general',

    formTitle:
      typeof input?.formTitle === 'string'
        ? input.formTitle.trim()
        : 'Get in touch',

    formDescription:
      typeof input?.formDescription === 'string'
        ? input.formDescription.trim()
        : 'Submit your details and the Auronix Commerce team will follow up.',

    formSubmitText:
      typeof input?.formSubmitText === 'string'
        ? input.formSubmitText.trim()
        : 'Submit',

    formFields:
      formFields.length > 0
        ? formFields
        : [
            'name',
            'email',
          ],

    successTitle:
      typeof input?.successTitle === 'string'
        ? input.successTitle.trim()
        : 'Submission received',

    successMessage:
      typeof input?.successMessage === 'string'
        ? input.successMessage.trim()
        : 'Thank you. Your submission has been received by Auronix Commerce LLC.',

    expiresAt,
  };
}