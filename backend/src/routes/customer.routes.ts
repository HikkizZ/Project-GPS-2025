import { Router } from "express";

import {
    getCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
} from "../controllers/customer.controller.js";

import { authenticateJWT } from "../middlewares/authentication.middleware.js";

const router: Router = Router();

router.use(authenticateJWT);

router
    .get("/all", getCustomers)
    .get("/", getCustomer)
    .post("/", createCustomer)
    .patch("/", updateCustomer)
    .delete("/", deleteCustomer);

export default router;