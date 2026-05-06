import { Router } from "express";
import { Role } from "@prisma/client";

import { markAttendance } from "../controllers/attendance.controllers";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

router.use(authenticate);

router.post(
    "/mark",
    authorizeRoles([
        Role.student,
    ]),
    markAttendance
);

export default router;