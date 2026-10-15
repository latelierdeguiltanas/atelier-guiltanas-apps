# État du projet — 15 octobre 2026

## Périmètre autorisé

Créer le troisième dossier parallèle `hub-configurable/`, sans modifier `ile-aux-tempetes/`, `ile-aux-tempetes-bastide/`, Forge ou les outils de combat. Premier socle pour deux MJ testeurs, COF2, campagnes configurables et indépendantes.

## Implémentation

Compte e-mail/mot de passe Supabase standard ; confirmation par collage du lien reçu pour préserver les redirections Auth existantes. Création de campagne, invitations 256 bits hachées côté serveur (30 jours, révocables), gestion des membres, configuration des outils, fiches manuelles, notes MJ, documents par lien, chroniques, catalogue, messages, retours exportables, sauvegarde et modèle/import dans une nouvelle campagne.

Migration Supabase `hcfg_configurable_beta_1` appliquée au projet `jitatmdbipjkvjstcgdc`. Aucun objet des hubs existants modifié. Clé frontale publique publishable, jamais de clé secrète. RLS sur toutes les tables. Fonctions privilégiées internes avec vérification de `auth.uid()` ; les fonctions publiques sont invoker et réservées aux utilisateurs connectés.

La tentative de service de comptes par pseudonyme/récupération a été refusée par le contrôle automatique d’approbation : changement d’authentification sensible avec accès service-role non explicitement autorisé. Elle n’a pas été appliquée ni déployée. Les fichiers de cette tentative ont été retirés ; l’application utilise l’authentification standard.

## Validation

- Intégration SQL sur le serveur : deux MJ et un PJ synthétiques, chacun dans son rôle ; isolation des campagnes, confidentialité MJ, refus d’écriture dans une autre campagne, propriété des fiches, refus des écritures périmées, retrait de membre, révocation d’invitation et refus des visiteurs anonymes : PASS. Transaction annulée, aucun compte ou campagne de test conservé.
- Six tests Node sur l’échappement HTML, les liens, les autorisations UI, l’import sans identités, le renouvellement de session, les révisions et la vérification des liens : PASS.
- Syntaxe des trois modules JS vérifiée.
- Conseiller sécurité Supabase : aucun avertissement/erreur concernant les objets créés. Information attendue « RLS sans politique » sur `hcfg_private.invites`, table volontairement inaccessible aux clients et utilisée uniquement par les fonctions internes. Les autres informations concernent les tables préexistantes, non modifiées.
- Pas de navigation ni de test visuel par IA, conformément à la méthode de travail de Math. Le parcours téléphone et les e-mails réels restent à vérifier.

## Prochaine validation utilisateur

1. Créer un compte et confirmer l’adresse : si SMTP bloque, configurer un fournisseur d’envoi sans modifier les mécanismes des autres hubs.
2. Créer une campagne et ajouter un personnage.
3. Inviter un second compte : vérifier fiche propre, notes MJ absentes, échanges synchronisés.
4. Faire créer une autre campagne au second MJ : vérifier l’absence de contenus de la première.
5. Recueillir les retours ; planifier la reprise graduelle des fonctions avancées de Bastide, puis les interludes.

Cette bêta est un nouveau socle connecté. Elle ne doit pas être présentée comme un hub Bastide intégral, un produit prêt à vendre ou une infrastructure physiquement séparée.
