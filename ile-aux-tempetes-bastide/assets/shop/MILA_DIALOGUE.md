# Vie et dialogue embarqué de Mila

La demande de Math est un dialogue écrit, naturel dans son domaine, sans modèle IA et sans service externe. Il n'y a pas d'activation OpenAI à demander : cette piste est abandonnée à sa demande.

## Principe

La question détermine d'abord le sujet, puis le type de réponse : identité, travail, lieu habituel, raison, relation, opinion, goûts, quotidien, blessure, crainte, projet, prix, quantité ou effet d'un produit. Une anecdote est un complément facultatif et pertinent ; elle n'est jamais un substitut automatique à la réponse. Les relances gardent le sujet précédent ; si le moteur ne comprend pas, Mila demande de préciser.

Le moteur est le même JavaScript embarqué dans la page et dans le serveur du hub pour enregistrer les échanges. Aucun appel de modèle, aucune clé d'IA, aucun abonnement ou service IA externe. L'historique des PJ reste synchronisé par le hub comme les autres données. Dans l'aperçu MJ, les essais tournent uniquement dans la page, sans écrire chez le PJ.

## Portrait de vie

Mila, appelée Myla dans le module, est une kobold ailée bricoleuse et alchimiste. Elle vit au Repos du Dragon, où elle tient le comptoir et travaille dans sa cellule-atelier. Blessée aux ailes par des striges, elle a été aidée par Runara pendant son rétablissement. Elle contribue à la communauté dirigée par Runara ; aucun contrat de travail salarié n'est inventé.

Le quotidien ajouté pour cette campagne : vérification des étiquettes et des flacons, rangement, matériel des voyageurs, préparation et bricolages, moments calmes pour les tâches minutieuses, repas chaud après le rangement. Elle aime comprendre et améliorer, travaille volontiers avec Laylee, n'aime ni les fioles sans étiquette ni la précipitation, et cherche surtout à fabriquer des choses utiles. Les boîtes mal rangées, vis débattues et bouchons coincés fournissent de petites histoires de vie.

## Liens au sanctuaire

- Runara : reconnaissance pour son aide, confiance, goût pour son écoute et son calme.
- Laylee : complice d'atelier et aide aux constructions ; elles discutent et essaient ensemble.
- Aga : respect de sa fermeté, qui protège le calme et l'ordre de l'atelier.
- Blepp : Mila aime ses récits, mais vérifie ses bouchons plutôt que compter sur sa chance.
- Frub : affection pour sa curiosité, avec des tâches précises pour canaliser ses questions.
- Kilnip : compagnie pendant le rangement, longues conversations, attention à sa fatigue.
- Mumpo : amusement et prudence face à ses initiatives audacieuses.
- Rix : jeux de mots auxquels Mila prétend résister, tout en participant.
- Zark : réparties autour des outils et des bouchons ; sa grossièreté ne vaut pas une sanction économique automatique.
- Tarak : échanges sur les plantes et préparations, respect pour sa patience.
- Varnoth : respect du travail solide, complémentarité entre petites pièces et constructions.

Les traits et fonctions déjà établis viennent des fiches publiques du hub. Les relations quotidiennes et anecdotes ajoutées sont des créations de campagne sans enjeu de scénario. Elles ne révèlent aucun secret, nouvelle quête, trésor ou pouvoir.

L'origine familiale précise, l'âge exact et un éventuel partenaire amoureux ne sont pas définis par défaut. Mila traite ces questions comme privées ; elle parle des kobolds du sanctuaire comme de sa famille de tous les jours. Cela évite de fixer un frère ou un conjoint au hasard alors que Math indiquait ne plus se souvenir des liens existants. Ces champs pourront être écrits explicitement quand ils seront arrêtés.

## Édition et limites

Source unique de la vie et des répliques : `supabase/functions/bastide-inventory/mila-life.js`. Logique de questions : `mila-engine.js`, à côté. Les deux fichiers sont servis directement à la page et inclus dans le paquet de la fonction serveur ; ils ne contiennent aucun secret de campagne ou clé.

Le catalogue fournit les noms, prix catalogue, stocks et descriptions : le moteur ne crée pas d'effet ni de tarif. Les demandes d'achats, de dons, de négociation et de vol renvoient aux actions existantes ; une phrase ne modifie jamais les biens. Le prix de revente personnalisé est laissé à la vue « Vendre mes objets » plutôt que deviné. Les PNJ masqués ne sont pas présentés tant que leur fiche n'a pas été rendue visible.

Ce moteur n'est pas une compréhension universelle du français. Il couvre les sujets écrits, des synonymes, les noms usuels et quelques variantes de transcription, puis demande une précision pour une question ambiguë ou hors domaine. Les tests contiennent de vraies questions et relances, et peuvent être enrichis à partir des formulations des joueurs.


## Débrief après session

Depuis la boutique MJ, ouvrir « Dialogues et débrief » (`mj/dialogues/`). Ce suivi commence avec Mila ; il ne prétend pas enregistrer les conversations orales autour de la table ni des PNJ qui n’ont pas encore de moteur.

1. Choisir les dates de session et relire l’historique, pour tous les PJ ou un seul. L’historique conserve les échanges originaux ; affichage par pages de 40, sans suppression des lignes plus anciennes.
2. Marquer les réponses utiles, à retravailler ou débriefées. Ajouter une note et, si utile, une proposition de réponse. Ces annotations restent privées MJ et ne changent pas la conversation d’origine.
3. Dans les notes par PJ, écrire les préférences de dialogue, attentes, liens avec les PNJ et faits de campagne à garder cohérents. Il s’agit d’observations du MJ, pas d’une analyse automatique de personnalité. Les dialogues joués oralement peuvent être résumés ici.
4. Préparer le débrief de session : statistiques sur tous les échanges de la période, cinq sujets les plus fréquents par PJ, au plus trente exemples signalés ou non compris pour le groupe, et notes MJ. Ajouter les décisions, puis enregistrer dans le hub. Les trente derniers débriefs sont proposés dans la liste, les plus anciens restent stockés.
5. Reprendre ce débrief avec Math. « Copier pour notre échange » prépare le texte pour son collage volontaire ; le hub ne l’envoie à aucun autre service. Les corrections acceptées seront écrites dans la vie/répliques/moteur, avec les nouvelles formulations ajoutées aux tests. Aucune modification ou apprentissage automatique ne se fait par l’enregistrement d’une note.

Les profils, annotations et débriefs sont accessibles au MJ seulement. Le PJ voit son historique de conversation normal, sans les notes MJ. Aucun nouveau service externe ; le stockage reste celui du hub.
