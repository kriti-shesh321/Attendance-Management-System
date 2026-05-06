import {
    Request,
    Response,
} from "express";

import { prisma } from "../config/prisma";

// @desc Institution summaries
// @route GET /api/v1/summary/institutions
// @access Private (Programme Manager)
export const getInstitutionSummaries = async (
    req: Request,
    res: Response
) => {
    try {
        const institutions = await prisma.institution.findMany(
            {
                include: {
                    batches: {
                        include:
                        {
                            sessions: true,

                            students: true,
                        },
                    },
                },
            }
        );

        const summaries = await Promise.all(
            institutions.map(async (institution) => {
                const batchIds = institution.batches.map(
                    (batch) => batch.id
                );

                const sessions = await prisma.session.findMany(
                    {
                        where:
                        {
                            batch_id:
                            {
                                in: batchIds,
                            },
                        },
                    }
                );

                const sessionIds = sessions.map(
                    (session) => session.id
                );

                const attendance =
                    await prisma.attendance.findMany(
                        {
                            where:
                            {
                                session_id:
                                {
                                    in: sessionIds,
                                },
                            },
                        }
                    );

                return {
                    institution:
                    {
                        id: institution.id,
                        name: institution.name,
                        region: institution.region,
                    },

                    metrics:
                    {
                        total_batches: institution.batches.length,

                        total_students: institution.batches.reduce(
                            (acc, batch) => acc + batch.students.length,
                            0
                        ),

                        total_sessions: sessions.length,

                        attendance:
                        {
                            present: attendance.filter(
                                (a) => a.status === "present")
                                .length,

                            absent:
                                attendance.filter(
                                    (a) => a.status === "absent")
                                    .length,

                            late: attendance.filter(
                                (a) => a.status === "late")
                                .length,
                        },
                    },
                };
            })
        );

        return res.status(200).json(summaries);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error.", });
    }
};

// @desc Programme summary
// @route GET /api/v1/summary/programme
// @access Private (Programme Manager, Monitoring Officer)
export const getProgrammeSummary = async (
    req: Request,
    res: Response
) => {
    try {
        const [
            totalInstitutions,
            totalBatches,
            totalStudents,
            totalSessions,
            attendance,
        ] = await Promise.all([
            prisma.institution.count(),

            prisma.batch.count(),

            prisma.user.count({
                where: {
                    role: "student",
                },
            }),

            prisma.session.count(),

            prisma.attendance.findMany(),
        ]);

        return res.status(200).json({
            total_institutions:
                totalInstitutions,

            total_batches:
                totalBatches,

            total_students:
                totalStudents,

            total_sessions:
                totalSessions,

            attendance: {
                present:
                    attendance.filter(
                        (a) => a.status === "present"
                    ).length,

                absent:
                    attendance.filter(
                        (a) => a.status === "absent"
                    ).length,

                late: attendance.filter(
                    (a) => a.status === "late"
                ).length,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error.", });
    }
};