import { Router } from "express";
import { updateImageMiddleware, handleUpdateImage } from "../middlewares/updateImage.middleware.js";
import { updateImageController } from "../controllers/updateImage.controller.js";

const router = Router();

router.post("/update-image", updateImageMiddleware, handleUpdateImage, updateImageController);

export default router;
