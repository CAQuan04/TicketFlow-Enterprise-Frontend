import React from 'react';

/**
 * Layout cho Auth Routes
 * 
 * Route Group: (auth)
 * - /login
 * - /register
 * - /forgot-password
 * 
 * Layout đơn giản: Centered form với logo
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary">TicketFlow</h1>
          <p className="mt-2 text-gray-600">Đặt vé sự kiện trực tuyến</p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          {children}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600">
          © 2024 TicketFlow. All rights reserved.
        </p>
      </div>
    </div>
  );
}
