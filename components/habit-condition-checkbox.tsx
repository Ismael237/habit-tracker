'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Check, Loader2 } from 'lucide-react'
import { Habit, HabitEntry, HabitCondition } from '@/types'
import { useHabitsStore } from '@/stores/habits-store'
import { toast } from 'sonner'

interface HabitConditionCheckboxProps {
  habit: Habit
  condition: HabitCondition
  conditionIndex: number
  todayEntry?: HabitEntry
  onUpdate?: () => void
}

export function HabitConditionCheckbox({ 
  habit,
  condition,
  conditionIndex,
  todayEntry,
  onUpdate
}: HabitConditionCheckboxProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { isOnline, addOfflineEntry } = useHabitsStore()
  
  const isConditionMet = todayEntry?.conditionsMet?.[conditionIndex] || false
  const isHabitCompleted = todayEntry?.completed || false

  const handleToggle = async (checked: boolean) => {
    // Empêcher de décocher une condition déjà validée
    if (!checked && isConditionMet) {
      toast.error('Impossible de décocher une condition déjà validée')
      return
    }

    setIsLoading(true)
    
    try {
      const today = new Date().toISOString().split('T')[0]
      
      // Créer un nouveau tableau des conditions avec la mise à jour
      const newConditionsMet = [...(todayEntry?.conditionsMet || habit.conditions.map(() => false))]
      newConditionsMet[conditionIndex] = checked
      
      // Vérifier si toutes les conditions sont remplies
      const allConditionsMet = newConditionsMet.every(Boolean)
      
      if (isOnline) {
        const response = await fetch('/api/habits/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            habitId: habit.id,
            date: today,
            completed: allConditionsMet,
            conditionsMet: newConditionsMet,
          }),
        })

        if (!response.ok) {
          throw new Error('Erreur lors de la sauvegarde')
        }

        toast.success(checked ? `Condition "${condition.name}" validée !` : `Condition "${condition.name}" annulée`)
        
        if (allConditionsMet && !isHabitCompleted) {
          toast.success('🎉 Toutes les conditions sont remplies ! Habitude complétée !')
        }
      } else {
        // Save offline
        addOfflineEntry({
          habitId: habit.id,
          date: today,
          completed: allConditionsMet,
          conditionsMet: newConditionsMet,
          synced: false,
        })
        
        toast.success(checked ? `Condition "${condition.name}" validée (hors ligne)` : `Condition "${condition.name}" annulée (hors ligne)`)
      }

      onUpdate?.()
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div 
      className={`flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 transition-all cursor-pointer ${
        isLoading 
          ? 'bg-gray-100 dark:bg-gray-800' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
      } ${isConditionMet ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : ''}`}
      onClick={() => !isLoading && !isConditionMet && handleToggle(true)}
    >
      <div className="relative">
        <Checkbox
          checked={isConditionMet}
          onCheckedChange={handleToggle}
          disabled={isLoading || isConditionMet} // Empêcher de décocher
          className="h-5 w-5"
          style={{
            backgroundColor: isConditionMet ? habit.color : 'transparent',
            borderColor: habit.color
          }}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
          </div>
        )}
      </div>
      
      <div className="flex-1">
        <span className={`text-sm transition-colors ${
          isConditionMet 
            ? 'text-gray-900 dark:text-gray-100 font-medium' 
            : 'text-gray-600 dark:text-gray-400'
        }`}>
          {condition.name}
        </span>
        {isLoading && (
          <div className="text-xs text-gray-500 mt-1">
            Validation en cours...
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        )}
        {isConditionMet && !isLoading && (
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <Check className="h-3 w-3 mr-1" />
            Validé
          </Badge>
        )}
      </div>
    </div>
  )
}
