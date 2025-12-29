'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import VideoPlayer from '@/components/VideoPlayer'
import Link from 'next/link'

interface Lesson {
  id: string
  title: string
  description: string | null
  videoUrl: string
  order: number
  duration: number | null
}

interface Course {
  id: string
  name: string
  lessons: Lesson[]
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [videoToken, setVideoToken] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUserId(data.user.id)
        }
      })

    // Get course data
    fetch(`/api/courses/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setCourse(data.course)
        const foundLesson = data.course.lessons.find(
          (l: Lesson) => l.id === params.lessonId
        )
        if (foundLesson) {
          setLesson(foundLesson)
        }
      })

    // Get video token
    fetch(`/api/lessons/${params.lessonId}/video-token`)
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          setVideoToken(data.token)
          if (data.videoUrl && !lesson) {
            setLesson((prev) => (prev ? { ...prev, videoUrl: data.videoUrl } : null))
          }
        } else {
          alert(data.error || 'Błąd podczas ładowania lekcji')
          router.push(`/courses/${params.id}`)
        }
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [params.id, params.lessonId, router])

  const handleProgress = async (progress: number) => {
    // Update progress every 10%
    if (progress % 10 < 1 && progress > 0) {
      try {
        await fetch(`/api/lessons/${params.lessonId}/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            progress: Math.round(progress),
            completed: progress >= 90,
          }),
        })
      } catch (err) {
        console.error('Failed to update progress:', err)
      }
    }
  }

  const handleComplete = async () => {
    try {
      await fetch(`/api/lessons/${params.lessonId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          progress: 100,
          completed: true,
        }),
      })
    } catch (err) {
      console.error('Failed to mark as complete:', err)
    }
  }

  const currentIndex = course?.lessons.findIndex((l) => l.id === params.lessonId) ?? -1
  const prevLesson = course && currentIndex > 0 ? course.lessons[currentIndex - 1] : null
  const nextLesson = course && currentIndex >= 0 && currentIndex < course.lessons.length - 1 ? course.lessons[currentIndex + 1] : null

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-xl font-bold text-gray-900">
                  Trading Learning Framework
                </Link>
                <Link
                  href={`/courses/${params.id}`}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  ← Powrót do kursu
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {loading ? (
              <div className="text-center py-12">
                <div className="text-lg text-gray-600">Ładowanie lekcji...</div>
              </div>
            ) : !course || !lesson ? (
              <div className="text-center py-12">
                <div className="text-lg text-gray-600">Lekcja nie została znaleziona</div>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
                  {lesson.description && (
                    <p className="text-gray-600">{lesson.description}</p>
                  )}
                </div>

                {videoToken && userId && (
                  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <VideoPlayer
                      videoUrl={lesson.videoUrl}
                      token={videoToken}
                      userId={userId}
                      lessonId={lesson.id}
                      onProgress={handleProgress}
                      onComplete={handleComplete}
                    />
                  </div>
                )}

                <div className="flex justify-between items-center">
                  {prevLesson ? (
                    <Link
                      href={`/courses/${params.id}/lessons/${prevLesson.id}`}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      ← Poprzednia lekcja
                    </Link>
                  ) : (
                    <div />
                  )}
                  {nextLesson ? (
                    <Link
                      href={`/courses/${params.id}/lessons/${nextLesson.id}`}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Następna lekcja →
                    </Link>
                  ) : (
                    <Link
                      href={`/courses/${params.id}`}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Zakończ kurs
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

