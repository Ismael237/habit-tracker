import { OfflineEntry } from '@/types'

const OFFLINE_STORAGE_KEY = 'habit-tracker-offline-entries'

export class OfflineSync {
  static getOfflineEntries(): OfflineEntry[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(OFFLINE_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error reading offline entries:', error)
      return []
    }
  }

  static saveOfflineEntry(entry: OfflineEntry): void {
    if (typeof window === 'undefined') return
    
    try {
      const entries = this.getOfflineEntries()
      entries.push(entry)
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(entries))
    } catch (error) {
      console.error('Error saving offline entry:', error)
    }
  }

  static removeOfflineEntry(entryId: string): void {
    if (typeof window === 'undefined') return
    
    try {
      const entries = this.getOfflineEntries()
      const filtered = entries.filter(entry => entry.habitId !== entryId)
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(filtered))
    } catch (error) {
      console.error('Error removing offline entry:', error)
    }
  }

  static clearOfflineEntries(): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem(OFFLINE_STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing offline entries:', error)
    }
  }

  static async syncOfflineEntries(): Promise<boolean> {
    const entries = this.getOfflineEntries()
    
    if (entries.length === 0) return true

    try {
      for (const entry of entries) {
        const response = await fetch('/api/habits/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            habitId: entry.habitId,
            date: entry.date,
            completed: entry.completed,
            conditionsMet: entry.conditionsMet,
          }),
        })

        if (response.ok) {
          this.removeOfflineEntry(entry.habitId)
        }
      }
      
      return true
    } catch (error) {
      console.error('Sync failed:', error)
      return false
    }
  }
}
