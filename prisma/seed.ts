import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data to avoid conflicts
  console.log('🧹 Clearing existing data...')
  await prisma.habitEntry.deleteMany()
  await prisma.habitCondition.deleteMany()
  await prisma.habit.deleteMany()
  await prisma.user.deleteMany()

  // Create a demo user
  const hashedPassword = await bcrypt.hash('demo123', 12)
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@habittracker.com' },
    update: {},
    create: {
      email: 'demo@habittracker.com',
      password: hashedPassword,
    },
  })

  console.log('👤 Created demo user:', user.email)

  // Create demo habits
  const habits = [
    {
      name: 'Faire du sport',
      color: '#10b981',
      notificationTime: '07:00',
      conditions: ['Minimum 30 minutes', 'Cardio ou musculation']
    },
    {
      name: 'Lire 30 minutes',
      color: '#3b82f6',
      notificationTime: '20:00',
      conditions: ['Livre physique ou ebook', 'Pas de réseaux sociaux']
    },
    {
      name: 'Méditation',
      color: '#8b5cf6',
      notificationTime: '06:30',
      conditions: ['Minimum 10 minutes', 'Environnement calme']
    },
    {
      name: 'Boire 2L d\'eau',
      color: '#06b6d4',
      notificationTime: '12:00',
      conditions: []
    },
    {
      name: 'Écrire dans mon journal',
      color: '#f59e0b',
      notificationTime: '21:30',
      conditions: ['Minimum 5 minutes', 'Réflexion personnelle']
    }
  ]

  for (const habitData of habits) {
    const habit = await prisma.habit.create({
      data: {
        userId: user.id,
        name: habitData.name,
        color: habitData.color,
        notificationTime: habitData.notificationTime,
        conditions: {
          create: habitData.conditions.map(name => ({ name }))
        }
      },
      include: {
        conditions: true
      }
    })

    console.log(`✅ Created habit: ${habit.name}`)

    // Create some sample entries for the last 30 days
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      date.setHours(0, 0, 0, 0)

      // Random completion (80% chance of completion for demo)
      const completed = Math.random() > 0.2
      const conditionsMet = habit.conditions.map(() => completed && Math.random() > 0.1)

      await prisma.habitEntry.upsert({
        where: {
          habitId_date: {
            habitId: habit.id,
            date,
          }
        },
        update: {
          completed,
          conditionsMet,
        },
        create: {
          habitId: habit.id,
          date,
          completed,
          conditionsMet,
        }
      })
    }

    console.log(`📊 Created 30 days of sample entries for: ${habit.name}`)
  }

  // Update streaks for all habits
  const allHabits = await prisma.habit.findMany({
    where: { userId: user.id },
    include: { entries: { orderBy: { date: 'desc' } } }
  })

  for (const habit of allHabits) {
    let currentStreak = 0
    let bestStreak = 0
    let tempStreak = 0

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Calculate current streak
    for (let i = 0; i < habit.entries.length; i++) {
      const entryDate = new Date(habit.entries[i].date)
      const expectedDate = new Date(today)
      expectedDate.setDate(today.getDate() - i)

      if (entryDate.getTime() === expectedDate.getTime() && habit.entries[i].completed) {
        currentStreak++
      } else {
        break
      }
    }

    // Calculate best streak
    for (const entry of habit.entries.reverse()) {
      if (entry.completed) {
        tempStreak++
        bestStreak = Math.max(bestStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    }

    await prisma.habit.update({
      where: { id: habit.id },
      data: {
        streakCurrent: currentStreak,
        streakBest: Math.max(bestStreak, currentStreak),
      }
    })

    console.log(`🔥 Updated streaks for ${habit.name}: current=${currentStreak}, best=${Math.max(bestStreak, currentStreak)}`)
  }

  console.log('✨ Database seeded successfully!')
  console.log('📧 Demo user credentials:')
  console.log('   Email: demo@habittracker.com')
  console.log('   Password: demo123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
