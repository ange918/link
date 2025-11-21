# FASH'LINK - Site Vitrine

## Vue d'ensemble
FASH'LINK est une plateforme vitrine qui connecte stylistes professionnels et jeunes talents dans l'industrie de la mode. Le site est développé en HTML, CSS et JavaScript vanilla (sans frameworks).

## Structure du projet

### Fichiers HTML (7 pages)
- `index.html` - Page d'accueil avec hero section, concept et étapes
- `a-propos.html` - Description, workflow, statistiques et avantages
- `styliste.html` - Espace styliste avec formulaire de demande
- `jeune-styliste.html` - Espace jeune styliste avec galerie portfolio et formulaire
- `fonctionnalités.html` - Présentation des 7 fonctionnalités avec test de géolocalisation
- `contact.html` - Formulaire de contact et carte
- `404.html` - Page erreur avec redirection automatique après 10 secondes

### Fichiers CSS et JavaScript
- `style.css` - Styles responsive mobile-first avec palette noir et blanc
- `script.js` - Fonctionnalités interactives (menu hamburger, validation, lightbox, géolocalisation, countdown 404)

## Design et Style

### Palette de couleurs
- Fond blanc: `#FFFFFF`
- Texte noir: `#000000`
- Accents sombres: `#111111`, `#222222`, `#333333`

### Typographie
- Police: Montserrat (Google Fonts)
- Style: Minimaliste, mode/fashion

### Icônes
- Boxicons 2.1.4 (CDN)
- Utilisés dans toute la navigation et les sections

## Fonctionnalités JavaScript

### Menu Hamburger
- Menu responsive pour mobile
- Toggle automatique au clic sur les liens

### Validation de formulaires
- Validation des champs requis
- Validation email avec regex
- Messages de confirmation après soumission
- Pas de création de compte (juste validation frontend)

### Galerie Portfolio (Lightbox)
- Clic sur image pour agrandir
- Fermeture par clic extérieur ou bouton X

### Géolocalisation
- Bouton de test sur la page Fonctionnalités
- Tente d'obtenir la position réelle
- Fallback: simulation avec coordonnées de Paris

### Page 404
- Compte à rebours de 10 secondes
- Redirection automatique vers l'accueil

## Responsive Design
- Mobile-first approach
- Breakpoints à 768px et 480px
- Grid et Flexbox pour layouts adaptatifs
- Menu hamburger sur mobile

## Déploiement
Le site est servi via Python HTTP Server sur le port 5000.

### Lancer le serveur
```bash
python -m http.server 5000
```

### Accès
Le site est accessible à l'adresse configurée par Replit sur le port 5000.

## État actuel
- ✅ Toutes les pages HTML créées avec contenu en français
- ✅ Design minimaliste noir et blanc implémenté
- ✅ Navigation fonctionnelle entre toutes les pages
- ✅ Tous les formulaires avec validation
- ✅ Responsive mobile, tablette et desktop
- ✅ Icônes Boxicons intégrées partout
- ✅ JavaScript interactif complet (menu, forms, lightbox, géo, 404)
- ✅ Workflow configuré et fonctionnel

## Prochaines étapes possibles
- Ajouter un backend pour traiter les soumissions de formulaires
- Implémenter une vraie base de données pour les profils
- Créer un tableau de bord admin pour validation
- Ajouter un système de messagerie interne
- Intégrer une vraie carte interactive (Google Maps/Mapbox)
- Développer le système de matching intelligent
