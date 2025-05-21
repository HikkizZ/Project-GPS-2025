import { Router } from "express";

import {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
} from "../controllers/inventory/product.controller.js";

import { authenticateJWT } from "../middlewares/authentication.middleware.js";

const router: Router = Router();

router.use(authenticateJWT);

router
    .get("/", getProducts)
    .get("/:id", getProduct)
    .post("/", createProduct)
    .patch("/:id", updateProduct)
    .delete("/:id", deleteProduct);