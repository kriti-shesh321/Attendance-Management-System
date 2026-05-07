import { Request, Response } from "express";
import crypto from "crypto";

import { prisma } from "../config/prisma";
import { validateInstitution } from "../utils/institution";

import { createBatchSchema, joinBatchSchema } from "../validations/batch.validations";
import { ZodError } from "zod";
import { formatZodError } from "../utils/zor-error";


// @desc Create a new batch
// @route POST /api/v1/batches
// @access Private (Trainer, Institution)
export const createBatch = async (
    req: Request,
    res: Response
) => {
    try {
        const validatedData = createBatchSchema.parse(req.body);

        const existingBatch = await prisma.batch.findUnique({
            where: {
                name: validatedData.name,
            },
        });

        if (existingBatch) {
            return res.status(409).json({ message: "Batch name already exists." });
        }

        const institution =
            await validateInstitution(validatedData.institution_id);

        if (!institution) {
            return res.status(404).json({
                message: "Institution not found.",
            });
        }

        const batch = await prisma.batch.create({
            data: {
                name: validatedData.name,
                institution_id:
                    validatedData.institution_id,
                created_by:
                    req.user!.userId,
            },
        });

        return res.status(201).json(batch);

    } catch (error) {
        console.error(error);

        if (error instanceof ZodError) {
            return res.status(400).json({ message: "Validation failed.", errors: formatZodError(error) });
        }

        return res.status(500).json({ message: "Internal server error." });
    }
};

// @desc Get all batches for the current institution user
// @route GET /api/v1/batches
// @access Private (Institution)
export const getBatches = async (
    req: Request,
    res: Response
) => {
    try {
        const user =
            await prisma.user.findUnique({
                where: {
                    id: req.user?.userId,
                },
            });

        const batches =
            await prisma.batch.findMany({
                where: {
                    institution_id: user?.institution_id!,
                },

                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            role: true,
                        },
                    },

                    institution: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                }
            });

        return res.status(200).json(batches);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

// @desc Generate an invite token for a batch, only trainer who created the batch can generate invite
// @route POST /api/v1/batches/:id/invite
// @access Private (Trainer)
export const generateInvite = async (
    req: Request,
    res: Response
) => {
    try {
        const batchId = String(req.params.id);

        const batch = await prisma.batch.findUnique(
            {
                where: {
                    id: batchId,
                },
            }
        );

        if (!batch) {
            return res.status(404).json({ message: "Batch not found." });
        }

        // trainer own the batch
        if (batch.created_by !== req.user?.userId) {
            return res.status(403).json({ message: "Forbidden." });
        }

        const token = crypto.randomBytes(16).toString("hex");

        const invite =
            await prisma.batchInvite.create(
                {
                    data: {
                        batch_id: batchId,
                        token,
                    },
                }
            );

        return res.status(201).json(
            invite
        );
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message:
                "Internal server error.",
        });
    }
};

// @desc Join a batch using an invite token
// @route POST /api/v1/batches/join
// @access Private (Student)
export const joinBatch = async (
    req: Request,
    res: Response
) => {
    try {
        const validatedData = joinBatchSchema.parse(req.body);

        const invite =
            await prisma.batchInvite.findUnique(
                {
                    where: {
                        token:
                            validatedData.token,
                    },
                }
            );

        if (!invite) {
            return res.status(404).json({ message: "Invite not found." });
        }

        const existingEntry =
            await prisma.batchStudent.findFirst(
                {
                    where: {
                        batch_id: invite.batch_id,
                        student_id: req.user!.userId,
                    },
                }
            );

        if (existingEntry) {
            return res.status(409).json({ message: "Already joined batch." });
        }

        const batchStudent =
            await prisma.batchStudent.create(
                {
                    data: {
                        batch_id: invite.batch_id,
                        student_id: req.user!.userId,
                    },
                }
            );

        return res.status(201).json(batchStudent);

    } catch (error) {
        console.error(error);

        if (error instanceof ZodError) {
            return res.status(400).json({ message: "Validation failed.", errors: formatZodError(error) });
        }

        return res.status(500).json({ message: "Internal server error." });
    }
};

// @desc Get batch summary
// @route GET /api/v1/batches/:id/summary
// @access Private (Institution)
export const getBatchSummary = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.user!.userId;

        const batchId = String(req.params.id);

        const user = await prisma.user.findUnique(
            {
                where: {
                    id: userId,
                },
            }
        );

        const batch = await prisma.batch.findUnique(
            {
                where: {
                    id: batchId,
                },

                include: {
                    creator: {
                        select:
                        {
                            id: true,
                            name: true,
                            role: true,
                        },
                    },

                    sessions:
                        true,

                    students:
                        true,
                },
            }
        );

        if (!batch) {
            return res.status(404).json({ message: "Batch not found.", });
        }

        // Institution ownership check
        if (batch.institution_id !== user?.institution_id) {
            return res.status(403).json({ message: "Forbidden.", });
        }

        const sessionSummaries = await Promise.all(
            batch.sessions.map(async (session) => {
                const attendanceRecords =
                    await prisma.attendance.findMany(
                        {
                            where:
                            {
                                session_id: session.id,
                            },
                        }
                    );

                return {
                    session:
                    {
                        id: session.id,
                        title: session.title,
                        start_time: session.start_time,
                        end_time: session.end_time,
                        created_at: session.created_at,
                    },

                    total_students: batch.students.length,
                    present:
                        attendanceRecords.filter(
                            (attendance) => attendance.status === "present"
                        ).length,

                    absent:
                        attendanceRecords.filter(
                            (attendance) => attendance.status === "absent"
                        ).length,

                    late: attendanceRecords.filter(
                        (attendance) => attendance.status === "late"
                    ).length,
                };
            }
            )
        );

        return res.status(200).json({
            batch_id: batch.id,
            name: batch.name,
            created_at: batch.created_at,
            created_by: batch.creator,
            summary: sessionSummaries,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error.", });
    }
};