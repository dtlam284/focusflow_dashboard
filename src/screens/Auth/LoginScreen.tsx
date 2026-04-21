import React from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router'
import { ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

import { useAppDispatch } from '@/app/store/hooks'
import { FormField } from '@/components/shared/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { loginAdmin } from '@/features/auth/store/slices/authSlice'

export function LoginScreen() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { status, refreshProfile } = useAuth()
  const dispatch = useAppDispatch()

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const redirect = searchParams.get('redirect') || '/'

  if (status === 'authenticated') {
    return <Navigate to={redirect} replace />
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm space-y-3 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          <h1 className="text-base font-semibold text-slate-900">Checking existing session</h1>
          <p className="text-sm text-slate-500">Please wait.</p>
        </div>
      </div>
    )
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim() || !password.trim()) {
      toast.error('Email and password are required')
      return
    }

    setIsSubmitting(true)

    try {
      await dispatch(
        loginAdmin({
          email: email.trim(),
          password,
        }),
      ).unwrap()

      const profile = await refreshProfile()
      if (!profile) {
        throw new Error('Unable to validate session')
      }

      navigate(redirect, { replace: true })
      toast.success('Signed in')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Admin Sign In</h1>
          <p className="mt-1 text-sm text-slate-600">
            Use your admin credentials to access Base CMS.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <FormField label="Email" htmlFor="email" required>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              title="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
            />
          </FormField>

          <FormField label="Password" htmlFor="password" required>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              title="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
            />
          </FormField>

          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  )
}
