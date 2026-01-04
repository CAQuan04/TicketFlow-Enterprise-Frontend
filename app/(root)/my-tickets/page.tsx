/**
 * ============================================
 * MY TICKETS PAGE - F7.3 SPEC (WALLET & TABS)
 * ============================================
 * 
 * Polished Ticket Wallet với filtering và physical-ticket look
 * 
 * ARCHITECTURE:
 * =============
 * 1. Page Setup & State
 *    - "use client"
 *    - useAuthStore protection (redirect to /login if not authenticated)
 *    - ticketService.getMyTickets() on mount
 *    - Skeleton while loading
 * 
 * 2. Filter Logic (TABS)
 *    - Tab 1: Upcoming (Active + future events)
 *    - Tab 2: Past/Used (Used/Cancelled OR past events)
 * 
 * 3. Date Handling
 *    - Strict comparison using dayjs
 *    - Upcoming: status === 'Active' AND startDateTime > now
 *    - Past: status !== 'Active' OR startDateTime < now
 * 
 * 4. Empty State
 *    - SVG illustration (empty wallet)
 *    - "Book Tickets Now" button → /events
 * 
 * 5. Modal Integration
 *    - QrModal at page root
 *    - State managed by parent (selectedTicket, isOpen)
 *    - TicketCard triggers modal via callback
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Tabs, Skeleton, Empty, Button, Alert } from 'antd';
import {
  FileProtectOutlined,
  ShoppingOutlined,
  CalendarOutlined,
  HistoryOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { ticketService } from '@/services/api';
import { useAuthStore } from '@/store';
import { TicketDto } from '@/types';
import TicketCard from '@/components/tickets/TicketCard';
import toast from 'react-hot-toast';

dayjs.locale('vi');

export default function MyTicketsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const [tickets, setTickets] = useState<TicketDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  /**
   * ============================================
   * HYDRATION & AUTHENTICATION CHECK
   * ============================================
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      toast.error('Vui lòng đăng nhập để xem vé của bạn');
      router.push('/login?returnUrl=/my-tickets');
    }
  }, [mounted, isAuthenticated, router]);

  /**
   * ============================================
   * FETCH TICKETS
   * ============================================
   */
  useEffect(() => {
    const fetchTickets = async () => {
      if (!mounted || !isAuthenticated) return;

      try {
        setLoading(true);

        // Call real API
        const data = await ticketService.getMyTickets();

        console.log('✅ Fetched tickets:', data);
        setTickets(data);

        if (data.length > 0) {
          toast.success(`Tìm thấy ${data.length} vé của bạn 🎫`);
        }
      } catch (error: unknown) {
        console.error('❌ Failed to fetch tickets:', error);

        // Type guard for Axios error
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response: { status: number } };
          const status = axiosError.response.status;
          if (status === 401 || status === 403) {
            toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            router.push('/login?returnUrl=/my-tickets');
            return;
          }
        }

        toast.error('Không thể tải danh sách vé. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [mounted, isAuthenticated, router]);

  /**
   * ============================================
   * FILTER LOGIC (TABS)
   * ============================================
   */
  
  /**
   * Tab 1: Upcoming
   * - status === 'Active'
   * - startDateTime > now
   */
  const upcomingTickets = tickets.filter((ticket) => {
    const isActive = ticket.status === 'Active';
    const eventDate = dayjs(ticket.startDateTime);
    const now = dayjs();
    const isFuture = eventDate.isAfter(now);
    
    // Debug log with full details
    if (ticket.ticketCode) {
      console.log(`🎫 ${ticket.ticketCode}:`, {
        eventName: ticket.eventName,
        status: ticket.status,
        startDateTime: ticket.startDateTime,
        eventDateParsed: eventDate.format('YYYY-MM-DD HH:mm'),
        nowTime: now.format('YYYY-MM-DD HH:mm'),
        isFuture,
        isActive,
        result: isActive && isFuture ? 'UPCOMING' : 'PAST',
      });
    }
    
    return isActive && isFuture;
  });

  /**
   * Tab 2: Past / Used
   * - status !== 'Active' (Used/Cancelled)
   * - OR startDateTime < now (past events even if Active)
   */
  const pastTickets = tickets.filter((ticket) => {
    const isNotActive = ticket.status !== 'Active';
    const isPast = dayjs(ticket.startDateTime).isBefore(dayjs());
    return isNotActive || isPast;
  });

  /**
   * ============================================
   * HANDLERS
   * ============================================
   */
  const handleRefresh = async () => {
    try {
      setLoading(true);
      const data = await ticketService.getMyTickets();
      setTickets(data);
      toast.success('Đã làm mới danh sách vé');
    } catch (error) {
      toast.error('Không thể làm mới. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * ============================================
   * RENDER LOADING STATE
   * ============================================
   */
  if (!mounted || (isAuthenticated && loading && tickets.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Skeleton.Input active size="large" className="mb-4" />
            <Skeleton.Input active size="small" className="mb-6" />
          </div>
          <Skeleton active paragraph={{ rows: 4 }} />
          <Skeleton active paragraph={{ rows: 4 }} className="mt-6" />
          <Skeleton active paragraph={{ rows: 4 }} className="mt-6" />
        </div>
      </div>
    );
  }

  /**
   * ============================================
   * EMPTY STATE COMPONENT
   * ============================================
   */
  const EmptyState = ({ message }: { message: string }) => (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <div className="text-center py-12">
          {/* Empty Wallet Illustration */}
          <div className="text-8xl mb-6">👛</div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {message}
          </h3>
          
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {message.includes('Upcoming')
              ? 'Bạn chưa có vé sắp tới. Khám phá các sự kiện thú vị và đặt vé ngay!'
              : 'Bạn chưa có vé đã qua. Lịch sử vé của bạn sẽ hiển thị ở đây.'}
          </p>
          
          {message.includes('Upcoming') && (
            <Link href="/events">
              <Button
                type="primary"
                size="large"
                icon={<ShoppingOutlined />}
                className="font-bold"
              >
                Đặt vé ngay
              </Button>
            </Link>
          )}
        </div>
      }
    />
  );

  /**
   * ============================================
   * RENDER PAGE
   * ============================================
   */
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2 flex items-center gap-3">
                <FileProtectOutlined />
                Vé của tôi
              </h1>
              <p className="text-gray-600 text-lg">
                Xin chào <strong>{user?.fullName}</strong>, bạn có{' '}
                <strong className="text-blue-600">{tickets.length}</strong> vé
              </p>
            </div>

            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
              size="large"
            >
              Làm mới
            </Button>
          </div>

          {/* INFO ALERT */}
          <Alert
            title="💡 QR Code được tạo trên thiết bị của bạn"
            description="Tiết kiệm băng thông, hoạt động offline, bảo mật tuyệt đối"
            type="info"
            showIcon
            closable
            className="mb-6"
          />
        </div>

        {/* TABS FILTERING */}
        <Tabs
          defaultActiveKey="upcoming"
          size="large"
          className="my-tickets-tabs"
          items={[
            {
              key: 'upcoming',
              label: (
                <span className="flex items-center gap-2 font-bold">
                  <CalendarOutlined />
                  Sắp tới ({upcomingTickets.length})
                </span>
              ),
              children: upcomingTickets.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 max-w-5xl mx-auto">
                  {upcomingTickets.map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} />
                  ))}
                </div>
              ) : (
                <EmptyState message="Không có vé Upcoming" />
              ),
            },
            {
              key: 'past',
              label: (
                <span className="flex items-center gap-2 font-bold">
                  <HistoryOutlined />
                  Đã qua / Đã dùng ({pastTickets.length})
                </span>
              ),
              children: pastTickets.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 max-w-5xl mx-auto">
                  {pastTickets.map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} />
                  ))}
                </div>
              ) : (
                <EmptyState message="Không có vé Past" />
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
