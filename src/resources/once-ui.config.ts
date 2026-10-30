import type { OnceUIDataStyleConfig, OnceUIStyleConfig } from '@once-ui-system/core';

export const style: OnceUIStyleConfig = {
  // Keep "system" so the theme switch works; first visit starts light.
  theme: 'system',
  defaultTheme: 'light',
  neutral: 'slate',
  brand: 'blue',
  accent: 'indigo',
  solid: 'color',
  solidStyle: 'flat',
  border: 'playful',
  surface: 'filled',
  transition: 'all',
  scaling: '100',
};

export const dataStyle: OnceUIDataStyleConfig = {
  variant: 'gradient',
  mode: 'categorical',
  height: 24,
  axis: { stroke: 'var(--neutral-alpha-weak)' },
  tick: { fill: 'var(--neutral-on-background-weak)', fontSize: 11, line: false },
};
