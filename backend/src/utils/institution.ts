import { prisma } from "../config/prisma";

export const validateInstitution =
    async (institutionId: string) => {
        const institution =
            await prisma.institution.findUnique(
                {
                    where: {
                        id: institutionId,
                    },
                }
            );

        return institution;
    };