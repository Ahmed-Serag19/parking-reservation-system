// API Service Layer for Parking Reservation System

import type {
  LoginRequest,
  LoginResponse,
  Zone,
  Gate,
  Subscription,
  CheckinRequest,
  Ticket,
  CheckoutRequest,
  CheckoutResponse,
  User,
  CreateEmployeeRequest,
  CreateEmployeeResponse,
  ParkingStateZone,
  Category,
  RushHour,
  Vacation,
} from "../types/api";

const API_BASE_URL = "http://localhost:3000/api/v1";

class ApiError extends Error {
  public status: number;
  public errors?: Record<string, string[]>;

  constructor(
    status: number,
    message: string,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

class ApiService {
  private getAuthToken(): string | null {
    return sessionStorage.getItem("auth_token");
  }

  private getAuthHeaders(): HeadersInit {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          status: "error",
          message: "Network error occurred",
        }));

        throw new ApiError(
          response.status,
          errorData.message || "Request failed",
          errorData.errors
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(0, "Network error occurred");
    }
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  // Master Data (Public)
  async getGates(): Promise<Gate[]> {
    return this.request<Gate[]>("/master/gates");
  }

  async getZones(gateId?: string): Promise<Zone[]> {
    const queryParams = gateId ? `?gateId=${gateId}` : "";
    return this.request<Zone[]>(`/master/zones${queryParams}`);
  }

  // Subscriptions
  async getSubscription(id: string): Promise<Subscription> {
    return this.request<Subscription>(`/subscriptions/${id}`);
  }

  // Tickets
  async checkin(
    data: CheckinRequest
  ): Promise<{ ticket: Ticket; zoneState: Zone }> {
    return this.request<{ ticket: Ticket; zoneState: Zone }>(
      "/tickets/checkin",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async checkout(data: CheckoutRequest): Promise<CheckoutResponse> {
    return this.request<CheckoutResponse>("/tickets/checkout", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getTicket(id: string): Promise<Ticket> {
    return this.request<Ticket>(`/tickets/${id}`);
  }

  // ============================================
  // ADMIN ENDPOINTS (require authentication)
  // ============================================

  // === Parking Reports ===
  async getParkingStateReport(): Promise<ParkingStateZone[]> {
    return this.request<ParkingStateZone[]>("/admin/reports/parking-state");
  }

  // === Zone Management ===
  // NOTE: Most zone CRUD endpoints are NOT IMPLEMENTED in the provided backend
  // Only zone open/close is available
  /*
  async getAdminZones(): Promise<Zone[]> {
    return this.request<Zone[]>("/admin/zones");
  }

  async createZone(zoneData: any): Promise<Zone> {
    return this.request<Zone>("/admin/zones", {
      method: "POST",
      body: JSON.stringify(zoneData),
    });
  }

  async updateZone(zoneId: string, zoneData: any): Promise<Zone> {
    return this.request<Zone>(`/admin/zones/${zoneId}`, {
      method: "PUT",
      body: JSON.stringify(zoneData),
    });
  }

  async deleteZone(zoneId: string): Promise<void> {
    return this.request<void>(`/admin/zones/${zoneId}`, {
      method: "DELETE",
    });
  }
  */

  // This is the ONLY zone endpoint actually implemented in the backend
  async updateZoneStatus(
    zoneId: string,
    open: boolean
  ): Promise<{ zoneId: string; open: boolean }> {
    return this.request<{ zoneId: string; open: boolean }>(
      `/admin/zones/${zoneId}/open`,
      {
        method: "PUT",
        body: JSON.stringify({ open }),
      }
    );
  }

  // === Category Management ===
  async getAdminCategories(): Promise<Category[]> {
    return this.request<Category[]>("/admin/categories");
  }

  async updateCategoryRates(
    categoryId: string,
    rates: { rateNormal: number; rateSpecial: number }
  ): Promise<Category> {
    return this.request<Category>(`/admin/categories/${categoryId}`, {
      method: "PUT",
      body: JSON.stringify(rates),
    });
  }

  // === Gate Management ===
  async getAdminGates(): Promise<Gate[]> {
    return this.request<Gate[]>("/admin/gates");
  }

  // === Rush Hours Management ===
  async getRushHours(): Promise<RushHour[]> {
    return this.request<RushHour[]>("/admin/rush-hours");
  }

  async createRushHour(rushHourData: {
    weekDay: number;
    from: string;
    to: string;
  }): Promise<RushHour> {
    return this.request<RushHour>("/admin/rush-hours", {
      method: "POST",
      body: JSON.stringify(rushHourData),
    });
  }

  async updateRushHour(
    rushHourId: string,
    rushHourData: Partial<RushHour>
  ): Promise<RushHour> {
    return this.request<RushHour>(`/admin/rush-hours/${rushHourId}`, {
      method: "PUT",
      body: JSON.stringify(rushHourData),
    });
  }

  async deleteRushHour(rushHourId: string): Promise<void> {
    return this.request<void>(`/admin/rush-hours/${rushHourId}`, {
      method: "DELETE",
    });
  }

  // === Vacations Management ===
  async getVacations(): Promise<Vacation[]> {
    return this.request<Vacation[]>("/admin/vacations");
  }

  async createVacation(vacationData: {
    name: string;
    from: string;
    to: string;
  }): Promise<Vacation> {
    return this.request<Vacation>("/admin/vacations", {
      method: "POST",
      body: JSON.stringify(vacationData),
    });
  }

  async updateVacation(
    vacationId: string,
    vacationData: Partial<Vacation>
  ): Promise<Vacation> {
    return this.request<Vacation>(`/admin/vacations/${vacationId}`, {
      method: "PUT",
      body: JSON.stringify(vacationData),
    });
  }

  async deleteVacation(vacationId: string): Promise<void> {
    return this.request<void>(`/admin/vacations/${vacationId}`, {
      method: "DELETE",
    });
  }

  // === Parking State Reports ===
  async getParkingStateReport(): Promise<ParkingStateZone[]> {
    return this.request<ParkingStateZone[]>("/admin/reports/parking-state");
  }

  // === Subscription Management ===
  async getAdminSubscriptions(): Promise<any[]> {
    return this.request<any[]>("/admin/subscriptions");
  }

  async createSubscription(subscriptionData: any): Promise<any> {
    return this.request<any>("/admin/subscriptions", {
      method: "POST",
      body: JSON.stringify(subscriptionData),
    });
  }

  async updateSubscription(
    subscriptionId: string,
    subscriptionData: any
  ): Promise<any> {
    return this.request<any>(`/admin/subscriptions/${subscriptionId}`, {
      method: "PUT",
      body: JSON.stringify(subscriptionData),
    });
  }

  // === Employee Management ===
  // NOTE: Exposing for testing; backend might return 404 if not implemented
  async getEmployees(): Promise<User[]> {
    return this.request<User[]>("/admin/users");
  }

  async createEmployee(
    employeeData: CreateEmployeeRequest
  ): Promise<CreateEmployeeResponse> {
    return this.request<CreateEmployeeResponse>("/admin/users", {
      method: "POST",
      body: JSON.stringify(employeeData),
    });
  }

  // Category Management (read-only)
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>("/master/categories");
  }
}

// Export singleton instance
export const api = new ApiService();
export type { ApiError };
