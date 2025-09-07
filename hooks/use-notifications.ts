'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window && 'serviceWorker' in navigator)
    
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Les notifications ne sont pas supportées sur ce navigateur')
      return false
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      
      if (result === 'granted') {
        toast.success('Notifications activées !')
        return true
      } else {
        toast.error('Permission refusée pour les notifications')
        return false
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      toast.error('Erreur lors de la demande de permission')
      return false
    }
  }

  const scheduleNotification = async (title: string, body: string) => {
    if (permission !== 'granted') {
      const granted = await requestPermission()
      if (!granted) return false
    }

    try {
      // For now, we'll just show an immediate notification
      // In a real app, you'd use the Web Push API with a backend service
      new Notification(title, {
        body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: 'habit-reminder',
        renotify: true,
      })
      
      return true
    } catch (error) {
      console.error('Error scheduling notification:', error)
      return false
    }
  }

  const sendTestNotification = async () => {
    return scheduleNotification(
      'Habit Tracker',
      'Vos habitudes vous attendent ! 🎯'
    )
  }

  return {
    permission,
    isSupported,
    requestPermission,
    scheduleNotification,
    sendTestNotification,
  }
}
