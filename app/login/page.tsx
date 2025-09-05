import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🎯 Habit Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Transformez vos habitudes en streaks addictifs
          </p>
        </div>
        
        <LoginForm />
        
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Pas encore de compte ?{' '}
            <Link 
              href="/register" 
              className="font-medium text-green-600 hover:text-green-500 dark:text-green-400"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
