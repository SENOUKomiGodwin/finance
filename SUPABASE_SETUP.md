# Guide de configuration Supabase

Ce guide vous explique comment configurer Supabase pour le projet Financial Analytics.

## Étape 1 : Créer un compte Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Cliquez sur "Start your project"
3. Créez un compte (GitHub ou email)
4. Connectez-vous à votre compte

## Étape 2 : Créer un nouveau projet

1. Cliquez sur "New Project"
2. Remplissez les informations :
   - **Name** : financial-analytics (ou le nom de votre choix)
   - **Database Password** : Choisissez un mot de passe fort (notez-le !)
   - **Region** : Choisissez la région la plus proche de vous
3. Cliquez sur "Create new project"
4. Attendez que le projet soit créé (peut prendre 1-2 minutes)

## Étape 3 : Obtenir les credentials

1. Une fois le projet créé, allez dans **Settings** → **API**
2. Copiez les informations suivantes :
   - **Project URL** : C'est votre `SUPABASE_URL`
   - **service_role key** : C'est votre `SUPABASE_SERVICE_ROLE_KEY` (NE PAS PARTAGER CETTE CLÉ)

## Étape 4 : Créer les tables dans Supabase

### Option A : Via l'éditeur SQL (recommandé)

1. Allez dans **SQL Editor** dans le menu de gauche
2. Cliquez sur "New query"
3. Copiez le contenu du fichier `server/supabase-schema.sql`
4. Collez-le dans l'éditeur
5. Cliquez sur "Run" (ou "Run" en bas à droite)
6. Vérifiez que les tables `users` et `financial_data` ont été créées

### Option B : Via le Table Editor

1. Allez dans **Table Editor**
2. Cliquez sur "Create a new table"
3. Créez la table `users` avec les colonnes :
   - id (bigint, primary key)
   - username (text, unique)
   - email (text, unique)
   - password (text)
   - role (text, default: 'analyst')
   - created_at (timestamp with time zone)
   - updated_at (timestamp with time zone)
4. Créez la table `financial_data` avec les colonnes :
   - id (bigint, primary key)
   - user_id (bigint, foreign key → users.id)
   - file_name (text)
   - file_type (text)
   - data (jsonb)
   - metadata (jsonb)
   - created_at (timestamp with time zone)
   - updated_at (timestamp with time zone)

## Étape 5 : Configurer les variables d'environnement

1. Ouvrez le fichier `server/.env`
2. Remplacez les valeurs par vos credentials Supabase :

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

3. Sauvegardez le fichier

## Étape 6 : Créer l'utilisateur admin par défaut

### Option A : Via le Table Editor

1. Allez dans **Table Editor**
2. Sélectionnez la table `users`
3. Cliquez sur "Insert row"
4. Remplissez les champs :
   - username: admin
   - email: admin@financial-analytics.com
   - password: admin123 (ou utilisez un hash bcrypt)
   - role: administrator
5. Cliquez sur "Save"

### Option B : Via SQL

1. Allez dans **SQL Editor**
2. Exécutez cette requête pour générer un hash bcrypt :

```sql
-- Note: Vous devez utiliser un outil pour générer le hash bcrypt
-- Pour admin123, le hash est : $2b$10$rKZ3Y8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z

INSERT INTO users (username, email, password, role)
VALUES ('admin', 'admin@financial-analytics.com', '$2b$10$rKZ3Y8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z', 'administrator');
```

**Note** : Le hash bcrypt ci-dessus est un exemple. Pour générer un vrai hash, utilisez :

```bash
# Dans le terminal
node -e "console.log(require('bcryptjs').hashSync('admin123', 10))"
```

## Étape 7 : Configurer les Row Level Security (RLS) - Optionnel mais recommandé

Pour sécuriser votre base de données, vous pouvez activer le RLS :

1. Allez dans **Authentication** → **Policies**
2. Activez "Enable RLS"
3. Créez des politiques pour chaque table

Exemple de politique pour la table `users` :

```sql
-- Politique pour permettre aux utilisateurs de voir leur propre profil
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid()::text = id::text);

-- Politique pour permettre aux admins de voir tous les utilisateurs
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()::text::bigint
    AND role = 'administrator'
  )
);
```

## Étape 8 : Tester la connexion

1. Démarrez le backend :
```bash
cd server
npm run dev
```

2. Vous devriez voir : `Connected to Supabase database`

3. Testez l'inscription/login via l'interface frontend

## Étape 9 : Dépannage

### Erreur : "Missing Supabase credentials"
- Vérifiez que `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont définis dans `.env`

### Erreur : "Supabase connection error"
- Vérifiez que l'URL est correcte
- Vérifiez que la clé est correcte (service_role key, pas anon key)
- Vérifiez que votre projet Supabase est actif

### Erreur : "Table does not exist"
- Vérifiez que vous avez exécuté le script SQL
- Allez dans Table Editor pour vérifier que les tables existent

## Ressources utiles

- [Documentation Supabase](https://supabase.com/docs)
- [Dashboard Supabase](https://app.supabase.com)
- [Guide Node.js Supabase](https://supabase.com/docs/guides/with-nodejs)

## Sécurité

⚠️ **IMPORTANT** :
- Ne partagez jamais votre `SUPABASE_SERVICE_ROLE_KEY`
- Ne commitez jamais le fichier `.env` dans Git
- Utilisez le RLS (Row Level Security) en production
- Changez le mot de passe par défaut de l'utilisateur admin
