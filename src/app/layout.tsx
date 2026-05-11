import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import PostHogProvider from '@/components/PostHogProvider';
import ClientLayout from '@/components/ClientLayout';

export const metadata: Metadata = {
  title: 'A6 Bedrijfsunits en Opslagboxen - Steiger 74-77 Almere',
  description: 'Koop uw eigen bedrijfsunit of opslagbox op De Steiger, Almere. Bekijk het aanbod en reserveer direct online.',
  keywords: 'bedrijfsunit, opslagbox, bedrijfsruimte, almere, de steiger, a6, kopen, reserveren',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className="min-h-screen flex flex-col bg-white">
        <PostHogProvider>
          <ClientLayout>
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </ClientLayout>
        </PostHogProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
