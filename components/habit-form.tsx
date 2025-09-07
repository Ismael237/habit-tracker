'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Info } from 'lucide-react'
import { habitSchema, HabitFormData } from '@/lib/validations'
import { toast } from 'sonner'

const HABIT_COLORS = [
  { color: '#10b981', name: 'Émeraude' },
  { color: '#3b82f6', name: 'Bleu' },
  { color: '#8b5cf6', name: 'Violet' },
  { color: '#f59e0b', name: 'Ambre' },
  { color: '#ef4444', name: 'Rouge' },
  { color: '#06b6d4', name: 'Cyan' },
  { color: '#84cc16', name: 'Lime' },
  { color: '#f97316', name: 'Orange' },
  { color: '#ec4899', name: 'Rose' },
  { color: '#6366f1', name: 'Indigo' },
]

interface HabitFormProps {
  onSuccess?: () => void
  initialData?: {
    id?: string
    name?: string
    color?: string
    notificationTime?: string
    conditions?: string[]
  }
  mode?: 'create' | 'edit'
}

export function HabitForm({ onSuccess, initialData, mode = 'create' }: HabitFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const lastConditionRef = useRef<HTMLInputElement>(null)

  const form = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: initialData?.name || '',
      color: initialData?.color || HABIT_COLORS[0].color,
      notificationTime: initialData?.notificationTime || '',
      conditions: initialData?.conditions || [] as string[],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'conditions',
  })

  // Auto-focus the last condition input when a new one is added
  useEffect(() => {
    if (fields.length > 0 && lastConditionRef.current) {
      const timer = setTimeout(() => {
        lastConditionRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [fields.length])

  const onSubmit = async (data: HabitFormData) => {
    setIsLoading(true)

    try {
      const url = mode === 'edit' ? `/api/habits/${initialData?.id}` : '/api/habits'
      const method = mode === 'edit' ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || `Erreur lors de ${mode === 'edit' ? 'la modification' : 'la création'} de l\'habitude`)
        return
      }

      toast.success(`Habitude ${mode === 'edit' ? 'modifiée' : 'créée'} avec succès !`)
      onSuccess?.()
      
      if (mode === 'edit' && initialData?.id) {
        router.push(`/habits/${initialData.id}`)
      } else {
        router.push('/')
      }
    } catch {
      toast.error(`Erreur de ${mode === 'edit' ? 'modification' : 'création'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {mode === 'edit' ? 'Modifier l\'habitude' : 'Nouvelle habitude'}
        </CardTitle>
        <CardDescription>
          {mode === 'edit' 
            ? 'Modifiez les paramètres de votre habitude' 
            : 'Créez une nouvelle habitude à tracker quotidiennement'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Nom de l'habitude */}
          <div className="space-y-3">
            <Label htmlFor="name" className="text-base font-semibold text-gray-900 dark:text-white">
              Nom de l&apos;habitude
            </Label>
            <Input
              id="name"
              placeholder="Ex: Faire du sport, Lire 30 minutes..."
              {...form.register('name')}
              disabled={isLoading}
              className="h-12 text-base border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Couleur */}
          <div className="space-y-4">
            <Label className="text-base font-semibold text-gray-900 dark:text-white">
              Couleur de l&apos;habitude
            </Label>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
              {HABIT_COLORS.map((colorItem) => (
                <button
                  key={colorItem.color}
                  type="button"
                  title={colorItem.name}
                  className={`group relative w-10 h-10 rounded-xl border-3 transition-all duration-200 cursor-pointer hover:scale-110 hover:shadow-lg ${form.watch('color') === colorItem.color
                      ? 'border-gray-900 dark:border-white scale-110 shadow-lg ring-2 ring-gray-900/20 dark:ring-white/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  style={{ backgroundColor: colorItem.color }}
                  onClick={() => form.setValue('color', colorItem.color)}
                  disabled={isLoading}
                >
                  {form.watch('color') === colorItem.color && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white dark:bg-gray-900 rounded-full shadow-sm"></div>
                    </div>
                  )}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded whitespace-nowrap">
                      {colorItem.name}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Heure de notification */}
          <div className="space-y-3">
            <Label htmlFor="notificationTime" className="text-base font-semibold text-gray-900 dark:text-white">
              Heure de rappel (optionnel)
            </Label>
            <Input
              id="notificationTime"
              type="time"
              {...form.register('notificationTime')}
              disabled={isLoading}
              className="h-12 text-base border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Recevez une notification quotidienne pour vous rappeler votre habitude
            </p>
            {form.formState.errors.notificationTime && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {form.formState.errors.notificationTime.message}
              </p>
            )}
          </div>

          {/* Conditions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold text-gray-900 dark:text-white">
                Conditions spécifiques (optionnel)
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append('')}
                disabled={isLoading}
                className="hover:bg-emerald-50 hover:border-emerald-300 dark:hover:bg-emerald-900/20 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une condition
              </Button>
            </div>

            {fields.map((field, index) => {
              const { ref, ...registerProps } = form.register(`conditions.${index}` as const)
              return (
                <div key={field.id} className="flex gap-3">
                  <Input
                    ref={(e) => {
                      ref(e)
                      if (index === fields.length - 1) {
                        lastConditionRef.current = e
                      }
                    }}
                    placeholder="Ex: Minimum 30 minutes, Avant 10h..."
                    {...registerProps}
                    disabled={isLoading}
                    className="h-11 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
                  />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => remove(index)}
                  disabled={isLoading}
                  className="h-11 w-11 p-0 hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-900/20 transition-colors"
                  title="Supprimer cette condition"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                </div>
              )
            })}

            {fields.length === 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      À propos des conditions
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Les conditions permettent d&apos;ajouter des critères spécifiques à votre habitude. Par exemple :
                    </p>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 list-disc list-inside space-y-1 ml-2">
                      <li>&ldquo;Minimum 30 minutes&rdquo; pour une séance de sport</li>
                      <li>&ldquo;Avant 10h&rdquo; pour une habitude matinale</li>
                      <li>&ldquo;Au moins 2 verres&rdquo; pour boire de l&apos;eau</li>
                    </ul>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                      💡 Vous pourrez cocher chaque condition individuellement dans le suivi quotidien
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (mode === 'edit' && initialData?.id) {
                  router.push(`/habits/${initialData.id}`)
                } else {
                  router.push('/')
                }
              }}
              disabled={isLoading}
              className="flex-1 h-12 text-base hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-12 text-base bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {mode === 'edit' ? 'Modification...' : 'Création...'}
                </div>
              ) : (
                mode === 'edit' ? 'Modifier l\'habitude' : 'Créer l\'habitude'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
