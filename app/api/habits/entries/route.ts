import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { habitEntrySchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const { habitId, date, completed, conditionsMet } = habitEntrySchema.parse(body)

    // Verify habit belongs to user
    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId: session.userId },
    })

    if (!habit) {
      return NextResponse.json(
        { error: 'Habitude non trouvée' },
        { status: 404 }
      )
    }

    const entryDate = new Date(date)
    entryDate.setHours(0, 0, 0, 0) // Normalize to start of day

    // Upsert entry (create or update)
    const entry = await prisma.habitEntry.upsert({
      where: {
        habitId_date: {
          habitId,
          date: entryDate,
        },
      },
      update: {
        completed,
        conditionsMet: conditionsMet || [],
      },
      create: {
        habitId,
        date: entryDate,
        completed,
        conditionsMet: conditionsMet || [],
      },
    })

    // Update streak if completed
    if (completed) {
      await updateHabitStreak(habitId)
    }

    return NextResponse.json({ entry })
  } catch (error) {
    console.error('Create entry error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde' },
      { status: 500 }
    )
  }
}

async function updateHabitStreak(habitId: string) {
  const entries = await prisma.habitEntry.findMany({
    where: { habitId, completed: true },
    orderBy: { date: 'desc' },
  })

  let currentStreak = 0
  let bestStreak = 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Calculate current streak
  for (let i = 0; i < entries.length; i++) {
    const entryDate = new Date(entries[i].date)
    const expectedDate = new Date(today)
    expectedDate.setDate(today.getDate() - i)

    if (entryDate.getTime() === expectedDate.getTime()) {
      currentStreak++
    } else {
      break
    }
  }

  // Calculate best streak
  let tempStreak = 0
  let lastDate: Date | null = null

  for (const entry of entries) {
    const entryDate = new Date(entry.date)
    
    if (!lastDate || 
        (lastDate.getTime() - entryDate.getTime()) === 24 * 60 * 60 * 1000) {
      tempStreak++
      bestStreak = Math.max(bestStreak, tempStreak)
    } else {
      tempStreak = 1
    }
    
    lastDate = entryDate
  }

  await prisma.habit.update({
    where: { id: habitId },
    data: {
      streakCurrent: currentStreak,
      streakBest: Math.max(bestStreak, currentStreak),
    },
  })
}
