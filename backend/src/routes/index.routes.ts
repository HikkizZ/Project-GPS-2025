import { Router } from "express"
import authRoutes from "./auth.routes.js"
import userRoutes from "./user.routes.js"
import productRoutes from "./inventory/product.routes.js"
import customerRoutes from "./stakeholders/customer.routes.js"
import supplierRoutes from "./stakeholders/supplier.routes.js"
import fichaEmpresaRoutes from "./recursosHumanos/fichaEmpresa.routes.js"
import licenciaPermisoRoutes from "./recursosHumanos/licenciaPermiso.routes.js"
import trabajadorRoutes from "./recursosHumanos/trabajador.routes.js"
import historialLaboralRoutes from "./recursosHumanos/historialLaboral.routes.js"
import filesRoutes from "./files.routes.js"
import { authenticateJWT } from "../middlewares/authentication.middleware.js"
import inventoryEntryRoutes from "./inventory/inventoryEntry.routes.js"
import inventoryExitRoutes from "./inventory/inventoryExit.routes.js"
import inventoryRoutes from "./inventory/inventory.routes.js"
//maquinitas run run bum bum .PIP-PIP-PIP-PIP retrocediendo
import maquinariaRoutes from "./maquinaria/maquinaria.routes.js"
import compraMaquinariaRoutes from "./maquinaria/compraMaquinaria.routes.js"
import ventaMaquinariaRoutes from "./maquinaria/ventaMaquinaria.routes.js"
import arriendoMaquinariaRoutes from "./maquinaria/arriendoMaquinaria.routes.js"
import clienteMaquinariaRoutes from "./maquinaria/clienteMaquinaria.routes.js"
import updateImageRoutes from "./updateImage.routes.js" // ✅ NUEVA RUTA

const router: Router = Router()

/* Test route */
router.get("/", (_req, res) => {
  res.status(200).json({
    msg: "API Working",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  })
})

// Rutas de autenticación (públicas)
router.use("/auth", authRoutes)

// Middleware de autenticación para todas las rutas protegidas
router.use(authenticateJWT)

// Rutas protegidas
router.use("/users", userRoutes)
router.use("/products", productRoutes)
router.use("/customers", customerRoutes) // Cliente del otro compañero
router.use("/suppliers", supplierRoutes)
router.use("/ficha-empresa", fichaEmpresaRoutes)
router.use("/licencia-permiso", licenciaPermisoRoutes)
router.use("/trabajadores", trabajadorRoutes)
router.use("/historial-laboral", historialLaboralRoutes)
router.use("/files", filesRoutes)
router.use("/inventory-entry", inventoryEntryRoutes)
router.use("/inventory-exit", inventoryExitRoutes)
router.use("/inventory", inventoryRoutes)

//MAQUINARIA
router.use("/maquinaria", maquinariaRoutes)
router.use("/compra-maquinaria", compraMaquinariaRoutes)
router.use("/ventas-maquinaria", ventaMaquinariaRoutes)
router.use("/arriendos-maquinaria", arriendoMaquinariaRoutes)
router.use("/clientes-maquinaria", clienteMaquinariaRoutes) // Tu cliente de maquinaria

/* Nueva ruta para subir imágenes */
router.use("/update-image", updateImageRoutes) // ✅ Agregada

export default router
