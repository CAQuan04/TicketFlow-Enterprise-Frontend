/**
 * Order & Payment DTOs
 * Mapped từ Backend: TicketBooking.Application.Features.Orders & Payments
 */

// Order Creation
export interface CreateOrderRequest {
  eventId: string;
  items: OrderTicketItem[];  // ✅ Backend expect 'items' (camelCase - viết thường chữ i)
  paymentMethod: PaymentMethod;
  useWallet?: boolean;
  walletAmount?: number;
}

export interface OrderTicketItem {
  ticketTypeId: string;
  quantity: number;
  seatIds?: string[]; // Optional: cho seated events
}

// Order Response
export interface OrderDto {
  orderId: string;
  orderNumber: string;
  userId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  venueId: string;
  venueName: string;
  status: OrderStatus;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  walletAmountUsed: number;
  tickets: OrderTicketDto[];
  paymentId?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string; // Thời gian hết hạn giữ chỗ
}

export interface OrderTicketDto {
  ticketId: string;
  ticketNumber: string;
  ticketTypeId: string;
  ticketTypeName: string;
  price: number;
  seatNumber?: string;
  qrCode?: string;
  status: TicketStatus;
  checkInTime?: string;
}

// Order Status
export enum OrderStatus {
  Pending = "Pending",
  Confirmed = "Confirmed",
  Processing = "Processing",
  Completed = "Completed",
  Cancelled = "Cancelled",
  Expired = "Expired"
}

export enum TicketStatus {
  Active = "Active",
  Used = "Used",
  Cancelled = "Cancelled",
  Expired = "Expired"
}

// Payment
export enum PaymentMethod {
  VNPay = "VNPay",
  Momo = "Momo",
  ZaloPay = "ZaloPay",
  Wallet = "Wallet",
  BankTransfer = "BankTransfer"
}

export enum PaymentStatus {
  Pending = "Pending",
  Processing = "Processing",
  Completed = "Completed",
  Failed = "Failed",
  Refunded = "Refunded"
}

export interface PaymentDto {
  paymentId: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paymentUrl?: string;
  createdAt: string;
  completedAt?: string;
}

/**
 * VNPay Payment Response Types
 */
export interface PaymentUrlResponse {
  paymentUrl: string; // VNPay URL trả về từ Backend
}

export interface VnPayIpnResponse {
  rspCode: string;   // Response code từ VNPay (00 = success)
  message: string;    // Message mô tả kết quả
  orderId?: string;   // Order ID nếu thành công
  amount?: number;    // Số tiền đã thanh toán
  transactionId?: string; // Transaction ID từ VNPay
}

// Wallet
export interface WalletDto {
  walletId: string;
  userId: string;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransactionDto {
  transactionId: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
  referenceId?: string;
  createdAt: string;
}

export enum TransactionType {
  Deposit = "Deposit",
  Withdrawal = "Withdrawal",
  Payment = "Payment",
  Refund = "Refund",
  Reward = "Reward"
}
