import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createStripePaymentIntent, createStripePaymentIntentForBLIK } from '@/lib/stripe'
import { z } from 'zod'

const createIntentSchema = z.object({
  courseId: z.string(),
  paymentMethod: z.enum(['STRIPE_BLIK', 'STRIPE_APPLE_PAY', 'STRIPE_CARD']),
})

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    const user = await getUserFromToken(token)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { courseId, paymentMethod } = createIntentSchema.parse(body)

    // Get course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Kurs nie został znaleziony' },
        { status: 404 }
      )
    }

    // Check if user already purchased this course
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId: user.id,
        courseId: course.id,
        status: 'COMPLETED',
      },
    })

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'Ten kurs został już wykupiony' },
        { status: 400 }
      )
    }

    // Create Stripe payment intent
    const amount = Number(course.price)
    let paymentIntent

    if (paymentMethod === 'STRIPE_BLIK') {
      paymentIntent = await createStripePaymentIntentForBLIK(amount, 'pln', {
        userId: user.id,
        courseId: course.id,
        paymentMethod,
      })
    } else if (paymentMethod === 'STRIPE_APPLE_PAY') {
      paymentIntent = await createStripePaymentIntent(amount, 'pln', {
        userId: user.id,
        courseId: course.id,
        paymentMethod,
      }, 'apple_pay')
    } else {
      paymentIntent = await createStripePaymentIntent(amount, 'pln', {
        userId: user.id,
        courseId: course.id,
        paymentMethod,
      })
    }

    // Create purchase record
    const purchase = await prisma.purchase.create({
      data: {
        userId: user.id,
        courseId: course.id,
        stripePaymentId: paymentIntent.id,
        paymentMethod: paymentMethod as any,
        amount: course.price,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      purchaseId: purchase.id,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Create payment intent error:', error)
    return NextResponse.json(
      { error: 'Błąd podczas tworzenia płatności' },
      { status: 500 }
    )
  }
}

