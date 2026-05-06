import { Router } from "express";
import { Role } from "@prisma/client";

import { getInstitutionSummaries, getProgrammeSummary, } from "../controllers/summary.controllers";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

router.use(authenticate);

router.get(
    "/institutions",
    authorizeRoles([Role.programme_manager]),
    getInstitutionSummaries
);

router.get(
    "/programme",
    authorizeRoles([Role.programme_manager, Role.monitoring_officer]),
    getProgrammeSummary
);

export default router;