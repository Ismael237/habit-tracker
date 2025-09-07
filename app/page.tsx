'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AppHeader } from '@/components/app-header'
import { useHabitsStore } from '@/stores/habits-store'
import { Habit, HabitEntry } from '@/types'
import { toast } from 'sonner'

export default function Dashboard() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  
  const { setOnlineStatus } = useHabitsStore()

  useEffect(() => {
    // Check online status
    const updateOnlineStatus = () => {
      setOnlineStatus(navigator.onLine)
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    updateOnlineStatus()

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchHabits()
  }, [])

  const fetchHabits = async () => {
    try {
      const response = await fetch('/api/habits')
      if (response.ok) {
        const data = await response.json()
        setHabits(data.habits)
      }
    } catch {
      toast.error('Erreur lors du chargement des habitudes')
    } finally {
      setIsLoading(false)
    }
  }



  const getTodayEntry = (habit: Habit): HabitEntry | undefined => {
    const today = new Date().toDateString()
    return habit.entries.find(entry => 
      new Date(entry.date).toDateString() === today
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement de vos habitudes...</p>
        </div>
      </div>
    )
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <AppHeader />

      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 lg:py-12">
        {habits.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="text-6xl mb-6">🎯</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Commencez votre première habitude
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
              Créez votre première habitude et commencez à construire des streaks addictifs !
            </p>
            <Button onClick={() => router.push('/habits/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Créer ma première habitude
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                  Tableau de bord
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {new Date().toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </p>
              </div>
              <Button 
                onClick={() => router.push('/habits/new')}
                className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle habitude
              </Button>
            </div>

            {/* Habits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 sm:gap-6 lg:gap-8">
              {habits.map((habit) => {
                const todayEntry = getTodayEntry(habit)
                const isCompleted = todayEntry?.completed || false
                const hasConditions = habit.conditions && habit.conditions.length > 0
                const conditionsCompleted = todayEntry?.conditionsMet?.filter(Boolean).length || 0
                const totalConditions = habit.conditions?.length || 0
                
                // Calculate stats for tooltip
                const completedEntries = habit.entries.filter(entry => entry.completed).length
                const totalEntries = habit.entries.length
                const completionRate = totalEntries > 0 ? Math.round((completedEntries / totalEntries) * 100) : 0
                const createdDaysAgo = Math.floor((new Date().getTime() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24))
                
                const tooltipContent = `Streak actuel: ${habit.streakCurrent} jours\nMeilleur streak: ${habit.streakBest} jours\nTaux de réussite: ${completionRate}%\nJours complétés: ${completedEntries}/${totalEntries}\nCréée il y a ${createdDaysAgo} jours${hasConditions ? `\nConditions: ${totalConditions}` : ''}${habit.notificationTime ? `\nRappel: ${habit.notificationTime}` : ''}`
                
                return (
                  <Card 
                    key={habit.id} 
                    className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:scale-[1.02]"
                    onClick={() => router.push(`/habits/${habit.id}`)}
                    title={tooltipContent}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-5">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate mb-2">
                              {habit.name}
                            </h3>
                            <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                              <span className="flex items-center">
                                <span className="w-2 h-2 bg-orange-400 rounded-full mr-1.5"></span>
                                Streak {habit.streakCurrent}
                              </span>
                              {hasConditions && (
                                <span className="text-xs">{totalConditions} condition{totalConditions > 1 ? 's' : ''}</span>
                              )}
                            </div>
                          </div>
                          
                          {/* Color indicator */}
                          <div 
                            className="w-4 h-4 rounded-full shadow-sm"
                            style={{ backgroundColor: habit.color }}
                          />
                        </div>

                        {/* Status section */}
                        <div className="flex items-center justify-center">
                          <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                            isCompleted 
                              ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' 
                              : 'bg-gray-50 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                          }`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              isCompleted ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                            {isCompleted ? 'Complété' : 'En attente'}
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Progression</span>
                            <span className="font-medium">{completionRate}%</span>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${completionRate}%`,
                                backgroundColor: habit.color
                              }}
                            />
                          </div>
                        </div>

                        {/* Conditions status */}
                        {hasConditions && (
                          <div className="text-center bg-gray-50 dark:bg-gray-800/50 rounded-md py-2 px-3">
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              Conditions: <span className="font-medium text-gray-900 dark:text-white">{conditionsCompleted}/{totalConditions}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}


