# 📋 **DEVBOOK COMPLET - HABIT TRACKER PWA**

## 🎯 **OBJECTIF**
Créer une PWA de tracking d'habitudes ultra-addictive, focalisée sur les streaks et le graphique style GitHub. App personnelle, simple mais efficace, fonctionnant offline.

---

## 🛠️ **STACK TECHNIQUE**

### Frontend
- **Framework** : Next.js 15.x.x (App Router)
- **Language** : TypeScript
- **Package Manager** : pnpm
- **Styling** : Tailwind CSS + shadcn/ui
- **PWA** : Manifest natif Next.js
- **Icons** : Lucide React
- **State Management** : Zustand
- **Forms** : react-hook-form + Zod

### Backend
- **API** : Next.js API Routes
- **Database** : PostgreSQL
- **ORM** : Prisma
- **Auth** : iron-session (simple)

### Déploiement
- **Hosting** : Vercel
- **Database** : PostgreSQL

---

## 🗄️ **MODÈLE DE DONNÉES**

### Schema Prisma
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  habits    Habit[]
  createdAt DateTime @default(now())
}

model Habit {
  id               String           @id @default(cuid())
  userId           String
  name             String
  color            String           @default("#10b981")
  streakCurrent    Int              @default(0)
  streakBest       Int              @default(0)
  notificationTime String?          // "09:00"
  createdAt        DateTime         @default(now())
  user             User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  conditions       HabitCondition[]
  entries          HabitEntry[]
}

model HabitCondition {
  id      String @id @default(cuid())
  habitId String
  name    String
  habit   Habit  @relation(fields: [habitId], references: [id], onDelete: Cascade)
}

model HabitEntry {
  id            String   @id @default(cuid())
  habitId       String
  date          DateTime @unique
  completed     Boolean  @default(false)
  conditionsMet Boolean[] // Array de boolean pour chaque condition
  habit         Habit    @relation(fields: [habitId], references: [id], onDelete: Cascade)
  
  @@unique([habitId, date])
}
```

---

## 📁 **ARCHITECTURE PROJET**

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── register/route.ts
│   │   │   └── logout/route.ts
│   │   ├── habits/
│   │   │   ├── route.ts              # GET, POST habits
│   │   │   └── [id]/
│   │   │       ├── route.ts          # PUT, DELETE habit
│   │   │       └── entries/route.ts  # GET, POST entries
│   │   └── sync/route.ts             # Sync offline data
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── habits/
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── manifest.ts                   # PWA Manifest
│   └── page.tsx                      # Dashboard principal
├── components/
│   ├── ui/                           # shadcn components
│   ├── auth/
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   ├── habit-checkbox.tsx
│   ├── habit-graph.tsx
│   ├── habit-form.tsx
│   ├── connection-status.tsx
│   └── notification-setup.tsx
├── lib/
│   ├── auth.ts                       # iron-session config
│   ├── db.ts                         # Prisma client
│   ├── offline-sync.ts               # LocalStorage sync
│   ├── notifications.ts              # Web Push
│   └── validations.ts                # Zod schemas
├── stores/
│   ├── auth-store.ts                 # Zustand auth store
│   └── habits-store.ts               # Zustand habits store
├── hooks/
│   ├── use-habits.ts
│   ├── use-offline.ts
│   └── use-notifications.ts
├── types/
│   └── index.ts
└── public/
    ├── sw.js                         # Service Worker
    ├── icon-192x192.png
    └── icon-512x512.png
```

---

## 🔐 **SYSTÈME D'AUTHENTIFICATION**

### Zustand Auth Store
```typescript
// stores/auth-store.ts
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}
```

### Schémas de validation Zod
```typescript
// lib/validations.ts
export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Minimum 6 caractères")
})

export const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Minimum 6 caractères"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
})
```

### Formulaires avec react-hook-form
```typescript
// components/auth/login-form.tsx
const form = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
  defaultValues: {
    email: "",
    password: ""
  }
})

// components/auth/register-form.tsx
const form = useForm<RegisterFormData>({
  resolver: zodResolver(registerSchema),
  defaultValues: {
    email: "",
    password: "",
    confirmPassword: ""
  }
})
```

---

## 🎮 **FONCTIONNALITÉS CORE**

### 1. **Page d'inscription (`/register`)**
```tsx
// Nouveau parcours utilisateur
- Formulaire email + password + confirmation
- Validation Zod en temps réel
- Gestion erreurs avec react-hook-form
- Redirection automatique vers login après inscription
- Design cohérent avec shadcn/ui
```

### 2. **Page de connexion (`/login`)**
```tsx
// Formulaire de connexion amélioré
- Validation Zod
- État de loading via Zustand
- Gestion erreurs serveur
- Redirection vers dashboard si connecté
```

### 3. **Dashboard Principal (`/`)**
```tsx
// Vue principale quotidienne
- Liste des habitudes avec checkbox géantes
- Streak actuel + record en évidence
- Conditions par habitude (si applicable)
- Bouton "Nouvelle habitude"
- Lien vers graphiques individuels
- Status connexion (online/offline)
```

### 4. **Système Streaks**
- **Calcul automatique** : +1 si habitude ET conditions validées
- **Streak en danger** : Alert si pas fait le jour J
- **Record personnel** : Toujours visible
- **Animation célébration** : Nouveau record

### 5. **Graphique GitHub Style**
- **Carré vert foncé** : Habitude + toutes conditions ✅
- **Carré vert clair** : Habitude seule ✅
- **Carré gris** : Rien fait
- **Tooltip hover** : Date + détails
- **Vue 365 jours** par habitude

### 6. **Gestion Offline (PWA)**
- **Installation** : Bannière d'installation automatique
- **Cache intelligent** : Pages + données essentielles
- **Sync bidirectionnel** : LocalStorage ↔ PostgreSQL
- **Fonctionnement complet offline** pour consultation + validation quotidienne

---

## 🔔 **SYSTÈME NOTIFICATIONS**

### Types
1. **Rappel quotidien** : Heure personnalisée par habitude
2. **Streak en danger** : Si rien fait après 18h
3. **Nouveau record** : Célébration immédiate

### Implémentation
```typescript
// Web Push API + Service Worker
- Permission demandée au premier lancement
- Notifications même app fermée
- Scheduling intelligent des rappels
```

---

## 📱 **CONFIGURATION PWA (Next.js 15)**

### 1. **Manifest Web App (`app/manifest.ts`)**
```typescript
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Habit Tracker PWA',
    short_name: 'Habits',
    description: 'Tracker d\'habitudes avec streaks et graphiques',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#10b981',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    categories: ['productivity', 'lifestyle'],
    orientation: 'portrait',
  }
}
```

### 2. **Service Worker (`public/sw.js`)**
```javascript
const CACHE_NAME = 'habit-tracker-v1'
const urlsToCache = [
  '/',
  '/login',
  '/register',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request)
      })
  )
})

// Push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '1',
      },
    }
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow('/')
  )
})
```

### 3. **Configuration Headers PWA**
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

---

## 🎨 **DESIGN SYSTEM**

### Couleurs principales
- **Primary** : `#10b981` (green-500) - Succès
- **Warning** : `#f59e0b` (amber-500) - Attention
- **Danger** : `#ef4444` (red-500) - Streak en danger
- **Neutral** : `#6b7280` (gray-500) - Non fait

### Composants clés
```tsx
// Formulaire d'inscription
<RegisterForm 
  onSuccess={handleRegisterSuccess}
  isLoading={isLoading}
/>

// Formulaire de connexion
<LoginForm 
  onSuccess={handleLoginSuccess}
  isLoading={isLoading}
/>

// Checkbox géante pour habitudes
<HabitCheckbox 
  habit={habit}
  completed={completed}
  onToggle={handleToggle}
  streak={streak}
/>

// Graphique style GitHub
<HabitGraph 
  entries={entries}
  color={habit.color}
  onDateHover={showTooltip}
/>

// Status connexion
<ConnectionStatus 
  isOnline={isOnline}
  pendingSync={pendingCount}
/>
```

---

## 🔄 **GESTION OFFLINE/ONLINE**

### Stratégie de cache
```typescript
// Service Worker cache strategy
const CACHE_STRATEGY = {
  pages: 'CacheFirst',        // Pages statiques
  api: 'NetworkFirst',        // Données habitudes
  assets: 'CacheFirst'        // CSS, JS, images
}
```

### Sync des données avec Zustand
```typescript
// stores/habits-store.ts
interface HabitsState {
  habits: Habit[]
  offlineEntries: HabitEntry[]
  isOnline: boolean
  syncOfflineData: () => Promise<void>
  addOfflineEntry: (entry: HabitEntry) => void
}
```

---

## 🛠️ **PLAN DE DÉVELOPPEMENT**

### Phase 0 : Setup Initial (1 jour)
1. **Initialisation projet** : `pnpm create next-app@latest` avec TypeScript
2. **Dépendances** : Installation shadcn/ui, zustand, react-hook-form, zod
3. **Configuration** : Tailwind, ESLint, Prettier
4. **Database setup** : Prisma + PostgreSQL

### Phase 1 : Authentification (2 jours)
1. **Schémas Zod** : Validation login/register
2. **Stores Zustand** : Auth state management
3. **Formulaires** : Login + Register avec react-hook-form
4. **API Routes** : `/api/auth/login` et `/api/auth/register`
5. **Protection routes** : Middleware authentification

### Phase 2 : Core Features (1 semaine)
1. **CRUD habitudes** : Création, modification, suppression
2. **Dashboard quotidien** : Liste habitudes + checkbox
3. **Système streaks** : Calcul + affichage
4. **Entries tracking** : Sauvegarde validations quotidiennes

### Phase 3 : Graphiques (3-4 jours)
1. **Graphique GitHub-style** : Génération carrés colorés
2. **Tooltips interactifs** : Détails au hover
3. **Navigation temporelle** : Scroll historique
4. **Responsive design** : Mobile + desktop

### Phase 4 : PWA + Offline (3-4 jours)
1. **Configuration PWA** : Manifest natif Next.js 15
2. **Service Worker** : Cache strategy + notifications
3. **Offline sync** : Zustand + LocalStorage
4. **Installation prompt** : Bannière installation

### Phase 5 : Notifications (2-3 jours)
1. **Web Push setup** : Permission + service
2. **VAPID keys** : Génération et configuration
3. **Scheduling** : Rappels quotidiens
4. **Smart alerts** : Streak en danger + célébrations

### Phase 6 : Polish (2-3 jours)
1. **Micro-interactions** : Animations légères
2. **Performance** : Optimisation bundle
3. **Testing** : Tests manuels complets
4. **Bug fixes** : Correction derniers problèmes

---

## 🚀 **DÉPLOIEMENT**

### Installation des dépendances
```bash
pnpm install next@latest react react-dom
pnpm install -D typescript @types/node @types/react @types/react-dom
pnpm install zustand react-hook-form @hookform/resolvers zod
pnpm install @prisma/client prisma
pnpm install iron-session bcryptjs
pnpm install lucide-react
pnpm install web-push @types/web-push
```

### Variables d'environnement
```env
DATABASE_URL="postgresql://..."
IRON_SESSION_SECRET="your-32-char-secret-here"
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"
NEXT_PUBLIC_APP_URL="https://habits.vercel.app"
```

---

## 🎯 **EXPÉRIENCE UTILISATEUR FINALE**

### Premier lancement
1. Landing page avec boutons "Connexion" / "Inscription"
2. Inscription simple : email + password + confirmation
3. Validation en temps réel avec Zod
4. Redirection vers connexion puis dashboard
5. Première habitude guidée
6. Prompt installation PWA
7. Setup notifications

### Usage quotidien (< 30 secondes)
1. Notification push : "Tes streaks t'attendent !"
2. Ouverture app (ou clic notification)
3. Dashboard : vue immédiate habitudes du jour
4. Check rapide des habitudes faites
5. Mise à jour streaks en temps réel
6. Fermeture avec satisfaction des carrés verts

### Fonctionnement offline
- App accessible depuis icône écran d'accueil
- Toutes les données visibles (cache)
- Validation habitudes fonctionne
- Sync automatique au retour connexion
- Aucune perte de données

---

## 📈 **MÉTRIQUES DE SUCCÈS**
- **Temps d'utilisation quotidien** : < 30 secondes
- **Rétention** : Utilisation quotidienne personnelle
- **Performance** : Chargement < 1 seconde
- **Offline-first** : Fonctionnement complet sans réseau
- **Addiction** : Envie irrésistible de maintenir les streaks

---

**OBJECTIF FINAL** : Une app si simple et addictive que l'abandonner devient psychologiquement impossible ! 🎯