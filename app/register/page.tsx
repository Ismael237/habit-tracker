import Link from 'next/link'
import { RegisterForm } from '@/components/auth/register-form'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🎯 Habit Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Commencez votre voyage vers de meilleures habitudes
          </p>
        </div>
        
        <RegisterForm />
        
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Déjà un compte ?{' '}
            <Link
              href="/login"
              className="font-medium text-green-600 hover:text-green-500 dark:text-green-400"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
