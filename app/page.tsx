import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full max-w-2xl p-8">
        {/* Logo & Brand */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-2xl shadow-blue-500/50">
            <svg
              className="h-14 w-14 text-white"
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
          <h1 className="mb-4 text-5xl font-bold text-gray-900">TicketFlow</h1>
          <p className="text-xl text-gray-600">
            Nền tảng đặt vé sự kiện hàng đầu Việt Nam
          </p>
        </div>

        {/* Auth Buttons */}
        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-center text-lg font-semibold text-white shadow-xl shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/40"
          >
            Đăng nhập
          </Link>

          <Link
            href="/register"
            className="block w-full rounded-xl border-2 border-blue-600 bg-white px-8 py-4 text-center text-lg font-semibold text-blue-600 shadow-lg transition-all hover:scale-105 hover:bg-blue-50"
          >
            Đăng ký tài khoản mới
          </Link>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-3 gap-6 text-center">
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-3 text-3xl font-bold text-blue-600">50K+</div>
            <div className="text-sm text-gray-600">Người dùng</div>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-3 text-3xl font-bold text-indigo-600">1000+</div>
            <div className="text-sm text-gray-600">Sự kiện</div>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-3 text-3xl font-bold text-purple-600">4.9★</div>
            <div className="text-sm text-gray-600">Đánh giá</div>
          </div>
        </div>

        {/* Test Links */}
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">
            🧪 Development Links:
          </h3>
          <div className="space-y-2 text-sm">
            <Link
              href="/test-auth-ui"
              className="block text-blue-600 hover:underline"
            >
              → Test Auth UI (Form validation testing)
            </Link>
            <a
              href="https://localhost:7207/swagger"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:underline"
            >
              → Backend API (Swagger)
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          © 2024 TicketFlow. All rights reserved.
        </div>
      </div>
    </div>
  );
}
