CREATE TYPE "public"."origine_commande" AS ENUM('helloasso', 'permanence');--> statement-breakpoint
CREATE TYPE "public"."statut_billet" AS ENUM('non_scanne', 'scanne', 'invalide');--> statement-breakpoint
CREATE TABLE "billets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"commande_id" uuid NOT NULL,
	"code" text NOT NULL,
	"tickets_boisson" integer DEFAULT 0 NOT NULL,
	"statut" "statut_billet" DEFAULT 'non_scanne' NOT NULL,
	"scanne_a" timestamp with time zone,
	"cree_a" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "billets_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "commandes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evenement_id" uuid NOT NULL,
	"nom" text NOT NULL,
	"email" text NOT NULL,
	"origine" "origine_commande" NOT NULL,
	"helloasso_payment_id" text,
	"cree_a" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "commandes_helloasso_payment_id_unique" UNIQUE("helloasso_payment_id")
);
--> statement-breakpoint
CREATE TABLE "evenements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom" text NOT NULL,
	"date" date NOT NULL,
	"heure" time NOT NULL,
	"lieu" text NOT NULL,
	"mot_de_passe_hash" text NOT NULL,
	"actif" boolean DEFAULT false NOT NULL,
	"cree_a" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "billets" ADD CONSTRAINT "billets_commande_id_commandes_id_fk" FOREIGN KEY ("commande_id") REFERENCES "public"."commandes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commandes" ADD CONSTRAINT "commandes_evenement_id_evenements_id_fk" FOREIGN KEY ("evenement_id") REFERENCES "public"."evenements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "evenements_un_seul_actif" ON "evenements" USING btree ("actif") WHERE "evenements"."actif" = true;