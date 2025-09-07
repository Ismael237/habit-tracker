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
  intensity: number // 0-4 for different shades
}

export function HabitGraph({ habit, entries, className }: HabitGraphProps) {
  const { graphData, totalContributions } = useMemo(() => {
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

    let contributions = 0

    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      const entry = entryMap.get(date.toDateString())
      const hasConditions = habit.conditions.length > 0
      const allConditionsMet = entry?.conditionsMet?.every(Boolean) || false
      const completed = entry?.completed || false
      
      if (completed) contributions++
      
      // Calculate intensity based on completion and conditions
      let intensity = 0
      if (completed) {
        if (hasConditions && allConditionsMet) {
          intensity = 4 // Darkest green
        } else if (completed) {
          intensity = 2 // Medium green
        }
      }
      
      data.push({
        date,
        completed,
        hasConditions,
        allConditionsMet,
        intensity,
      })
    }

    return { graphData: data, totalContributions: contributions }
  }, [habit, entries])

  const getSquareColor = (day: DayData) => {
    switch (day.intensity) {
      case 0:
        return 'bg-gray-200 dark:bg-gray-700'
      case 1:
        return 'bg-emerald-200 dark:bg-emerald-900/40'
      case 2:
        return 'bg-emerald-400 dark:bg-emerald-600'
      case 3:
        return 'bg-emerald-600 dark:bg-emerald-500'
      case 4:
        return 'bg-emerald-800 dark:bg-emerald-400'
      default:
        return 'bg-gray-200 dark:bg-gray-700'
    }
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

  // Generate month labels
  const getMonthLabels = () => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
    const labels = []
    const today = new Date()
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - 11 + i, 1)
      labels.push({
        month: months[date.getMonth()],
        position: i * 4.33 // Approximate position for 52 weeks
      })
    }
    
    return labels
  }

  // Generate day labels
  const getDayLabels = () => {
    return ['L', 'M', 'M', 'J', 'V', 'S', 'D']
  }

  // Group days by weeks
  const weeks = []
  for (let i = 0; i < graphData.length; i += 7) {
    weeks.push(graphData.slice(i, i + 7))
  }

  const monthLabels = getMonthLabels()
  const dayLabels = getDayLabels()

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Activité des 12 derniers mois
        </h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Moins</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-[2px] transition-all duration-200 cursor-pointer hover:scale-110 hover:opacity-80" />
            <div className="w-3 h-3 bg-emerald-200 dark:bg-emerald-900/40 rounded-[2px] transition-all duration-200 cursor-pointer hover:scale-110 hover:opacity-80" />
            <div className="w-3 h-3 bg-emerald-400 dark:bg-emerald-600 rounded-[2px] transition-all duration-200 cursor-pointer hover:scale-110 hover:opacity-80" />
            <div className="w-3 h-3 bg-emerald-600 dark:bg-emerald-500 rounded-[2px] transition-all duration-200 cursor-pointer hover:scale-110 hover:opacity-80" />
            <div className="w-3 h-3 bg-emerald-800 dark:bg-emerald-400 rounded-[2px] transition-all duration-200 cursor-pointer hover:scale-110 hover:opacity-80" />
          </div>
          <span>Plus</span>
        </div>
      </div>

      <div className="overflow-x-auto flex items-center justify-center">
        <div className="inline-flex flex-col space-y-1">
          {/* Month labels */}
          <div className="flex text-xs text-gray-500 dark:text-gray-400 mb-2 ml-8">
            {monthLabels.map((label, index) => (
              <div key={index} className="w-16 text-center">
                {label.month}
              </div>
            ))}
          </div>

          {/* Main grid container */}
          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col space-y-1 text-xs text-gray-500 dark:text-gray-400 mr-2">
              {dayLabels.map((day, index) => (
                <div key={index} className="h-3 flex items-center">
                  {index % 2 === 1 ? day : ''}
                </div>
              ))}
            </div>

            {/* Contribution squares */}
            <div className="flex space-x-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col space-y-1">
                  {week.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`w-3 h-3 rounded-[2px] cursor-pointer transition-all duration-200 hover:scale-110 hover:opacity-80 ${getSquareColor(day)}`}
                      title={getTooltipText(day)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
        <span className="font-medium">{totalContributions} contributions</span> dans les 12 derniers mois
      </div>
    </div>
  )
}
