ALTER TABLE "billets" ADD COLUMN "nom" text;--> statement-breakpoint
ALTER TABLE "billets" ADD COLUMN "prenom" text;--> statement-breakpoint
-- Billets existants : nom de l'acheteur, prénom = premier mot, nom = le reste
-- (ou tout le nom s'il n'y a qu'un mot). À corriger à la main si besoin.
UPDATE "billets" SET
  "prenom" = split_part("commandes"."nom", ' ', 1),
  "nom" = COALESCE(
    NULLIF(trim(substr("commandes"."nom", length(split_part("commandes"."nom", ' ', 1)) + 1)), ''),
    "commandes"."nom"
  )
FROM "commandes" WHERE "commandes"."id" = "billets"."commande_id";--> statement-breakpoint
ALTER TABLE "billets" ALTER COLUMN "nom" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "billets" ALTER COLUMN "prenom" SET NOT NULL;
