import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    const user = await getUserFromToken(token)

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const courses = await prisma.course.findMany({
      include: {
        _count: {
          select: {
            lessons: true,
            purchases: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      courses: courses.map((course) => ({
        ...course,
        price: course.price.toString(),
      })),
    })
  } catch (error) {
    console.error('Get admin courses error:', error)
    return NextResponse.json(
      { error: 'Błąd podczas pobierania kursów' },
      { status: 500 }
    )
  }
}

