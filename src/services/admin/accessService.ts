import { API_ENDPOINTS } from "@/constants/api";
import type {
  DataResponse,
  EntityId,
  PaginatedResponse,
} from "@/services/core";
import { apiClient } from "@/services/core";
import type {
  AdminUser,
  CreatePermissionRequest,
  CreateUserRequest,
  LoginAuditFilters,
  LoginAuditItem,
  LoginAuditStats,
  PermissionItem,
  UpdateUserRequest,
  UserFilters,
} from '@/models/account'
import type {
  AuthLoginRequest,
  AuthLoginResponse,
  AuthRefreshRequest,
  AuthRefreshResponse,
  SessionItem,
  UpdateMyProfileRequest,
} from '@/models/authentication'

export const authService = {
  async login(payload: AuthLoginRequest): Promise<AuthLoginResponse> {
    const response = await apiClient.post<AuthLoginResponse>(
      API_ENDPOINTS.auth.loginEmail,
      payload,
      { requiresAuth: false },
    );

    apiClient.setTokens({
      accessToken: response.token,
      refreshToken: response.refreshToken,
      tokenExpires: response.tokenExpires,
    });

    return response;
  },

  async refresh(refreshToken?: string): Promise<AuthRefreshResponse> {
    const currentTokens = apiClient.tokens;
    const token = refreshToken ?? currentTokens?.refreshToken;

    if (!token) {
      throw new Error("No refresh token available");
    }

    const response = await apiClient.post<AuthRefreshResponse>(
      API_ENDPOINTS.auth.refresh,
      {
        refreshToken: token,
      } satisfies AuthRefreshRequest,
      {
        requiresAuth: false,
        retryOnUnauthorized: false,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    apiClient.setTokens({
      accessToken: response.token,
      refreshToken: response.refreshToken,
      tokenExpires: response.tokenExpires,
    });

    return response;
  },

  async logout(): Promise<void> {
    await apiClient.post<void>(API_ENDPOINTS.auth.logout);
    apiClient.clearTokens();
  },

  async logoutAll(): Promise<void> {
    await apiClient.post<void>(API_ENDPOINTS.auth.logoutAll);

    apiClient.clearTokens();
  },

  getStoredTokens() {
    return apiClient.tokens;
  },

  setStoredTokens(response: AuthLoginResponse | AuthRefreshResponse): void {
    apiClient.setTokens({
      accessToken: response.token,
      refreshToken: response.refreshToken,
      tokenExpires: response.tokenExpires,
    });
  },

  clearStoredTokens(): void {
    apiClient.clearTokens();
  },

  getMe(): Promise<AdminUser> {
    return apiClient.get<AdminUser>(API_ENDPOINTS.auth.me);
  },

  updateMe(payload: UpdateMyProfileRequest): Promise<AdminUser> {
    return apiClient.patch<AdminUser>(API_ENDPOINTS.auth.me, payload);
  },

  getSessions(): Promise<SessionItem[]> {
    return apiClient.get<SessionItem[]>(API_ENDPOINTS.auth.sessions);
  },

  revokeSession(sessionId: EntityId): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.auth.sessionById(sessionId));
  },
};

export const usersService = {
  list(query?: UserFilters): Promise<PaginatedResponse<AdminUser>> {
    const normalizedRoleId =
      query?.role !== undefined && query.role !== null && query.role !== ""
        ? Number(query.role)
        : undefined;
    const inheritedRoles =
      query?.filters?.roles && Array.isArray(query.filters.roles)
        ? query.filters.roles.filter((item) => typeof item?.id === "number")
        : [];
    const roleFilters =
      typeof normalizedRoleId === "number" && Number.isFinite(normalizedRoleId)
        ? [{ id: normalizedRoleId }, ...inheritedRoles]
        : inheritedRoles;
    const dedupedRoles = Array.from(
      new Map(roleFilters.map((item) => [item.id, item])).values(),
    );

    const normalizedQuery = {
      page: query?.page,
      limit: query?.limit,
      // Backend users endpoint currently accepts `filters` and `sort` JSON.
      filters:
        dedupedRoles.length > 0
          ? {
              roles: dedupedRoles,
            }
          : (query?.filterOptions ?? query?.filters),
      sort: query?.sort,
      // Keep these for forwards/backwards compatibility across API revisions.
      search: query?.search?.trim() || undefined,
      role:
        typeof normalizedRoleId === "number" &&
        Number.isFinite(normalizedRoleId)
          ? normalizedRoleId
          : undefined,
      status:
        query?.status !== undefined &&
        query.status !== null &&
        query.status !== ""
          ? String(query.status)
          : undefined,
    };

    return apiClient.get<PaginatedResponse<AdminUser>>(
      API_ENDPOINTS.users.root,
      {
        query: normalizedQuery,
      },
    );
  },

  async listAll(
    query?: Omit<UserFilters, "page" | "limit"> & {
      pageSize?: number;
      maxPages?: number;
    },
  ): Promise<AdminUser[]> {
    const pageSize = Math.min(50, Math.max(1, Number(query?.pageSize ?? 50)));
    const maxPages = Math.max(1, Number(query?.maxPages ?? 200));

    const users: AdminUser[] = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages && page <= maxPages) {
      const response = await this.list({
        page,
        limit: pageSize,
        search: query?.search,
        role: query?.role,
        status: query?.status,
        filters: query?.filters,
        sort: query?.sort,
      });

      users.push(...(response.data ?? []));

      totalPages =
        response.totalPages ||
        Math.max(1, Math.ceil((response.total ?? 0) / pageSize));
      page += 1;
    }

    return users;
  },

  create(payload: CreateUserRequest): Promise<DataResponse<AdminUser>> {
    return apiClient.post<DataResponse<AdminUser>>(
      API_ENDPOINTS.users.root,
      payload,
    );
  },

  getById(id: EntityId): Promise<DataResponse<AdminUser>> {
    return apiClient.get<DataResponse<AdminUser>>(API_ENDPOINTS.users.byId(id));
  },

  update(
    id: EntityId,
    payload: UpdateUserRequest,
  ): Promise<DataResponse<AdminUser>> {
    return apiClient.patch<DataResponse<AdminUser>>(
      API_ENDPOINTS.users.byId(id),
      payload,
    );
  },

  remove(id: EntityId): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.users.byId(id));
  },
};

export const permissionsService = {
  list(): Promise<DataResponse<PermissionItem[]>> {
    return apiClient.get<DataResponse<PermissionItem[]>>(
      API_ENDPOINTS.permissions.root,
    );
  },

  create(
    payload: CreatePermissionRequest,
  ): Promise<DataResponse<PermissionItem>> {
    return apiClient.post<DataResponse<PermissionItem>>(
      API_ENDPOINTS.permissions.root,
      payload,
    );
  },

  remove(id: EntityId): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.permissions.byId(id));
  },
};

export const loginAuditService = {
  list(query?: LoginAuditFilters): Promise<PaginatedResponse<LoginAuditItem>> {
    return apiClient.get<PaginatedResponse<LoginAuditItem>>(
      API_ENDPOINTS.loginAudit.root,
      {
        query,
      },
    );
  },

  getStats(query?: LoginAuditFilters): Promise<DataResponse<LoginAuditStats>> {
    return apiClient.get<DataResponse<LoginAuditStats>>(
      API_ENDPOINTS.loginAudit.stats,
      {
        query,
      },
    );
  },
};
