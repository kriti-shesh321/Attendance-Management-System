import { z } from "zod";

export const createBatchSchema =
    z.object({
        name: z.string().min(2)
    });

export const joinBatchSchema =
    z.object({
        token: z.string(),
    });