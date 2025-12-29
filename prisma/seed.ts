import { PrismaClient, CourseLevel } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create Beginner Course
  const beginnerCourse = await prisma.course.upsert({
    where: { id: 'course-beginner' },
    update: {},
    create: {
      id: 'course-beginner',
      name: 'Kurs Początkujący',
      level: CourseLevel.BEGINNER,
      description: 'Kurs dla osób zaczynających przygodę z tradingiem. Poznasz podstawy rynków finansowych, analizy technicznej i zarządzania ryzykiem.',
      price: 299.00,
      lessons: {
        create: [
          {
            id: 'lesson-1',
            title: 'Wprowadzenie do tradingu',
            description: 'Podstawowe pojęcia i wprowadzenie do świata tradingu',
            videoUrl: '/videos/beginner/lesson-1.mp4',
            order: 1,
            duration: 1800, // 30 minutes
          },
          {
            id: 'lesson-2',
            title: 'Rynek Forex - podstawy',
            description: 'Jak działa rynek Forex i podstawowe pojęcia',
            videoUrl: '/videos/beginner/lesson-2.mp4',
            order: 2,
            duration: 2400, // 40 minutes
          },
          {
            id: 'lesson-3',
            title: 'Analiza techniczna - podstawy',
            description: 'Wprowadzenie do analizy technicznej i wykresów',
            videoUrl: '/videos/beginner/lesson-3.mp4',
            order: 3,
            duration: 2700, // 45 minutes
          },
        ],
      },
    },
  })

  // Create Intermediate Course
  const intermediateCourse = await prisma.course.upsert({
    where: { id: 'course-intermediate' },
    update: {},
    create: {
      id: 'course-intermediate',
      name: 'Kurs Średnio Zaawansowany',
      level: CourseLevel.INTERMEDIATE,
      description: 'Zaawansowane strategie tradingowe, zarządzanie portfelem i psychologia tradingu dla średnio zaawansowanych traderów.',
      price: 499.00,
      lessons: {
        create: [
          {
            id: 'lesson-4',
            title: 'Zaawansowane strategie tradingowe',
            description: 'Kompleksowe strategie dla doświadczonych traderów',
            videoUrl: '/videos/intermediate/lesson-4.mp4',
            order: 1,
            duration: 3600, // 60 minutes
          },
          {
            id: 'lesson-5',
            title: 'Zarządzanie ryzykiem i portfelem',
            description: 'Jak efektywnie zarządzać kapitałem i ograniczać ryzyko',
            videoUrl: '/videos/intermediate/lesson-5.mp4',
            order: 2,
            duration: 3300, // 55 minutes
          },
          {
            id: 'lesson-6',
            title: 'Psychologia tradingu',
            description: 'Mentalność i emocje w tradingu',
            videoUrl: '/videos/intermediate/lesson-6.mp4',
            order: 3,
            duration: 3000, // 50 minutes
          },
        ],
      },
    },
  })

  console.log('Seeding completed!')
  console.log('Created courses:', { beginnerCourse, intermediateCourse })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

