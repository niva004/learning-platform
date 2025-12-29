import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateProgressSchema = z.object({
  progress: z.number().min(0).max(100),
  completed: z.boolean().optional(),
})

export async function POST(
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

    const body = await request.json()
    const { progress, completed } = updateProgressSchema.parse(body)

    // Check if lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: params.id },
    })

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lekcja nie została znaleziona' },
        { status: 404 }
      )
    }

    // Check if user purchased the course
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: user.id,
        courseId: lesson.courseId,
        status: 'COMPLETED',
      },
    })

    if (!purchase && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Musisz wykupić kurs, aby uzyskać dostęp do lekcji' },
        { status: 403 }
      )
    }

    // Update or create progress
    const progressRecord = await prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: params.id,
        },
      },
      update: {
        progress,
        completed: completed ?? (progress >= 90),
        watchedAt: completed || progress >= 90 ? new Date() : undefined,
      },
      create: {
        userId: user.id,
        lessonId: params.id,
        progress,
        completed: completed ?? (progress >= 90),
        watchedAt: completed || progress >= 90 ? new Date() : undefined,
      },
    })

    return NextResponse.json({ progress: progressRecord })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Update progress error:', error)
    return NextResponse.json(
      { error: 'Błąd podczas aktualizacji postępu' },
      { status: 500 }
    )
  }
}

