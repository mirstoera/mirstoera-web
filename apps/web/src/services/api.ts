import {
  ApiResponse,
  ServiceEntity,
  EnquiryEntity,
  EnquirySubmissionInput,
  PublicSettings,
  AdminSettings,
  DashboardMetrics,
  NotificationOutboxEntity,
  AdminAuditLogEntity,
  AdminLoginInput,
  AdminUserEntity,
} from '@momera/shared';

const API_BASE = (import.meta.env.VITE_API_URL as string) || '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Include HttpOnly session cookies
  });

  const json = (await res.json()) as ApiResponse<T>;

  if (!res.ok || !json.success) {
    const error = new Error(json.error?.message || `Request failed with status ${res.status}`);
    (error as any).code = json.error?.code;
    (error as any).details = json.error?.details;
    throw error;
  }

  return json.data as T;
}

export const api = {
  // Public APIs
  getHealth: () => request<any>('/health'),
  getServices: () => request<ServiceEntity[]>('/services'),
  getServiceBySlug: (slug: string) => request<ServiceEntity>(`/services/${slug}`),
  getPublicSettings: () => request<PublicSettings>('/public-settings'),
  submitEnquiry: (data: EnquirySubmissionInput) =>
    request<{ id: number; reference_code: string; status: string; created_at: string }>(
      '/enquiries',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  // Admin APIs
  adminLogin: (data: AdminLoginInput) =>
    request<{ user: AdminUserEntity; token?: string }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  adminLogout: () => request<null>('/admin/logout', { method: 'POST' }),
  adminGetSession: () => request<{ user: AdminUserEntity }>('/admin/session'),
  adminGetDashboard: () =>
    request<{ metrics: DashboardMetrics; recent_enquiries: EnquiryEntity[] }>('/admin/dashboard'),
  adminGetEnquiries: (params: {
    status?: string;
    service_slug?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.service_slug) query.set('service_slug', params.service_slug);
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    return request<{
      items: EnquiryEntity[];
      pagination: { page: number; limit: number; total: number; total_pages: number };
    }>(`/admin/enquiries?${query.toString()}`);
  },
  adminGetEnquiryById: (id: number) =>
    request<{ enquiry: EnquiryEntity; notes: any[]; whatsapp_url: string }>(
      `/admin/enquiries/${id}`
    ),
  adminUpdateEnquiryStatus: (id: number, data: { status: string; quoted_price_inr?: number; note?: string }) =>
    request<EnquiryEntity>(`/admin/enquiries/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  adminAddEnquiryNote: (id: number, note: string) =>
    request<any>(`/admin/enquiries/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    }),
  adminGetServices: () => request<ServiceEntity[]>('/admin/services'),
  adminCreateService: (data: {
    slug: string;
    title: string;
    tagline?: string;
    description: string;
    starting_price_inr: number;
    cover_image_url?: string | null;
    is_active?: boolean;
    display_order?: number;
  }) =>
    request<ServiceEntity>('/admin/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  adminUpdateService: (id: number, data: Partial<ServiceEntity & { starting_price_inr?: number }>) =>
    request<ServiceEntity>(`/admin/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  adminGetSettings: () => request<AdminSettings>('/admin/settings'),
  adminUpdateSettings: (data: Partial<AdminSettings>) =>
    request<AdminSettings>('/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  adminGetNotifications: () => request<NotificationOutboxEntity[]>('/admin/notifications'),
  adminRetryNotification: (id: number) =>
    request<{ id: number; success: boolean }>(`/admin/notifications/${id}/retry`, {
      method: 'POST',
    }),
  adminGetAuditLogs: () => request<AdminAuditLogEntity[]>('/admin/audit-logs'),
};
