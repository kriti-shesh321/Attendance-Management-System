import { z } from "zod";

export const createBatchSchema =
    z.object({
        name: z.string().min(2),
        institution_id: z.uuid(),
    });

export const joinBatchSchema =
    z.object({
        token: z.string(),
    });