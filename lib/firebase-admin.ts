import { cert, getApps, initializeApp, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import type { Auth } from 'firebase-admin/auth';
import type { Database } from 'firebase-admin/database';

function createAdminApp() {
  const existing = getApps();

  if (existing.length > 0) {
    return getApp();
  }

  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    '\n'
  );

  if (
    !process.env.FIREBASE_ADMIN_PROJECT_ID ||
    !process.env.FIREBASE_ADMIN_CLIENT_EMAIL ||
    !privateKey
  ) {
    throw new Error(
      'Firebase Admin environment variables are not configured.'
    );
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
    databaseURL:
      process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
      'https://erprise-app-default-rtdb.firebaseio.com',
  });
}

function lazyService<T extends object>(factory: () => T): T {
  return new Proxy({} as T, {
    get(_target, property) {
      const service = factory();
      const value = Reflect.get(service, property, service);

      return typeof value === 'function'
        ? value.bind(service)
        : value;
    },
  });
}

/* Next.js imports routes during builds, so initialize Firebase on first use. */
export const adminAuth: Auth = lazyService(() =>
  getAuth(createAdminApp())
);

export const adminDb: Database = lazyService(() =>
  getDatabase(createAdminApp())
);

export default createAdminApp;
