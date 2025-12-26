import { axiosClient } from '@/lib/axios-client';
import {
  CreateOrderRequest,
  OrderDto,
  PaymentDto,
  WalletDto,
  WalletTransactionDto,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

/**
 * Order Service
 * Xử lý tất cả API calls liên quan đến orders và payments
 */

const ORDER_ENDPOINTS = {
  ORDERS: '/orders',
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
  MY_ORDERS: '/orders/my-orders',
  CANCEL_ORDER: (id: string) => `/orders/${id}/cancel`,
};

const PAYMENT_ENDPOINTS = {
  PAYMENT_DETAIL: (id: string) => `/payments/${id}`,
  PAYMENT_CALLBACK: '/payments/callback',
  PAYMENT_STATUS: (id: string) => `/payments/${id}/status`,
};

const WALLET_ENDPOINTS = {
  MY_WALLET: '/wallets/my-wallet',
  TRANSACTIONS: '/wallets/transactions',
  DEPOSIT: '/wallets/deposit',
  WITHDRAW: '/wallets/withdraw',
};

export const orderService = {
  /**
   * Create new order
   */
  async createOrder(data: CreateOrderRequest): Promise<OrderDto> {
    const response = await axiosClient.post<ApiResponse<OrderDto>>(
      ORDER_ENDPOINTS.ORDERS,
      data
    );
    return response.data.data!;
  },

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<OrderDto> {
    const response = await axiosClient.get<ApiResponse<OrderDto>>(
      ORDER_ENDPOINTS.ORDER_DETAIL(orderId)
    );
    return response.data.data!;
  },

  /**
   * Get my orders
   */
  async getMyOrders(
    pageNumber?: number,
    pageSize?: number
  ): Promise<PaginatedResponse<OrderDto>> {
    const response = await axiosClient.get<ApiResponse<PaginatedResponse<OrderDto>>>(
      ORDER_ENDPOINTS.MY_ORDERS,
      { params: { pageNumber, pageSize } }
    );
    return response.data.data!;
  },

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string): Promise<void> {
    await axiosClient.post(ORDER_ENDPOINTS.CANCEL_ORDER(orderId));
  },
};

export const paymentService = {
  /**
   * Get payment detail
   */
  async getPaymentById(paymentId: string): Promise<PaymentDto> {
    const response = await axiosClient.get<ApiResponse<PaymentDto>>(
      PAYMENT_ENDPOINTS.PAYMENT_DETAIL(paymentId)
    );
    return response.data.data!;
  },

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentDto> {
    const response = await axiosClient.get<ApiResponse<PaymentDto>>(
      PAYMENT_ENDPOINTS.PAYMENT_STATUS(paymentId)
    );
    return response.data.data!;
  },
};

export const walletService = {
  /**
   * Get my wallet
   */
  async getMyWallet(): Promise<WalletDto> {
    const response = await axiosClient.get<ApiResponse<WalletDto>>(
      WALLET_ENDPOINTS.MY_WALLET
    );
    return response.data.data!;
  },

  /**
   * Get wallet transactions
   */
  async getTransactions(
    pageNumber?: number,
    pageSize?: number
  ): Promise<PaginatedResponse<WalletTransactionDto>> {
    const response = await axiosClient.get<
      ApiResponse<PaginatedResponse<WalletTransactionDto>>
    >(WALLET_ENDPOINTS.TRANSACTIONS, {
      params: { pageNumber, pageSize },
    });
    return response.data.data!;
  },

  /**
   * Deposit to wallet
   */
  async deposit(amount: number): Promise<any> {
    const response = await axiosClient.post<ApiResponse<any>>(WALLET_ENDPOINTS.DEPOSIT, {
      amount,
    });
    return response.data.data!;
  },
};
