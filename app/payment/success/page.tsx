'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [verifying, setVerifying] = useState(true)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Check for Stripe payment intent
    const paymentIntentId = searchParams.get('payment_intent')
    
    if (paymentIntentId) {
      // Stripe payment
      fetch(`/api/payments/verify-stripe?payment_intent=${paymentIntentId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.status === 'succeeded') {
            setSuccess(true)
            setTimeout(() => {
              router.push('/dashboard')
            }, 3000)
          } else {
            setSuccess(false)
          }
          setVerifying(false)
        })
        .catch(() => {
          setSuccess(false)
          setVerifying(false)
        })
      return
    }

    // PayPal redirects with 'token' parameter
    const paymentId = searchParams.get('token') || searchParams.get('paymentId')
    
    if (!paymentId) {
      setVerifying(false)
      return
    }

    // Verify PayPal payment
    fetch('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: paymentId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.status === 'COMPLETED') {
          setSuccess(true)
          setTimeout(() => {
            router.push('/dashboard')
          }, 3000)
        } else {
          setSuccess(false)
        }
        setVerifying(false)
      })
      .catch(() => {
        setSuccess(false)
        setVerifying(false)
      })
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        {verifying ? (
          <div className="text-center">
            <div className="text-lg text-gray-600 mb-4">Weryfikacja płatności...</div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : success ? (
          <div className="text-center">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Płatność zakończona pomyślnie!
            </h1>
            <p className="text-gray-600 mb-6">
              Twój dostęp do kursu został aktywowany. Możesz teraz rozpocząć naukę.
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Przejdź do dashboard
            </Link>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">✗</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Wystąpił problem z płatnością
            </h1>
            <p className="text-gray-600 mb-6">
              Twoja płatność nie została zakończona. Spróbuj ponownie lub skontaktuj się z
              obsługą.
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Powrót do dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

