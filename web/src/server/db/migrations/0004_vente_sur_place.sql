ALTER TYPE "public"."origine_commande" ADD VALUE 'sur_place';--> statement-breakpoint
ALTER TABLE "commandes" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "evenements" ADD COLUMN "prix_billet_sur_place_centimes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE "evenements" SET "prix_billet_sur_place_centimes" = "prix_billet_centimes";