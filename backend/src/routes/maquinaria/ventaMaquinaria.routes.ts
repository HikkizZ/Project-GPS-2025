import { Router } from "express";
import { VentaMaquinariaController } from "../../controllers/maquinaria/ventaMaquinaria.controller.js";
import {
  registrarVentaValidation,
  ventaIdValidation,
  patenteValidation,
  fechaRangoValidation,
  compradorValidation,
} from "../../validations/maquinaria/ventaMaquinaria.validations.js";
import { authenticateJWT } from "../../middlewares/authentication.middleware.js";
import { verifyRole } from "../../middlewares/authorization.middleware.js";

const router = Router();
const ventaMaquinariaController = new VentaMaquinariaController();

router.post("/", authenticateJWT, verifyRole(["Arriendo"]), registrarVentaValidation, ventaMaquinariaController.registrarVenta);
router.get("/", authenticateJWT, verifyRole(["Arriendo"]), ventaMaquinariaController.obtenerTodasLasVentas);
router.get("/fecha", authenticateJWT, verifyRole(["Arriendo"]), fechaRangoValidation, ventaMaquinariaController.obtenerVentasPorFecha);
router.get("/patente/:patente", authenticateJWT, verifyRole(["Arriendo"]), patenteValidation, ventaMaquinariaController.obtenerVentasPorPatente);
router.get("/comprador/:comprador", authenticateJWT, verifyRole(["Arriendo"]), compradorValidation, ventaMaquinariaController.obtenerVentasPorComprador);
router.get("/:id", authenticateJWT, verifyRole(["Arriendo"]), ventaIdValidation, ventaMaquinariaController.obtenerVentaPorId);
router.delete("/:id", authenticateJWT, verifyRole(["SuperAdministrador"]), ventaIdValidation, ventaMaquinariaController.eliminarVenta);
router.patch("/:id/restaurar", authenticateJWT, verifyRole(["SuperAdministrador"]), ventaIdValidation, ventaMaquinariaController.restaurarVenta);

export default router;