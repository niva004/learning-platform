'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push('/login')
          return
        }

        if (requireAdmin && data.user.role !== 'ADMIN') {
          router.push('/dashboard')
          return
        }

        setUser(data.user)
        setLoading(false)
      })
      .catch(() => {
        router.push('/login')
      })
  }, [router, requireAdmin])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Ładowanie...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}

