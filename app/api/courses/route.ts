import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    const user = await getUserFromToken(token)

    const courses = await prisma.course.findMany({
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            order: true,
            duration: true,
          },
        },
        _count: {
          select: { lessons: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    // If user is logged in, add purchase status
    if (user) {
      const purchases = await prisma.purchase.findMany({
        where: {
          userId: user.id,
          status: 'COMPLETED',
        },
        select: { courseId: true },
      })

      const purchasedCourseIds = new Set(purchases.map((p) => p.courseId))

      return NextResponse.json({
        courses: courses.map((course) => ({
          ...course,
          price: course.price.toString(),
          isPurchased: purchasedCourseIds.has(course.id),
        })),
      })
    }

    return NextResponse.json({
      courses: courses.map((course) => ({
        ...course,
        price: course.price.toString(),
        isPurchased: false,
      })),
    })
  } catch (error) {
    console.error('Get courses error:', error)
    return NextResponse.json(
      { error: 'Błąd podczas pobierania kursów' },
      { status: 500 }
    )
  }
}

