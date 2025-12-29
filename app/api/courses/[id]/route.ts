import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('token')?.value
    const user = await getUserFromToken(token)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          include: {
            progress: {
              where: { userId: user.id },
              select: {
                completed: true,
                progress: true,
                watchedAt: true,
              },
            },
          },
        },
      },
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Kurs nie został znaleziony' },
        { status: 404 }
      )
    }

    // Check if user purchased this course
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: user.id,
        courseId: course.id,
        status: 'COMPLETED',
      },
    })

    return NextResponse.json({
      course: {
        ...course,
        price: course.price.toString(),
        isPurchased: !!purchase,
        lessons: course.lessons.map((lesson) => ({
          ...lesson,
          progress: lesson.progress[0] || null,
        })),
      },
    })
  } catch (error) {
    console.error('Get course error:', error)
    return NextResponse.json(
      { error: 'Błąd podczas pobierania kursu' },
      { status: 500 }
    )
  }
}

