'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Flame, Target } from 'lucide-react'
import { Habit, HabitEntry } from '@/types'
import { useHabitsStore } from '@/stores/habits-store'
import { toast } from 'sonner'

interface HabitCheckboxProps {
  habit: Habit
  todayEntry?: HabitEntry
  onToggle?: (habitId: string, completed: boolean) => void
}

export function HabitCheckbox({ habit, todayEntry, onToggle }: HabitCheckboxProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { isOnline, addOfflineEntry } = useHabitsStore()
  
  const isCompleted = todayEntry?.completed || false
  const streak = habit.streakCurrent

  const handleToggle = async (checked: boolean) => {
    setIsLoading(true)
    
    try {
      const today = new Date().toISOString().split('T')[0]
      
      if (isOnline) {
        const response = await fetch('/api/habits/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            habitId: habit.id,
            date: today,
            completed: checked,
            conditionsMet: habit.conditions.map(() => checked),
          }),
        })

        if (!response.ok) {
          throw new Error('Erreur lors de la sauvegarde')
        }

        toast.success(checked ? 'Habitude validée !' : 'Habitude annulée')
      } else {
        // Save offline
        addOfflineEntry({
          habitId: habit.id,
          date: today,
          completed: checked,
          conditionsMet: habit.conditions.map(() => checked),
          synced: false,
        })
        
        toast.success(checked ? 'Habitude validée (hors ligne)' : 'Habitude annulée (hors ligne)')
      }

      onToggle?.(habit.id, checked)
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={handleToggle}
            disabled={isLoading}
            className="h-6 w-6"
            style={{
              backgroundColor: isCompleted ? habit.color : 'transparent',
              borderColor: habit.color
            }}
          />
          
          <div>
            <h3 className="font-medium text-lg">{habit.name}</h3>
            {habit.conditions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {habit.conditions.map((condition) => (
                  <Badge
                    key={condition.id}
                    variant="outline"
                    className="text-xs"
                  >
                    {condition.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {streak > 0 && (
            <div className="flex items-center space-x-1 text-orange-500">
              <Flame className="h-4 w-4" />
              <span className="font-bold">{streak}</span>
            </div>
          )}
          
          {habit.streakBest > 0 && (
            <div className="flex items-center space-x-1 text-blue-500">
              <Target className="h-4 w-4" />
              <span className="text-sm">{habit.streakBest}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
