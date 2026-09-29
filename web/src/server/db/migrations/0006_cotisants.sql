ALTER TABLE "billets" ADD COLUMN "cotisant" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "evenements" ADD COLUMN "prix_billet_cotisant_centimes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "evenements" ADD COLUMN "prix_billet_sur_place_cotisant_centimes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
-- Les événements existants n'ont qu'un tarif : les cotisants le gardent tel quel.
UPDATE "evenements" SET "prix_billet_cotisant_centimes" = "prix_billet_centimes", "prix_billet_sur_place_cotisant_centimes" = "prix_billet_sur_place_centimes";