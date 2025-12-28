'use client';

import { Toaster } from 'react-hot-toast';
import Script from 'next/script';

/**
 * Auth Layout - Split Screen Design (Enterprise Style)
 * 
 * Layout này dùng cho Login và Register pages
 * 
 * Design Pattern:
 * - Desktop: Split screen (Left = Image + Testimonial, Right = Form)
 * - Mobile: Chỉ hiển thị form, ẩn image
 * - Dark overlay trên image để text rõ ràng hơn
 * 
 * Features:
 * - Google Identity Services script cho OAuth
 * - Toaster notifications global
 * - Responsive design
 * - Modern gradient background
 * 
 * Structure:
 * ┌─────────────────────────────────────────┐
 * │  Left (Image)     │  Right (Form)       │
 * │  - Cover image    │  - Login/Register   │
 * │  - Dark overlay   │  - Centered         │
 * │  - Logo           │  - White bg         │
 * │  - Testimonial    │  - Shadow           │
 * └─────────────────────────────────────────┘
 */

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <>
      {/* Google Identity Services Script */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
      />

      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Left Side - Image & Branding (Hidden on mobile) */}
        <div className="relative hidden w-1/2 lg:block">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=2000')`,
            }}
          >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-indigo-900/90 to-purple-900/85" />
          </div>

          {/* Content on top of image */}
          <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
            {/* Logo & Brand */}
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                  <svg
                    className="h-7 w-7 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                    />
                  </svg>
                </div>
                <span className="text-2xl font-bold">TicketFlow</span>
              </div>
              <p className="mt-4 text-lg text-blue-100">
                Nền tảng đặt vé sự kiện hàng đầu Việt Nam
              </p>
            </div>

            {/* Testimonial */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="h-5 w-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="mb-4 text-lg leading-relaxed">
                  "Đặt vé concert siêu nhanh, giao diện đẹp, thanh toán an toàn. 
                  Không phải lo lắng về việc vé hết hay fake. Highly recommended!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400" />
                  <div>
                    <p className="font-semibold">Nguyễn Minh Anh</p>
                    <p className="text-sm text-blue-200">Khách hàng thường xuyên</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold">50K+</div>
                  <div className="text-sm text-blue-200">Người dùng</div>
                </div>
                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold">1000+</div>
                  <div className="text-sm text-blue-200">Sự kiện</div>
                </div>
                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold">4.9★</div>
                  <div className="text-sm text-blue-200">Đánh giá</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-sm text-blue-200">
              © 2024 TicketFlow. All rights reserved.
            </div>
          </div>
        </div>

        {/* Right Side - Form Container */}
        <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
          <div className="w-full max-w-md">
            {/* Mobile Logo (Shown only on mobile) */}
            <div className="mb-8 text-center lg:hidden">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600">
                <svg
                  className="h-9 w-9 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">TicketFlow</h1>
              <p className="text-sm text-gray-600">Đặt vé sự kiện dễ dàng</p>
            </div>

            {/* Form Card */}
            <div className="rounded-2xl bg-white p-8 shadow-2xl shadow-blue-500/10">
              {children}
            </div>

            {/* Footer Links (Mobile) */}
            <div className="mt-6 text-center text-sm text-gray-600 lg:hidden">
              <p>© 2024 TicketFlow. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications - Global */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '10px',
            padding: '16px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
          loading: {
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}
