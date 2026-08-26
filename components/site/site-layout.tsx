import {
  type ReactNode,
} from 'react';

export function SiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}
