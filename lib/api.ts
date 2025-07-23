import type { ApiResponse } from "./types"

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

// Generic API client
class ApiClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`
      const config: RequestInit = {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      }

      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        return {
          error: data.message || "An error occurred",
        }
      }

      return { data }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Network error",
      }
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }
}

export const apiClient = new ApiClient()

// Specific API functions
export const toursApi = {
  getAll: () => apiClient.get("/tours"),
  getById: (id: string) => apiClient.get(`/tours/${id}`),
  getBySlug: (slug: string) => apiClient.get(`/tours/slug/${slug}`),
  getFeatured: () => apiClient.get("/tours?featured=true"),
  getByCategory: (category: string) => apiClient.get(`/tours?category=${category}`),
  search: (query: string) => apiClient.get(`/tours/search?q=${encodeURIComponent(query)}`),
}

export const bookingsApi = {
  create: (booking: any) => apiClient.post("/bookings", booking),
  getById: (id: string) => apiClient.get(`/bookings/${id}`),
  getAll: () => apiClient.get("/bookings"),
}

export const contactApi = {
  submit: (form: any) => apiClient.post("/contact", form),
}

export const newsletterApi = {
  subscribe: (subscription: any) => apiClient.post("/newsletter", subscription),
}
