import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getStripePaymentIntent } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    const user = await getUserFromToken(token)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const paymentIntentId = searchParams.get('payment_intent')

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Missing payment_intent parameter' },
        { status: 400 }
      )
    }

    // Get Stripe payment intent
    const paymentIntent = await getStripePaymentIntent(paymentIntentId)

    if (!paymentIntent) {
      return NextResponse.json(
        { error: 'Payment intent not found' },
        { status: 404 }
      )
    }

    // Find purchase
    const purchase = await prisma.purchase.findFirst({
      where: {
        stripePaymentId: paymentIntentId,
        userId: user.id,
      },
    })

    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      )
    }

    // Update purchase status based on payment intent status
    if (paymentIntent.status === 'succeeded' && purchase.status !== 'COMPLETED') {
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: { status: 'COMPLETED' },
      })

      return NextResponse.json({
        success: true,
        status: 'succeeded',
      })
    } else if (paymentIntent.status === 'requires_payment_method') {
      if (purchase.status !== 'FAILED') {
        await prisma.purchase.update({
          where: { id: purchase.id },
          data: { status: 'FAILED' },
        })
      }

      return NextResponse.json({
        success: false,
        status: 'failed',
      })
    }

    return NextResponse.json({
      success: true,
      status: paymentIntent.status,
    })
  } catch (error) {
    console.error('Verify Stripe payment error:', error)
    return NextResponse.json(
      { error: 'Błąd podczas weryfikacji płatności' },
      { status: 500 }
    )
  }
}

