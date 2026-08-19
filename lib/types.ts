export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no_show";

export type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number | null;
};

export type AdminBooking = {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  serviceDurationMinutes: number;
  servicePrice: number | null;
  scheduledAt: string;
  status: BookingStatus;
};

export type AdminCustomer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  totalBookings: number;
  noShowCount: number;
  lastBookingAt: string | null;
};
