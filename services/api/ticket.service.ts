/**
 * ============================================
 * TICKET SERVICE (F7 - Real Integration)
 * ============================================
 * 
 * Service layer để fetch và quản lý tickets của user
 * 
 * Backend API: GET /tickets/mine
 * Response: Array<TicketDto> (already flattened by backend)
 */

import { axiosClient } from '@/lib/axios-client';
import { TicketDto, ApiResponse } from '@/types';

const TICKET_ENDPOINTS = {
  MY_TICKETS: '/tickets/mine',
  TICKET_DETAIL: (id: string) => `/tickets/${id}`,
};

export const ticketService = {
  /**
   * Get My Tickets (Real API Integration)
   * 
   * @returns Promise<TicketDto[]> - Flat list of tickets
   */
  async getMyTickets(): Promise<TicketDto[]> {
    try {
      console.log('📡 Fetching tickets from API: GET', TICKET_ENDPOINTS.MY_TICKETS);
      
      const response = await axiosClient.get<ApiResponse<TicketDto[]>>(
        TICKET_ENDPOINTS.MY_TICKETS
      );

      console.log('✅ Tickets fetched:', response.data);

      const data = response.data.data || response.data;

      if (!Array.isArray(data)) {
        console.warn('⚠️ Unexpected response format:', data);
        return [];
      }

      return data as TicketDto[];
    } catch (error: unknown) {
      console.error('❌ Failed to fetch tickets:', error);
      
      // Type guard for Axios error
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number; data: unknown } };
        console.error('API Error:', {
          status: axiosError.response.status,
          data: axiosError.response.data,
        });
      }

      throw error;
    }
  },

  /**
   * Get Ticket by ID
   */
  async getTicketById(ticketId: string): Promise<TicketDto> {
    const response = await axiosClient.get<ApiResponse<TicketDto>>(
      TICKET_ENDPOINTS.TICKET_DETAIL(ticketId)
    );

    return response.data.data || (response.data as unknown as TicketDto);
  },

  /**
   * Filter tickets by status (client-side)
   */
  filterByStatus(tickets: TicketDto[], status: string): TicketDto[] {
    if (status === 'All' || !status) return tickets;
    return tickets.filter(t => t.status === status);
  },

  /**
   * Sort tickets by date (client-side)
   */
  sortByDate(tickets: TicketDto[], order: 'asc' | 'desc' = 'desc'): TicketDto[] {
    return [...tickets].sort((a, b) => {
      const dateA = new Date(a.startDateTime).getTime();
      const dateB = new Date(b.startDateTime).getTime();
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    });
  },
};
