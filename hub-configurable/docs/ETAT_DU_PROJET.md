# État du projet — 15 octobre 2026 — bêta 2

## Décision utilisateur faisant autorité

Aucune inscription, aucun e-mail, aucun mot de passe. Les MJ ouvrent le lien commun, créent leur espace local puis peuvent retrouver le même espace sur un autre appareil grâce à un lien MJ et/ou une sauvegarde. Chaque MJ importe/crée ses personnages et génère lui-même un lien individuel à envoyer au joueur. Campagne et one-shot sont distingués par un réglage ; outils identiques, configuration indépendante.

Le remplacement de l’accès par comptes est explicitement demandé le 15/10 à 09:46 (Europe/Paris). Il n’utilise ni comptes cachés, ni privilèges Supabase Auth, ni Edge Function service-role. L’ancien refus automatique de service de comptes pseudonymes concernait une autre conception ; cette conception n’a jamais été installée.

## Implémentation

- Création immédiate dans IndexedDB, sans requête d’authentification ; identifiant d’espace UUID et secret MJ 256 bits produits par le navigateur.
- Synchronisation via `public.hcfg_link_api`, wrapper invoker vers la fonction interne `hcfg_private.link_api`. Tables privées `link_spaces`, `link_keys`, `link_operations`, RLS activée et droits directs révoqués. Autorisation à chaque opération par hachage du lien. Fonctions avec search_path vide.
- Liens MJ et PJ distincts ; un lien PJ est limité à sa fiche et aux contenus partagés. Les autres fiches et les notes MJ sont filtrées avant transmission. Révocation/renouvellement par le MJ.
- Journaux, documents par URL, catalogue d’objets, échanges et retours de test. Vue simplifiée/complète.
- File d’attente locale persistante, révisions par fiche, opérations idempotentes et résolution explicite des conflits avec export préalable.
- Copie locale par identité de lien : un cache PJ et un cache MJ ne sont pas mélangés, même pour la même aventure sur un appareil.
- PDF-lib local : champs AcroForm importés, modifiables, synchronisés et réexportés ; PDF original conservé. PDF figé : consultation et saisie manuelle. Fiche JSON export/import ; support du format générique G1. Aucun moteur automatique de règles ni OCR.
- Sauvegarde complète contenant les liens ; restauration du même espace. Modèles sans accès ni joueurs, importés dans un nouvel espace.
- Service worker limité au nouveau dossier pour rouvrir l’application hors ligne après préparation initiale en ligne.

## Validation

Tests SQL en rôle anon, sans utilisateur Auth, dans une transaction annulée : création campagne et one-shot, lien MJ, lien par personnage, accès à l’espace correct, secrets et autres fiches absents de la réponse PJ, modification de sa fiche par PJ, refus des modifications d’un autre personnage ou des réglages MJ, rejet d’une écriture périmée, idempotence après réémission et révocation de lien : PASS.

Tests Node : espaces indépendants sans requête Auth, récupération des liens, conservation hors ligne, réémission du même op_id, conflits sans perte, caches MJ/PJ séparés, échappement des textes/liens, import/export PDF à champs et conservation du PDF figé : PASS.

Conseiller sécurité : uniquement informations RLS sans politique pour les nouvelles tables privées, volontairement fermées aux clients directs et consultées par les fonctions vérifiant les liens. Aucun changement apporté aux objets Bastide/Nespresso.

Aucune navigation ni test visuel par IA. Le rendu sur téléphone et l’ergonomie des fiches réelles restent à valider par Math et les deux MJ. Ne pas annoncer toutes les fonctions Bastide comme déjà reprises : combat avancé, soundboard, boutique et interludes restent hors de cette bêta.

## Point de reprise

Dossier `hub-configurable/`, même adresse publique, nouvelle interface sans inscription. Relire ce fichier et README avant toute reprise. Tester avec deux MJ : chacun crée une aventure différente, importe un personnage, ouvre son lien MJ sur un autre appareil puis transmet le lien PJ à son joueur.

## Suivi bêta — reprise 15 octobre 2026
Interface privée ajoutée dans suivi/. Événements anonymisés, conservation 90 jours, accès par clé privée. Les fonctions serveur sont installées et refusent une clé invalide ; les tables ne sont pas lisibles directement par anon. Tests Node existants : 9/9. Autorisation explicite de Math reçue le 15/10 à 10:59 (Europe/Paris) pour la publication et l’accès administrateur. Clé administrateur activée ; lecture du rapport avec cette clé vérifiée côté serveur. La clé privée n’est jamais publiée dans le dépôt. Aucun changement Bastide/Nespresso.

## 16 octobre 2026 — Gestion des PNJ
Rubrique PNJ distincte des objets et PJ : création, modification, suppression, export JSON et inclusion dans sauvegardes/modèles. Champs rôle, lieu, apparence, personnalité/voix, motivation, situation et histoire. Privé MJ par défaut, partage volontaire de la fiche entière ; secrets à conserver dans Notes MJ. Stockage compatible avec le serveur existant : item avec data.recordType=npc, sans lien joueur ni modification du schéma. Aucun changement des hubs existants.

## 16 octobre 2026 — Outils MJ de séance
Accès au Soundboard_final générique (aucun changement à son dépôt), accès à gestionnaire-combat-cof2/multi/. Cette édition réutilise le gestionnaire existant et ses 20 profils ; aucun script de liaison Bastide, aucun PJ préchargé. Campagnes/one-shots locaux indépendants par espace du hub, 19 rencontres Île aux Tempêtes activées uniquement dans la campagne pack facultative. Création/modification de monstres et de compositions ; import des valeurs PJ du cache local du hub sur action explicite. Exports complets de toutes les campagnes de cet espace et imports en copies sans écrasement. Pas de synchronisation distante des préparations de combat ni des sons ; transfert via sauvegardes. Les anciennes URL, leurs fichiers et leur stockage sont conservés.
