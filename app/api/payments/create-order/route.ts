import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPayPalOrder } from '@/lib/paypal'
import { z } from 'zod'

const createOrderSchema = z.object({
  courseId: z.string(),
  paymentMethod: z.enum(['PAYPAL']).optional().default('PAYPAL'),
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
    const { courseId } = createOrderSchema.parse(body)

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

    // Create PayPal order with return URLs
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const order = await createPayPalOrder(
      course.price.toString(),
      'PLN',
      `${appUrl}/payment/success`,
      `${appUrl}/dashboard`
    )

    // Create purchase record
    const purchase = await prisma.purchase.create({
      data: {
        userId: user.id,
        courseId: course.id,
        paypalOrderId: order.id,
        paymentMethod: 'PAYPAL',
        amount: course.price,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      orderId: order.id,
      purchaseId: purchase.id,
      approveUrl: order.links?.find((link: any) => link.rel === 'approve')?.href,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Błąd podczas tworzenia zamówienia' },
      { status: 500 }
    )
  }
}

