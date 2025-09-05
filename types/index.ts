export interface User {
  id: string
  email: string
  createdAt: Date
}

export interface Habit {
  id: string
  userId: string
  name: string
  color: string
  streakCurrent: number
  streakBest: number
  notificationTime?: string
  createdAt: Date
  conditions: HabitCondition[]
  entries: HabitEntry[]
}

export interface HabitCondition {
  id: string
  habitId: string
  name: string
}

export interface HabitEntry {
  id: string
  habitId: string
  date: Date
  completed: boolean
  conditionsMet: boolean[]
}

export interface HabitWithStats extends Habit {
  todayEntry?: HabitEntry
  streak: number
  completedToday: boolean
}

export interface OfflineEntry {
  habitId: string
  date: string
  completed: boolean
  conditionsMet: boolean[]
  synced: boolean
}
