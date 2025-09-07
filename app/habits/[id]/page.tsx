'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Target, TrendingUp, Bell, Edit3, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HabitGraph } from '@/components/habit-graph'
import { HabitConditionCheckbox } from '@/components/habit-condition-checkbox'
import { HabitCompletion } from '@/components/habit-completion'
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal'
import { AppHeader } from '@/components/app-header'
import { useAuthStore } from '@/stores/auth-store'
import { Habit, HabitEntry } from '@/types'
import { toast } from 'sonner'

export default function HabitDetailPage() {
  const [habit, setHabit] = useState<Habit | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const params = useParams()
  const { } = useAuthStore()

  const habitId = params.id as string

  const fetchHabit = useCallback(async () => {
    try {
      const response = await fetch(`/api/habits/${habitId}`)
      if (response.ok) {
        const data = await response.json()
        setHabit(data.habit)
      } else if (response.status === 404) {
        toast.error('Habitude non trouvée')
        router.push('/')
      } else {
        toast.error('Erreur lors du chargement de l&apos;habitude')
      }
    } catch {
      toast.error('Erreur lors du chargement de l&apos;habitude')
    } finally {
      setIsLoading(false)
    }
  }, [habitId, router])

  useEffect(() => {
    if (habitId) {
      fetchHabit()
    }
  }, [habitId, fetchHabit])

  const getTodayEntry = (): HabitEntry | undefined => {
    if (!habit) return undefined
    const today = new Date().toDateString()
    return habit.entries.find(entry =>
      new Date(entry.date).toDateString() === today
    )
  }

  const getCompletionRate = (): number => {
    if (!habit || habit.entries.length === 0) return 0
    const completedEntries = habit.entries.filter(entry => entry.completed).length
    return Math.round((completedEntries / habit.entries.length) * 100)
  }

  const getStreakData = () => {
    if (!habit) return { current: 0, best: 0, daysActive: 0 }
    
    const totalDays = habit.entries.length
    const completedDays = habit.entries.filter(entry => entry.completed).length
    
    return {
      current: habit.streakCurrent,
      best: habit.streakBest,
      daysActive: totalDays,
      completedDays
    }
  }

  const handleDelete = async () => {
    if (!habit) return
    
    setIsDeleting(true)
    
    try {
      const response = await fetch(`/api/habits/${habit.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Habitude supprimée avec succès')
        router.push('/')
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch {
      toast.error('Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
      setIsDeleteModalOpen(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement de l&apos;habitude...</p>
        </div>
      </div>
    )
  }

  if (!habit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🤔</div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Habitude non trouvée
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Cette habitude n&apos;existe pas ou a été supprimée.
          </p>
          <Button onClick={() => router.push('/')}>
            Retour au dashboard
          </Button>
        </div>
      </div>
    )
  }

  const streakData = getStreakData()
  const completionRate = getCompletionRate()
  const todayEntry = getTodayEntry()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <AppHeader title="🎯 Habit Tracker" showAddButton={false} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Title and Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: habit.color }}
                />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl md:text-4xl">
                  {habit.name}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/habits/${habit.id}/edit`)}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Modifier
              </Button>
              <Button
                variant="destructive"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>

          {/* Date */}
          <div className="text-lg text-gray-600 dark:text-gray-400">
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>

          {/* Main Content - Consolidated */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Validation & Conditions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Validation d&apos;aujourd&apos;hui</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Habit Completion */}
                <HabitCompletion
                  habit={habit}
                  todayEntry={todayEntry}
                  onUpdate={fetchHabit}
                />

                {/* Conditions if they exist */}
                {habit.conditions && habit.conditions.length > 0 && (
                  <div className="space-y-3">
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                        Conditions supplémentaires
                      </h4>
                      <div className="space-y-2">
                        {habit.conditions.map((condition, index) => (
                          <HabitConditionCheckbox
                            key={condition.id}
                            habit={habit}
                            condition={condition}
                            conditionIndex={index}
                            todayEntry={todayEntry}
                            onUpdate={fetchHabit}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right Column - Stats & Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Statistiques & Informations</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Key Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {streakData.current}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Streak actuel
                    </div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {streakData.best}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Record
                    </div>
                  </div>
                </div>
                
                {/* Success Rate */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Taux de réussite</span>
                    <span className="font-medium">{completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>

                {/* Essential Details */}
                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Créée le</span>
                    <span className="text-sm font-medium">
                      {new Date(habit.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  
                  {habit.notificationTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Rappel</span>
                      <div className="flex items-center space-x-1">
                        <Bell className="h-3 w-3" />
                        <span className="text-sm font-medium">{habit.notificationTime}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total validé</span>
                    <span className="text-sm font-medium">{streakData.completedDays} jours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Section - Full Width Graph */}
          <div className="w-full">
            <HabitGraph
              habit={habit}
              entries={habit.entries}
              className="w-full"
            />
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          habitName={habit.name}
          isLoading={isDeleting}
        />
      </main>
    </div>
  )
}
