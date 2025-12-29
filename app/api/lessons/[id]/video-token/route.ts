import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateVideoToken } from '@/lib/video-security'
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting: max 10 requests per minute per IP
    const clientId = getClientIdentifier(request)
    const limit = rateLimit(clientId, 10, 60 * 1000)

    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': limit.remaining.toString(),
            'X-RateLimit-Reset': limit.resetTime.toString(),
            'Retry-After': Math.ceil((limit.resetTime - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    const token = request.cookies.get('token')?.value
    const user = await getUserFromToken(token)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: params.id },
      include: { course: true },
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

    // Generate video token
    const videoToken = generateVideoToken(user.id, lesson.id)

    const response = NextResponse.json({
      token: videoToken,
      videoUrl: lesson.videoUrl,
    })

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', '10')
    response.headers.set('X-RateLimit-Remaining', limit.remaining.toString())
    response.headers.set('X-RateLimit-Reset', limit.resetTime.toString())

    return response
  } catch (error) {
    console.error('Get video token error:', error)
    return NextResponse.json(
      { error: 'Błąd podczas generowania tokena' },
      { status: 500 }
    )
  }
}

