import { z } from "zod";

export const commandeIdSchema = z.string().uuid();

export const billetIdSchema = z.string().uuid();

export const scanCodeSchema = z.string().min(1);

export const evenementIdSchema = z.string().uuid();
