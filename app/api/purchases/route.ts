import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    const purchases = await prisma.purchase.findMany({
      where: { userId: user.id },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            level: true,
            _count: {
              select: { lessons: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      purchases: purchases.map((purchase) => ({
        ...purchase,
        amount: purchase.amount.toString(),
      })),
    })
  } catch (error) {
    console.error('Get purchases error:', error)
    return NextResponse.json(
      { error: 'Błąd podczas pobierania historii płatności' },
      { status: 500 }
    )
  }
}

