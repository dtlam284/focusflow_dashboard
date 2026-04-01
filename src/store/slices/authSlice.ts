import { createSlice } from '@reduxjs/toolkit'
import type { AdminUser } from '@/models/account'
import type { AuthLoginRequest } from '@/models/authentication'
import type { AuthLoginResponse } from '@/models/authentication'
import { AuthService } from '@/services/access/accessService'
import { createAppAsyncThunk } from '@/store/thunkTypes'
import { toErrorMessage } from './sliceUtils'

export interface AuthState {
  user: AdminUser | null
  isAuthenticated: boolean
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isSubmitting: false,
  error: null,
}

export const loginAdmin = createAppAsyncThunk<AuthLoginResponse, AuthLoginRequest>(
  'auth/loginAdmin',
  async (payload, { rejectWithValue }) => {
    try {
      return await AuthService.login(payload)
    } catch (error) {
      return rejectWithValue(toErrorMessage(error, 'Unable to login'))
    }
  },
)

export const fetchMyProfile = createAppAsyncThunk<AdminUser>(
  'auth/fetchMyProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await AuthService.getMe()
    } catch (error) {
      return rejectWithValue(toErrorMessage(error, 'Unable to fetch profile'))
    }
  },
)

export const logoutAdmin = createAppAsyncThunk<void>(
  'auth/logoutAdmin',
  async (_, { rejectWithValue }) => {
    try {
      await AuthService.logout()
    } catch (error) {
      AuthService.clearStoredTokens()
      return rejectWithValue(toErrorMessage(error, 'Unable to logout'))
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth(state) {
      state.user = null
      state.isAuthenticated = false
      state.error = null
      AuthService.clearStoredTokens()
    },
    setAuthUser(state, action: { payload: AdminUser | null }) {
      state.user = action.payload
      state.isAuthenticated = Boolean(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.user = action.payload.user
        state.isAuthenticated = true
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload ?? 'Unable to login'
      })
      .addCase(fetchMyProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.isLoading = false
        state.user = null
        state.isAuthenticated = false
        state.error = action.payload ?? 'Unable to fetch profile'
      })
      .addCase(logoutAdmin.pending, (state) => {
        state.isSubmitting = true
      })
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.isSubmitting = false
        state.user = null
        state.isAuthenticated = false
      })
      .addCase(logoutAdmin.rejected, (state, action) => {
        state.isSubmitting = false
        state.user = null
        state.isAuthenticated = false
        state.error = action.payload ?? 'Unable to logout'
      })
  },
})

export const { clearAuth, setAuthUser } = authSlice.actions
export default authSlice.reducer
