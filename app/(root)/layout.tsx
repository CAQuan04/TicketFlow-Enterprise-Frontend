import React from 'react';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';

/**
 * Layout cho Customer Routes
 * 
 * Route Group: (root)
 * - / (Home)
 * - /events
 * - /events/[id]
 * - /booking
 * - /my-tickets
 * - /profile
 * 
 * Includes: Navbar + Content + Footer
 */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}
