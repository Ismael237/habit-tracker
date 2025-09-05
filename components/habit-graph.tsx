'use client'

import { useMemo } from 'react'
import { Habit, HabitEntry } from '@/types'

interface HabitGraphProps {
  habit: Habit
  entries: HabitEntry[]
  className?: string
}

interface DayData {
  date: Date
  completed: boolean
  hasConditions: boolean
  allConditionsMet: boolean
}

export function HabitGraph({ habit, entries, className }: HabitGraphProps) {
  const graphData = useMemo(() => {
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - 364) // 365 days total
    
    const data: DayData[] = []
    const entryMap = new Map(
      entries.map(entry => [
        new Date(entry.date).toDateString(),
        entry
      ])
    )

    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      const entry = entryMap.get(date.toDateString())
      const hasConditions = habit.conditions.length > 0
      const allConditionsMet = entry?.conditionsMet?.every(Boolean) || false
      
      data.push({
        date,
        completed: entry?.completed || false,
        hasConditions,
        allConditionsMet,
      })
    }

    return data
  }, [habit, entries])

  const getSquareColor = (day: DayData) => {
    if (!day.completed) return 'bg-gray-100 dark:bg-gray-800'
    
    if (day.hasConditions && day.allConditionsMet) {
      return 'bg-green-600' // Vert foncé : habitude + toutes conditions
    } else if (day.completed) {
      return 'bg-green-300' // Vert clair : habitude seule
    }
    
    return 'bg-gray-100 dark:bg-gray-800'
  }

  const getTooltipText = (day: DayData) => {
    const dateStr = day.date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    if (!day.completed) {
      return `${dateStr}\nAucune activité`
    }

    if (day.hasConditions) {
      return `${dateStr}\nHabitude: ✅\nConditions: ${day.allConditionsMet ? '✅' : '❌'}`
    }

    return `${dateStr}\nHabitude: ✅`
  }

  // Group days by weeks
  const weeks = []
  for (let i = 0; i < graphData.length; i += 7) {
    weeks.push(graphData.slice(i, i + 7))
  }

  return (
    <div className={`p-4 ${className}`}>
      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-2" style={{ color: habit.color }}>
          {habit.name}
        </h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <span>Streak actuel: {habit.streakCurrent} jours</span>
          <span>Meilleur streak: {habit.streakBest} jours</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex space-x-1 min-w-max">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col space-y-1">
              {week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`w-3 h-3 rounded-sm cursor-pointer transition-all hover:scale-110 ${getSquareColor(day)}`}
                  title={getTooltipText(day)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Il y a un an</span>
        <div className="flex items-center space-x-2">
          <span>Moins</span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-100 dark:bg-gray-800 rounded-sm" />
            <div className="w-2 h-2 bg-green-300 rounded-sm" />
            <div className="w-2 h-2 bg-green-600 rounded-sm" />
          </div>
          <span>Plus</span>
        </div>
        <span>Aujourd&apos;hui</span>
      </div>
    </div>
  )
}
