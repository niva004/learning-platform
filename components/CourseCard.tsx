'use client'

import Link from 'next/link'

interface CourseCardProps {
  course: {
    id: string
    name: string
    description: string | null
    price: string
    level: string
    isPurchased: boolean
    _count: {
      lessons: number
    }
  }
}

export default function CourseCard({ course }: CourseCardProps) {
  const levelLabels: Record<string, string> = {
    BEGINNER: 'Początkujący',
    INTERMEDIATE: 'Średnio Zaawansowany',
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900">{course.name}</h3>
          <span className="px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full">
            {levelLabels[course.level] || course.level}
          </span>
        </div>
        {course.description && (
          <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>
        )}
        <div className="flex items-center justify-between mt-4">
          <div>
            <p className="text-2xl font-bold text-gray-900">{course.price} PLN</p>
            <p className="text-sm text-gray-500">{course._count.lessons} lekcji</p>
          </div>
          <Link
            href={course.isPurchased ? `/courses/${course.id}` : `/courses/${course.id}`}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            {course.isPurchased ? 'Zobacz kurs' : 'Zobacz szczegóły'}
          </Link>
        </div>
        {course.isPurchased && (
          <div className="mt-3 text-sm text-green-600 font-medium">
            ✓ Wykupione
          </div>
        )}
      </div>
    </div>
  )
}

