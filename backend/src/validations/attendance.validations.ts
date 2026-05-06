import { z } from "zod";
import { AttendanceStatus } from "@prisma/client";

export const markAttendanceSchema =
    z.object({
        session_id: z.uuid(),
        status: z.enum([
            AttendanceStatus.present,
            AttendanceStatus.absent,
            AttendanceStatus.late,
        ]),
    });