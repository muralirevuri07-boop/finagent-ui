// FinAgent Global — Design Tokens
// Single source of truth for colors, spacing, typography
import React from 'react';

export const colors = {
  // Backgrounds
  bg:         '#04080f',
  bgCard:     'rgba(8,16,36,0.92)',
  bgHover:    'rgba(0,200,255,0.05)',
  bgActive:   'rgba(0,200,255,0.12)',

  // Borders
  border:     'rgba(0,200,255,0.14)',
  borderHi:   'rgba(0,200,255,0.35)',
  borderDim:  'rgba(0,200,255,0.07)',

  // Accents
  teal:       '#00c8ff',
  green:      '#00e87a',
  red:        '#ff4466',
  amber:      '#ffaa00',
  purple:     '#a259ff',

  // Text
  textPrimary:   '#e8f0f8',
  textSecondary: 'rgba(180,200,220,0.65)',
  textDim:       'rgba(120,150,180,0.45)',
  textTeal:      '#00c8ff',
  textGreen:     '#00e87a',
  textRed:       '#ff4466',
} as const;

export const font = {
  mono: "'Share Tech Mono', 'Courier New', monospace",
  heading: "'Orbitron', 'Share Tech Mono', monospace",
  ui: "'Share Tech Mono', monospace",
} as const;

export const radius = {
  sm: '6px',
  md: '10px',
  lg: '14px',
  pill: '999px',
} as const;

export const space = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '0.85rem',
  lg: '1.2rem',
  xl: '2rem',
} as const;

// Reusable card style
export const cardStyle: React.CSSProperties = {
  background: colors.bgCard,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.lg,
  backdropFilter: 'blur(20px)',
};
