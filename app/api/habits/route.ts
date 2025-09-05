import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { habitSchema } from '@/lib/validations'

export async function GET() {
  try {
    const session = await requireAuth()
    
    const habits = await prisma.habit.findMany({
      where: { userId: session.userId },
      include: {
        conditions: true,
        entries: {
          orderBy: { date: 'desc' },
          take: 365, // Last year of entries
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ habits })
  } catch (error) {
    console.error('Get habits error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des habitudes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const { name, color, notificationTime, conditions } = habitSchema.parse(body)

    const habit = await prisma.habit.create({
      data: {
        userId: session.userId!,
        name,
        color,
        notificationTime,
        conditions: {
          create: conditions?.map(name => ({ name })) || [],
        },
      },
      include: {
        conditions: true,
        entries: true,
      },
    })

    return NextResponse.json({ habit })
  } catch (error) {
    console.error('Create habit error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'habitude' },
      { status: 500 }
    )
  }
}
