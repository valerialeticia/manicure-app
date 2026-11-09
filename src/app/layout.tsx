import type { Metadata, Viewport } from 'next';
import { Figtree, Instrument_Serif } from 'next/font/google';
import type { ReactNode } from 'react';
import { ServiceWorkerRegister } from '@/features/pwa/ServiceWorkerRegister';
import './globals.css';

// As fontes são baixadas no build e servidas pelo próprio app (funcionam offline no PWA).
const displayFont = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
});

const bodyFont = Figtree({
  subsets: ['latin'],
  variable: '--font-figtree',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Agenda Manicure',
  description: 'Agende seu horário de manicure e pedicure de forma rápida.',
  applicationName: 'Agenda Manicure',
  appleWebApp: {
    capable: true,
    title: 'Manicure',
    statusBarStyle: 'default',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#a3174a' },
    { media: '(prefers-color-scheme: dark)', color: '#21151b' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
