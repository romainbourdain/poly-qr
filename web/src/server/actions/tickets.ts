"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import {
  creerCommandePermanence,
  invaliderBillet,
  listerBillets,
  obtenirStatsBillets,
  reactiverBillet,
} from "@/server/services/tickets";
import type { StatutFilter } from "@/shared/lib/search-params";
import {
  type PermanenceCommandeInput,
  permanenceCommandeSchema,
} from "@/shared/validators/permanence";

export async function creerPermanenceAction(input: PermanenceCommandeInput) {
  const parsed = permanenceCommandeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Formulaire invalide." };
  }

  try {
    const { commande, billets } = await creerCommandePermanence(
      db,
      parsed.data,
    );
    revalidatePath("/admin/billets");
    return { success: true as const, commande, billets };
  } catch {
    return {
      success: false as const,
      error: "Aucun événement actif : impossible de créer le billet.",
    };
  }
}

export async function invaliderBilletAction(billetId: string): Promise<void> {
  await invaliderBillet(db, billetId);
  revalidatePath("/admin/billets");
}

export async function reactiverBilletAction(billetId: string): Promise<void> {
  await reactiverBillet(db, billetId);
  revalidatePath("/admin/billets");
}

export async function listerBilletsAction(filtres: {
  q: string;
  statut: StatutFilter;
}) {
  return listerBillets(db, filtres);
}

export async function obtenirStatsBilletsAction() {
  return obtenirStatsBillets(db);
}
