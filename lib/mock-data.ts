export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
};

export type Booking = {
  id: string;
  customerId: string;
  serviceId: string;
  scheduledAt: string; // ISO-ish local timestamp, e.g. 2026-08-18T10:00
  status: BookingStatus;
};

export const SHOP_NAME = "뷰티 스튜디오";

// GET /api/services
export const SERVICES: Service[] = [
  { id: "s1", name: "상담 30분", durationMinutes: 30, price: 30 },
  { id: "s2", name: "시술 60분", durationMinutes: 60, price: 60 },
  { id: "s3", name: "재방문 상담 20분", durationMinutes: 20, price: 20 },
];

export const CUSTOMERS: Customer[] = [
  { id: "c1", name: "김서연", phone: "010-2841-7702", email: "seoyeon@example.com" },
  { id: "c2", name: "박준호", phone: "010-3320-1188", email: "junho@example.com" },
  { id: "c3", name: "이하늘", phone: "010-7712-9034", email: null },
  { id: "c4", name: "최민석", phone: "010-4409-2216", email: "minseok@example.com" },
  { id: "c5", name: "정유진", phone: "010-8871-3345", email: null },
  { id: "c6", name: "한지우", phone: "010-2204-6689", email: "jiwoo@example.com" },
  { id: "c7", name: "문가영", phone: "010-9982-4471", email: null },
  { id: "c8", name: "배성우", phone: "010-1157-8830", email: "sungwoo@example.com" },
  { id: "c9", name: "오세훈", phone: "010-6650-1123", email: null },
  { id: "c10", name: "신아름", phone: "010-3345-7719", email: null },
];

// GET /api/admin/bookings
export const BOOKINGS: Booking[] = [
  { id: "bk_7a21", customerId: "c1", serviceId: "s2", scheduledAt: "2026-08-18T10:00", status: "pending" },
  { id: "bk_9c04", customerId: "c2", serviceId: "s1", scheduledAt: "2026-08-18T11:00", status: "pending" },
  { id: "bk_2f88", customerId: "c3", serviceId: "s3", scheduledAt: "2026-08-18T13:20", status: "confirmed" },
  { id: "bk_5d13", customerId: "c4", serviceId: "s2", scheduledAt: "2026-08-18T14:00", status: "confirmed" },
  { id: "bk_1b70", customerId: "c5", serviceId: "s1", scheduledAt: "2026-08-18T15:30", status: "pending" },
  { id: "bk_8e35", customerId: "c6", serviceId: "s3", scheduledAt: "2026-08-18T16:40", status: "confirmed" },
  { id: "bk_4a92", customerId: "c9", serviceId: "s1", scheduledAt: "2026-08-17T10:30", status: "completed" },
  { id: "bk_6c47", customerId: "c1", serviceId: "s1", scheduledAt: "2026-08-17T14:00", status: "completed" },
  { id: "bk_3f19", customerId: "c7", serviceId: "s2", scheduledAt: "2026-08-17T15:00", status: "no_show" },
  { id: "bk_0d63", customerId: "c8", serviceId: "s3", scheduledAt: "2026-08-16T11:20", status: "completed" },
  { id: "bk_5b08", customerId: "c2", serviceId: "s2", scheduledAt: "2026-08-16T13:00", status: "cancelled" },
  { id: "bk_7e56", customerId: "c10", serviceId: "s1", scheduledAt: "2026-08-15T16:00", status: "no_show" },
  { id: "bk_2c30", customerId: "c3", serviceId: "s2", scheduledAt: "2026-08-15T10:00", status: "completed" },
  { id: "bk_9a11", customerId: "c6", serviceId: "s1", scheduledAt: "2026-08-04T15:00", status: "completed" },
  { id: "bk_8b22", customerId: "c7", serviceId: "s1", scheduledAt: "2026-08-02T11:30", status: "no_show" },
  { id: "bk_7c33", customerId: "c1", serviceId: "s1", scheduledAt: "2026-07-29T11:00", status: "completed" },
  { id: "bk_6d44", customerId: "c4", serviceId: "s2", scheduledAt: "2026-07-30T14:00", status: "no_show" },
  { id: "bk_5e55", customerId: "c2", serviceId: "s1", scheduledAt: "2026-07-21T10:30", status: "completed" },
  { id: "bk_4f66", customerId: "c7", serviceId: "s1", scheduledAt: "2026-07-14T11:30", status: "completed" },
  { id: "bk_3a77", customerId: "c1", serviceId: "s3", scheduledAt: "2026-07-08T16:00", status: "completed" },
];

/** Fixed "today" for the seeded demo data (keeps stats/labels deterministic). */
export const TODAY_ISO = "2026-08-18";

export function getService(serviceId: string): Service {
  const service = SERVICES.find((s) => s.id === serviceId);
  if (!service) throw new Error(`Unknown service: ${serviceId}`);
  return service;
}

export function getCustomer(customerId: string): Customer {
  const customer = CUSTOMERS.find((c) => c.id === customerId);
  if (!customer) throw new Error(`Unknown customer: ${customerId}`);
  return customer;
}
