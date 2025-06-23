import { Router } from "express"
import authRoutes from "./auth.routes.js"
import userRoutes from "./user.routes.js"
import maquinariaRoutes from "./maquinaria/maquinaria.routes.js"
import compraMaquinariaRoutes from "./maquinaria/compraMaquinaria.routes.js"
import ventaMaquinariaRoutes from "./maquinaria/ventaMaquinaria.routes.js"

const router: Router = Router()

/* Test route */
router.get("/", (req, res) => {
  res.send("Hello World")
})

/* Here are the routes */
router.use("/auth", authRoutes)
router.use("/user", userRoutes)

/* Maquinaria routes */
router.use("/maquinaria", maquinariaRoutes)
router.use("/compras-maquinaria", compraMaquinariaRoutes)
router.use("/ventas-maquinaria", ventaMaquinariaRoutes)

export default router
