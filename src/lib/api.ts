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
  ApiError,
} from "../types/api";

const API_BASE_URL = "http://localhost:3000/api/v1";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem("auth_token");
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

  // Admin endpoints (require authentication)
  async getParkingStateReport(): Promise<Zone[]> {
    return this.request<Zone[]>("/admin/reports/parking-state");
  }

  async updateZoneStatus(zoneId: string, open: boolean): Promise<Zone> {
    return this.request<Zone>(`/admin/zones/${zoneId}/open`, {
      method: "PUT",
      body: JSON.stringify({ open }),
    });
  }

  async updateCategoryRates(
    categoryId: string,
    rates: { rateNormal: number; rateSpecial: number }
  ): Promise<any> {
    return this.request(`/admin/categories/${categoryId}`, {
      method: "PUT",
      body: JSON.stringify(rates),
    });
  }
}

// Export singleton instance
export const api = new ApiService();
export { ApiError };
