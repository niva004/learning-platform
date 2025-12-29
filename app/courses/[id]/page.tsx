'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import Link from 'next/link'
import PaymentMethodSelector from '@/components/PaymentMethodSelector'
import { loadStripe } from '@stripe/stripe-js'

interface Lesson {
  id: string
  title: string
  order: number
  duration: number | null
  progress: {
    completed: boolean
    progress: number
    watchedAt: string | null
  } | null
}

interface Course {
  id: string
  name: string
  description: string | null
  price: string
  level: string
  isPurchased: boolean
  lessons: Lesson[]
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
)

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    'PAYPAL' | 'STRIPE_BLIK' | 'STRIPE_APPLE_PAY' | 'STRIPE_CARD' | null
  >(null)
  const [showPaymentMethods, setShowPaymentMethods] = useState(false)

  useEffect(() => {
    fetch(`/api/courses/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setCourse(data.course)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [params.id])

  const handlePurchase = async () => {
    if (!course) return

    if (!selectedPaymentMethod) {
      setShowPaymentMethods(true)
      return
    }

    setPurchasing(true)

    try {
      if (selectedPaymentMethod === 'PAYPAL') {
        // PayPal payment
        const res = await fetch('/api/payments/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId: course.id, paymentMethod: 'PAYPAL' }),
        })

        const data = await res.json()

        if (!res.ok) {
          alert(data.error || 'Błąd podczas tworzenia zamówienia')
          setPurchasing(false)
          return
        }

        // Redirect to PayPal
        if (data.approveUrl) {
          window.location.href = data.approveUrl
        }
      } else {
        // Stripe payment (BLIK, Apple Pay, Card)
        const res = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId: course.id,
            paymentMethod: selectedPaymentMethod,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          alert(data.error || 'Błąd podczas tworzenia płatności')
          setPurchasing(false)
          return
        }

        const stripe = await stripePromise
        if (!stripe) {
          alert('Błąd inicjalizacji Stripe')
          setPurchasing(false)
          return
        }

        // Handle different payment methods
        if (selectedPaymentMethod === 'STRIPE_BLIK') {
          // BLIK requires redirect
          const { error } = await stripe.confirmPayment({
            clientSecret: data.clientSecret,
            confirmParams: {
              return_url: `${window.location.origin}/payment/success?payment_intent=${data.paymentIntentId}`,
            },
          })

          if (error) {
            alert(error.message || 'Błąd podczas płatności BLIK')
            setPurchasing(false)
          }
        } else if (selectedPaymentMethod === 'STRIPE_APPLE_PAY') {
          // Apple Pay - use redirect flow for consistency
          const { error } = await stripe.confirmPayment({
            clientSecret: data.clientSecret,
            confirmParams: {
              return_url: `${window.location.origin}/payment/success?payment_intent=${data.paymentIntentId}`,
            },
          })

          if (error) {
            alert(error.message || 'Błąd podczas płatności Apple Pay')
            setPurchasing(false)
          }
        } else {
          // Card payment - use redirect flow
          const { error } = await stripe.confirmPayment({
            clientSecret: data.clientSecret,
            confirmParams: {
              return_url: `${window.location.origin}/payment/success?payment_intent=${data.paymentIntentId}`,
            },
          })

          if (error) {
            alert(error.message || 'Błąd podczas płatności kartą')
            setPurchasing(false)
          }
        }
      }
    } catch (err: any) {
      alert(err.message || 'Wystąpił błąd')
      setPurchasing(false)
    }
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-'
    const minutes = Math.floor(seconds / 60)
    return `${minutes} min`
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
                  href="/dashboard"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {loading ? (
              <div className="text-center py-12">
                <div className="text-lg text-gray-600">Ładowanie...</div>
              </div>
            ) : course ? (
              <div>
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.name}</h1>
                  {course.description && (
                    <p className="text-gray-600 mb-4">{course.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{course.price} PLN</p>
                      <p className="text-sm text-gray-500">{course.lessons.length} lekcji</p>
                    </div>
                    {!course.isPurchased && (
                      <div className="text-right">
                        {!showPaymentMethods ? (
                          <button
                            onClick={() => setShowPaymentMethods(true)}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                          >
                            Wykup kurs
                          </button>
                        ) : (
                          <div className="space-y-4">
                            <PaymentMethodSelector
                              onSelectMethod={(method) => {
                                setSelectedPaymentMethod(method)
                              }}
                              selectedMethod={selectedPaymentMethod}
                            />
                            <div className="flex space-x-3">
                              <button
                                onClick={() => {
                                  setShowPaymentMethods(false)
                                  setSelectedPaymentMethod(null)
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                              >
                                Anuluj
                              </button>
                              <button
                                onClick={handlePurchase}
                                disabled={purchasing || !selectedPaymentMethod}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                              >
                                {purchasing ? 'Przetwarzanie...' : 'Kontynuuj płatność'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {course.isPurchased && (
                      <div className="text-green-600 font-medium">✓ Wykupione</div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Lekcje</h2>
                  <div className="space-y-3">
                    {course.lessons.map((lesson, index) => (
                      <Link
                        key={lesson.id}
                        href={`/courses/${course.id}/lessons/${lesson.id}`}
                        className={`block p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                          !course.isPurchased ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={(e) => {
                          if (!course.isPurchased) {
                            e.preventDefault()
                            alert('Musisz wykupić kurs, aby uzyskać dostęp do lekcji')
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold">
                              {lesson.order}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                              <p className="text-sm text-gray-500">
                                {formatDuration(lesson.duration)}
                              </p>
                            </div>
                          </div>
                          {lesson.progress && (
                            <div className="flex items-center space-x-2">
                              {lesson.progress.completed ? (
                                <span className="text-green-600 font-medium">✓ Ukończone</span>
                              ) : (
                                <div className="text-right">
                                  <div className="text-sm text-gray-600">
                                    {lesson.progress.progress}% obejrzane
                                  </div>
                                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-indigo-600"
                                      style={{ width: `${lesson.progress.progress}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-lg text-gray-600">Kurs nie został znaleziony</div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

