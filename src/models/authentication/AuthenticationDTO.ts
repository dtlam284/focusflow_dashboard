export interface AuthLoginRequest {
  email: string
  password: string
}

export interface AuthRefreshRequest {
  refreshToken: string
}

export interface AuthLogoutRequest {
  refreshToken?: string
}

export interface UpdateMyProfileRequest {
  firstName?: string
  lastName?: string
  photo?: string
}
