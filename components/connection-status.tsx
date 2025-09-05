'use client'

import { useEffect, useState } from 'react'
import { Wifi, WifiOff, Bell, BellOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useHabitsStore } from '@/stores/habits-store'
import { useNotifications } from '@/hooks/use-notifications'
import { toast } from 'sonner'

export function ConnectionStatus() {
  const { isOnline, setOnlineStatus, syncOfflineData } = useHabitsStore()
  const { permission, requestPermission, sendTestNotification } = useNotifications()
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
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
  }, [setOnlineStatus])

  const handleSync = async () => {
    if (!isOnline) return
    
    setIsSyncing(true)
    try {
      await syncOfflineData()
      toast.success('Synchronisation terminée')
    } catch {
      toast.error('Erreur de synchronisation')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleNotificationToggle = async () => {
    if (permission === 'granted') {
      await sendTestNotification()
    } else {
      await requestPermission()
    }
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Connection Status */}
      <div className="flex items-center space-x-1">
        {isOnline ? (
          <Wifi className="h-4 w-4 text-green-500" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-500" />
        )}
        <span className="text-sm text-gray-500">
          {isOnline ? 'En ligne' : 'Hors ligne'}
        </span>
      </div>

      {/* Sync Button */}
      {isOnline && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? 'Sync...' : 'Sync'}
        </Button>
      )}

      {/* Notification Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleNotificationToggle}
        title={permission === 'granted' ? 'Test notification' : 'Activer les notifications'}
      >
        {permission === 'granted' ? (
          <Bell className="h-4 w-4 text-green-500" />
        ) : (
          <BellOff className="h-4 w-4 text-gray-400" />
        )}
      </Button>
    </div>
  )
}
