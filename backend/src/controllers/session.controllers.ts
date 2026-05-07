import { Request, Response, } from "express";

import { prisma } from "../config/prisma";

import { createSessionSchema } from "../validations/session.validations";
import { formatZodError } from "../utils/zod-error";
import { ZodError } from "zod";

// @desc Create session
// @route POST /api/v1/sessions
// @access Private (Trainer)
export const createSession = async (
    req: Request,
    res: Response
) => {
    try {
        const validatedData = createSessionSchema.parse(req.body);

        const batch = await prisma.batch.findUnique(
            {
                where: {
                    id: validatedData.batch_id,
                },
            }
        );

        if (!batch) {
            return res.status(404).json({ message: "Batch not found." });
        }

        // Only creator trainer can create session
        if (batch.created_by !== req.user?.userId) {
            return res.status(403).json({ message: "Forbidden." });
        }

        const session = await prisma.session.create(
            {
                data: {
                    batch_id: validatedData.batch_id,
                    trainer_id: req.user.userId,
                    title: validatedData.title,
                    date: new Date(validatedData.date),
                    start_time: new Date(validatedData.start_time),
                    end_time: new Date(validatedData.end_time)
                },
            }
        );

        return res.status(201).json(session);

    } catch (error) {
        console.error(error);

        if (error instanceof ZodError) {
            return res.status(400).json({ message: "Validation failed.", errors: formatZodError(error) });
        }

        return res.status(500).json({ message: "Internal server error." });
    }
};

// @desc Get sessions
// @route GET /api/v1/sessions
// @access Private (Trainer, Student)
export const getSessions = async (
    req: Request,
    res: Response
) => {
    try {
        const user = await prisma.user.findUnique(
            {
                where: {
                    id: req.user?.userId,
                },
            }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found.", });
        }

        let sessions: any[] = [];

        // Trainer Sessions
        if (user.role === "trainer") {

            sessions = await prisma.session.findMany(
                {
                    where: {
                        trainer_id: user.id,
                    },

                    include: {
                        batch: {
                            select:
                            {
                                id: true,
                                name: true,
                            },
                        },

                        trainer:
                        {
                            select:
                            {
                                id: true,
                                name: true,
                            },
                        },
                    },

                    orderBy: {
                        created_at: "desc",
                    },
                }
            );
        }

        // Student Sessions
        else if (user.role === "student") {
            const batchStudents =
                await prisma.batchStudent.findMany(
                    {
                        where: {
                            student_id: user.id,
                        },
                    }
                );

            const batchIds = batchStudents.map(
                (batchStudent) => batchStudent.batch_id
            );

            sessions = await prisma.session.findMany(
                {
                    where: {
                        batch_id:
                        {
                            in: batchIds,
                        },
                    },

                    include: {
                        batch: {
                            select:
                            {
                                id: true,
                                name: true,
                            },
                        },

                        trainer:
                        {
                            select:
                            {
                                id: true,
                                name: true,
                            },
                        },
                    },

                    orderBy: {
                        created_at: "desc",
                    },
                }
            );
        }

        return res.status(200).json(sessions);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error.", });
    }
};

// @desc Get session attendance summary
// @route GET /api/v1/sessions/:id/attendance
// @access Private (Trainer)
export const getSessionAttendance = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.user!.userId;

        const sessionId = String(req.params.id);

        const session = await prisma.session.findUnique(
            {
                where: {
                    id: sessionId,
                },

                include: {
                    batch: {
                        select:
                        {
                            id: true,
                            name: true,
                        },
                    },

                    trainer:
                    {
                        select:
                        {
                            id: true,
                            name: true,
                        },
                    },
                },
            }
        );

        if (!session) {
            return res.status(404).json({ message: "Session not found.", });
        }

        // Only trainer owner
        if (
            session.trainer_id !== userId
        ) {
            return res.status(403).json({ message: "Forbidden.", });
        }

        const attendanceRecords = await prisma.attendance.findMany(
            {
                where: {
                    session_id: sessionId,
                },
            }
        );

        return res.status(200).json({
            id: session.id,
            title: session.title,
            batch: session.batch,
            trainer: session.trainer,
            date: session.date,
            created_at: session.created_at,
            attendance: {
                total: attendanceRecords.length,

                present:
                    attendanceRecords.filter(
                        (attendance) => attendance.status == "present"
                    ).length,

                absent:
                    attendanceRecords.filter(
                        (attendance) => attendance.status === "absent"
                    ).length,

                late: attendanceRecords.filter(
                    (attendance) => attendance.status === "late"
                ).length,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error.", });
    }
};