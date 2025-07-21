import { Router } from "express";

import {
    getSuppliers,
    getSupplier,
    createSupplier,
    updateSupplier,
    deleteSupplier,
} from "../../controllers/stakeholders/supplier.controller.js";

import { authenticateJWT } from "../../middlewares/authentication.middleware.js";

const router: Router = Router();

router.use(authenticateJWT);

router
    .get("/all", getSuppliers)
    .get("/", getSupplier)
    .post("/", createSupplier)
    .put("/:id", updateSupplier)
    .delete("/:id", deleteSupplier);

export default router;