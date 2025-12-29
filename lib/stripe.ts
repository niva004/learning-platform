import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set - Stripe payments will not work')
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    })
  : (null as any)

export async function createStripePaymentIntent(
  amount: number,
  currency: string = 'pln',
  metadata: Record<string, string> = {},
  paymentMethodType?: 'card' | 'apple_pay'
) {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to smallest currency unit (grosze for PLN)
    currency: currency.toLowerCase(),
    metadata,
    payment_method_types: paymentMethodType === 'apple_pay' ? ['card'] : ['card'],
    ...(paymentMethodType === 'apple_pay' && {
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic',
        },
      },
    }),
  })

  return paymentIntent
}

export async function createStripePaymentIntentForBLIK(
  amount: number,
  currency: string = 'pln',
  metadata: Record<string, string> = {}
) {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: currency.toLowerCase(),
    metadata,
    payment_method_types: ['blik'],
  })

  return paymentIntent
}

export async function getStripePaymentIntent(paymentIntentId: string) {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  return await stripe.paymentIntents.retrieve(paymentIntentId)
}

export async function confirmStripePaymentIntent(
  paymentIntentId: string,
  paymentMethodId?: string
) {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  return await stripe.paymentIntents.confirm(paymentIntentId, {
    payment_method: paymentMethodId,
  })
}

