import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPayPalOrder, capturePayPalOrder } from '@/lib/paypal'
import { z } from 'zod'

const verifySchema = z.object({
  orderId: z.string(),
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
    const { orderId } = verifySchema.parse(body)

    // Get PayPal order
    const paypalOrder = await getPayPalOrder(orderId)

    if (!paypalOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Find purchase
    const purchase = await prisma.purchase.findFirst({
      where: {
        paypalOrderId: orderId,
        userId: user.id,
      },
    })

    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      )
    }

    // If order is approved, capture it
    if (paypalOrder.status === 'APPROVED') {
      const capturedOrder = await capturePayPalOrder(orderId)

      if (capturedOrder.status === 'COMPLETED') {
        // Update purchase status
        await prisma.purchase.update({
          where: { id: purchase.id },
          data: { status: 'COMPLETED' },
        })

        return NextResponse.json({
          success: true,
          status: 'COMPLETED',
        })
      }
    } else if (paypalOrder.status === 'COMPLETED') {
      // Update purchase status if not already updated
      if (purchase.status !== 'COMPLETED') {
        await prisma.purchase.update({
          where: { id: purchase.id },
          data: { status: 'COMPLETED' },
        })
      }

      return NextResponse.json({
        success: true,
        status: 'COMPLETED',
      })
    }

    return NextResponse.json({
      success: true,
      status: paypalOrder.status,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Verify payment error:', error)
    return NextResponse.json(
      { error: 'Błąd podczas weryfikacji płatności' },
      { status: 500 }
    )
  }
}

