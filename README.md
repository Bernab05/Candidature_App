# 🍽️ Suivi des Candidatures - Restaurants Étoilés

Application de suivi des candidatures pour stages en restaurants étoilés à Paris avec **carte interactive dynamique**.

## ✨ Fonctionnalités

- ✅ **Carte interactive Leaflet** - zoom et déplacement, les marqueurs suivent !
- ✅ Ajout / modification / suppression de candidatures
- ✅ Coordonnées GPS pour chaque restaurant
- ✅ Statistiques en temps réel
- ✅ Export CSV
- ✅ Recherche et tri
- ✅ Données sauvegardées localement (localStorage)
- ✅ Interface responsive (mobile/desktop)

## 🗺️ La carte

La carte utilise **react-leaflet** avec OpenStreetMap. Les marqueurs sont de vrais marqueurs Leaflet qui :
- Suivent le zoom et le déplacement
- Affichent un popup au clic
- Sont colorés selon le statut (or=attente, vert=visité, rouge=refusé)

## 🚀 Déploiement sur Vercel (5 minutes)

### Étape 1 : GitHub
1. Créer un compte sur **https://github.com**
2. Cliquer **+** → **New repository**
3. Nom : `suivi-candidatures`
4. Cliquer **Create repository**

### Étape 2 : Upload
1. Décompresser ce ZIP
2. Dans GitHub : **Add file** → **Upload files**
3. Glisser tout le contenu
4. **Commit changes**

### Étape 3 : Vercel
1. Aller sur **https://vercel.com**
2. **Sign up** avec GitHub
3. **Add New** → **Project**
4. Sélectionner votre repo
5. **Deploy**

✅ Votre site sera en ligne !

## 💻 Développement local

```bash
npm install
npm start
```

## 📍 Trouver les coordonnées GPS

Pour ajouter un restaurant avec sa position exacte :
1. Aller sur **Google Maps**
2. Rechercher le restaurant
3. **Clic droit** sur le marqueur
4. Cliquer sur les coordonnées pour les copier
5. Format : `48.8566, 2.3522` (latitude, longitude)

## 📁 Structure

```
candidatures-app/
├── public/
│   └── index.html
├── src/
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

## 📝 License

MIT - Libre d'utilisation
