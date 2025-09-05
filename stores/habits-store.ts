import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Habit, HabitEntry, OfflineEntry } from '@/types'

interface HabitsState {
  habits: Habit[]
  offlineEntries: OfflineEntry[]
  isOnline: boolean
  isLoading: boolean
  
  // Actions
  setHabits: (habits: Habit[]) => void
  addHabit: (habit: Habit) => void
  updateHabit: (id: string, updates: Partial<Habit>) => void
  deleteHabit: (id: string) => void
  
  // Entries
  addEntry: (entry: HabitEntry) => void
  addOfflineEntry: (entry: OfflineEntry) => void
  syncOfflineData: () => Promise<void>
  
  // Network status
  setOnlineStatus: (isOnline: boolean) => void
  setLoading: (isLoading: boolean) => void
}

export const useHabitsStore = create<HabitsState>()(
  persist(
    (set, get) => ({
      habits: [],
      offlineEntries: [],
      isOnline: true,
      isLoading: false,
      
      setHabits: (habits) => set({ habits }),
      
      addHabit: (habit) => set((state) => ({ 
        habits: [...state.habits, habit] 
      })),
      
      updateHabit: (id, updates) => set((state) => ({
        habits: state.habits.map(habit => 
          habit.id === id ? { ...habit, ...updates } : habit
        )
      })),
      
      deleteHabit: (id) => set((state) => ({
        habits: state.habits.filter(habit => habit.id !== id)
      })),
      
      addEntry: (entry) => set((state) => ({
        habits: state.habits.map(habit => {
          if (habit.id === entry.habitId) {
            return {
              ...habit,
              entries: [...habit.entries, entry]
            }
          }
          return habit
        })
      })),
      
      addOfflineEntry: (entry) => set((state) => ({
        offlineEntries: [...state.offlineEntries, entry]
      })),
      
      syncOfflineData: async () => {
        const { offlineEntries, isOnline } = get()
        
        if (!isOnline || offlineEntries.length === 0) return
        
        try {
          set({ isLoading: true })
          
          for (const entry of offlineEntries) {
            const response = await fetch('/api/habits/entries', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(entry),
            })
            
            if (response.ok) {
              entry.synced = true
            }
          }
          
          // Remove synced entries
          set((state) => ({
            offlineEntries: state.offlineEntries.filter(entry => !entry.synced)
          }))
          
        } catch (error) {
          console.error('Sync failed:', error)
        } finally {
          set({ isLoading: false })
        }
      },
      
      setOnlineStatus: (isOnline) => {
        set({ isOnline })
        if (isOnline) {
          get().syncOfflineData()
        }
      },
      
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'habits-storage',
      partialize: (state) => ({ 
        habits: state.habits, 
        offlineEntries: state.offlineEntries 
      }),
    }
  )
)
