import Link from 'next/link';
import { Ticket, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

/**
 * FOOTER COMPONENT - HOÀN CHỈNH
 * 
 * ====================================
 * STRUCTURE
 * ====================================
 * 
 * Layout (Desktop):
 * ┌────────────────────────────────────────────────┐
 * │ [About]    [Quick Links]    [Contact]    [Social] │
 * │  - Intro    - Events         - Email      - FB   │
 * │  - Mission  - My Tickets     - Phone      - TW   │
 * │             - Support        - Address    - IG   │
 * ├────────────────────────────────────────────────┤
 * │ © 2025 TicketFlow. All rights reserved.        │
 * └────────────────────────────────────────────────┘
 * 
 * Layout (Mobile): Stacked columns
 * 
 * 
 * ====================================
 * DESIGN NOTES
 * ====================================
 * 
 * - Dark background: bg-gray-900
 * - White text với opacity variations
 * - Hover effects: text-blue-400
 * - Social icons: Circle với hover scale
 * - Responsive: 1-column mobile → 4-column desktop
 * 
 * 
 * ====================================
 * SEO BENEFITS
 * ====================================
 * 
 * - Internal links (Events, About, Contact)
 * - Company information (Address, Phone, Email)
 * - Social media links (External signals)
 * - Copyright notice (Trust signal)
 * 
 * 
 * ====================================
 * TESTING
 * ====================================
 * 
 * Test 1: Links
 * 1. Click all footer links
 * 2. Should navigate correctly
 * 3. External links open in new tab
 * 
 * Test 2: Responsive
 * 1. Desktop: 4 columns side-by-side
 * 2. Tablet: 2 columns
 * 3. Mobile: 1 column stacked
 * 
 * Test 3: Hover States
 * 1. Hover links → text-blue-400
 * 2. Hover social icons → scale-110
 * 3. Transitions smooth
 */

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-800 bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* About Section */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Ticket className="h-6 w-6 text-blue-500" />
              <span className="text-xl font-bold text-white">TicketFlow</span>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-gray-400">
              Nền tảng đặt vé sự kiện hàng đầu Việt Nam. Kết nối bạn với hàng nghìn sự kiện 
              âm nhạc, hội thảo, thể thao và giải trí.
            </p>
            <p className="text-xs text-gray-500">
              Đơn giản, nhanh chóng, và an toàn.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Liên kết</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/events" 
                  className="text-sm transition-colors hover:text-blue-400"
                >
                  Sự kiện
                </Link>
              </li>
              <li>
                <Link 
                  href="/booking/my-tickets" 
                  className="text-sm transition-colors hover:text-blue-400"
                >
                  Vé của tôi
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="text-sm transition-colors hover:text-blue-400"
                >
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link 
                  href="/support" 
                  className="text-sm transition-colors hover:text-blue-400"
                >
                  Hỗ trợ
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-sm transition-colors hover:text-blue-400"
                >
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy" 
                  className="text-sm transition-colors hover:text-blue-400"
                >
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Liên hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                <a 
                  href="mailto:support@ticketflow.vn" 
                  className="transition-colors hover:text-blue-400"
                >
                  support@ticketflow.vn
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                <a 
                  href="tel:+84123456789" 
                  className="transition-colors hover:text-blue-400"
                >
                  +84 123 456 789
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                <span className="leading-relaxed">
                  123 Nguyễn Huệ, Quận 1<br />
                  TP. Hồ Chí Minh, Việt Nam
                </span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Theo dõi chúng tôi</h3>
            <p className="mb-4 text-sm text-gray-400">
              Cập nhật thông tin sự kiện mới nhất và ưu đãi hấp dẫn.
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com/ticketflow"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition-all hover:scale-110 hover:bg-blue-600 hover:text-white"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/ticketflow"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition-all hover:scale-110 hover:bg-blue-400 hover:text-white"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/ticketflow"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition-all hover:scale-110 hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 hover:text-white"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com/@ticketflow"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition-all hover:scale-110 hover:bg-red-600 hover:text-white"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-gray-800" />

        {/* Copyright */}
        <div className="flex flex-col items-center justify-between gap-4 text-center text-sm text-gray-500 md:flex-row md:text-left">
          <p>
            © {currentYear} <span className="font-semibold text-white">TicketFlow</span>. 
            All rights reserved.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Link href="/terms" className="transition-colors hover:text-white">
              Điều khoản
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-white">
              Bảo mật
            </Link>
            <Link href="/cookies" className="transition-colors hover:text-white">
              Cookies
            </Link>
            <Link href="/sitemap" className="transition-colors hover:text-white">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}