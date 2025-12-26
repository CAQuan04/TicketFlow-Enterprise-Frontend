/**
 * Venue DTOs
 * Mapped từ Backend: TicketBooking.Application.Features.Venues
 */

export interface VenueDto {
  venueId: string;
  name: string;
  address: string;
  city: string;
  country: string;
  capacity: number;
  description?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  facilities: string[];
  contactEmail?: string;
  contactPhone?: string;
}

export interface CreateVenueRequest {
  name: string;
  address: string;
  city: string;
  country: string;
  capacity: number;
  description?: string;
  imageFile?: File;
  latitude?: number;
  longitude?: number;
  facilities?: string[];
  contactEmail?: string;
  contactPhone?: string;
}

export interface SeatMapDto {
  venueId: string;
  sections: SeatSection[];
}

export interface SeatSection {
  sectionId: string;
  name: string;
  rows: SeatRow[];
}

export interface SeatRow {
  rowId: string;
  rowNumber: string;
  seats: Seat[];
}

export interface Seat {
  seatId: string;
  seatNumber: string;
  isAvailable: boolean;
  isReserved: boolean;
  price: number;
  ticketTypeId?: string;
}
