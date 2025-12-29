'use client'

import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Link from 'next/link'

interface Purchase {
  id: string
  status: string
  amount: string
  createdAt: string
  course: {
    id: string
    name: string
    level: string
    _count: {
      lessons: number
    }
  }
}

interface CourseProgress {
  courseId: string
  courseName: string
  totalLessons: number
  completedLessons: number
  progress: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user)
        loadDashboardData()
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  const loadDashboardData = async () => {
    try {
      // Get purchases
      const purchasesRes = await fetch('/api/purchases')
      const purchasesData = await purchasesRes.json()
      if (purchasesData.purchases) {
        setPurchases(purchasesData.purchases)
      }

      // Get courses to calculate progress
      const coursesRes = await fetch('/api/courses')
      const coursesData = await coursesRes.json()
      
      if (coursesData.courses) {
        const completedPurchases = purchasesData.purchases?.filter(
          (p: Purchase) => p.status === 'COMPLETED'
        ) || []

        const progressPromises = completedPurchases.map(async (purchase: Purchase) => {
          const courseRes = await fetch(`/api/courses/${purchase.course.id}`)
          const courseData = await courseRes.json()
          
          if (courseData.course) {
            const completedCount = courseData.course.lessons.filter(
              (l: any) => l.progress?.completed
            ).length
            const totalCount = courseData.course.lessons.length

            return {
              courseId: purchase.course.id,
              courseName: purchase.course.name,
              totalLessons: totalCount,
              completedLessons: completedCount,
              progress: totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
            }
          }
          return null
        })

        const progressResults = await Promise.all(progressPromises)
        setCourseProgress(progressResults.filter((p) => p !== null) as CourseProgress[])
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-xl font-bold text-gray-900">
                  Trading Learning Framework
                </Link>
                <Link
                  href="/"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Kursy
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                {user?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST' })
                    window.location.href = '/'
                  }}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Wyloguj
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

            {loading ? (
              <div className="text-center py-12">
                <div className="text-lg text-gray-600">Ładowanie...</div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Course Progress */}
                {courseProgress.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Twój postęp</h2>
                    <div className="space-y-4">
                      {courseProgress.map((progress) => (
                        <div key={progress.courseId} className="border-b pb-4 last:border-b-0 last:pb-0">
                          <div className="flex items-center justify-between mb-2">
                            <Link
                              href={`/courses/${progress.courseId}`}
                              className="text-lg font-semibold text-indigo-600 hover:text-indigo-700"
                            >
                              {progress.courseName}
                            </Link>
                            <span className="text-sm text-gray-600">
                              {progress.completedLessons}/{progress.totalLessons} lekcji
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 transition-all"
                              style={{ width: `${progress.progress}%` }}
                            />
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {Math.round(progress.progress)}% ukończone
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Purchased Courses */}
                {purchases.filter((p) => p.status === 'COMPLETED').length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Wykupione kursy</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {purchases
                        .filter((p) => p.status === 'COMPLETED')
                        .map((purchase) => (
                          <Link
                            key={purchase.id}
                            href={`/courses/${purchase.course.id}`}
                            className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {purchase.course.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {purchase.course._count.lessons} lekcji
                            </p>
                          </Link>
                        ))}
                    </div>
                  </div>
                )}

                {/* Purchase History */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Historia płatności</h2>
                  {purchases.length === 0 ? (
                    <p className="text-gray-600">Brak historii płatności</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Kurs
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Kwota
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Data
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {purchases.map((purchase) => (
                            <tr key={purchase.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {purchase.course.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {purchase.amount} PLN
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    purchase.status === 'COMPLETED'
                                      ? 'bg-green-100 text-green-800'
                                      : purchase.status === 'PENDING'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {purchase.status === 'COMPLETED'
                                    ? 'Zakończone'
                                    : purchase.status === 'PENDING'
                                    ? 'Oczekujące'
                                    : 'Nieudane'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(purchase.createdAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Empty State */}
                {purchases.filter((p) => p.status === 'COMPLETED').length === 0 && (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Nie masz jeszcze wykupionych kursów
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Zacznij od wykupienia jednego z naszych kursów tradingowych
                    </p>
                    <Link
                      href="/"
                      className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Zobacz kursy
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

