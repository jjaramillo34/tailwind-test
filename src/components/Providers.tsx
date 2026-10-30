'use client';

import {
  DataThemeProvider,
  IconProvider,
  ThemeProvider,
  ToastProvider,
} from '@once-ui-system/core';
import { LayoutProvider } from '@once-ui-system/core/next';
import type { SVGProps } from 'react';
import { Drama, MapPin, Palette, Printer, Ticket } from 'lucide-react';
import type { LucideIcon as LucideIconType } from 'lucide-react';
import { dataStyle, style } from '@/resources/once-ui.config';

// Icons Once UI does not ship, registered by name for <Icon> / prefixIcon.
declare module '@once-ui-system/core' {
  interface IconLibraryOverrides {
    mapPin: true;
    ticket: true;
    theater: true;
    palette: true;
    printer: true;
  }
}

// lucide draws at a fixed 24px; 1em lets Once UI's icon sizes (xs–xl) apply.
const sized = (LucideIcon: LucideIconType) => {
  const SizedIcon = (props: SVGProps<SVGSVGElement>) => <LucideIcon width="1em" height="1em" {...props} />;
  SizedIcon.displayName = LucideIcon.displayName;
  return SizedIcon;
};

const extraIcons = {
  mapPin: sized(MapPin),
  ticket: sized(Ticket),
  theater: sized(Drama),
  palette: sized(Palette),
  printer: sized(Printer),
};

// LayoutProvider from /next so links and images go through next/link and next/image.
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <ThemeProvider {...style}>
        <DataThemeProvider {...dataStyle}>
          <ToastProvider>
            <IconProvider icons={extraIcons}>{children}</IconProvider>
          </ToastProvider>
        </DataThemeProvider>
      </ThemeProvider>
    </LayoutProvider>
  );
}
