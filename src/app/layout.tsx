import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'De Steiger - Duurzame bedrijfsruimtes voor ondernemers en beleggers',
  description: 'Ontdek de duurzame oplossingen van De Steiger. Moderne, toekomstbestendige bedrijfspanden op toplocaties in Nederland.',
  keywords: 'bedrijfsruimte, bedrijfspand, kantoor, de steiger, duurzaam, nederland, amsterdam, rotterdam, utrecht',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
