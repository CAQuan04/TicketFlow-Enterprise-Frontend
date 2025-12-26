import * as signalR from '@microsoft/signalr';

/**
 * SignalR Connection Manager (Singleton Pattern)
 * 
 * Kết nối với NotificationHub từ Backend .NET
 * Xử lý:
 * - Auto-reconnect khi mất kết nối
 * - JWT Authentication
 * - Event listeners cho realtime notifications
 */

export type NotificationEventType =
  | 'OrderConfirmed'
  | 'OrderCancelled'
  | 'TicketCheckedIn'
  | 'PaymentCompleted'
  | 'PaymentFailed'
  | 'EventUpdated'
  | 'EventCancelled';

export interface SignalRNotification {
  type: NotificationEventType;
  title: string;
  message: string;
  data?: any;
  timestamp: string;
}

class SignalRConnection {
  private connection: signalR.HubConnection | null = null;
  private listeners: Map<string, Set<(notification: SignalRNotification) => void>> = new Map();
  private isConnecting = false;

  /**
   * Khởi tạo kết nối với Hub
   * Tự động gắn JWT token vào query string
   */
  public async connect(token?: string): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log('[SignalR] Already connected');
      return;
    }

    if (this.isConnecting) {
      console.log('[SignalR] Connection in progress...');
      return;
    }

    this.isConnecting = true;

    try {
      // Lấy token từ localStorage nếu không được truyền vào
      const authToken = token || this.getToken();

      if (!authToken) {
        console.warn('[SignalR] No token found, skipping connection');
        this.isConnecting = false;
        return;
      }

      // Tạo connection với JWT token
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${process.env.NEXT_PUBLIC_HUB_URL}`, {
          accessTokenFactory: () => authToken,
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Exponential backoff: 0s, 2s, 10s, 30s
            if (retryContext.elapsedMilliseconds < 60000) {
              return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
            } else {
              return null; // Stop reconnecting after 1 minute
            }
          },
        })
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Setup event handlers
      this.setupEventHandlers();

      // Start connection
      await this.connection.start();
      console.log('[SignalR] Connected successfully');
    } catch (error) {
      console.error('[SignalR] Connection failed:', error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Đóng kết nối
   */
  public async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      console.log('[SignalR] Disconnected');
    }
  }

  /**
   * Subscribe to notification events
   * @param eventType - Loại event cần lắng nghe
   * @param callback - Function xử lý khi nhận notification
   * @returns Unsubscribe function
   */
  public on(
    eventType: NotificationEventType | 'all',
    callback: (notification: SignalRNotification) => void
  ): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(eventType);
      if (eventListeners) {
        eventListeners.delete(callback);
      }
    };
  }

  /**
   * Invoke server method (gửi message lên server)
   */
  public async invoke(methodName: string, ...args: any[]): Promise<any> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR connection is not established');
    }

    return await this.connection.invoke(methodName, ...args);
  }

  /**
   * Get connection state
   */
  public getState(): signalR.HubConnectionState | null {
    return this.connection?.state || null;
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  // ====== Private Methods ======

  private setupEventHandlers() {
    if (!this.connection) return;

    // Lắng nghe event "ReceiveNotification" từ Backend Hub
    this.connection.on('ReceiveNotification', (notification: SignalRNotification) => {
      console.log('[SignalR] Notification received:', notification);

      // Trigger callbacks cho event type cụ thể
      const typeListeners = this.listeners.get(notification.type);
      if (typeListeners) {
        typeListeners.forEach((callback) => callback(notification));
      }

      // Trigger callbacks cho 'all' events
      const allListeners = this.listeners.get('all');
      if (allListeners) {
        allListeners.forEach((callback) => callback(notification));
      }
    });

    // Reconnecting event
    this.connection.onreconnecting((error) => {
      console.warn('[SignalR] Reconnecting...', error);
    });

    // Reconnected event
    this.connection.onreconnected((connectionId) => {
      console.log('[SignalR] Reconnected with ID:', connectionId);
    });

    // Close event
    this.connection.onclose((error) => {
      console.error('[SignalR] Connection closed', error);
    });
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }
}

// Export singleton instance
export const signalRConnection = new SignalRConnection();

// Hook để sử dụng trong React components
export { signalR };
