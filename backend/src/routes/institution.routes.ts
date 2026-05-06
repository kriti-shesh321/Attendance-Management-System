import { Router } from "express";

import { getInstitutions } from "../controllers/institution.controllers";

const router = Router();

router.get("/", getInstitutions);

export default router;