'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { HabitForm } from '@/components/habit-form'
import { AppHeader } from '@/components/app-header'
import { ArrowLeft } from 'lucide-react'
import { Habit } from '@/types'
import { toast } from 'sonner'

export default function EditHabitPage() {
  const [habit, setHabit] = useState<Habit | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const params = useParams()

  const habitId = params.id as string

  const fetchHabit = useCallback(async () => {
    try {
      const response = await fetch(`/api/habits/${habitId}`)
      if (response.ok) {
        const data = await response.json()
        const habitData = data.habit
        setHabit(habitData)
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <AppHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement de l&apos;habitude...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!habit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <AppHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Habitude non trouvée
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              L&apos;habitude que vous cherchez n&apos;existe pas ou a été supprimée.
            </p>
            <Button onClick={() => router.push('/')}>
              Retour au tableau de bord
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const initialData = {
    id: habit.id,
    name: habit.name,
    color: habit.color,
    notificationTime: habit.notificationTime || '',
    conditions: habit.conditions?.map((c: { name: string }) => c.name) || [],
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <AppHeader />
      
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 lg:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Back button */}
          <div className="mb-6 w-full max-w-2xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => router.push(`/habits/${habitId}`)}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l&apos;habitude
            </Button>
          </div>
          
          <HabitForm 
            mode="edit" 
            initialData={initialData}
            onSuccess={() => {
              // Optional callback after successful edit
            }}
          />
        </div>
      </main>
    </div>
  )
}
