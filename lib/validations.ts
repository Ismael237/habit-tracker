import { z } from 'zod'

// Auth schemas
export const loginSchema = z.object({
  email: z.email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
})

export const registerSchema = z.object({
  email: z.email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

// Habit schemas
export const habitSchema = z.object({
  name: z.string().min(1, 'Le nom de l\'habitude est requis').max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Couleur invalide'),
  notificationTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Heure invalide').optional(),
  conditions: z.array(z.string().min(1, 'La condition ne peut pas être vide')).optional(),
})

export const habitEntrySchema = z.object({
  habitId: z.cuid('ID d\'habitude invalide'),
  date: z.iso.datetime('Date invalide'),
  completed: z.boolean(),
  conditionsMet: z.array(z.boolean()).optional(),
})

// Types
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type HabitFormData = z.infer<typeof habitSchema>
export type HabitEntryFormData = z.infer<typeof habitEntrySchema>
