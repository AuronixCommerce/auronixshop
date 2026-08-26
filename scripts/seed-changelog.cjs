require('dotenv').config({
  path: '.env.local',
});

const {
  getDatabase,
} = require('firebase-admin/database');

const {
  getApps,
} = require('firebase-admin/app');

async function loadAdminApp() {
  /*
   * Your Next.js project already initializes Firebase Admin.
   * The seed script attempts to use that same environment
   * configuration without requiring a specific private-key
   * variable name.
   */

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_ADMIN_PROJECT_ID;

  const clientEmail =
    process.env.FIREBASE_CLIENT_EMAIL ||
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

  const privateKey =
    process.env.FIREBASE_PRIVATE_KEY ||
    process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  const databaseURL =
    process.env.FIREBASE_DATABASE_URL ||
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;

  if (
    !projectId ||
    !clientEmail ||
    !privateKey ||
    !databaseURL
  ) {
    throw new Error(
      [
        'Firebase Admin environment variables are incomplete.',
        '',
        `projectId: ${Boolean(projectId)}`,
        `clientEmail: ${Boolean(clientEmail)}`,
        `privateKey: ${Boolean(privateKey)}`,
        `databaseURL: ${Boolean(databaseURL)}`,
        '',
        'The seed script needs access to your Firebase Admin credentials.',
      ].join('\n')
    );
  }

  if (!getApps().length) {
    const {
      initializeApp,
      cert,
    } = require('firebase-admin/app');

    initializeApp({
      credential: cert({
        projectId,

        clientEmail,

        privateKey:
          privateKey.replace(
            /\\n/g,
            '\n'
          ),
      }),

      databaseURL,
    });
  }

  return getApps()[0];
}

const releases = [
  {
    version: '1.0.0',
    title: 'Auronix Commerce Experience',
    summary:
      'The foundation of the Auronix Commerce website, company experience, business presentation, and supplier-focused journey.',
    features: [
      'Introduced the Auronix Commerce brand experience.',
      'Established core company, services, products, process, and contact experiences.',
      'Built the supplier-focused website journey.',
    ],
    fixes: [],
    improvements: [
      'Created a consistent premium visual language across the website.',
      'Improved navigation between core business areas.',
    ],
  },

  {
    version: '1.1.0',
    title: 'A Complete Administration Workspace',
    summary:
      'Auronix gained a centralized administration experience for managing business operations and incoming activity.',
    features: [
      'Added centralized administrative operations.',
      'Added seller application management.',
      'Added supplier submission management.',
      'Added contact message management.',
      'Added support ticket management.',
      'Added blog, careers, and partner management.',
    ],
    fixes: [],
    improvements: [
      'Created a unified workflow for reviewing business activity.',
      'Added operational counters and quick actions.',
    ],
  },

  {
    version: '1.2.0',
    title: 'Seller Onboarding',
    summary:
      'Seller onboarding became a complete journey from application review to account creation.',
    features: [
      'Added seller account activation.',
      'Added seller dashboard areas.',
      'Added account setup and onboarding workflows.',
      'Added account security and password-reset experiences.',
    ],
    fixes: [
      'Improved seller invitation handling.',
      'Improved account setup and activation messaging.',
    ],
    improvements: [
      'Made seller communications clearer and more professional.',
      'Improved the transition from application review to onboarding.',
    ],
  },

  {
    version: '1.3.0',
    title: 'AI-Powered Support',
    summary:
      'Auronix introduced AI-assisted customer support, support automation, and an administration workspace for AI controls.',
    features: [
      'Added AI-assisted support responses.',
      'Added AI support instructions.',
      'Added conversation-aware ticket assistance.',
      'Added support automation when administration is offline.',
      'Added AI application screening foundations.',
    ],
    fixes: [
      'Improved support response handling.',
      'Improved automated support workflows.',
    ],
    improvements: [
      'Made AI responses more professional and consistent.',
      'Improved support continuity across conversations.',
    ],
  },

  {
    version: '1.4.0',
    title: 'Content & Careers',
    summary:
      'The public website expanded with richer content, careers, blog publishing, and a stronger information architecture.',
    features: [
      'Added dynamic careers publishing.',
      'Added blog publishing workflows.',
      'Expanded company and product information.',
      'Added a richer public careers experience.',
    ],
    fixes: [
      'Improved careers content synchronization.',
      'Improved public content rendering.',
    ],
    improvements: [
      'Added more detailed business information.',
      'Improved presentation of content and opportunities.',
    ],
  },

  {
    version: '1.5.0',
    title: 'Professional Auronix Communications',
    summary:
      'Auronix communication workflows were upgraded with professional business emails, account notifications, and AI-assisted email drafting.',
    features: [
      'Added professional email templates.',
      'Added AI email composition.',
      'Added seller account invitation emails.',
      'Added password-reset emails.',
      'Added support response emails.',
      'Added supplier and contact communication workflows.',
    ],
    fixes: [
      'Improved account invitation communications.',
      'Improved support email handling.',
      'Improved email consistency across business workflows.',
    ],
    improvements: [
      'Introduced a consistent Auronix Commerce Team signature.',
      'Improved email presentation and readability.',
      'Added better conversation history for outbound communication.',
    ],
  },

  {
    version: '1.6.0',
    title: 'A Smarter Auronix Experience',
    summary:
      'The latest experience brings together smarter support, better communication, stronger administration tools, and a more polished public website.',
    features: [
      'Introduced the Auronix AI workspace.',
      'Improved support conversation memory.',
      'Added AI-assisted application screening.',
      'Added professional communication workflows.',
      'Added the foundation for a public product update center.',
    ],
    fixes: [
      'Improved account invitation and password-reset reliability.',
      'Improved support response workflows.',
      'Resolved multiple application and communication workflow issues.',
    ],
    improvements: [
      'Improved the overall website experience.',
      'Improved administration workflows.',
      'Improved consistency across customer-facing communications.',
      'Improved the platform foundation for future releases.',
    ],
  },
];

async function run() {
  await loadAdminApp();

  const db =
    getDatabase();

  const root =
    db.ref('siteChangelog');

  const existing =
    await root.get();

  /*
   * Safety check:
   * Don't duplicate the release history if it already exists.
   */
  if (existing.exists()) {
    const current =
      existing.val();

    const existingVersions =
      new Set(
        Object.values(
          current || {}
        )
          .filter(
            (item) =>
              item &&
              typeof item === 'object'
          )
          .map(
            (item) =>
              item.version
          )
          .filter(Boolean)
      );

    const missing =
      releases.filter(
        (release) =>
          !existingVersions.has(
            release.version
          )
      );

    if (!missing.length) {
      console.log(
        'All Auronix release-history entries already exist. Nothing was added.'
      );

      return;
    }

    for (const release of missing) {
      const releaseRef =
        root.push();

      await releaseRef.set({
        ...release,

        releaseDate:
          Date.now(),

        published:
          true,

        createdAt:
          Date.now(),

        createdBy:
          'system-release-history',
      });

      console.log(
        `Created ${release.version}`
      );
    }

    console.log(
      'Missing Auronix releases added successfully.'
    );

    return;
  }

  for (const release of releases) {
    const releaseRef =
      root.push();

    await releaseRef.set({
      ...release,

      releaseDate:
        Date.now(),

      published:
        true,

      createdAt:
        Date.now(),

      createdBy:
        'system-release-history',
    });

    console.log(
      `Created ${release.version}`
    );
  }

  console.log(
    'Auronix changelog seeded successfully.'
  );
}

run().catch((error) => {
  console.error(
    '\nChangelog seed failed:\n',
    error
  );

  process.exit(1);
});
