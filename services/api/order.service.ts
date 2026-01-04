import { axiosClient } from '@/lib/axios-client';
import {
  CreateOrderRequest,
  OrderDto,
  PaymentDto,
  WalletDto,
  WalletTransactionDto,
  PaginatedResponse,
  ApiResponse,
  PaymentUrlResponse,
  VnPayIpnResponse,
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
  PAY_WITH_WALLET: (orderId: string) => `/orders/${orderId}/pay`, // Wallet payment
  VNPAY_DEPOSIT: '/payments/deposit', // VNPay deposit
};

const WALLET_ENDPOINTS = {
  MY_WALLET: '/wallets/balance', // ✅ Endpoint chuẩn Backend Day 6
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
    
    console.log('🔍 createOrder response:', response.data);
    
    // Backend có thể trả về nhiều format
    const orderData = response.data.data || response.data;
    
    if (!orderData || typeof orderData !== 'object') {
      console.error('❌ Invalid order response:', response.data);
      throw new Error('Invalid order response format');
    }
    
    console.log('✅ Parsed order:', orderData);
    return orderData as OrderDto;
  },

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<OrderDto> {
    const response = await axiosClient.get<ApiResponse<OrderDto>>(
      ORDER_ENDPOINTS.ORDER_DETAIL(orderId)
    );
    console.log('🔍 getOrderById response:', response.data);
    
    // Backend có thể trả về response.data hoặc response.data.data
    const orderData = response.data.data || response.data;
    
    if (!orderData || typeof orderData !== 'object') {
      throw new Error('Invalid order response format');
    }
    
    return orderData as OrderDto;
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
   * Pay order with wallet
   * 
   * POST /api/orders/{orderId}/pay
   * 
   * Backend returns: { message: "Payment successful. Ticket has been sent to your email." }
   * 
   * @param orderId - Order ID
   * @returns void (success means payment completed)
   */
  async payWithWallet(orderId: string): Promise<void> {
    await axiosClient.post(
      PAYMENT_ENDPOINTS.PAY_WITH_WALLET(orderId)
    );
    console.log('✅ Wallet payment API call successful');
  },

  /**
   * Initiate VNPay deposit
   * 
   * POST /api/payments/deposit
   * 
   * @param amount - Amount to deposit (VND)
   * @returns VNPay payment URL
   */
  async initiateVNPayDeposit(amount: number): Promise<{ paymentUrl: string }> {
    const response = await axiosClient.post<ApiResponse<{ paymentUrl: string }>>(
      PAYMENT_ENDPOINTS.VNPAY_DEPOSIT,
      { amount }
    );
    return response.data.data!;
  },

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

  /**
   * ====================================================================
   * VNPAY DEPOSIT FLOW (F6.1 Implementation)
   * ====================================================================
   * 
   * Create VNPay Deposit Link
   * 
   * Flow: User muốn nạp tiền vào ví → Gọi API này → Nhận VNPay URL → Redirect
   * 
   * POST /api/payments/deposit
   * Body: { amount: number }
   * 
   * @param amount - Số tiền muốn nạp (VND)
   * @returns VNPay payment URL (full URL to redirect user)
   * 
   * FRONTEND REDIRECT PATTERN:
   * 1. Frontend gọi API Backend: POST /payments/deposit { amount }
   * 2. Backend tạo VNPay request với returnUrl = Frontend URL (http://localhost:3000/payment/callback)
   * 3. Backend trả về VNPay URL cho Frontend
   * 4. Frontend redirect user đến VNPay URL
   * 5. User thanh toán trên VNPay gateway
   * 6. VNPay redirect về Frontend URL (returnUrl)
   * 7. Frontend parse query params từ VNPay
   * 8. Frontend gọi API Backend: GET /payments/callback với query params
   * 9. Backend verify signature và update database
   * 10. Frontend hiển thị kết quả cho user
   * 
   * TẠI SAO VNPAY REDIRECT VỀ FRONTEND THAY VÌ BACKEND?
   * - VNPay chỉ hỗ trợ HTTP redirect (browser), không phải API callback
   * - Nếu redirect về Backend API → User sẽ thấy JSON response thay vì UI
   * - Frontend URL (localhost:3000) là nơi user đang tương tác → UX tốt hơn
   * - Frontend đóng vai trò "bridge": Nhận redirect → Parse params → Call Backend API
   * - Backend API chỉ xử lý verification logic (stateless)
   */
  async createDepositLink(amount: number): Promise<string> {
    try {
      const response = await axiosClient.post<ApiResponse<PaymentUrlResponse>>(
        PAYMENT_ENDPOINTS.VNPAY_DEPOSIT,
        { amount }
      );
      
      console.log('🔍 createDepositLink response:', response.data);
      
      // Backend có thể trả về nhiều format:
      // 1. { data: { paymentUrl: "..." } } hoặc { data: { url: "..." } }
      // 2. { paymentUrl: "..." } hoặc { url: "..." }
      // 3. String trực tiếp (nếu Backend trả plain text)
      
      const data = response.data.data || response.data;
      
      // Backend thực tế trả về 'url', không phải 'paymentUrl'
      const paymentUrl = typeof data === 'string' 
        ? data 
        : (data as any)?.url || (data as PaymentUrlResponse)?.paymentUrl;
      
      if (!paymentUrl || typeof paymentUrl !== 'string') {
        console.error('❌ Invalid response format:', response.data);
        throw new Error('VNPay payment URL not found in response');
      }
      
      console.log('✅ VNPay payment URL:', paymentUrl);
      return paymentUrl;
    } catch (error: any) {
      console.error('❌ Create VNPay deposit link failed:', error);
      throw error;
    }
  },

  /**
   * Verify VNPay Return (Callback)
   * 
   * Được gọi từ Payment Callback Page sau khi VNPay redirect về Frontend
   * 
   * Flow:
   * 1. User hoàn thành thanh toán trên VNPay
   * 2. VNPay redirect về: http://localhost:3000/payment/callback?vnp_Amount=5000000&vnp_ResponseCode=00&...
   * 3. Frontend page parse URLSearchParams
   * 4. Gọi method này để verify với Backend
   * 5. Backend kiểm tra signature và update wallet balance
   * 6. Trả về kết quả cho Frontend hiển thị
   * 
   * GET /api/payments/callback?vnp_Amount=...&vnp_ResponseCode=...&vnp_SecureHash=...
   * 
   * @param queryParams - URLSearchParams từ VNPay redirect
   * @returns VnPayIpnResponse với rspCode và message
   * 
   * Response Codes:
   * - "00": Thành công
   * - "24": User hủy giao dịch
   * - "07": Trừ tiền thành công nhưng giao dịch nghi vấn (timeout)
   * - Other: Lỗi khác
   */
  async verifyVnPayReturn(queryParams: URLSearchParams): Promise<VnPayIpnResponse> {
    try {
      // Convert URLSearchParams to plain object
      const params: Record<string, string> = {};
      queryParams.forEach((value, key) => {
        params[key] = value;
      });
      
      console.log('🔍 Verifying VNPay callback with params:', params);
      
      // Gọi Backend API với query params
      const response = await axiosClient.get<ApiResponse<VnPayIpnResponse>>(
        PAYMENT_ENDPOINTS.PAYMENT_CALLBACK,
        { params }
      );
      
      const result = response.data.data;
      
      if (!result) {
        throw new Error('VNPay verification response is empty');
      }
      
      console.log('✅ VNPay verification result:', result);
      
      return result;
    } catch (error: any) {
      console.error('❌ VNPay verification failed:', error);
      
      // Trả về error response thay vì throw để Frontend có thể handle UI
      return {
        rspCode: '99',
        message: error?.response?.data?.message || 'Xác thực thanh toán thất bại. Vui lòng liên hệ support.',
      };
    }
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
    console.log('🔍 getMyWallet response:', response.data);
    
    // Backend có thể trả về số, object, hoặc { data: object }
    const walletData = response.data.data || response.data;
    
    // Nếu là số thuần, convert thành WalletDto format
    if (typeof walletData === 'number') {
      return { balance: walletData } as WalletDto;
    }
    
    // Nếu là object, return luôn
    if (walletData && typeof walletData === 'object') {
      return walletData as WalletDto;
    }
    
    // Fallback: Trả về balance = 0
    return { balance: 0 } as WalletDto;
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
