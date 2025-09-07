import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    const userId = session.userId!
    const resolvedParams = await params
    const habitId = resolvedParams.id

    const habit = await prisma.habit.findFirst({
      where: {
        id: habitId,
        userId,
      },
      include: {
        conditions: true,
        entries: {
          orderBy: {
            date: 'desc'
          }
        }
      }
    })

    if (!habit) {
      return NextResponse.json(
        { error: 'Habitude non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json({ habit })
  } catch (error) {
    console.error('Error fetching habit:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    const userId = session.userId!
    const resolvedParams = await params
    const habitId = resolvedParams.id
    const body = await request.json()

    const { name, color, notificationTime, conditions } = body

    // Verify habit belongs to user
    const existingHabit = await prisma.habit.findFirst({
      where: {
        id: habitId,
        userId,
      }
    })

    if (!existingHabit) {
      return NextResponse.json(
        { error: 'Habitude non trouvée' },
        { status: 404 }
      )
    }

    // Update habit and conditions in a transaction
    const updatedHabit = await prisma.$transaction(async (tx) => {
      // Delete existing conditions
      await tx.habitCondition.deleteMany({
        where: { habitId }
      })

      // Update habit
      await tx.habit.update({
        where: { id: habitId },
        data: {
          name,
          color,
          notificationTime,
        }
      })

      // Create new conditions if provided
      if (conditions && conditions.length > 0) {
        await tx.habitCondition.createMany({
          data: conditions.map((condition: string) => ({
            habitId,
            name: condition,
          }))
        })
      }

      // Return updated habit with relations
      return await tx.habit.findUnique({
        where: { id: habitId },
        include: {
          conditions: true,
          entries: {
            orderBy: {
              date: 'desc'
            }
          }
        }
      })
    })

    return NextResponse.json({ habit: updatedHabit })
  } catch (error) {
    console.error('Error updating habit:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    const userId = session.userId!
    const resolvedParams = await params
    const habitId = resolvedParams.id

    // Verify habit belongs to user
    const existingHabit = await prisma.habit.findFirst({
      where: {
        id: habitId,
        userId,
      }
    })

    if (!existingHabit) {
      return NextResponse.json(
        { error: 'Habitude non trouvée' },
        { status: 404 }
      )
    }

    // Delete habit (cascade will handle conditions and entries)
    await prisma.habit.delete({
      where: { id: habitId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting habit:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
