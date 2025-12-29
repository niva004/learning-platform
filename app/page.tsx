'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import CourseCard from '@/components/CourseCard'

interface Course {
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

const stats = [
  { value: '2,847+', label: 'Aktywnych studentów' },
  { value: '89%', label: 'Wskaźnik sukcesu' },
  { value: '€4.2M+', label: 'Wypracowany zysk studentów' },
  { value: '15+', label: 'Lat doświadczenia' },
]

const features = [
  {
    title: 'Sprawdzone strategie',
    description: 'Strategie przetestowane na rynkach przez ponad 15 lat. Żadnych teorii - tylko to, co działa.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Live Trading Sessions',
    description: 'Cotygodniowe sesje live gdzie analizujemy rynek w czasie rzeczywistym i szukamy setupów.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Wsparcie mentora',
    description: 'Bezpośredni dostęp do mentora. Odpowiedzi na pytania, analiza Twoich trade\'ów.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    ),
  },
  {
    title: 'Risk Management',
    description: 'Nauczysz się profesjonalnego zarządzania ryzykiem i kapitałem - klucz do długoterminowego sukcesu.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
]

const testimonials = [
  {
    name: 'Marcin K.',
    role: 'Full-time Trader od 2023',
    content: 'Po 6 miesiącach kursu rzuciłem pracę i traduje full-time. Strategia price action zmieniła moje podejście do rynków.',
    profit: '+340% ROI w 2024',
  },
  {
    name: 'Anna W.',
    role: 'Inwestorka, Warszawa',
    content: 'Najlepsza inwestycja w siebie. Jasne tłumaczenie, świetna społeczność i realne wyniki. Polecam każdemu.',
    profit: '+€28,500 w 12 miesięcy',
  },
  {
    name: 'Tomasz P.',
    role: 'Trader Forex',
    content: 'Wreszcie kurs, który uczy prawdziwego tradingu a nie teorii. Support jest niesamowity.',
    profit: '+67% na koncie w Q4 2024',
  },
]

const faqs = [
  {
    question: 'Czy kurs jest odpowiedni dla początkujących?',
    answer: 'Tak! Mamy dedykowany moduł dla początkujących, który przeprowadzi Cię przez podstawy tradingu krok po kroku. Nie musisz mieć żadnego doświadczenia.',
  },
  {
    question: 'Jak długo mam dostęp do materiałów?',
    answer: 'Dostęp do materiałów jest dożywotni. Kupujesz raz i masz dostęp na zawsze, włącznie z wszystkimi przyszłymi aktualizacjami.',
  },
  {
    question: 'Ile czasu muszę poświęcić na naukę?',
    answer: 'Zalecamy minimum 1-2 godziny dziennie na naukę i praktykę. Im więcej czasu poświęcisz, tym szybciej zobaczysz wyniki.',
  },
  {
    question: 'Czy mogę zarabiać tradując part-time?',
    answer: 'Absolutnie tak. Wielu naszych studentów traduje 2-3 godziny dziennie i osiąga świetne wyniki. Nauczymy Cię jak znaleźć najlepsze sesje pod Twój harmonogram.',
  },
]

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [currentScreenshot, setCurrentScreenshot] = useState(0)

  const screenshots = [
    '/images/trade-screenshot-1.svg',
    '/images/trade-screenshot-2.svg',
    '/images/trade-screenshot-3.svg',
  ]

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user)
        }
      })

    fetch('/api/courses')
      .then((res) => res.json())
      .then((data) => {
        setCourses(data.courses)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScreenshot((prev) => (prev + 1) % screenshots.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d1117]/90 backdrop-blur-md border-b border-[#30363d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#00d26a] to-[#00a854] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">TradeMaster<span className="text-[#00d26a]">Pro</span></span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-[#c9d1d9] hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="text-[#c9d1d9] hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={async () => {
                      await fetch('/api/auth/logout', { method: 'POST' })
                      window.location.href = '/'
                    }}
                    className="text-[#c9d1d9] hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Wyloguj
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-[#c9d1d9] hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Zaloguj
                  </Link>
                  <Link
                    href="/register"
                    className="btn-trading-primary px-5 py-2 rounded-lg text-sm"
                  >
                    Dołącz teraz
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-trading-hero bg-chart-pattern overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0d1117]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00d26a]/10 border border-[#00d26a]/30 text-[#00d26a] text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-[#00d26a] rounded-full animate-pulse" />
                Nowy kurs 2025 dostępny
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Zarabiaj na rynkach
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#00d26a] to-[#ffd700]">
                  jak profesjonaliści
                </span>
              </h1>

              <p className="text-lg md:text-xl text-[#8b949e] mb-8 max-w-xl mx-auto lg:mx-0">
                Dołącz do ponad 2,800 traderów, którzy zmienili swoje podejście do tradingu dzięki sprawdzonym strategiom i wsparciu ekspertów.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <a
                  href="#courses"
                  className="btn-trading-primary px-8 py-4 rounded-xl text-lg font-semibold inline-flex items-center justify-center gap-2"
                >
                  Rozpocznij naukę
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
                <a
                  href="#results"
                  className="btn-trading-secondary px-8 py-4 rounded-xl text-lg font-semibold inline-flex items-center justify-center gap-2"
                >
                  Zobacz wyniki
                </a>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-[#8b949e]">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#00d26a]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Dożywotni dostęp
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#00d26a]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Wsparcie 24/7
                </div>
              </div>
            </div>

            {/* Screenshot carousel */}
            <div className="relative">
              <div className="screenshot-container relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#00d26a]/20 to-[#ffd700]/20 rounded-xl blur-lg" />
                <div className="relative bg-[#161b22] rounded-xl overflow-hidden border border-[#30363d]">
                  {/* Browser-like header */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-[#0d1117] border-b border-[#30363d]">
                    <div className="w-3 h-3 rounded-full bg-[#ff4757]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffd700]" />
                    <div className="w-3 h-3 rounded-full bg-[#00d26a]" />
                    <span className="ml-4 text-xs text-[#8b949e]">TradingView - EUR/USD</span>
                  </div>
                  <div className="relative aspect-video">
                    <Image
                      src={screenshots[currentScreenshot]}
                      alt="Trade screenshot"
                      fill
                      className="object-cover transition-opacity duration-500"
                    />
                  </div>
                </div>
              </div>

              {/* Screenshot indicators */}
              <div className="flex justify-center gap-2 mt-4">
                {screenshots.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentScreenshot(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      currentScreenshot === index
                        ? 'w-8 bg-[#00d26a]'
                        : 'bg-[#30363d] hover:bg-[#8b949e]'
                    }`}
                  />
                ))}
              </div>

              {/* Floating profit badge */}
              <div className="absolute -bottom-4 -left-4 bg-[#161b22] border border-[#00d26a] rounded-xl px-4 py-3 shadow-lg glow-green-sm">
                <div className="text-[#8b949e] text-xs">Dzisiejszy zysk</div>
                <div className="text-[#00d26a] text-2xl font-bold">+$2,847</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-[#30363d] bg-[#161b22]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="stat-number text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-[#8b949e] text-sm md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section id="results" className="py-20 bg-[#0d1117]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Prawdziwe wyniki naszych studentów
            </h2>
            <p className="text-[#8b949e] text-lg max-w-2xl mx-auto">
              Oto przykłady transakcji wykonanych przez naszych studentów używając strategii z kursu.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {screenshots.map((src, index) => (
              <div key={index} className="card-trading rounded-xl overflow-hidden">
                <div className="relative aspect-video">
                  <Image src={src} alt={`Trade result ${index + 1}`} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8b949e] text-sm">Trade #{index + 1}</span>
                    <span className="profit-badge px-3 py-1 rounded-full text-sm font-semibold">
                      +{[140, 230, 114][index]} pips
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[#161b22]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Co otrzymujesz w kursie?
            </h2>
            <p className="text-[#8b949e] text-lg max-w-2xl mx-auto">
              Kompleksowe szkolenie tradingowe z wszystkim, czego potrzebujesz, żeby zacząć zarabiać na rynkach.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="card-trading rounded-xl p-6">
                <div className="w-14 h-14 rounded-xl bg-[#00d26a]/10 flex items-center justify-center text-[#00d26a] mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-[#8b949e]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-[#0d1117]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Co mówią nasi studenci?
            </h2>
            <p className="text-[#8b949e] text-lg max-w-2xl mx-auto">
              Dołącz do społeczności traderów, którzy już zmienili swoje życie.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card-trading rounded-xl p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-[#ffd700]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[#c9d1d9] mb-6">&quot;{testimonial.content}&quot;</p>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-[#8b949e] text-sm">{testimonial.role}</div>
                  </div>
                  <div className="profit-badge px-3 py-1 rounded-full text-xs font-semibold">
                    {testimonial.profit}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-20 bg-[#161b22]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Wybierz swój kurs
            </h2>
            <p className="text-[#8b949e] text-lg max-w-2xl mx-auto">
              Znajdź kurs dopasowany do Twojego poziomu i celów tradingowych.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-[#30363d] border-t-[#00d26a] rounded-full animate-spin" />
              <div className="text-[#8b949e] mt-4">Ładowanie kursów...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-[#0d1117]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Często zadawane pytania
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="card-trading rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center"
                >
                  <span className="font-semibold text-white">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-[#8b949e] transition-transform ${openFaq === index ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-[#8b949e]">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-trading-hero bg-chart-pattern relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-[#0d1117]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Gotowy, żeby zmienić swoje życie?
          </h2>
          <p className="text-[#8b949e] text-lg mb-8 max-w-2xl mx-auto">
            Dołącz do tysięcy traderów, którzy już zarabiają na rynkach. Rozpocznij swoją podróż dzisiaj.
          </p>
          <a
            href="#courses"
            className="btn-trading-primary px-10 py-4 rounded-xl text-lg font-semibold inline-flex items-center justify-center gap-2"
          >
            Dołącz teraz
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <p className="text-[#8b949e] text-sm mt-4">
            30-dniowa gwarancja zwrotu pieniędzy
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#0d1117] border-t border-[#30363d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#00d26a] to-[#00a854] rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">TradeMaster<span className="text-[#00d26a]">Pro</span></span>
            </div>
            <div className="text-[#8b949e] text-sm">
              &copy; 2025 TradeMasterPro. Wszelkie prawa zastrzeżone.
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-[#8b949e] hover:text-white transition-colors">Regulamin</a>
              <a href="#" className="text-[#8b949e] hover:text-white transition-colors">Polityka prywatności</a>
              <a href="#" className="text-[#8b949e] hover:text-white transition-colors">Kontakt</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
