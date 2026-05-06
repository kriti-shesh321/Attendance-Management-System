import { z } from "zod";

export const createSessionSchema =
    z.object({
        batch_id: z.uuid(),
        title: z.string().min(2),
        date: z.string(),
        start_time: z.string(),
        end_time: z.string(),
    });