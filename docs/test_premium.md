Étape 1 – Connexion et premier groupe
Aller sur la landing (page d’accueil).
Cliquer sur « Lancer l’application » (ou équivalent) pour aller sur le tableau de bord (/app).
Ouvrir les Paramètres (lien ou bouton vers /app/settings).
Dans la section Synchronisation, cliquer sur « Connexion » / « Créer un compte ».
Se connecter (ou créer le compte).
Vérifier le message du type « Connecté en tant que … » et que la section Plan actuel affiche « Gratuit » (ou « Free »).
À ce stade, ton utilisateur a un groupe et un abonnement free (créés automatiquement à la première connexion/sync).
Étape 2 – Limite « 1 objectif » (plan gratuit)
Rester (ou revenir) sur le tableau de bord (/app).
Créer un premier objectif (bouton du type « Créer un objectif ») : nom, montant, optionnellement deadline → Enregistrer.
→ L’objectif doit apparaître.
Cliquer à nouveau sur « Créer un objectif » (ou équivalent).
Vérifier qu’une limite s’affiche (message du type « Un seul objectif sur l’offre gratuite » / « FREE_LIMIT_ONE_GOAL ») et qu’on ne peut pas créer un deuxième objectif.
Si la limite s’affiche et bloque bien la création, le comportement gratuit est bon.
Étape 3 – Passer en Premium (simulation)
Aller dans Paramètres (/app/settings).
Dans Plan actuel, vérifier que c’est toujours Gratuit.
Cliquer sur « Passer en Premium » (ou « Upgrade to Premium »).
Dans la modale, cliquer sur « Simuler l’upgrade » (ou « Simulate upgrade »).
Attendre la fin du chargement (sync après upgrade).
Vérifier :
un toast du type « Vous êtes maintenant Premium »,
dans Plan actuel, l’affichage passe à Premium.
Phase 1 (cœur Premium + upgrade) est validée.
Étape 4 – Objectifs illimités (Premium)
Aller sur le tableau de bord (/app).
Créer un deuxième objectif, puis un troisième si tu veux.
Vérifier qu’ils s’affichent tous et qu’aucune limite ne bloque la création.
Comportement illimité Premium OK.
Étape 5 – Rôle et membres (Premium)
Dans Paramètres, faire défiler jusqu’à la section Plan actuel.
Vérifier qu’apparaissent :
« Votre rôle » : Administrateur (ou Admin),
« Membres » : au moins une ligne (toi, en admin).
(Optionnel) Cliquer sur « Inviter un membre » :
Rôle : Contributeur ou Observateur,
« Generate link » (ou « Générer le lien »),
copier le lien affiché (du type …/app/join?token=…).
Ouvrir ce lien dans une fenêtre de navigation privée (ou un autre navigateur).
Se connecter avec un autre compte (ou en créer un).
Vérifier que la page confirme le type « You joined the group » puis redirige vers le tableau de bord.
Revenir au premier compte → Paramètres : dans Membres, vérifier qu’il y a maintenant 2 membres (toi + l’autre).
Phase 2 (rôles / invitation) est validée.
Étape 6 – Observateur en lecture seule
Avec le deuxième compte (invité en Observateur), aller sur le tableau de bord.
Ouvrir un objectif (détail).
Vérifier :
pas de bouton Supprimer (icône poubelle),
pas de boutons « Ajouter des économies » / « Retirer »,
pas de bouton « Clôturer le projet » (si tu l’as déjà vu en admin).
L’historique et la progression doivent être visibles, mais tout en lecture seule.
Comportement observateur OK.
Étape 7 – Journal d’événements (Premium)
Repasser sur le premier compte (admin).
Ouvrir un objectif qui a déjà des mouvements (ou en ajouter un dépôt/retrait).
Faire défiler la page : une section « Journal d’événements » (ou « Event log ») doit apparaître.
Vérifier qu’elle liste des événements (ex. Objectif créé, Transaction ajoutée, Objectif modifié) avec une date/heure.
Phase 3 (journal) validée.
Étape 8 – Export PDF / Excel (Premium)
Toujours sur la page de détail d’un objectif (compte admin, Premium).
Vérifier la présence des boutons « Exporter en PDF » et « Exporter en Excel ».
Cliquer sur « Exporter en PDF » : un fichier PDF doit se télécharger (nom du type Nom_objectif_2025-xx-xx.pdf).
Ouvrir le PDF : objectif, montants, liste des transactions (et date de génération).
Cliquer sur 「 Exporter en Excel 」 : un fichier .xlsx doit se télécharger.
Ouvrir le fichier : objectif, montants, onglet avec les transactions.
Phase 5 (export) validée.
Étape 9 – Partager en lecture seule (Premium, admin)
Sur la page de détail du même objectif, cliquer sur 「 Partager (lien lecture seule) 」 (ou 「 Share (read-only link) 」).
Dans la modale, cliquer sur 「 Créer un lien de partage 」 / 「 Generate link 」.
Un lien du type https://.../share/xxxxx doit s’afficher.
Cliquer sur 「 Copy 」 (ou « Copier ») pour copier le lien.
Ouvrir ce lien dans une fenêtre de navigation privée (sans être connecté, ou avec un autre compte).
Vérifier :
une page lecture seule : objectif, progression, historique des transactions,
aucun bouton d’édition, d’ajout de transaction ou de suppression.
Phase 6 (partage) validée.
Étape 10 – Clôture et archivage (Premium)
Sur la page de détail d’un objectif (compte admin), faire défiler jusqu’au bouton 「 Clôturer le projet 」 (souvent en petit lien sous les boutons d’action).
Cliquer dessus, puis confirmer dans la modale.
Vérifier :
un bandeau du type 「 Projet clôturé le [date] 」,
disparition du bouton Supprimer, des boutons 「 Ajouter des économies 」 / 「 Retirer 」 et du bouton 「 Clôturer le projet 」.
Rafraîchir la page (ou resynchroniser) : le bandeau « Projet clôturé » doit rester, l’objectif reste en lecture seule.
Phase 4 (clôture) validée.
Récap de ce que tu auras testé
Phase	Ce qui est testé
1	Plan gratuit depuis le cloud, limite 1 objectif, upgrade simulé, plan Premium affiché
2	Rôle admin, liste des membres, invitation, acceptation, observateur en lecture seule
3	Journal d’événements visible sur un objectif Premium
4	Clôture d’un objectif puis tout en lecture seule
5	Export PDF et Excel téléchargés et contenant les bonnes infos
6	Lien de partage ouvrable en lecture seule (même sans être connecté)
7	Modale « Passer en Premium » avec simulation d’upgrade
Si une étape ne se comporte pas comme décrit, noter quelle étape, quelle action et ce que tu vois (message d’erreur, rien qui change, etc.) pour cibler le correctif.