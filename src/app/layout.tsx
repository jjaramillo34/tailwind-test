import '@once-ui-system/core/css/styles.css';
import '@once-ui-system/core/css/tokens.css';
import './globals.css';

import type { Metadata } from 'next';
import { Inter, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { Column, Row, ThemeInit } from '@once-ui-system/core';
import { Providers } from '@/components/Providers';
import { dataStyle, style } from '@/resources/once-ui.config';

// Once UI reads these four font variables.
const heading = Inter({ variable: '--font-heading', subsets: ['latin'], display: 'swap' });
const body = Inter({ variable: '--font-body', subsets: ['latin'], display: 'swap' });
const label = Inter({ variable: '--font-label', subsets: ['latin'], display: 'swap' });
const code = Geist_Mono({ variable: '--font-code', subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'District 79 Arts Grant Events', template: '%s · District 79 Events' },
  description: 'Register for District 79 Arts Grant events across New York City.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Row
      as="html"
      lang="en-US"
      suppressHydrationWarning
      className={[heading.variable, body.variable, label.variable, code.variable].join(' ')}
    >
      <head>
        {/* Sets data-theme before first paint. */}
        <ThemeInit config={style} dataStyle={dataStyle} />
      </head>
      <Providers>
        <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh" suppressHydrationWarning>
          {children}
          <Analytics />
        </Column>
      </Providers>
    </Row>
  );
}
