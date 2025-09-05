'use client'

import { useState, useEffect } from 'react'
import { Habit, HabitEntry } from '@/types'
import { useHabitsStore } from '@/stores/habits-store'
import { toast } from 'sonner'

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { isOnline, addOfflineEntry } = useHabitsStore()

  const fetchHabits = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/habits')
      
      if (response.ok) {
        const data = await response.json()
        setHabits(data.habits)
      } else {
        throw new Error('Failed to fetch habits')
      }
    } catch (error) {
      console.error('Error fetching habits:', error)
      toast.error('Erreur lors du chargement des habitudes')
    } finally {
      setIsLoading(false)
    }
  }

  const createHabit = async (habitData: {
    name: string
    color: string
    notificationTime?: string
    conditions?: string[]
  }) => {
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habitData),
      })

      if (response.ok) {
        const data = await response.json()
        setHabits(prev => [...prev, data.habit])
        toast.success('Habitude créée avec succès !')
        return data.habit
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create habit')
      }
    } catch (error) {
      console.error('Error creating habit:', error)
      toast.error('Erreur lors de la création de l\'habitude')
      throw error
    }
  }

  const toggleHabit = async (habitId: string, completed: boolean) => {
    const today = new Date().toISOString().split('T')[0]
    
    try {
      if (isOnline) {
        const response = await fetch('/api/habits/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            habitId,
            date: today,
            completed,
            conditionsMet: [],
          }),
        })

        if (response.ok) {
          await fetchHabits() // Refresh habits to get updated streaks
          toast.success(completed ? 'Habitude validée !' : 'Habitude annulée')
        } else {
          throw new Error('Failed to toggle habit')
        }
      } else {
        // Save offline
        addOfflineEntry({
          habitId,
          date: today,
          completed,
          conditionsMet: [],
          synced: false,
        })
        
        // Update local state optimistically
        setHabits(prev => prev.map(habit => {
          if (habit.id === habitId) {
            const todayEntry: HabitEntry = {
              id: `temp-${Date.now()}`,
              habitId,
              date: new Date(today),
              completed,
              conditionsMet: [],
            }
            
            return {
              ...habit,
              entries: [todayEntry, ...habit.entries.filter(e => 
                new Date(e.date).toDateString() !== new Date(today).toDateString()
              )],
            }
          }
          return habit
        }))
        
        toast.success(completed ? 'Habitude validée (hors ligne)' : 'Habitude annulée (hors ligne)')
      }
    } catch (error) {
      console.error('Error toggling habit:', error)
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  const getTodayEntry = (habit: Habit): HabitEntry | undefined => {
    const today = new Date().toDateString()
    return habit.entries.find(entry => 
      new Date(entry.date).toDateString() === today
    )
  }

  useEffect(() => {
    fetchHabits()
  }, [])

  return {
    habits,
    isLoading,
    fetchHabits,
    createHabit,
    toggleHabit,
    getTodayEntry,
  }
}
