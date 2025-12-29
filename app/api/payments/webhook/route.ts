import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPayPalOrder, capturePayPalOrder } from '@/lib/paypal'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing orderId' },
        { status: 400 }
      )
    }

    // Get PayPal order
    const paypalOrder = await getPayPalOrder(orderId)

    if (!paypalOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Find purchase
    const purchase = await prisma.purchase.findUnique({
      where: { paypalOrderId: orderId },
      include: { user: true, course: true },
    })

    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      )
    }

    // Check if order is already completed
    if (purchase.status === 'COMPLETED') {
      return NextResponse.json({ success: true, message: 'Already processed' })
    }

    // If order status is APPROVED, capture it
    if (paypalOrder.status === 'APPROVED') {
      const capturedOrder = await capturePayPalOrder(orderId)

      if (capturedOrder.status === 'COMPLETED') {
        // Update purchase status
        await prisma.purchase.update({
          where: { id: purchase.id },
          data: { status: 'COMPLETED' },
        })
      }
    } else if (paypalOrder.status === 'COMPLETED') {
      // Update purchase status
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: { status: 'COMPLETED' },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

