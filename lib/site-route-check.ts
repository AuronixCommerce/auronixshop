import fs from 'fs';
import path from 'path';

const APP_ROOT =
  path.join(
    process.cwd(),
    'app'
  );

function normalizePath(
  value: string
): string {
  let result =
    String(value || '')
      .trim()
      .replace(
        /\\/g,
        '/'
      );

  if (
    !result.startsWith('/')
  ) {
    result =
      '/' + result;
  }

  result =
    result.replace(
      /\/+/g,
      '/'
    );

  if (
    result.length > 1 &&
    result.endsWith('/')
  ) {
    result =
      result.slice(
        0,
        -1
      );
  }

  return result || '/';
}

function escapeRegex(
  value: string
): string {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  );
}

function hasPageFile(
  directory: string
): boolean {
  const names = [
    'page.tsx',
    'page.ts',
    'page.jsx',
    'page.js',
  ];

  for (
    const name of names
  ) {
    if (
      fs.existsSync(
        path.join(
          directory,
          name
        )
      )
    ) {
      return true;
    }
  }

  return false;
}

function collectRoutes(
  directory: string,
  routeParts: string[] = []
): string[] {
  const results: string[] = [];

  if (
    !fs.existsSync(
      directory
    )
  ) {
    return results;
  }

  if (
    hasPageFile(
      directory
    )
  ) {
    const route =
      routeParts.length > 0
        ? normalizePath(
            '/' +
              routeParts.join(
                '/'
              )
          )
        : '/';

    results.push(
      route
    );
  }

  let entries: fs.Dirent[] = [];

  try {
    entries =
      fs.readdirSync(
        directory,
        {
          withFileTypes:
            true,
        }
      );
  } catch {
    return results;
  }

  for (
    const entry of entries
  ) {
    if (
      !entry.isDirectory()
    ) {
      continue;
    }

    if (
      entry.name.startsWith(
        '.'
      )
    ) {
      continue;
    }

    if (
      entry.name ===
      'api'
    ) {
      continue;
    }

    const childDirectory =
      path.join(
        directory,
        entry.name
      );

    const childRoutes =
      collectRoutes(
        childDirectory,
        [
          ...routeParts,
          entry.name,
        ]
      );

    for (
      const childRoute of childRoutes
    ) {
      results.push(
        childRoute
      );
    }
  }

  return results;
}

function routeToRegex(
  route: string
): RegExp {
  const normalized =
    normalizePath(
      route
    );

  if (
    normalized === '/'
  ) {
    return /^\/$/;
  }

  const pieces =
    normalized
      .split('/')
      .filter(Boolean);

  let pattern = '';

  for (
    const piece of pieces
  ) {
    if (
      /^\[\[\.\.\.[^\]]+\]\]$/.test(
        piece
      )
    ) {
      pattern +=
        '(?:/.*)?';

      continue;
    }

    if (
      /^\[\.\.\.[^\]]+\]$/.test(
        piece
      )
    ) {
      pattern +=
        '/.+';

      continue;
    }

    if (
      /^\[[^\]]+\]$/.test(
        piece
      )
    ) {
      pattern +=
        '/[^/]+';

      continue;
    }

    pattern +=
      '/' +
      escapeRegex(
        piece
      );
  }

  return new RegExp(
    '^' +
      pattern +
      '/?$'
  );
}

export function getKnownSiteRoutes(): string[] {
  const routes =
    collectRoutes(
      APP_ROOT
    );

  const unique =
    Array.from(
      new Set(
        routes
      )
    );

  return unique
    .filter(
      route =>
        !route.startsWith(
          '/api'
        )
    )
    .filter(
      route =>
        !route.startsWith(
          '/admin'
        )
    )
    .filter(
      route =>
        !route.startsWith(
          '/partner-portal'
        )
    )
    .filter(
      route =>
        !route.startsWith(
          '/seller/dashboard'
        )
    )
    .sort();
}

export function routeExists(
  requestedPath: string
): boolean {
  let normalized =
    requestedPath || '/';

  try {
    if (
      /^https?:\/\//i.test(
        normalized
      )
    ) {
      const url =
        new URL(
          normalized
        );

      normalized =
        url.pathname;
    }
  } catch {
    return false;
  }

  normalized =
    normalizePath(
      normalized
    );

  const routes =
    getKnownSiteRoutes();

  for (
    const route of routes
  ) {
    if (
      routeToRegex(
        route
      ).test(
        normalized
      )
    ) {
      return true;
    }
  }

  return false;
}

export function isPublicSitePath(
  requestedPath: string
): boolean {
  const normalized =
    normalizePath(
      requestedPath
    );

  if (
    normalized ===
      '/admin' ||
    normalized.startsWith(
      '/admin/'
    )
  ) {
    return false;
  }

  if (
    normalized ===
      '/api' ||
    normalized.startsWith(
      '/api/'
    )
  ) {
    return false;
  }

  if (
    normalized ===
      '/partner-portal' ||
    normalized.startsWith(
      '/partner-portal/'
    )
  ) {
    return false;
  }

  if (
    normalized ===
      '/seller/dashboard' ||
    normalized.startsWith(
      '/seller/dashboard/'
    )
  ) {
    return false;
  }

  return true;
}