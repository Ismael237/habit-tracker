# 🗄️ Guide des Migrations Prisma - Habit Tracker

Ce guide explique comment utiliser le système de migration Prisma pour gérer l'évolution de la base de données.

## 📋 Scripts disponibles

### Développement
```bash
# Créer et appliquer une nouvelle migration
pnpm db:migrate

# Générer le client Prisma après modification du schéma
pnpm db:generate

# Pousser les changements directement (sans migration)
pnpm db:push

# Ouvrir Prisma Studio pour explorer la DB
pnpm db:studio

# Initialiser la DB avec des données d'exemple
pnpm db:seed

# Récupérer le schéma depuis une DB existante
pnpm db:pull
```

### Production
```bash
# Déployer les migrations en production
pnpm db:migrate:deploy

# Réinitialiser complètement la DB (⚠️ DANGER)
pnpm db:migrate:reset
```

## 🚀 Première installation

1. **Configurer la base de données**
   ```bash
   # Copier le fichier d'environnement
   cp env.example .env
   
   # Modifier DATABASE_URL dans .env avec vos credentials PostgreSQL
   ```

2. **Appliquer les migrations**
   ```bash
   # Créer les tables dans la base de données
   pnpm db:migrate
   ```

3. **Initialiser avec des données d'exemple**
   ```bash
   # Créer un utilisateur demo et des habitudes d'exemple
   pnpm db:seed
   ```

## 📝 Workflow de développement

### Modifier le schéma de base de données

1. **Éditer le fichier `schema.prisma`**
   ```prisma
   // Exemple: ajouter un nouveau champ
   model Habit {
     id          String @id @default(cuid())
     name        String
     description String? // ← Nouveau champ
     // ...
   }
   ```

2. **Créer une migration**
   ```bash
   pnpm db:migrate
   # Prisma vous demandera un nom pour la migration
   # Ex: "add_description_to_habit"
   ```

3. **Vérifier la migration**
   - Le fichier SQL est créé dans `prisma/migrations/`
   - Le client Prisma est automatiquement régénéré
   - La base de données est mise à jour

### Travailler en équipe

1. **Récupérer les migrations des autres**
   ```bash
   git pull
   pnpm db:migrate  # Applique les nouvelles migrations
   ```

2. **Résoudre les conflits de migration**
   ```bash
   pnpm db:migrate:reset  # ⚠️ Recrée la DB depuis zéro
   pnpm db:seed          # Recharge les données d'exemple
   ```

## 🔧 Commandes utiles

### Diagnostic
```bash
# Vérifier l'état des migrations
npx prisma migrate status

# Voir le schéma actuel
npx prisma db pull --print
```

### Maintenance
```bash
# Réinitialiser complètement (développement uniquement)
pnpm db:migrate:reset --force

# Marquer une migration comme appliquée (sans l'exécuter)
npx prisma migrate resolve --applied "20231201000000_migration_name"
```

## 📊 Données d'exemple

Le script de seed (`prisma/seed.ts`) crée :

- **Utilisateur demo** : `demo@habittracker.com` / `demo123`
- **5 habitudes d'exemple** avec conditions
- **30 jours d'historique** pour chaque habitude
- **Calcul automatique des streaks**

## ⚠️ Bonnes pratiques

### ✅ À faire
- Toujours tester les migrations sur une copie de la DB
- Créer des migrations atomiques (un changement = une migration)
- Nommer les migrations de manière descriptive
- Sauvegarder la DB avant les migrations importantes

### ❌ À éviter
- Modifier manuellement les fichiers de migration
- Utiliser `db:push` en production
- Supprimer des migrations déjà déployées
- Oublier de commiter les fichiers de migration

## 🚨 Urgences

### Migration échouée
```bash
# 1. Vérifier l'état
npx prisma migrate status

# 2. Marquer comme résolue si nécessaire
npx prisma migrate resolve --applied "migration_name"

# 3. Ou revenir en arrière
pnpm db:migrate:reset
```

### Corruption de données
```bash
# Restaurer depuis une sauvegarde
pg_restore -d habit_tracker backup.sql

# Ou réinitialiser complètement
pnpm db:migrate:reset
pnpm db:seed
```

## 📚 Ressources

- [Documentation Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Guide des migrations](https://www.prisma.io/docs/guides/database/developing-with-prisma-migrate)
- [Troubleshooting](https://www.prisma.io/docs/guides/database/troubleshooting-orm)
