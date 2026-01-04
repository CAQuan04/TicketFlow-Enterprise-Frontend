/**
 * ============================================
 * QR CODE MODAL - F7.2 SPEC (HIGH CONTRAST)
 * ============================================
 * 
 * Modal hiển thị QR Code với high contrast để check-in
 * 
 * SECURITY NOTE:
 * ==============
 * ⚠️ Only the ticketCode is encoded in the QR.
 * ⚠️ No PII (Personally Identifiable Information) is stored in the QR.
 * ⚠️ Backend validates the ticketCode on scan.
 * 
 * WHY WHITE BACKGROUND IS CRITICAL:
 * ==================================
 * ❌ Dark Mode apps: Nền tối + QR tối = Máy quét KHÔNG đọc được
 * ✅ Bắt buộc WHITE background: QR scanners yêu cầu high contrast
 * 
 * VISUAL FEEDBACK:
 * ================
 * - Active tickets: Full opacity (100%), QR rõ nét
 * - Used tickets: 50% opacity, chỉ để tham khảo
 * - Cancelled tickets: 50% opacity, invalid warning
 * 
 * WHY GENERATE QR ON FRONTEND:
 * ============================
 * Backend PNG:
 *  - 50KB per request
 *  - CPU intensive
 *  - No offline support
 * 
 * Frontend SVG:
 *  - ticketCode = ~50 bytes
 *  - 0 server load
 *  - PWA-ready (offline mode)
 *  - Scales infinitely
 */

'use client';

import React from 'react';
import { Modal, Tag } from 'antd';
import QRCode from 'react-qr-code';
import {
  CloseOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { TicketDto, TicketStatus } from '@/types';

interface QrModalProps {
  /**
   * Full ticket object containing ticketCode, eventName, and status
   */
  ticket: TicketDto | null;

  /**
   * Modal visibility state
   */
  isOpen: boolean;

  /**
   * Close handler
   */
  onClose: () => void;
}

export default function QrModal({ ticket, isOpen, onClose }: QrModalProps) {
  // Guard: No ticket
  if (!ticket) return null;

  /**
   * Get Status Badge Config
   */
  const getStatusConfig = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.Active:
        return {
          color: 'success',
          icon: <CheckCircleOutlined />,
          text: 'READY TO USE',
          textVi: 'SẴN SÀNG SỬ DỤNG',
        };
      case TicketStatus.Used:
        return {
          color: 'default',
          icon: <ClockCircleOutlined />,
          text: 'ALREADY CHECKED-IN',
          textVi: 'ĐÃ CHECK-IN',
        };
      case TicketStatus.Cancelled:
        return {
          color: 'error',
          icon: <CloseCircleOutlined />,
          text: 'INVALID',
          textVi: 'KHÔNG HỢP LỆ',
        };
      default:
        return {
          color: 'default',
          icon: null,
          text: status,
          textVi: status,
        };
    }
  };

  const statusConfig = getStatusConfig(ticket.status);
  const isUsedOrCancelled =
    ticket.status === TicketStatus.Used || ticket.status === TicketStatus.Cancelled;

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={550}
      closeIcon={<CloseOutlined />}
      className="qr-modal"
    >
      <div className="py-6 px-4">
        {/* TITLE: Event Name */}
        <h2 className="text-2xl font-bold text-gray-900 mb-1 text-center">
          {ticket.eventName}
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Ticket QR Code
        </p>

        {/* Centered Flex Column */}
        <div className="flex flex-col items-center gap-6">
          {/* STATUS BADGE */}
          <Tag
            color={statusConfig.color}
            icon={statusConfig.icon}
            className="text-base font-bold px-4 py-2"
            style={{ fontSize: '16px' }}
          >
            {statusConfig.textVi}
          </Tag>

          {/* QR CONTAINER - CRITICAL: WHITE BACKGROUND */}
          <div
            className="p-6 rounded-2xl border-4 border-gray-300 shadow-lg"
            style={{
              backgroundColor: '#FFFFFF', // MUST BE WHITE (Dark Mode compatible)
            }}
          >
            {/* QR Code Generation */}
            <div
              style={{
                opacity: isUsedOrCancelled ? 0.5 : 1, // 50% opacity for Used/Cancelled
                transition: 'opacity 0.3s ease',
              }}
            >
              {/* 
                SECURITY: Only ticketCode is encoded.
                No PII (user info, email, phone) is in the QR.
                Backend validates ticketCode on scan.
              */}
              <QRCode
                value={ticket.ticketCode}
                size={256}
                level="H" // High error correction (30% redundancy)
                bgColor="#FFFFFF" // White background (essential for scanners)
                fgColor="#000000" // Black foreground
              />
            </div>
          </div>

          {/* TICKET CODE: Monospace Display */}
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
              Ticket Code
            </div>
            <div
              className="text-xl font-mono tracking-widest font-bold text-gray-900 bg-gray-100 px-4 py-2 rounded-lg border border-gray-300"
              style={{
                letterSpacing: '0.15em',
              }}
            >
              {ticket.ticketCode}
            </div>
            <div className="text-xs text-gray-400 mt-2">
              (Để nhập thủ công nếu cần)
            </div>
          </div>

          {/* HELPER TEXT: Brightness Tip */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 w-full">
            <div className="flex items-start gap-2">
              <BulbOutlined className="text-yellow-600 text-lg mt-0.5" />
              <div className="flex-1 text-sm text-yellow-800">
                <strong>Mẹo quét nhanh:</strong> Tăng độ sáng màn hình lên 100% để
                máy quét đọc mã QR nhanh hơn.
              </div>
            </div>
          </div>

          {/* Warning for Used/Cancelled Tickets */}
          {isUsedOrCancelled && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 w-full">
              <div className="text-sm text-red-800 text-center">
                {ticket.status === TicketStatus.Used
                  ? '⚠️ Vé này đã được sử dụng. Không thể check-in lại.'
                  : '⚠️ Vé này đã bị hủy. Vui lòng liên hệ BTC.'}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
