-- Lydia n'est plus proposé : les anciennes commandes passent en « autre ».
UPDATE "commandes" SET "moyen_paiement" = 'autre' WHERE "moyen_paiement" = 'lydia';--> statement-breakpoint
ALTER TABLE "commandes" ALTER COLUMN "moyen_paiement" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."moyen_paiement";--> statement-breakpoint
CREATE TYPE "public"."moyen_paiement" AS ENUM('virement', 'hello_asso', 'especes', 'sumup', 'autre');--> statement-breakpoint
ALTER TABLE "commandes" ALTER COLUMN "moyen_paiement" SET DATA TYPE "public"."moyen_paiement" USING "moyen_paiement"::"public"."moyen_paiement";--> statement-breakpoint
-- L'événement est dénormalisé sur le billet pour les clés étrangères composites.
ALTER TABLE "commandes" ADD CONSTRAINT "commandes_id_evenement_unique" UNIQUE("id","evenement_id");--> statement-breakpoint
ALTER TABLE "billets" ADD COLUMN "evenement_id" uuid;--> statement-breakpoint
UPDATE "billets" SET "evenement_id" = "commandes"."evenement_id" FROM "commandes" WHERE "commandes"."id" = "billets"."commande_id";--> statement-breakpoint
ALTER TABLE "billets" ALTER COLUMN "evenement_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "billets" ADD CONSTRAINT "billets_id_evenement_unique" UNIQUE("id","evenement_id");--> statement-breakpoint
ALTER TABLE "billets" DROP CONSTRAINT "billets_commande_id_commandes_id_fk";--> statement-breakpoint
ALTER TABLE "billets" ADD CONSTRAINT "billets_commande_evenement_fk" FOREIGN KEY ("commande_id","evenement_id") REFERENCES "public"."commandes"("id","evenement_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE TABLE "lignes_boisson" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evenement_id" uuid NOT NULL,
	"commande_id" uuid NOT NULL,
	"billet_id" uuid NOT NULL,
	"quantite" integer NOT NULL,
	CONSTRAINT "lignes_boisson_quantite_positive" CHECK ("lignes_boisson"."quantite" > 0)
);--> statement-breakpoint
ALTER TABLE "lignes_boisson" ADD CONSTRAINT "lignes_boisson_commande_evenement_fk" FOREIGN KEY ("commande_id","evenement_id") REFERENCES "public"."commandes"("id","evenement_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lignes_boisson" ADD CONSTRAINT "lignes_boisson_billet_evenement_fk" FOREIGN KEY ("billet_id","evenement_id") REFERENCES "public"."billets"("id","evenement_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- Les tickets déjà saisis deviennent une ligne rattachée à la commande du billet.
INSERT INTO "lignes_boisson" ("evenement_id", "commande_id", "billet_id", "quantite") SELECT "evenement_id", "commande_id", "id", "tickets_boisson" FROM "billets" WHERE "tickets_boisson" > 0;--> statement-breakpoint
ALTER TABLE "billets" DROP COLUMN "tickets_boisson";
