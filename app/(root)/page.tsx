'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from 'antd';
import { CalendarOutlined, TrophyOutlined, SafetyOutlined, RocketOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store';

/**
 * Home Page
 * 
 * Route: /
 * Layout: (root)
 * 
 * Features:
 * - Dynamic content based on auth state
 * - Show login/register for guests
 * - Show personalized content for authenticated users
 */

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-20 text-white">
        <div className="container mx-auto text-center">
          {isAuthenticated ? (
            <>
              <h1 className="mb-6 text-5xl font-bold">
                Chào mừng trở lại, {user?.fullName || 'bạn'}! 👋
              </h1>
              <p className="mb-8 text-xl text-blue-100">
                Khám phá các sự kiện mới nhất và đặt vé ngay hôm nay
              </p>
              
              <div className="flex justify-center gap-4">
                <Link href="/events">
                  <Button 
                    type="primary" 
                    size="large" 
                    className="h-12 px-8 bg-white text-blue-600 hover:bg-blue-50 border-0"
                    icon={<RocketOutlined />}
                  >
                    Khám phá sự kiện
                  </Button>
                </Link>
                <Link href="/booking">
                  <Button 
                    size="large" 
                    className="h-12 px-8" 
                    ghost
                  >
                    Vé của tôi
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="mb-6 text-5xl font-bold">
                Đặt vé sự kiện dễ dàng
              </h1>
              <p className="mb-8 text-xl text-blue-100">
                Hàng nghìn sự kiện đang chờ bạn khám phá
              </p>
              
              <div className="flex justify-center gap-4">
                <Link href="/events">
                  <Button type="primary" size="large" className="h-12 px-8">
                    Khám phá sự kiện
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="large" className="h-12 px-8" ghost>
                    Đăng nhập
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container mx-auto">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            Tại sao chọn TicketFlow?
          </h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <CalendarOutlined className="text-5xl text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Đa dạng sự kiện</h3>
              <p className="text-gray-600">
                Concert, hội chợ, workshop và nhiều sự kiện khác
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <SafetyOutlined className="text-5xl text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Thanh toán an toàn</h3>
              <p className="text-gray-600">
                Hỗ trợ nhiều phương thức thanh toán bảo mật
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <TrophyOutlined className="text-5xl text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Ưu đãi hấp dẫn</h3>
              <p className="text-gray-600">
                Giảm giá và khuyến mãi độc quyền
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="section bg-gray-50">
        <div className="container mx-auto">
          <h2 className="mb-8 text-3xl font-bold text-gray-900">
            Sự kiện nổi bật
          </h2>

          {/* TODO: Fetch và hiển thị featured events */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-xl"
              >
                <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500" />
                <div className="p-4">
                  <h3 className="mb-2 text-lg font-semibold">
                    Sự kiện mẫu {i}
                  </h3>
                  <p className="mb-4 text-sm text-gray-600">
                    25/12/2024 • 19:00 • TP.HCM
                  </p>
                  <Button type="primary" block>
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="section bg-primary py-16 text-white">
          <div className="container mx-auto text-center">
            <h2 className="mb-4 text-3xl font-bold">
              Sẵn sàng tham gia sự kiện?
            </h2>
            <p className="mb-8 text-lg text-blue-100">
              Đăng ký ngay để không bỏ lỡ các ưu đãi độc quyền
            </p>
            <Link href="/register">
              <Button size="large" className="h-12 px-8" ghost>
                Đăng ký miễn phí
              </Button>
            </Link>
          </div>
        </section>
      )}

      {isAuthenticated && user?.role === 'Customer' && (
        <section className="section bg-gradient-to-br from-purple-600 to-pink-600 py-16 text-white">
          <div className="container mx-auto text-center">
            <h2 className="mb-4 text-3xl font-bold">
              Bạn là nhà tổ chức sự kiện?
            </h2>
            <p className="mb-8 text-lg text-purple-100">
              Nâng cấp tài khoản để tạo và quản lý sự kiện của riêng bạn
            </p>
            <Button size="large" className="h-12 px-8" ghost>
              Trở thành Organizer
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
