import { HabitForm } from '@/components/habit-form'

export default function NewHabitPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Créer une nouvelle habitude
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Définissez votre nouvelle habitude et commencez à construire des streaks !
          </p>
        </div>
        
        <HabitForm />
      </div>
    </div>
  )
}
