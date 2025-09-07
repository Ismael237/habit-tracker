'use client'

import { Button } from '@/components/ui/button'
import { Plus, LogOut, Wifi, WifiOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { useHabitsStore } from '@/stores/habits-store'

interface AppHeaderProps {
  title?: string
  showAddButton?: boolean
}

export function AppHeader({ title = '🎯 Habit Tracker', showAddButton = false }: AppHeaderProps) {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { isOnline } = useHabitsStore()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-3xl md:text-1xl xl:text-2xl">
              {title}
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
            {showAddButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/habits/new')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle habitude
              </Button>
            )}
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
  )
}
