import { Router } from "express";
import { Role } from "@prisma/client";

import { createSession, getSessions, getSessionAttendance } from "../controllers/session.controllers";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

router.use(authenticate);

router.post(
    "/",
    authorizeRoles([Role.trainer]),
    createSession
);

router.get(
    "/",
    authorizeRoles([Role.trainer, Role.student]),
    getSessions
);

router.get(
    "/:id/attendance",
    authorizeRoles([Role.trainer]),
    getSessionAttendance
);

export default router;