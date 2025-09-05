'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import { habitSchema, HabitFormData } from '@/lib/validations'
import { toast } from 'sonner'

const HABIT_COLORS = [
  '#10b981', // emerald-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
  '#ec4899', // pink-500
  '#6366f1', // indigo-500
]

interface HabitFormProps {
  onSuccess?: () => void
}

export function HabitForm({ onSuccess }: HabitFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: '',
      color: HABIT_COLORS[0],
      notificationTime: '',
      conditions: [] as string[],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'conditions',
  })

  const onSubmit = async (data: HabitFormData) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Erreur lors de la création de l\'habitude')
        return
      }

      toast.success('Habitude créée avec succès !')
      onSuccess?.()
      router.push('/')
    } catch {
      toast.error('Erreur de création')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Nouvelle habitude</CardTitle>
        <CardDescription>
          Créez une nouvelle habitude à tracker quotidiennement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Nom de l'habitude */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom de l&apos;habitude</Label>
            <Input
              id="name"
              placeholder="Ex: Faire du sport, Lire 30 minutes..."
              {...form.register('name')}
              disabled={isLoading}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Couleur */}
          <div className="space-y-3">
            <Label>Couleur</Label>
            <div className="flex flex-wrap gap-2">
              {HABIT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    form.watch('color') === color
                      ? 'border-gray-900 dark:border-white scale-110'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => form.setValue('color', color)}
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>

          {/* Heure de notification */}
          <div className="space-y-2">
            <Label htmlFor="notificationTime">Heure de rappel (optionnel)</Label>
            <Input
              id="notificationTime"
              type="time"
              {...form.register('notificationTime')}
              disabled={isLoading}
            />
            {form.formState.errors.notificationTime && (
              <p className="text-sm text-red-500">
                {form.formState.errors.notificationTime.message}
              </p>
            )}
          </div>

          {/* Conditions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Conditions spécifiques (optionnel)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append('')}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une condition
              </Button>
            </div>
            
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <Input
                  placeholder="Ex: Minimum 30 minutes, Avant 10h..."
                  {...form.register(`conditions.${index}` as const)}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => remove(index)}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {fields.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Les conditions permettent d&apos;ajouter des critères spécifiques à votre habitude
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/')}
              disabled={isLoading}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Création...' : 'Créer l\'habitude'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
