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
    INTERMEDIATE: 'Zaawansowany',
  }

  const levelColors: Record<string, string> = {
    BEGINNER: 'bg-[#00d26a]/10 text-[#00d26a] border-[#00d26a]/30',
    INTERMEDIATE: 'bg-[#ffd700]/10 text-[#ffd700] border-[#ffd700]/30',
  }

  return (
    <div className="card-trading rounded-xl overflow-hidden group">
      {/* Header gradient */}
      <div className="h-2 bg-gradient-to-r from-[#00d26a] to-[#00a854]" />

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white group-hover:text-[#00d26a] transition-colors">
            {course.name}
          </h3>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${levelColors[course.level] || 'bg-[#30363d] text-[#8b949e]'}`}>
            {levelLabels[course.level] || course.level}
          </span>
        </div>

        {course.description && (
          <p className="text-[#8b949e] mb-6 line-clamp-3 leading-relaxed">{course.description}</p>
        )}

        {/* Features list */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-sm text-[#c9d1d9]">
            <svg className="w-4 h-4 text-[#00d26a]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {course._count.lessons} lekcji wideo HD
          </div>
          <div className="flex items-center gap-2 text-sm text-[#c9d1d9]">
            <svg className="w-4 h-4 text-[#00d26a]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Dożywotni dostęp
          </div>
          <div className="flex items-center gap-2 text-sm text-[#c9d1d9]">
            <svg className="w-4 h-4 text-[#00d26a]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Wsparcie mentora
          </div>
        </div>

        <div className="flex items-end justify-between pt-4 border-t border-[#30363d]">
          <div>
            <p className="text-sm text-[#8b949e] mb-1">Cena kursu</p>
            <p className="text-3xl font-bold text-white">
              {course.price}
              <span className="text-lg text-[#8b949e] ml-1">PLN</span>
            </p>
          </div>
          <Link
            href={`/courses/${course.id}`}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              course.isPurchased
                ? 'bg-[#00d26a] text-black hover:bg-[#00a854]'
                : 'btn-trading-primary'
            }`}
          >
            {course.isPurchased ? 'Kontynuuj naukę' : 'Kup teraz'}
          </Link>
        </div>

        {course.isPurchased && (
          <div className="mt-4 flex items-center gap-2 text-sm text-[#00d26a] font-medium bg-[#00d26a]/10 px-3 py-2 rounded-lg">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Kurs wykupiony - masz pełny dostęp
          </div>
        )}
      </div>
    </div>
  )
}
