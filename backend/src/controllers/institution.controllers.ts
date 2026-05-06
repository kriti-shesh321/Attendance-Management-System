import { Request, Response } from "express";

import { prisma } from "../config/prisma";

export const getInstitutions = async (
    req: Request,
    res: Response
) => {
    try {
        const institutions =
            await prisma.institution.findMany({
                orderBy: {
                    created_at: "asc",
                },
            });

        return res.status(200).json(
            institutions
        );
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message:
                "Internal server error.",
        });
    }
};