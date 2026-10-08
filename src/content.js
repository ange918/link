// Textes des chapitres : descriptions générales et factuelles, sans chiffres inventés.
export const CHAPTERS = [
  {
    id: 'fuselage', part: 'fuselage', short: 'Fuselage', num: '01', kicker: 'Structure',
    title: 'Fuselage',
    text: "C'est le tube qui porte l'équipage, les passagers et le fret. Sa section circulaire répartit uniformément les efforts liés à la pressurisation. Sur les long-courriers récents, il fait largement appel aux matériaux composites.",
    tags: ['Cellule pressurisée', 'Hublots', 'Soutes'],
    origin: 'model',
  },
  {
    id: 'cockpit', part: 'cockpit', short: 'Cockpit', num: '02', kicker: 'Pilotage',
    title: 'Poste de pilotage',
    text: "Le nez devient transparent : deux sièges, des écrans de pilotage et de navigation, un piédestal central et, de chaque côté, un mini-manche latéral. Sur les commandes de vol électriques, les ordres des pilotes passent par des calculateurs avant d'atteindre les gouvernes.",
    tags: ['Écrans de vol', 'Mini-manches', 'Piédestal', 'Panneau supérieur'],
    origin: 'mixed',
    originText: 'Nez du modèle 3D, intérieur procédural (écrans génériques, sans données)',
  },
  {
    id: 'ailes', part: 'ailes', short: 'Ailes', num: '03', kicker: 'Portance',
    title: 'Ailes',
    text: "Leur profil crée la portance. La flèche retarde les effets de compressibilité aux vitesses de croisière proches de celle du son. Becs et volets augmentent la portance à basse vitesse, ailerons et spoilers contrôlent le roulis. Les ailes servent aussi de réservoirs de carburant.",
    tags: ['Volets & becs', 'Ailerons', 'Réservoirs', 'Ailettes marginales'],
    origin: 'model',
  },
  {
    id: 'moteurs', part: 'moteurs', short: 'Moteurs', num: '04', kicker: 'Propulsion',
    title: 'Moteurs',
    text: "Vue écorchée d'un turboréacteur à double flux. La soufflante accélère un grand flux d'air froid qui contourne le cœur et fournit l'essentiel de la poussée. Dans le cœur, l'air est comprimé, brûlé avec le carburant, puis détendu dans les turbines qui entraînent compresseurs et soufflante.",
    tags: ['A · Soufflante', 'B · Compresseur BP', 'C · Compresseur HP', 'D · Combustion', 'E · Turbines', 'F · Tuyère'],
    origin: 'mixed',
    originText: 'Nacelles du modèle 3D, moteur écorché procédural (proportions approximatives)',
  },
  {
    id: 'empennage', part: 'empennage', short: 'Empennage', num: '05', kicker: 'Stabilité',
    title: 'Empennage',
    text: "La dérive et sa gouverne de direction assurent la stabilité et le contrôle en lacet. Le plan horizontal réglable et ses gouvernes de profondeur contrôlent le tangage. Le cône arrière abrite généralement l'APU, un groupe auxiliaire qui fournit électricité et air comprimé au sol.",
    tags: ['Dérive', 'Gouverne de direction', 'Plan horizontal'],
    origin: 'model',
  },
  {
    id: 'train', part: 'train', short: 'Train', num: '06', kicker: 'Au sol',
    title: "Train d'atterrissage",
    text: "Train tricycle escamotable : une jambe avant orientable pour rouler au sol et deux trains principaux sous la voilure, ici représentés avec des bogies à quatre roues. Les amortisseurs oléopneumatiques absorbent l'impact du toucher. Après le décollage, le train se replie dans ses logements.",
    tags: ['Train avant orientable', 'Bogies', 'Amortisseurs'],
    origin: 'procedural',
  },
  {
    id: 'cabine', part: 'cabine', short: 'Cabine', num: '07', kicker: 'Intérieur',
    title: 'Cabine',
    text: "Le pont principal accueille les passagers en rangées, sous les coffres à bagages. Sous le plancher se trouvent les soutes à bagages et à fret. La cabine est pressurisée et climatisée pendant le vol. L'aménagement montré ici est illustratif : chaque compagnie choisit le sien.",
    tags: ['Pont principal', 'Rangées de sièges', 'Plancher & soutes'],
    origin: 'procedural',
  },
];
