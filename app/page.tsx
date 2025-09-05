'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, LogOut, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HabitCheckbox } from '@/components/habit-checkbox'
import { HabitGraph } from '@/components/habit-graph'
import { useAuthStore } from '@/stores/auth-store'
import { useHabitsStore } from '@/stores/habits-store'
import { Habit, HabitEntry } from '@/types'
import { toast } from 'sonner'

export default function Dashboard() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null)
  const router = useRouter()
  
  const { user, logout } = useAuthStore()
  const { isOnline, setOnlineStatus } = useHabitsStore()

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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      logout()
      router.push('/login')
    } catch {
      toast.error('Erreur lors de la déconnexion')
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                🎯 Habit Tracker
              </h1>
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm text-gray-500">
                  {isOnline ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Bonjour, {user?.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/habits/new')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle habitude
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {habits.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Commencez votre première habitude
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Créez votre première habitude et commencez à construire des streaks addictifs !
            </p>
            <Button onClick={() => router.push('/habits/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Créer ma première habitude
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Daily Habits */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Habitudes du jour</span>
                    <span className="text-sm font-normal text-gray-500">
                      {new Date().toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {habits.map((habit) => (
                    <div key={habit.id} className="space-y-2">
                      <HabitCheckbox
                        habit={habit}
                        todayEntry={getTodayEntry(habit)}
                        onToggle={() => fetchHabits()}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => setSelectedHabit(habit)}
                      >
                        Voir le graphique
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Habit Graph */}
            <div>
              {selectedHabit ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Graphique des habitudes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <HabitGraph
                      habit={selectedHabit}
                      entries={selectedHabit.entries}
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <div className="text-4xl mb-2">📊</div>
                      <p>Sélectionnez une habitude pour voir son graphique</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}


