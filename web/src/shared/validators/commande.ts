import { z } from "zod";

export const commandeIdSchema = z.string().uuid();
