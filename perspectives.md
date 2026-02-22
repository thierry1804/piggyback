# Piggyback
## Document de référence – Produit, business model, IA et landing page

> Ce document synthétise **l’ensemble des décisions, orientations et contenus** discutés pour Piggyback.
> Il sert de **référence unique** pour le produit, le business model, la stratégie IA, les tarifs et la landing page (desktop & mobile-first).

---

## 1. Vision du produit

### 1.1 Ce qu’est Piggyback
Piggyback est une **plateforme de suivi de tirelires physiques**.

Elle permet de :
- suivre des économies déjà existantes (famille, groupe, association)
- fixer un objectif et une deadline
- enregistrer les contributions
- partager la visibilité et la transparence

👉 Piggyback **ne gère pas l’argent**. Il gère **l’information, la traçabilité et la confiance**.

> *"La tirelire existe déjà. Piggyback lui donne une mémoire."*

---

### 1.2 Ce que Piggyback n’est pas
- ❌ Une banque
- ❌ Un mobile money
- ❌ Une fintech de paiement

Piggyback est un **outil de suivi**, pas un intermédiaire financier.

---

## 2. Fonctionnalités actuelles (socle existant)

Déjà présentes dans Piggyback :
- Montant objectif
- Deadline
- Calcul du montant à épargner par période
  - ex : "Pour atteindre votre objectif, vous devez épargner 50 000 Ar par semaine"

⚠️ Ces fonctionnalités relèvent du **calcul déterministe**, pas de l’IA.
Elles constituent le **moteur de conseil de base** (`advisory_engine`).

---

## 3. Modèle produit & monétisation

### 3.1 Niveaux du produit

#### Gratuit (adoption maximale)
- 1 tirelire
- Objectif + deadline
- Conseil d’épargne (calcul)
- Historique simple
- 1 administrateur

---

#### Premium One-Shot (paiement unique)
Objectif : **sérieux, gouvernance, preuve**.

Fonctionnalités :
- Tirelires illimitées
- Multi-contributeurs
- Rôles utilisateurs :
  - Administrateur
  - Contributeur
  - Observateur (lecture seule)
- Historique détaillé et **inviolable**
- Journal d’événements
- Clôture et archivage des projets
- Export PDF / Excel
- Partage sécurisé (lecture seule)

❌ Exclu volontairement :
- IA
- alertes intelligentes
- analyses comportementales

👉 Le Premium One-Shot est une **fondation stable**, indépendante de l’IA.

---

#### IA (abonnement futur)
Objectif : **valeur continue et revenu récurrent**.

- analyses comportementales
- prévisions avancées
- résumés automatiques
- alertes intelligentes

---

## 4. Architecture fonctionnelle & IA

### 4.1 Découpage recommandé

```
core_features        (gratuit)
premium_features     (one-shot)
advisory_engine      (calculs actuels)
ai_features          (abonnement futur)
```

Le `advisory_engine` (calculs) **n’est pas de l’IA**.

---

### 4.2 Données à structurer dès maintenant

Même si elles ne sont pas visibles côté UI.

#### Contributions
- montant
- timestamp précis
- auteur
- source (manuel / correction)

#### Objectifs
- valeur initiale
- date de création
- date de modification
- auteur de la modification

#### Activité
- fréquence par utilisateur
- périodes d’inactivité
- écart prévu / réel

---

### 4.3 Indicateurs internes (silencieux)
- consistency_score
- saving_velocity
- delay_risk_score

Ces indicateurs serviront plus tard à l’IA.

---

## 5. IA – Évolution progressive

### IA Phase 1
- Prévision réaliste de date d’atteinte
- Résumé mensuel automatique
- Alertes simples de retard

### IA Phase 2
- Analyse de régularité
- Détection d’anomalies
- Comparaison prévu / réel

### IA Phase 3 (ONG / B2B)
- Rapports multi-tirelires
- Alertes de gouvernance
- Tableaux consolidés

---

## 6. Tarification

### 6.1 Grand public

#### Gratuit
- Accès libre

#### Premium One-Shot
- **15 000 Ar** (recommandé)
- Plage possible : 10 000 – 20 000 Ar
- Paiement unique
- Accès à vie

---

### 6.2 Abonnements IA (futur)

#### IA Basic
- 2 000 – 3 000 Ar / mois
- Résumés
- Prévisions simples

#### IA Advanced
- 5 000 – 7 000 Ar / mois
- Analyses comportementales
- Alertes intelligentes

#### Abonnement annuel
- 10 mois payés = 12 mois

---

### 6.3 Tarifs contractuels ONG

#### Offre ONG Essentielle
- 10 tirelires
- 50 utilisateurs
- IA Basic
- Exports & archivage

💰 200 000 – 300 000 Ar / an

---

#### Offre ONG Avancée
- 30 tirelires
- 150 utilisateurs
- IA Advanced
- Rapports consolidés

💰 500 000 – 700 000 Ar / an

---

#### Offre ONG Partenaire
- Illimité
- IA complète
- Branding
- Support dédié

💰 1 200 000 – 2 000 000 Ar / an

---

## 7. Démarche commerciale

### Phase 1 – Sans IA
Message clé :
> "Piggyback vous aide à suivre et sécuriser une tirelire, seul ou à plusieurs."

---

### Phase 2 – Pré-IA
Teaser discret :
> "Bientôt, des analyses pour vous aider à atteindre vos objectifs plus facilement."

---

### Phase 3 – IA
> "Votre tirelire est suivie. Activez maintenant l’intelligence qui vous aide à mieux épargner."

---

## 8. Landing Page – Version Mobile-First (référence)

### Écran 1 – Hero
**Suivez votre tirelire. Atteignez vos objectifs.**

CTA : **Créer ma première tirelire**

Micro-texte : Gratuit · Sans carte bancaire

---

### Écran 2 – Problème
- On ne sait plus combien a été mis
- Plusieurs personnes participent
- Aucun historique clair

---

### Écran 3 – Solution
- Objectif clair
- Contributions enregistrées
- Progression visible

---

### Écran 4 – Comment ça marche
1. Créez une tirelire
2. Ajoutez les contributions
3. Suivez la progression

---

### Écran 5 – Fonctionnalités
- Objectif & deadline
- Conseil d’épargne
- Multi-contributeurs
- Historique
- Exports (Premium)

---

### Écran 6 – Confiance
> Piggyback ne gère pas votre argent.
> Il aide uniquement à le suivre.

---

### Écran 7 – Tarifs
- Gratuit
- Premium (15 000 Ar – paiement unique)
- IA (bientôt)

---

### Écran 8 – Pour qui
- Familles
- Écoles
- Associations
- ONG

---

### Écran 9 – CTA final
**Créer ma tirelire maintenant**

Micro-texte : Cela prend moins d’une minute.

---

## 9. Positionnement final

Piggyback évolue naturellement :

> Carnet → Tableau de bord → Assistant → Conseiller

Sans jamais trahir la promesse initiale :
**la confiance avant l’intelligence.**

1. Fonctionnalités centrées sur la confiance (différenciation forte)
1.1 Journal de confiance (Trust Ledger)

Un journal non modifiable qui enregistre :

chaque contribution

chaque modification d’objectif

chaque changement de deadline

chaque correction manuelle

🔐 Valeur :

ONG, familles, groupes → preuve morale

Personne ne peut dire « on a changé après »

➡️ Peu d’outils grand public font ça.

1.2 Signatures symboliques

Chaque contributeur peut :

valider une contribution

laisser une note courte (ex : “Cotisation janvier”)

📌 Option premium :

validation requise à 2 personnes pour certaines entrées

➡️ Tu introduis une responsabilité collective.

1.3 Historique visible après clôture

Une fois une tirelire clôturée :

tout devient lecture seule

partageable via lien public

➡️ Utilisable comme :

preuve associative

rapport de projet

transparence communautaire

2. Fonctionnalités sociales intelligentes mais non intrusives
2.1 Engagement moral (soft)

Avant de créer une tirelire :

“Souhaitez-vous vous engager à contribuer régulièrement ?”

Pas contractuel.
Mais affiché dans la tirelire.

➡️ La psychologie de l’engagement est très puissante.

2.2 Contributions symboliques

Autoriser des entrées comme :

promesse

contribution prévue

contribution exceptionnelle

Distinctes de l’argent réel.

➡️ Les autres apps ne comprennent que des montants.
Piggyback comprend l’intention.

2.3 Indicateur de fiabilité (privé)

Un score interne (non affiché publiquement) basé sur :

régularité

respect des engagements

écarts fréquents

➡️ Base parfaite pour l’IA plus tard.

3. Fonctionnalités orientées temps réel et réalité terrain
3.1 Mode hors-ligne / saisie différée

Contributions saisies sans connexion

Synchronisation ultérieure

Marquage temporel réel vs sync

➡️ Très différenciant pour Madagascar & Afrique.

3.2 Photo de la tirelire (preuve visuelle)

Optionnelle :

photo à l’ouverture

photo à la clôture

photo intermédiaire

⚠️ Pas pour vérifier l’argent, mais :

renforcer la confiance

créer une trace visuelle

3.3 Rythme réel vs rythme idéal

Comparaison graphique :

ce qui aurait dû être fait

ce qui a été fait

➡️ Visualisation simple mais très parlante.

4. Fonctionnalités émotionnelles (rarement exploitées)
4.1 Timeline narrative

Une tirelire raconte une histoire :

création

moments clés

pics de contributions

clôture

➡️ L’épargne devient un projet vécu, pas un chiffre.

4.2 Message à la clôture

À la fin :

message collectif

remerciements

leçons apprises

Téléchargeable en PDF.

4.3 Souvenir numérique

Après clôture :

archive consultable

timeline figée

exportable

➡️ Très puissant pour familles & associations.

5. Fonctionnalités IA (à forte valeur ajoutée réelle)
5.1 Détection de dérive

L’IA détecte :

baisse progressive des contributions

changement de comportement

silence inhabituel

📣 Message :

“La dynamique a changé ces 3 dernières semaines.”

5.2 Recommandations contextuelles

Pas génériques.
Basées sur :

l’historique

le type de tirelire

le nombre de participants

Ex :

“Les groupes similaires au vôtre contribuent souvent plus en début de mois.”

5.3 Résumé intelligent

Mensuel ou à la demande :

ce qui a bien marché

ce qui a freiné

ce qui peut être ajusté

➡️ Pas un tableau, un récit utile.

6. Fonctionnalités spécifiques ONG / collectifs
6.1 Tirelires liées

sous-tirelires par activité

consolidation automatique

6.2 Indicateurs de gouvernance

% de contributions validées

nombre de corrections

stabilité des objectifs

➡️ Très peu d’outils proposent ça.

6.3 Mode audit léger

accès lecture seule

export standardisé

timeline figée

7. Ce qui fait que Piggyback est UNIQUE

Si tu devais résumer :

❌ Les autres outils suivent l’argent
✅ Piggyback suit la discipline, la confiance et le temps

8. Mon conseil franc (coach mode)

Ne cherche pas à être :

une app de budget

une app bancaire

une app de paiement

👉 Sois la mémoire fiable des projets d’épargne collectifs.