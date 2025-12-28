import React from 'react';
import { NavbarSimple } from '@/components/layout/navbar-simple';
import { Footer } from '@/components/layout/footer';

/**
 * ROOT LAYOUT - Customer Routes
 * 
 * ====================================
 * ROUTE GROUP: (root)
 * ====================================
 * 
 * Applies to:
 * - / (Home/Landing page)
 * - /events (Event listing)
 * - /events/[id] (Event detail)
 * - /booking/* (Booking flow)
 * - /profile (User profile)
 * 
 * 
 * ====================================
 * STRUCTURE
 * ====================================
 * 
 * Layout:
 * ┌─────────────────────────┐
 * │       Navbar            │ ← Sticky top, glassmorphism
 * ├─────────────────────────┤
 * │                         │
 * │       Content           │ ← flex-1 (Grow to fill space)
 * │       (children)        │
 * │                         │
 * ├─────────────────────────┤
 * │       Footer            │ ← Always at bottom
 * └─────────────────────────┘
 * 
 * 
 * ====================================
 * LAYOUT FEATURES
 * ====================================
 * 
 * 1. **Flex Column Layout**:
 *    - min-h-screen: Full viewport height minimum
 *    - flex-col: Stack vertically
 *    - flex-1 on main: Content grows to push footer down
 * 
 * 2. **Navbar**:
 *    - Sticky positioning
 *    - Auth-aware (Guest vs Logged-in)
 *    - Hydration-safe with useMounted pattern
 * 
 * 3. **Footer**:
 *    - Always at bottom
 *    - 4-column grid (responsive)
 *    - Social links + Contact info
 * 
 * 
 * ====================================
 * CONTAINER STRATEGY
 * ====================================
 * 
 * KHÔNG add container ở layout này vì:
 * - Một số pages cần full-width (Hero sections, banners)
 * - Mỗi page tự control container theo design
 * 
 * Pages có thể:
 * - Full-width: <div className="w-full">
 * - Contained: <div className="container mx-auto px-4">
 * - Mixed: Full-width hero + contained content
 * 
 * 
 * ====================================
 * TESTING
 * ====================================
 * 
 * Test 1: Layout Structure
 * 1. Navigate to /
 * 2. Check: Navbar visible at top
 * 3. Check: Content area in middle
 * 4. Check: Footer at bottom (even with little content)
 * 
 * Test 2: Footer Position
 * 1. Page with little content
 * 2. Footer should stick to bottom (not float)
 * 3. Page with lots of content
 * 4. Footer should be after content (scrollable)
 * 
 * Test 3: Navbar Sticky
 * 1. Scroll down on long page
 * 2. Navbar should stick to top
 * 3. Backdrop blur effect visible
 * 
 * Test 4: Responsive
 * 1. Desktop: Full layout
 * 2. Tablet: Navbar collapses, footer 2-col
 * 3. Mobile: Hamburger menu, footer 1-col
 */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar: Sticky header với auth state */}
      <NavbarSimple />
      
      {/* Main Content: Grows to fill space, pushes footer down */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Footer: Always at bottom */}
      <Footer />
    </div>
  );
}
