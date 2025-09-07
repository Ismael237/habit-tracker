'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Loader2, Target } from 'lucide-react'
import { Habit, HabitEntry } from '@/types'
import { useHabitsStore } from '@/stores/habits-store'
import { toast } from 'sonner'

interface HabitCompletionProps {
  habit: Habit
  todayEntry?: HabitEntry
  onUpdate?: () => void
}

export function HabitCompletion({ habit, todayEntry, onUpdate }: HabitCompletionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { isOnline, addOfflineEntry } = useHabitsStore()
  
  const isCompleted = todayEntry?.completed || false
  const hasConditions = habit.conditions && habit.conditions.length > 0
  const allConditionsMet = todayEntry?.conditionsMet?.every(Boolean) || false

  const handleToggle = async () => {
    // Empêcher de décocher une habitude déjà validée
    if (isCompleted) {
      toast.error('Impossible de décocher une habitude déjà validée')
      return
    }

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
            completed: true,
            conditionsMet: habit.conditions.map(() => false), // Les conditions restent à valider séparément
          }),
        })

        if (!response.ok) {
          throw new Error('Erreur lors de la sauvegarde')
        }

        toast.success('🎉 Habitude validée !')
      } else {
        // Save offline
        addOfflineEntry({
          habitId: habit.id,
          date: today,
          completed: true,
          conditionsMet: habit.conditions.map(() => false),
          synced: false,
        })
        
        toast.success('🎉 Habitude validée (hors ligne)')
      }

      onUpdate?.()
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Validation principale de l'habitude */}
      <div className={`p-4 rounded-lg border transition-all ${
        isCompleted 
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Target className="h-5 w-5 text-gray-500" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                Habitude principale
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isCompleted ? 'Habitude validée pour aujourd\'hui' : 'Marquer l\'habitude comme terminée'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {isCompleted ? (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                <Check className="h-3 w-3 mr-1" />
                Terminé
              </Badge>
            ) : (
              <Button
                onClick={handleToggle}
                disabled={isLoading}
                size="sm"
                style={{ backgroundColor: habit.color }}
                className="text-white hover:opacity-90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Validation...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Valider
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Résumé des conditions si elles existent */}
      {hasConditions && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center justify-between">
            <span>Conditions supplémentaires :</span>
            <span>
              {todayEntry?.conditionsMet?.filter(Boolean).length || 0} / {habit.conditions.length} validées
            </span>
          </div>
          {allConditionsMet && (
            <div className="mt-2 text-green-600 dark:text-green-400 font-medium">
              🎯 Toutes les conditions sont remplies !
            </div>
          )}
        </div>
      )}
    </div>
  )
}
