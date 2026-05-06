import { z } from "zod";
import { Role } from "@prisma/client";

export const registerSchema = z.object({
    name: z.string().min(2),
    email: z.email(),
    password: z.string().min(6),
    role: z.enum([
        Role.student,
        Role.trainer,
        Role.institution,
        Role.programme_manager,
        Role.monitoring_officer
    ]),
    institution_id: z.uuid().optional(),
});

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
});