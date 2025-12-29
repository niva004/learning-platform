'use client'

import { useState, useEffect } from 'react'

interface PaymentMethodSelectorProps {
  onSelectMethod: (method: 'PAYPAL' | 'STRIPE_BLIK' | 'STRIPE_APPLE_PAY' | 'STRIPE_CARD') => void
  selectedMethod: 'PAYPAL' | 'STRIPE_BLIK' | 'STRIPE_APPLE_PAY' | 'STRIPE_CARD' | null
}

export default function PaymentMethodSelector({
  onSelectMethod,
  selectedMethod,
}: PaymentMethodSelectorProps) {
  const [showApplePay, setShowApplePay] = useState(false)

  // Check if Apple Pay is available
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ApplePaySession) {
      if ((window as any).ApplePaySession.canMakePayments()) {
        setShowApplePay(true)
      }
    }
  }, [])

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Wybierz metodę płatności
      </label>

      <div className="space-y-2">
        {/* PayPal */}
        <button
          type="button"
          onClick={() => onSelectMethod('PAYPAL')}
          className={`w-full p-4 border-2 rounded-lg transition-all ${
            selectedMethod === 'PAYPAL'
              ? 'border-indigo-600 bg-indigo-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
                PP
              </div>
              <span className="font-medium text-gray-900">PayPal</span>
            </div>
            {selectedMethod === 'PAYPAL' && (
              <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        </button>

        {/* BLIK */}
        <button
          type="button"
          onClick={() => onSelectMethod('STRIPE_BLIK')}
          className={`w-full p-4 border-2 rounded-lg transition-all ${
            selectedMethod === 'STRIPE_BLIK'
              ? 'border-indigo-600 bg-indigo-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-8 bg-black rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">BLIK</span>
              </div>
              <span className="font-medium text-gray-900">BLIK</span>
            </div>
            {selectedMethod === 'STRIPE_BLIK' && (
              <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        </button>

        {/* Apple Pay */}
        {showApplePay && (
          <button
            type="button"
            onClick={() => onSelectMethod('STRIPE_APPLE_PAY')}
            className={`w-full p-4 border-2 rounded-lg transition-all ${
              selectedMethod === 'STRIPE_APPLE_PAY'
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-8 bg-black rounded flex items-center justify-center">
                  <svg
                    className="w-8 h-6 text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-900">Apple Pay</span>
              </div>
              {selectedMethod === 'STRIPE_APPLE_PAY' && (
                <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          </button>
        )}

        {/* Karta kredytowa (Stripe) */}
        <button
          type="button"
          onClick={() => onSelectMethod('STRIPE_CARD')}
          className={`w-full p-4 border-2 rounded-lg transition-all ${
            selectedMethod === 'STRIPE_CARD'
              ? 'border-indigo-600 bg-indigo-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <span className="font-medium text-gray-900">Karta kredytowa</span>
            </div>
            {selectedMethod === 'STRIPE_CARD' && (
              <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        </button>
      </div>
    </div>
  )
}

