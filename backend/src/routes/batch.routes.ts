import { Router } from "express";

import { createBatch, generateInvite, getBatches, joinBatch, getBatchSummary } from "../controllers/batch.controllers";

import { Role } from "@prisma/client";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

router.use(authenticate);

router.post(
    "/",
    authorizeRoles([Role.institution, Role.trainer]),
    createBatch
);
router.get(
    "/",
    authorizeRoles([Role.institution]),
    getBatches
);
router.post(
    "/:id/invite",
    authorizeRoles([Role.trainer]),
    generateInvite
);
router.post(
    "/join",
    authorizeRoles([Role.student]),
    joinBatch
);
router.get(
    "/:id/summary",
    authorizeRoles([Role.institution]),
    getBatchSummary
);

export default router;