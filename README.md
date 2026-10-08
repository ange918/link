# Anatomie d'un long-courrier : démo 3D au scroll (V2)

Démo de site premium : un avion de ligne est présenté pièce par pièce au défilement. Il part entier (hero), passe en vue éclatée, puis chaque chapitre détache une pièce : fuselage, poste de pilotage, ailes, moteurs, empennage, train d'atterrissage, cabine. La caméra s'en approche et les autres pièces passent en silhouette « fantôme ». À la fin, l'avion se réassemble pièce par pièce, avec un léger décalage entre elles.

Nouveautés de la V2 :

- **Direction visuelle « Veille design »** : palette nuit (#05070A / #0A0E14 / #111823), un seul accent horizon #5CC8FF, ambre #FFB23E réservé à l'ancre principale ; Sora (titres), Inter (texte) et B612 Mono (données) ; panneaux à coins repères, progression à 7 segments ; silhouettes fantômes #9FC3E0 (remplissage 6 %, arêtes 30 %) avec liseré fresnel bleu ; grille au sol, brouillard, exposition 1,2 et quatre lumières (key chaude, rim froide, hémisphère, ponctuelle d'accent sur la pièce présentée). La caméra, les distances d'éclatement et les easings suivent le guide.
- **Poste de pilotage** : au chapitre 02, le nez devient transparent et la caméra entre dans la cabine de pilotage. On y voit une planche de bord à écrans (textures canvas génériques de type PFD, ND, moteurs et système, **sans aucune donnée chiffrée**), deux sièges, deux mini-manches latéraux, le piédestal, le panneau supérieur et un vitrage tiré de la forme du nez. Quatre étiquettes accompagnent la vue.
- **Moteur en vue écorchée** : au chapitre 04, la nacelle droite s'ouvre en demi-coupe, à la manière des écorchés de Masterwork. Six sections sont étiquetées : soufflante, compresseur BP, compresseur HP, chambre de combustion (ancre ambre), turbines HP et BP, tuyère. Les attelages BP et HP tournent doucement, sauf en mouvement réduit.
- **Modèle amélioré** : subdivision de Loop du nez (1 itération) et des nacelles (2 itérations), normales recalculées avec un angle seuil de 38°, vernis et métal revus. Le fuselage n'est pas subdivisé, car sa livrée se déformait.

## Lancer la démo (build statique)

Le dossier `dist/` est un site statique. Il doit être servi en HTTP, car l'ouverture directe du fichier `index.html` ne permet pas de charger le modèle 3D :

```bash
npx serve dist          # puis ouvrir l'URL affichée (http://localhost:3000)
# ou : python3 -m http.server -d dist 8080
```

Les chemins sont relatifs (`base: './'`), donc `dist/` peut aussi être déposé dans un sous-dossier ou sur Netlify, GitHub Pages, etc. Le dossier pèse environ 1,4 Mo, dont 178 Ko pour le modèle.

## Déploiement Vercel

Le site se construit depuis les sources. `vercel.json` fixe le preset Vite, l'installation `npm ci`, la commande `npm run build` et le dossier de sortie `dist`. Le dépôt `public/` seul ne suffit pas : Vite doit empaqueter `src/` avant publication.

## Développement

```bash
npm install
npm run dev            # serveur Vite
npm run build          # build de production dans dist/
npm run build:model    # régénère public/models/avion.glb depuis raw/ (découpage, subdivision, normales, compression)
SUBDIV=0 npm run build:model   # même chose sans subdivision
```

## Structure

- `src/main.js` : timeline maître (un seul objet d'état), rendu, fantômes, étiquettes projetées, scroll
- `src/content.js` : textes des chapitres
- `src/cockpit.js` : poste de pilotage procédural (écrans canvas génériques)
- `src/turbofan.js` : turboréacteur procédural en demi-coupe
- `src/gear.js`, `src/cabin.js` : train et cabine procéduraux
- `tools/build-model.mjs` : découpage du modèle amvlab en pièces nommées, subdivision et normales
- `tools/capture.mjs`, `tools/seek.mjs` : captures Playwright

## Stack

- Vite 8, JavaScript vanilla
- Three.js 0.186 : GLTFLoader + MeshoptDecoder, RoomEnvironment (plus de HDRI à télécharger), MeshPhysicalMaterial, tone mapping ACES, shaders fresnel et grille
- GSAP 3.15 + ScrollTrigger : une seule timeline maître en scrub anime un seul objet d'état (caméra, focale, sortie et atténuation de chaque pièce, train, nez transparent, coupe moteur, cabine). Le scroll s'aimante sur les chapitres et le retour en arrière fonctionne.
- gltf-transform (meshopt + WebP) et three-subdivide (Loop) pour la préparation hors ligne du modèle
- Polices auto-hébergées (@fontsource) : Sora, Inter, B612 Mono
- Design system ui-ux-pro-max (`design-system/anatomie-d-un-avion/MASTER.md`, motion 9), réaligné sur la direction Veille design

## Accessibilité et performances

- `prefers-reduced-motion` : pas de trajet caméra, pas de scrub, pas de rotation ni de flottement. Chaque chapitre affiche directement son plan final, avec un fondu.
- Mobile : panneau en bas d'écran, sept traits de progression sous la barre, caméra recadrée et reculée. Les étiquettes deviennent des lettres, dont la légende figure dans le panneau. Pixel ratio plafonné (1,5 sur mobile, 1,75 sur desktop), cabine allégée.
- Écran de chargement avec progression, message de repli si WebGL est indisponible (le texte reste lisible).
- Boutons précédent et suivant dans chaque panneau, progression cliquable, lien d'évitement, focus visible, cibles tactiles d'au moins 44 px.

## Crédits

- **Modèle 3D** « A350 » (variante `A350_nologo.glb`) par **amvlab**, https://github.com/amvlab/aircraft-models, licence **CC BY 4.0** (https://creativecommons.org/licenses/by/4.0/). Modifications : découpage en 13 pièces nommées, subdivision de Loop du nez et des nacelles, normales recalculées, recentrage, compression meshopt et texture WebP.
- **Poste de pilotage, moteur écorché, train d'atterrissage et cabine** : modélisation procédurale en Three.js pour cette démo, à titre d'illustration. Les proportions sont approximatives et les écrans sont des visuels génériques sans données.
- **three-subdivide** par Stephens Nunnally, https://github.com/stevinz/three-subdivide, licence MIT (préparation du modèle uniquement, non incluse dans le site).
- **Direction visuelle** : guide de style Veille design (`/workspace/avion-3d-direction`).
- **Polices** : Sora, Inter et B612 Mono, SIL Open Font License 1.1.
- Bibliothèques : Three.js (MIT), GSAP (licence standard GSAP, gratuite).

Démo non affiliée aux constructeurs aéronautiques. Les textes sont généraux et pédagogiques. Aucune valeur chiffrée n'est affichée, et les noms de travail du guide (« AXIAL », « AX-350 ») ne sont pas utilisés.
