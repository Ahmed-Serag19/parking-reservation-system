// API Types for Parking Reservation System

export interface User {
  id: string;
  username: string;
  role: "admin" | "employee";
  name?: string;
  email?: string;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  rateNormal: number;
  rateSpecial: number;
}

export interface Zone {
  id: string;
  name: string;
  categoryId: string;
  gateIds: string[];
  totalSlots: number;
  occupied: number;
  free: number;
  reserved: number;
  availableForVisitors: number;
  availableForSubscribers: number;
  rateNormal: number;
  rateSpecial: number;
  open: boolean;
}

// Parking state report returns zones with different field names
export interface ParkingStateZone {
  zoneId: string;
  name: string;
  totalSlots: number;
  occupied: number;
  free: number;
  reserved: number;
  availableForVisitors: number;
  availableForSubscribers: number;
  subscriberCount: number;
  open: boolean;
}

export interface Gate {
  id: string;
  name: string;
  zoneIds: string[];
  location: string;
}

export interface Ticket {
  id: string;
  type: "visitor" | "subscriber";
  zoneId: string;
  gateId: string;
  checkinAt: string;
  subscriptionId?: string;
}

export interface CheckinRequest {
  gateId: string;
  zoneId: string;
  type: "visitor" | "subscriber";
  subscriptionId?: string;
}

export interface CheckoutRequest {
  ticketId: string;
  forceConvertToVisitor?: boolean;
}

export interface CheckoutResponse {
  ticketId: string;
  checkinAt: string;
  checkoutAt: string;
  durationHours: number;
  breakdown: BreakdownSegment[];
  amount: number;
  zoneState: Zone;
}

export interface BreakdownSegment {
  from: string;
  to: string;
  hours: number;
  rateMode: "normal" | "special";
  rate: number;
  amount: number;
}

export interface Subscription {
  id: string;
  userName: string;
  active: boolean;
  category: string;
  cars: Car[];
  startsAt: string;
  expiresAt: string;
  currentCheckins: TicketCheckin[];
}

export interface Car {
  plate: string;
  brand: string;
  model: string;
  color: string;
}

export interface TicketCheckin {
  ticketId: string;
  zoneId: string;
  checkinAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// Employee Management
export interface CreateEmployeeRequest {
  username: string;
  password: string;
  name?: string;
  email?: string;
  role: "admin" | "employee";
}

export interface CreateEmployeeResponse {
  user: User;
  message: string;
}

// Category request/response types
export interface CreateCategoryRequest {
  name: string;
  description: string;
  rateNormal: number;
  rateSpecial: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  rateNormal?: number;
  rateSpecial?: number;
}

export interface ApiError {
  status: string;
  message: string;
  errors?: Record<string, string[]>;
}

// WebSocket Message Types
export interface WSMessage {
  type: "zone-update" | "admin-update";
  payload: any;
}

export interface ZoneUpdateMessage {
  type: "zone-update";
  payload: Zone;
}

export interface AdminUpdateMessage {
  type: "admin-update";
  payload: {
    adminId: string;
    action: string;
    targetType: string;
    targetId: string;
    details?: any;
    timestamp: string;
  };
}
