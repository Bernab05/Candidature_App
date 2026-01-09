# 🍽️ Suivi des Candidatures - Restaurants Étoilés

Application de suivi des candidatures pour stages en restaurants étoilés avec **carte interactive dynamique** et **géocodage international**.

## ✨ Fonctionnalités principales

### 🗺️ Carte interactive avancée
- ✅ **Carte Leaflet avec OpenStreetMap** - Zoom, déplacement fluide
- ✅ **Marqueurs dynamiques colorés** selon le statut :
  - 🟡 Or = En attente
  - 🟢 Vert = Visité ou réponse positive
  - 🔴 Rouge = Réponse négative
- ✅ **Popup détaillé** au clic sur chaque restaurant
- ✅ **Centrage automatique** - Cliquez sur un restaurant dans la liste pour le localiser
- ✅ **Repositionnement en temps réel** lors des modifications

### 🌍 Géocodage automatique international
- ✅ **Recherche d'adresse intelligente** - Pas besoin de coordonnées GPS !
- ✅ **Support international** - Formats acceptés :
  - Ville + Pays : `Tokyo, Japan`
  - Restaurant + Ville : `Noma, Copenhagen, Denmark`
  - Adresse complète : `17 rue Marbeuf, Paris 8e, France`
  - Ville seule (reconnue) : `London`, `Berlin`, `Barcelona`
- ✅ **API Nominatim (OpenStreetMap)** - Gratuite, sans clé API
- ✅ **50+ villes et pays reconnus** automatiquement
- ✅ **Confirmation visuelle** avec le lieu trouvé

### 📊 Gestion des candidatures
- ✅ **CRUD complet** - Créer, lire, modifier, supprimer
- ✅ **Statistiques en temps réel** - Total, visites, réponses, taux
- ✅ **Import/Export CSV** - Sauvegardez et restaurez vos données
- ✅ **Recherche et tri** - Par restaurant, chef, date, statut
- ✅ **Sauvegarde automatique** - localStorage (données persistantes)

### 💾 Import/Export
- ✅ **Export CSV** - Toutes vos données en un clic
- ✅ **Import CSV** - Restaurez vos données facilement
- ✅ **Format complet** - Restaurant, Date, Téléphone, Chef, Visite, Réponse, Commentaires, Adresse, Coordonnées

### 📱 Interface responsive
- ✅ **Mobile-first** - Fonctionne sur tous les appareils
- ✅ **Design élégant** - Couleurs or et noir, style professionnel
- ✅ **Accessibilité** - Clavier (Escape pour fermer les modals)

---

## 🚀 Démarrage rapide

### Installation

```bash
# Cloner le projet
git clone https://github.com/Bernab05/Candidature_App.git
cd Candidature_App

# Installer les dépendances
npm install

# Lancer en mode développement
npm start
```

L'application sera accessible sur **http://localhost:3000**

---

## 📖 Guide d'utilisation

### 1. Ajouter un restaurant

1. Cliquez sur **➕ Nouvelle**
2. Remplissez le formulaire :
   - **Restaurant** (requis)
   - **Date d'envoi**
   - **Téléphone**
   - **Chef**
   - **Visite effectuée** (oui/non)
   - **Réponse** (positive/négative/en attente)
   - **Adresse** - Exemples :
     - `Tokyo, Japan`
     - `Noma, Copenhagen`
     - `17 rue Marbeuf, Paris 8e`
   - **Commentaires**
3. Cliquez sur **🔍 Rechercher** pour géocoder l'adresse
4. Vérifiez les coordonnées affichées
5. Cliquez sur **💾 Enregistrer**

### 2. Modifier un restaurant

1. Cliquez sur **✏️** dans le tableau
2. Le formulaire s'ouvre avec les données actuelles
3. Modifiez les champs (notamment l'adresse si besoin)
4. Cliquez sur **🔍 Rechercher** si vous avez changé l'adresse
5. **La carte se centre automatiquement** sur la nouvelle position
6. Cliquez sur **💾 Enregistrer**

### 3. Localiser un restaurant sur la carte

- Cliquez sur un restaurant dans la liste latérale
- La carte se déplace et centre automatiquement sur le restaurant
- Le popup s'ouvre avec les détails

### 4. Exporter vos données

1. Cliquez sur **📥 Export CSV**
2. Un fichier `candidatures_YYYY-MM-DD.csv` est téléchargé
3. Conservez-le en backup !

### 5. Importer vos données

1. Cliquez sur **📤 Import CSV**
2. Sélectionnez votre fichier CSV
3. Vos données sont restaurées instantanément

---

## 🌍 Géocodage - Exemples d'adresses

| Format | Exemple | Résultat |
|--------|---------|----------|
| **Ville + Pays** | `Tokyo, Japan` | Centre de Tokyo |
| **Restaurant + Ville** | `Noma, Copenhagen, Denmark` | Adresse précise du restaurant |
| **Adresse complète** | `17 rue Marbeuf, Paris 8e, France` | Position exacte |
| **Ville seule** | `London` | Centre de Londres |
| **Rue sans ville** | `rue de Rivoli` | Paris ajouté automatiquement |

### Villes reconnues automatiquement (50+)

**Europe :** Paris, London, Berlin, Madrid, Rome, Barcelona, Milan, Lyon, Marseille, Copenhagen, Stockholm, Oslo, Amsterdam, Brussels, Vienna, Prague, Budapest, Warsaw, Lisbon, Dublin, Athens, Helsinki, Zurich, Geneva, Monaco, Luxembourg

**Monde :** Tokyo, New York, Singapore, Bangkok, Sydney, Toronto, et plus...

---

## 📁 Structure du projet

```
candidatures-app/
├── public/
│   └── index.html          # Page HTML principale
├── src/
│   ├── App.js              # Application React (carte, formulaires, logique)
│   └── index.js            # Point d'entrée React
├── .gitignore              # Fichiers ignorés par Git
├── package.json            # Dépendances npm
└── README.md               # Documentation
```

---

## 🛠️ Technologies utilisées

- **React 18** - Framework UI
- **React Leaflet** - Carte interactive
- **Leaflet** - Librairie de cartographie
- **Nominatim API** - Géocodage gratuit (OpenStreetMap)
- **localStorage** - Stockage local des données
- **CSS-in-JS** - Styles intégrés

---

## 🌐 Déploiement sur Vercel (5 minutes)

### Méthode rapide

1. **Fork le projet sur GitHub**
   ```
   https://github.com/Bernab05/Candidature_App
   ```

2. **Créer un compte Vercel**
   - Aller sur https://vercel.com
   - Sign up avec GitHub

3. **Déployer**
   - Cliquer **Add New** → **Project**
   - Sélectionner votre fork
   - Cliquer **Deploy**
   - ✅ Votre site est en ligne en 2 minutes !

### Configuration Vercel (automatique)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "framework": "create-react-app"
}
```

---

## 💡 Astuces

### Retrouver vos données
- Les données sont dans **localStorage** du navigateur
- Exportez régulièrement en CSV pour backup
- Ne videz pas le cache sans avoir exporté !

### Géocodage optimal
- Plus l'adresse est précise, meilleur est le résultat
- Pour Paris : `17 rue Marbeuf, Paris 8e` est meilleur que `rue Marbeuf`
- Pour l'international : Toujours ajouter le pays (`Tokyo, Japan`)

### Limites de l'API Nominatim
- **1 requête par seconde maximum** (fair use)
- Gratuite, pas de clé API nécessaire
- Si trop de requêtes : attendez quelques secondes

---

## 🔧 Développement

### Build de production

```bash
npm run build
```

Crée le dossier `build/` prêt pour le déploiement.

### Linting

```bash
npm run lint
```

### Tests

```bash
npm test
```

---

## 📝 Format CSV

Le fichier CSV exporté contient :

```
Restaurant,Date Envoi,Téléphone,Chef,Visite,Réponse,Commentaires,Adresse,Latitude,Longitude
"Le Faham","2024-12-29","01 53 81 48 18","Rangama","oui","","","",48.8534,2.3488
```

---

## 🐛 Problèmes connus

### La carte ne charge pas
- Vérifiez votre connexion internet
- OpenStreetMap doit être accessible

### Le géocodage ne fonctionne pas
- Vérifiez l'orthographe de l'adresse
- Essayez le format "Ville, Pays"
- Attendez quelques secondes (limite API)

### Mes données ont disparu
- Vérifiez que vous n'avez pas vidé le cache navigateur
- Restaurez depuis un export CSV

---

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Ouvrir une issue pour un bug
- Proposer une nouvelle fonctionnalité
- Soumettre une pull request

---

## 📄 License

MIT - Libre d'utilisation

---

## 👨‍💻 Auteur

Créé avec ❤️ pour faciliter la recherche de stage en restaurants étoilés.

**Généré avec [Claude Code](https://claude.com/claude-code)**

Co-Authored-By: Claude Sonnet 4.5
