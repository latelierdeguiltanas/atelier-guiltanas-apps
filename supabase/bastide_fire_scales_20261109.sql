-- Créations maison COF2. Seul le catalogue MJ est écrit.
-- Aucun envoi, événement ou inventaire PJ.
begin;
insert into public.bastide_scenario_items
 (id,title,kind,category,description,player_description,mj_notes,mechanical_base,equipment,active,sort_order)
select id,title,'object',category,description,'',
 'Création maison en écailles de serpent de feu. Destinataire envisagé : ' || recipient || '. Aucune attribution automatique. Usages suivis manuellement par le MJ ; équiper/ranger ne recharge pas les usages. Aucun bonus permanent hors protection ordinaire explicitement indiquée.',
 mechanical_base,jsonb_build_object('slot',slot,'effect',description,'bonuses',bonuses),true,sort_order
from (values
 ('bastide-fire-scales-harnais','Harnais des braises','Équipement','Faelar','Harnais de compagnon — aucune armure','accessory_1','{}'::jsonb,250,
 'Porté par le loup : une fois par combat, après détermination des DM d’une source, réduire de 2 les DM subis par le loup, minimum 0. Décision avant retrait des PV. Suivi manuel MJ ; aucune réduction permanente ni modification de la DEF. Sur la fiche de Faelar, équiper représente le harnais porté par son loup, sans bonus pour Faelar.'),
 ('bastide-fire-scales-refuge','Bouclier du Refuge','Protection','Wilfried','Petit bouclier','shield','{"shieldDef":1}'::jsonb,251,
 'Petit bouclier : protection ordinaire DEF +1 au porteur, remplace son bouclier. Refuge : une fois par combat, porteur conscient et bouclier équipé, intervention gratuite hors tour après désignation d’un allié adjacent et avant le jet d’attaque : DEF +2 pour cet allié contre cette seule attaque. Sans déplacement ni attaque supplémentaire. Retirer aussitôt ; suivi manuel MJ.'),
 ('bastide-fire-scales-de','Dé à coudre des doigts froids','Équipement','Prépôtante','Accessoire de précision','accessory_1','{}'::jsonb,252,
 'Équipé : une fois par scène, annoncer avant le jet un bonus de 2 à un test de manipulation manuelle précise, par exemple couture ou petit mécanisme, avec accord du MJ. Ni attaque ni bonus général d’AGI. Ajouter uniquement à ce jet, manuellement. Nouvelle scène décidée par le MJ ; ranger puis équiper ne recharge pas.'),
 ('bastide-fire-scales-bague','Bague du dernier geste','Équipement','Scanlan','Bague utilitaire','accessory_1','{}'::jsonb,253,
 'Équipée : une fois par combat, immédiatement après une attaque réussie pendant son tour, choisir soit 2 DM supplémentaires sur cette attaque, sans multiplication critique, soit déplacer de 1 m au plus un objet libre de 100 g maximum situé à 1 m ou moins. Aucun objet porté, tenu ou fixé ; aucun jet, attaque, activation ou dégât par ce déplacement. Choix exclusif, suivi manuel MJ.'),
 ('bastide-fire-scales-pince','Pince de précision à chaleur douce','Équipement','Vive l’Âme','Outil de précision','main_hand','{}'::jsonb,254,
 'Tenue en main : chaleur douce pour artisanat, petites réparations et mécanismes délicats. Outil adapté sous contrôle du MJ ; aucun bonus chiffré, réparation automatique ou action supplémentaire. Ne fond pas le métal et ne produit aucun dégât de feu. Les tests et durées ordinaires restent applicables.'),
 ('bastide-fire-scales-epingle','Épingle chauffe-aile','Équipement','Zéphéline','Accessoire de confort','accessory_1','{}'::jsonb,255,
 'Équipée : diffuse une chaleur douce pour le confort des ailes et le séchage léger. Aucun bonus chiffré, résistance au froid ou au feu, soin, amélioration du vol ou protection contre les intempéries dangereuses. Effet utilitaire apprécié par le MJ.')
) as v(id,title,category,recipient,mechanical_base,slot,bonuses,sort_order,description)
on conflict(id) do update set title=excluded.title,kind=excluded.kind,category=excluded.category,
 description=excluded.description,player_description=excluded.player_description,mj_notes=excluded.mj_notes,
 mechanical_base=excluded.mechanical_base,equipment=excluded.equipment,active=excluded.active,
 sort_order=excluded.sort_order,updated_at=now()
where (bastide_scenario_items.title,bastide_scenario_items.kind,bastide_scenario_items.category,
 bastide_scenario_items.description,bastide_scenario_items.player_description,bastide_scenario_items.mj_notes,
 bastide_scenario_items.mechanical_base,bastide_scenario_items.equipment,bastide_scenario_items.active,bastide_scenario_items.sort_order)
 is distinct from (excluded.title,excluded.kind,excluded.category,excluded.description,excluded.player_description,
 excluded.mj_notes,excluded.mechanical_base,excluded.equipment,excluded.active,excluded.sort_order);
commit;

select id,title,equipment,active from public.bastide_scenario_items
where id like 'bastide-fire-scales-%' order by sort_order;
