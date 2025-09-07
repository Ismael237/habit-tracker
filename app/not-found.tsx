'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/app-header'
import { Home, ArrowLeft, Target } from 'lucide-react'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <AppHeader />
      
      <main className="flex items-center justify-center min-h-[80vh] px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          {/* Animated 404 */}
          <div className="mb-8">
            <div className="relative">
              <h1 className="text-8xl sm:text-9xl font-bold text-gray-200 dark:text-gray-700 select-none">
                404
              </h1>
              <div className="absolute inset-0 flex items-center justify-center">
                <Target className="h-16 w-16 sm:h-20 sm:w-20 text-emerald-500 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Oups ! Page introuvable
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
                Il semblerait que cette page ait perdu sa streak... 
                Elle n'existe pas ou a été déplacée.
              </p>
            </div>

            {/* Suggestions */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Que souhaitez-vous faire ?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>Retourner au tableau de bord</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Créer une nouvelle habitude</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Vérifier l'URL saisie</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Revenir en arrière</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="flex items-center gap-2 h-12 px-6 text-base hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Retour
              </Button>
              <Button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 h-12 px-6 text-base bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Home className="h-5 w-5" />
                Tableau de bord
              </Button>
            </div>

            {/* Fun message */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                💡 <strong>Astuce :</strong> Maintenez vos habitudes même quand vous vous perdez ! 
                Une bonne streak ne s'arrête jamais. 🎯
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
