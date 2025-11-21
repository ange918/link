# FASH'LINK - Site Vitrine

## Vue d'ensemble
FASH'LINK est une plateforme vitrine qui connecte stylistes professionnels et jeunes talents dans l'industrie de la mode. Le site est développé en HTML, CSS et JavaScript vanilla (sans frameworks).

## Structure du projet

### Fichiers HTML (10 pages)
- `index.html` - Page d'accueil avec hero, concept, étapes, vidéo et témoignages
- `a-propos.html` - Description, workflow, FAQ accordéon (6 items), Blog (3 articles), statistiques animées et avantages
- `styliste.html` - Espace styliste avec formulaire de demande
- `jeune-styliste.html` - Espace jeune styliste avec galerie portfolio et formulaire
- `fonctionnalités.html` - Fonctionnalités principales (6 cartes), Phase 2 avancées (5 cartes), et Packs économiques (3 packs)
- `galerie.html` - Galerie de réalisations et projets réussis
- `blog.html` - Page Blog accessible depuis À propos (hors navigation principale)
- `faq.html` - Page FAQ accessible depuis À propos (hors navigation principale)
- `contact.html` - Formulaire de contact et carte
- `404.html` - Page erreur avec redirection automatique après 10 secondes

### Fichiers CSS et JavaScript
- `style.css` - Styles responsive mobile-first avec palette noir et blanc + text-transform uppercase pour tous les titres (h1, h2, h3)
- `script.js` - Toutes les fonctionnalités interactives (accordéon FAQ, compteurs animés, etc.)
- `favicon.svg` - Icône du site
- `.gitignore` - Ignore Python cache, virtualenvs et fichiers temporaires

## Design et Style

### Palette de couleurs
- Fond blanc: `#FFFFFF`
- Texte noir: `#000000`
- Accents sombres: `#111111`, `#222222`, `#333333`

### Typographie
- Police: Montserrat (Google Fonts)
- Style: Minimaliste, mode/fashion
- **Tous les titres (h1, h2, h3) en MAJUSCULES** via text-transform uppercase

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
- Toast notifications (au lieu d'alertes)
- Loader/spinner pendant soumission
- Messages de confirmation modernes

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

### FAQ Accordéon
- 6 questions/réponses intégrées dans la page À propos
- Questions/réponses dépliables avec animation fluide
- Fermeture automatique des autres items au clic
- Page FAQ dédiée accessible via lien dans la section

### Compteurs Statistiques Animés
- Section Statistiques sur la page À propos
- Compteurs animés au scroll (Intersection Observer)
- Anime les chiffres de 0 à la valeur cible
- Affiche les statistiques clés de la plateforme

### Back-to-Top Button
- Apparaît après scroll de 300px
- Retour en haut avec animation smooth
- Présent sur toutes les pages

### Animations au scroll
- Fade-in progressif des éléments
- Utilise Intersection Observer API
- Appliqué aux cartes de projets, blog et témoignages

### Toast Notifications
- Notifications modernes et élégantes
- Types: success, error, info
- Disparition automatique après 4 secondes

## Responsive Design
- Mobile-first approach
- Breakpoints à 768px et 480px
- Grid et Flexbox pour layouts adaptatifs
- Menu hamburger sur mobile

## Nouvelles Sections

### Témoignages (Page d'accueil)
- 3 témoignages de stylistes et jeunes talents
- Design minimaliste avec avatars
- Animation au scroll

### Vidéo de présentation (Page d'accueil)
- Placeholder pour vidéo YouTube/Vimeo
- Aspect ratio 16:9
- Facile à remplacer par une vraie vidéo

### Galerie de réalisations
- 6 projets exemple avec tags
- Hover effects sur les cartes
- Responsive grid

### Blog/Actualités (Page À propos)
- 3 articles récents affichés sur la page À propos
- Lien vers la page Blog complète (hors navigation principale)
- Design moderne avec dates et auteurs

### FAQ (Page À propos)
- 6 questions fréquentes en accordéon sur la page À propos
- Système d'accordéon interactif et responsive
- Lien vers la page FAQ complète avec 10 questions (hors navigation principale)

### Fonctionnalités Principales
- 6 fonctionnalités principales avec icônes Boxicons
- Design en cartes responsive et élégantes
- Profils vérifiés, matching intelligent, messagerie, portfolio, opportunités, géolocalisation

### Fonctionnalités Phase 2
- 5 fonctionnalités avancées à venir
- Design cohérent avec phase 1
- Dashboard admin, système rating, API mobile, analytics, partenariats

### Packs & Modèle Économique
- 3 packs: Découverte (gratuit), Professionnel (29€/mois), Premium (99€/mois)
- Cartes avec listes d'avantages et CTA
- Design clair et engageant

### Statistiques Animées (Page À propos)
- 4 statistiques clés avec compteurs animés
- Animation déclenchée au scroll (Intersection Observer)
- Design minimaliste avec grands chiffres

## SEO & Performance

### Meta tags
- Description unique par page
- Keywords pertinents
- Favicon SVG léger

### Optimisations
- Images optimisées via stock_image_tool
- Animations GPU-accelerated (transform)
- Lazy loading via Intersection Observer
- CSS minimaliste et performant

## Navigation
- **Menu principal** : Accueil, À propos, **Fonctionnalités**, Styliste, Jeune Styliste, Galerie, Contact
- **Pages secondaires** : Blog et FAQ (accessibles via la page À propos, retirées du menu principal)
- Menu hamburger responsive pour mobile
- Navigation cohérente sur toutes les pages

## Déploiement
Le site est servi via Python 3.11 HTTP Server sur le port 5000.

### Prérequis
- Python 3.11 installé via Replit modules

### Lancer le serveur
```bash
python -m http.server 5000
```

### Accès
Le site est accessible à l'adresse configurée par Replit sur le port 5000.

## État actuel (21 novembre 2025)
- ✅ 10 pages HTML complètes avec contenu en français
- ✅ Design minimaliste noir et blanc avec images d'arrière-plan
- ✅ **TOUS LES TITRES EN MAJUSCULES** (h1, h2, h3)
- ✅ Navigation mise à jour : Fonctionnalités ajouté, Blog et FAQ retirés du menu principal
- ✅ Page À propos enrichie : FAQ accordéon (6 items), Blog (3 articles), Statistiques animées
- ✅ Page Fonctionnalités complète : 6 principales + 5 Phase 2 + 3 Packs économiques
- ✅ Tous les formulaires avec validation moderne
- ✅ Responsive mobile, tablette et desktop
- ✅ Icônes Boxicons partout
- ✅ JavaScript interactif complet : menu, forms, lightbox, géo, 404, **accordéon FAQ**, **compteurs animés**, scroll animations, toast, back-to-top
- ✅ SEO optimisé avec meta tags
- ✅ Favicon personnalisé
- ✅ Témoignages et vidéo sur homepage
- ✅ Toast notifications au lieu d'alertes
- ✅ Loader sur soumission de formulaires
- ✅ Animations au scroll (IntersectionObserver)
- ✅ Bouton retour en haut sur toutes les pages
- ✅ Python 3.11 installé
- ✅ .gitignore configuré pour Python
- ✅ Workflow configuré et fonctionnel

## Prochaines étapes possibles
- Ajouter un backend pour traiter les soumissions de formulaires
- Implémenter une vraie base de données pour les profils
- Créer un tableau de bord admin pour validation
- Ajouter un système de messagerie interne
- Intégrer une vraie carte interactive (Google Maps/Mapbox)
- Développer le système de matching intelligent
- Remplacer les placeholders vidéo/images par du contenu réel
- Ajouter plus d'articles de blog
- Implémenter la newsletter
