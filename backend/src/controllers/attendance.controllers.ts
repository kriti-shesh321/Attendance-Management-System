import { Request, Response, } from "express";
import { prisma } from "../config/prisma";

import { markAttendanceSchema } from "../validations/attendance.validations";

// @desc Mark attendance
// @route POST /api/v1/attendance/mark
// @access Private (Student)
export const markAttendance = async (
    req: Request,
    res: Response
) => {
    try {
        const validatedData = markAttendanceSchema.parse(req.body);
        const userId = req.user!.userId;

        const session =
            await prisma.session.findUnique(
                {
                    where: {
                        id: validatedData.session_id,
                    },
                }
            );

        if (!session) {
            return res.status(404).json({ message: "Session not found.", });
        }

        // Check student belongs to batch
        const batchStudent = await prisma.batchStudent.findFirst(
            {
                where: {
                    batch_id: session.batch_id,
                    student_id: userId,
                },
            }
        );

        if (!batchStudent) {
            return res.status(403).json({ message: "Forbidden.", });
        }

        // Prevent duplicate attendance
        const existingAttendance = await prisma.attendance.findFirst(
            {
                where: {
                    session_id: validatedData.session_id,
                    student_id: userId,
                },
            }
        );

        if (existingAttendance) {
            return res.status(409).json({ message: "Attendance already marked.", });
        }

        const attendance = await prisma.attendance.create(
            {
                data: {
                    session_id: validatedData.session_id,
                    student_id: userId,
                    status: validatedData.status,
                },
            }
        );

        return res.status(201).json(attendance);

    } catch (error) {
        console.error(error);

        return res.status(500).json({ message: "Internal server error.", });
    }
};