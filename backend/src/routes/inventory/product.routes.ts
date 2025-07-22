import { Router } from "express";
import { verifyRole } from "../../middlewares/authorization.middleware.js";

import {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
} from "../../controllers/inventory/product.controller.js";

import { authenticateJWT } from "../../middlewares/authentication.middleware.js";

const router: Router = Router();

router.use(authenticateJWT);

router.use(verifyRole(["Administrador", "SuperAdministrador", "Ventas", "Gerencia"]));

router
    .get("/all", getProducts)
    .get("/", getProduct)
    .post("/", createProduct)
    .put("/:id", updateProduct)
    .delete("/:id", deleteProduct);

export default router;