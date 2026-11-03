# Financial Analytics

## 📋 Description du projet

Financial Analytics est une plateforme complète d'analyse financière full-stack qui permet aux entreprises de visualiser, analyser et comprendre leurs données financières grâce à des fonctionnalités avancées d'intelligence artificielle.

**Objectifs du projet :**
- Centraliser et analyser les données financières provenant de multiples sources (CSV, Excel, JSON)
- Fournir un tableau de bord interactif avec des KPIs en temps réel
- Permettre des requêtes en langage naturel sur les données financières
- Détecter automatiquement les anomalies et les transactions suspectes
- Prévoir les tendances de revenus futures
- Générer des rapports professionnels en plusieurs formats

**Problème résolu :**
Les entreprises perdent souvent un temps considérable à analyser manuellement leurs données financ spreadsheets. Financial Analytics automatise ce processus en offrant une interface intuitive, des analyses par machine learning et des insights automatisés, permettant aux décideurs de prendre des décisions plus rapides et plus éclairées.

## ✨ Fonctionnalités

- **Import de données** : Support des formats CSV, Excel (.xlsx, .xls) et JSON avec validation
- **Dashboard interactif** : Cartes KPI en temps réel, tendances de revenus et répartition des dépenses
- **Assistant IA** : Requêtes en langage naturel avec zéro hallucination (réponses basées sur les données)
- **Détection d'anomalies** : Détection d'anomalies par machine learning utilisant Isolation Forest
- **Prévisions de revenus** : Prévisions de séries temporelles avec régression linéaire et polynomiale
- **Génération de rapports** : Export de rapports en PDF, Excel et CSV
- **Authentification et autorisation** : Authentification JWT avec accès basé sur les rôles (Analyste, Manager, Administrateur)
- **Filtrage des données** : Filtrage par plage de dates, région, produit et département

## 🏗️ Architecture du projet

L'application suit une architecture microservices avec les composants suivants :

```
Frontend React (localhost:3000)
    ↓ (proxy configuré)
Backend Node.js / Express (localhost:5000)
    ↓ (pg pool)
PostgreSQL (localhost:5432)
    ↓
Base de données : financial_analytics

Backend Node.js / Express (localhost:5000)
    ↓
Analytics Service Python / Flask (localhost:3001)

Backend Node.js / Express (localhost:5000)
    ↓
AI Service Python / FastAPI (localhost:8000)
```

## 🛠️ Technologies utilisées

### Frontend
- React 18.2.0
- React Router 6.20.0
- Chart.js 4.4.0 & React Chart.js 2 5.2.0
- TailwindCSS 3.3.6
- Lucide React 0.294.0
- Axios 1.6.2
- Recharts 2.10.3

### Backend
- Node.js
- Express.js 4.18.2
- PostgreSQL (via pg 8.11.3)
- JWT Authentication (jsonwebtoken 9.0.2)
- bcryptjs 2.4.3
- Multer 1.4.5-lts.1 (upload de fichiers)
- ExcelJS 4.4.0 & PDFKit 0.13.0 (génération de rapports)
- Helmet 7.1.0 (sécurité)
- express-rate-limit 7.1.5 (limitation de taux)

### Analytics Service (Python)
- Python 3.9+
- Pandas >=2.2.0
- NumPy >=2.0.0
- Scikit-learn >=1.5.0 (Isolation Forest)
- Flask >=3.0.0
- Flask-CORS >=4.0.0
- openpyxl >=3.1.0

### AI Service (Python)
- FastAPI >=0.115.0
- Uvicorn >=0.32.0
- Pydantic >=2.9.0
- httpx >=0.27.0
- pandas >=2.2.0
- numpy >=2.0.0
- OpenAI >=1.50.0 (optionnel)
- Anthropic >=0.40.0 (optionnel)

## � Prérequis

Avant d'installer et de lancer le projet, assurez-vous d'avoir installé les éléments suivants :

- **Node.js** (v18 ou supérieur)
- **npm** (v9 ou supérieur)
- **Python** (v3.9 ou supérieur)
- **pip** (gestionnaire de paquets Python)
- **PostgreSQL** (v13 ou supérieur)
- **Git** (pour cloner le dépôt)

## ⚙️ Installation

### 1. Cloner le dépôt

```bash
git clone <url-du-dépôt>
cd financial-analytics
```

### 2. Configuration du Backend

```bash
cd server
npm install
cp .env.example .env
# Éditez .env avec vos identifiants de base de données
```

### 3. Configuration du Service Analytics

```bash
cd ../analytics
pip install -r requirements.txt
```

### 4. Configuration du Service IA

```bash
cd ../ai-service
pip install -r requirements.txt
cp .env.example .env
# Éditez .env avec vos clés API si vous utilisez les fonctionnalités LLM
```

### 5. Configuration du Frontend

```bash
cd ../client
npm install
```

## 🗄️ Configuration PostgreSQL

### Création de la base de données

**Option 1 : Via psql**
```bash
psql -U postgres
CREATE DATABASE financial_analytics;
\q
```

**Option 2 : Via createdb**
```bash
createdb financial_analytics -U postgres
```

**Option 3 : Sur Windows avec chemin complet**
```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE financial_analytics;"
```

### Initialisation du schéma de base de données

Une fois la base de données créée, exécutez le script d'initialisation :

```bash
cd server
node init-db.js
```

Ce script crée :
- Table `users` (utilisateurs avec rôles)
- Table `financial_data` (données financières)
- Indexes pour optimiser les performances
- Triggers pour la mise à jour automatique des timestamps
- Un utilisateur administrateur par défaut

**Informations de connexion :**
- Nom de la base : `financial_analytics`
- Port : `5432`
- Utilisateur par défaut : `postgres`
- Hôte : `127.0.0.1` (recommandé pour éviter les erreurs IPv6)

## 🔐 Variables d'environnement

### Backend (server/.env)

```env
# Configuration de la base de données
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=financial_analytics
DB_USER=postgres
DB_PASSWORD=your_password

# Configuration JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Configuration du serveur
PORT=5000
NODE_ENV=development

# Configuration CORS
CLIENT_URL=http://localhost:3000

# Configuration du service IA
AI_SERVICE_URL=http://localhost:8000
```

### Service IA (ai-service/.env)

```env
# Configuration du service IA
PORT=8000

# Configuration API LLM
# Choisissez : openai ou anthropic
LLM_PROVIDER=openai

# Configuration OpenAI
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4-turbo-preview

# Configuration Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_MODEL=claude-3-opus-20240229

# Configuration API Backend
BACKEND_API_URL=http://localhost:5000
```

⚠️ **Important** : Ne commitez jamais les fichiers `.env` dans le dépôt Git. Utilisez uniquement `.env.example` comme modèle.

## 🚀 Lancement du projet

Pour démarrer l'application complète, ouvrez 4 terminaux séparés :

### 1. Démarrer PostgreSQL

Assurez-vous que le service PostgreSQL est en cours d'exécution :

**Windows :**
```powershell
Get-Service postgresql-x64-18
```

**Linux/Mac :**
```bash
sudo systemctl status postgresql
```

### 2. Démarrer le Backend (Port 5000)

```bash
cd server
npm run dev
```

Le backend sera accessible sur `http://localhost:5000`

### 3. Démarrer le Service Analytics (Port 3001)

```bash
cd analytics
python app.py
```

Le service analytics sera accessible sur `http://localhost:3001`

### 4. Démarrer le Service IA (Port 8000)

```bash
cd ai-service
python main.py
```

Le service IA sera accessible sur `http://localhost:8000`

### 5. Démarrer le Frontend (Port 3000)

```bash
cd client
npm start
```

L'application sera accessible sur `http://localhost:3000`

## 🔌 API REST

### Endpoints d'authentification

| Méthode | URL | Description |
|---------|-----|-------------|
| POST | `/api/auth/register` | Enregistrer un nouvel utilisateur |
| POST | `/api/auth/login` | Connexion d'un utilisateur |
| GET | `/api/auth/profile` | Obtenir le profil utilisateur (authentifié) |

**Corps de la requête (Register) :**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "analyst"
}
```

**Corps de la requête (Login) :**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Endpoints de gestion des données

| Méthode | URL | Description |
|---------|-----|-------------|
| POST | `/api/data/upload` | Uploader un fichier de données financières |
| GET | `/api/data` | Obtenir toutes les données de l'utilisateur |
| GET | `/api/data/:id` | Obtenir un dataset spécifique |
| DELETE | `/api/data/:id` | Supprimer un dataset (admin/manager uniquement) |

**Upload de fichier :**
- Méthode : `multipart/form-data`
- Champ : `file`
- Formats acceptés : CSV, Excel (.xlsx, .xls), JSON
- Taille maximale : 10MB

### Endpoints d'analyse

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/api/analytics/kpi` | Obtenir les KPIs financiers |
| GET | `/api/analytics/charts` | Obtenir les données pour les graphiques |
| GET | `/api/analytics/anomalies/:data_id` | Détecter les anomalies dans un dataset |
| GET | `/api/analytics/forecast/:data_id` | Générer des prévisions de revenus |

### Endpoints de rapports

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/api/reports/generate?format=excel&data_id=:id` | Générer un rapport Excel |
| GET | `/api/reports/generate?format=pdf&data_id=:id` | Générer un rapport PDF |
| GET | `/api/reports/generate?format=csv&data_id=:id` | Générer un rapport CSV |

### Endpoint de santé

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/api/health` | Vérifier l'état du serveur |

## 🤖 Service IA

Le service IA (FastAPI) fournit des fonctionnalités d'analyse avancée et de requêtes en langage naturel.

### Endpoints du Service IA

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/` | Racine du service |
| GET | `/health` | Vérifier l'état du service IA |
| POST | `/api/query` | Requête en langage naturel sur les données |
| POST | `/api/insights` | Générer des insights automatisés |
| POST | `/api/llm-query` | Requête avec LLM (optionnel) |

**Corps de la requête (Query) :**
```json
{
  "query": "Quel est le revenu total ?",
  "dataset_id": "123",
  "data": []
}
```

**Réponse :**
```json
{
  "answer": "Le revenu total est de $50,000",
  "data": [{"total": 50000, "count": 100}],
  "query_type": "total",
  "confidence": 1.0
}
```

### Installation du Service IA

```bash
cd ai-service
pip install -r requirements.txt
cp .env.example .env
# Éditez .env avec vos clés API si nécessaire
```

### Démarrage du Service IA

```bash
python main.py
```

Le service sera accessible sur `http://localhost:8000`

## 🧪 Tests

### Tests Backend

```bash
cd server
npm test
```

**Note** : Des tests Jest sont configurés dans `package.json`, mais aucun fichier de test n'a été identifié dans la version actuelle du projet.

### Tests Frontend

```bash
cd client
npm test
```

**Note** : Des tests React sont configurés dans `package.json`, mais aucun fichier de test n'a été identifié dans la version actuelle du projet.

**Aucun test automatisé n'a été identifié dans la version actuelle du projet.**

## 📁 Structure du projet

```
financial-analytics/
├── client/                      # Frontend React
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/         # Composants réutilisables
│   │   │   ├── KPICard.js
│   │   │   ├── RevenueChart.js
│   │   │   ├── ExpenseChart.js
│   │   │   ├── Layout.js
│   │   │   └── ProtectedRoute.js
│   │   ├── context/            # Contexte React
│   │   │   └── AuthContext.js
│   │   ├── pages/              # Pages de l'application
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── DataUpload.js
│   │   │   ├── Analytics.js
│   │   │   ├── Reports.js
│   │   │   └── AIAssistant.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
├── server/                      # Backend Node.js/Express
│   ├── config/
│   │   └── database.js          # Configuration PostgreSQL
│   ├── controllers/            # Contrôleurs de routes
│   │   ├── authController.js
│   │   ├── dataController.js
│   │   ├── analyticsController.js
│   │   └── reportController.js
│   ├── middleware/             # Middleware
│   │   └── auth.js             # Authentification JWT
│   ├── models/                 # Modèles de base de données
│   │   ├── User.js
│   │   └── FinancialData.js
│   ├── routes/                 # Routes API
│   │   ├── auth.js
│   │   ├── data.js
│   │   ├── analytics.js
│   │   └── reports.js
│   ├── uploads/                # Répertoire d'upload
│   ├── server.js               # Point d'entrée du serveur
│   ├── init-db.js              # Script d'initialisation DB
│   ├── package.json
│   └── .env.example
├── analytics/                  # Service Analytics Python
│   ├── data_processor.py       # Validation et traitement des données
│   ├── anomaly_detection.py    # Détection d'anomalies Isolation Forest
│   ├── forecasting.py          # Prévisions de revenus
│   ├── app.py                  # Application Flask
│   └── requirements.txt
├── ai-service/                 # Service IA FastAPI
│   ├── assistant.py            # Moteur de requêtes (zéro hallucination)
│   ├── insights.py             # Génération d'insights automatisés
│   ├── main.py                 # Application FastAPI
│   ├── requirements.txt
│   └── .env.example
├── employes.sql                # Fichier SQL additionnel
└── README.md
```

## 🐛 Dépannage

### PostgreSQL non démarré

**Symptôme :** Erreur de connexion à la base de données

**Solution :**
```powershell
# Windows
Get-Service postgresql-x64-18
Start-Service postgresql-x64-18

# Linux/Mac
sudo systemctl start postgresql
sudo systemctl status postgresql
```

### psql non reconnu

**Symptôme :** `psql : Le terme «psql» n'est pas reconnu`

**Solution :**
- Sur Windows, utilisez le chemin complet : `& "C:\Program Files\PostgreSQL\18\bin\psql.exe"`
- Ajoutez le chemin PostgreSQL au PATH système
- Ou utilisez l'invite de commande PostgreSQL (pgAdmin, SQL Shell)

### Port 5432 indisponible

**Symptôme :** `EADDRINUSE: address already in use :::5432`

**Solution :**
```powershell
# Identifier le processus utilisant le port
netstat -ano | findstr ":5432"

# Terminer le processus
taskkill /F /PID <PID>
```

### Backend non accessible sur le port 5000

**Symptôme :** `ECONNREFUSED` lors de l'accès au backend

**Solutions possibles :**
1. Vérifiez que le backend est démarré : `cd server && npm run dev`
2. Vérifiez que le port 5000 n'est pas utilisé : `netstat -ano | findstr ":5000"`
3. Vérifiez les variables d'environnement dans `.env`
4. Vérifiez que PostgreSQL est accessible

### Problème de variables d'environnement

**Symptôme :** Erreurs de connexion ou valeurs undefined

**Solution :**
1. Vérifiez que le fichier `.env` existe dans le répertoire approprié
2. Vérifiez que les variables sont correctement nommées
3. Redémarrez le serveur après avoir modifié `.env`
4. Utilisez `DB_HOST=127.0.0.1` au lieu de `localhost` pour éviter les erreurs IPv6

### Problème d'installation Python

**Symptôme :** Erreur lors de `pip install -r requirements.txt`

**Solution :**
1. Vérifiez la version Python : `python --version` (doit être 3.9+)
2. Mettez à jour pip : `python -m pip install --upgrade pip`
3. Utilisez des versions compatibles avec Python 3.13 (déjà configurées dans requirements.txt)

### Erreur "Route.get() requires a callback function"

**Symptôme :** Le backend crash au démarrage avec cette erreur

**Solution :**
Cette erreur a été corrigée dans la version actuelle. Assurez-vous d'avoir la dernière version du fichier `server/controllers/dataController.js`.

### Frontend sans CSS

**Symptôme :** La page s'affiche sans styles Tailwind

**Solution :**
Vérifiez que le fichier `client/src/index.css` contient les directives Tailwind :
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 🔒 Sécurité

### Bonnes pratiques de sécurité

1. **Ne jamais commiter les fichiers `.env`**
   - Les fichiers `.env` contiennent des informations sensibles
   - Utilisez `.env.example` comme modèle
   - Ajoutez `.env` au `.gitignore`

2. **Ne pas exposer les clés API**
   - Les clés API OpenAI/Anthropic doivent rester dans `.env`
   - Ne les stockez jamais dans le code source
   - Faites une rotation régulière des clés en production

3. **Utiliser des secrets forts**
   - Changez le `JWT_SECRET` par défaut
   - Utilisez des mots de passe PostgreSQL forts
   - Changez le mot de passe admin par défaut

4. **HTTPS en production**
   - Utilisez HTTPS pour toutes les communications
   - Configurez SSL/TLS sur le serveur de production
   - Utilisez des cookies sécurisés et HttpOnly

5. **Limitation de taux**
   - Le backend utilise `express-rate-limit`
   - Configurez les limites selon vos besoins
   - Surveillez les tentatives d'attaque par force brute

6. **Validation des fichiers**
   - Les uploads sont limités à 10MB
   - Seuls les formats CSV, Excel et JSON sont acceptés
   - Les fichiers sont validés avant traitement

7. **Contrôle d'accès**
   - Utilisez les rôles appropriés (analyst, manager, administrator)
   - Ne donnez pas de droits administratifs inutilement
   - Révisez régulièrement les accès utilisateurs

### .gitignore

Assurez-vous que votre `.gitignore` contient :
```
.env
node_modules/
uploads/
__pycache__/
*.pyc
.DS_Store
```

## 👨‍💻 Développement

### Ajouter une nouvelle fonctionnalité

1. **Backend :**
   - Créez un contrôleur dans `server/controllers/`
   - Créez les routes dans `server/routes/`
   - Ajoutez les routes dans `server/server.js`
   - Mettez à jour les modèles si nécessaire

2. **Frontend :**
   - Créez un composant dans `client/src/components/`
   - Créez une page dans `client/src/pages/`
   - Ajoutez la route dans `client/src/App.js`
   - Mettez à jour le contexte si nécessaire

3. **Service Analytics/IA :**
   - Ajoutez la fonctionnalité dans le fichier Python approprié
   - Exposez un endpoint dans `app.py` ou `main.py`
   - Mettez à jour `requirements.txt` si nécessaire

### Structure de code

- Suivez les conventions existantes
- Utilisez des commentaires clairs
- Gérez les erreurs de manière appropriée
- Validez les entrées utilisateur
- Utilisez les middleware d'authentification

## 📄 Licence

**MIT License**

Ce projet est sous licence MIT. Vous êtes libre de l'utiliser à des fins personnelles ou commerciales.

## 👤 Auteur

**Auteur** : SENOU Komi Godwin

## 📞 Support

Pour les questions, problèmes de configuration ou contributions, veuillez ouvrir une issue sur le dépôt du projet.

## 🎯 Informations importantes trouvées dans le projet

### Ports utilisés
- Frontend : 3000
- Backend : 5000
- Analytics Service : 3001
- AI Service : 8000
- PostgreSQL : 5432

### Scripts npm principaux

**Backend :**
- `npm start` : Démarrer le serveur en production
- `npm run dev` : Démarrer le serveur en développement (nodemon)
- `npm test` : Exécuter les tests Jest

**Frontend :**
- `npm start` : Démarrer le serveur de développement React
- `npm run build` : Créer un build de production
- `npm test` : Exécuter les tests React

### Utilisateur par défaut
- Email : admin@financial-analytics.com
- Mot de passe : admin123
- Rôle : administrator

⚠️ **Important** : Changez ce mot de passe en production !

### Formats de données supportés
- CSV (.csv)
- Excel (.xlsx, .xls)
- JSON (.json)

### Champs requis pour les données financières
- `date` : Date de la transaction (YYYY-MM-DD)
- `amount` : Montant de la transaction (numérique)

### Champs optionnels
- `type` : Type de transaction (revenue/expense)
- `category` : Catégorie pour le regroupement
- `description` : Description de la transaction
- `region` : Région géographique
- `department` : Département

## 📝 Informations non déterminées

Les éléments suivants n'ont pas pu être déterminés dans la version actuelle du projet :

- **URL du dépôt Git** : À compléter
- **Tests automatisés** : Aucun fichier de test identifié
- **Documentation API détaillée** : À compléter
- **Guide de contribution spécifique** : À compléter
