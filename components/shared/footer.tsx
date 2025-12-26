import React from 'react';
import Link from 'next/link';
import { FacebookOutlined, InstagramOutlined, TwitterOutlined } from '@ant-design/icons';

/**
 * Footer Component
 * 
 * NOTE: Server Component (không cần 'use client')
 */

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="mb-4 text-xl font-bold text-primary">TicketFlow</h3>
            <p className="text-sm text-gray-600">
              Nền tảng đặt vé sự kiện hàng đầu Việt Nam
            </p>
            
            {/* Social Links */}
            <div className="mt-4 flex gap-4">
              <a href="#" className="text-gray-600 hover:text-primary">
                <FacebookOutlined className="text-xl" />
              </a>
              <a href="#" className="text-gray-600 hover:text-primary">
                <InstagramOutlined className="text-xl" />
              </a>
              <a href="#" className="text-gray-600 hover:text-primary">
                <TwitterOutlined className="text-xl" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-semibold text-gray-900">Về chúng tôi</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-primary">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-primary">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-600 hover:text-primary">
                  Tuyển dụng
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 font-semibold text-gray-900">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-gray-600 hover:text-primary">
                  Trung tâm trợ giúp
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-primary">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-primary">
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-semibold text-gray-900">Liên hệ</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Email: support@ticketflow.vn</li>
              <li>Hotline: 1900 xxxx</li>
              <li>Địa chỉ: 123 Đường ABC, Q.1, TP.HCM</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-gray-200 pt-8 text-center">
          <p className="text-sm text-gray-600">
            © 2024 TicketFlow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
