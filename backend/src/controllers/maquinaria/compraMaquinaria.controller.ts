import type { Request, Response } from "express"
import { CompraMaquinariaService } from "../../services/maquinaria/compraMaquinaria.service.js"

export class CompraMaquinariaController {
  private compraMaquinariaService: CompraMaquinariaService

  constructor() {
    this.compraMaquinariaService = new CompraMaquinariaService()
  }

  registrarCompra = async (req: Request, res: Response): Promise<void> => {
    try {
      const file = req.file
      const data = req.body

      const resultado = await this.compraMaquinariaService.registrarCompra(data, file)

      res.status(201).json({
        success: true,
        message: "Compra registrada exitosamente",
        data: resultado,
      })
    } catch (error: any) {
      console.error("Error en registrarCompra:", error)
      res.status(500).json({
        success: false,
        message: error.message || "Error interno del servidor",
        error: error.message,
      })
    }
  }

  obtenerTodasLasCompras = async (req: Request, res: Response): Promise<void> => {
    try {
      const compras = await this.compraMaquinariaService.obtenerTodasLasCompras()

      res.status(200).json({
        success: true,
        message: "Compras obtenidas exitosamente",
        data: compras,
      })
    } catch (error: any) {
      console.error("Error en obtenerTodasLasCompras:", error)
      res.status(500).json({
        success: false,
        message: error.message || "Error interno del servidor",
        error: error.message,
      })
    }
  }

  obtenerCompraPorId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const compra = await this.compraMaquinariaService.obtenerCompraPorId(Number.parseInt(id))

      if (!compra) {
        res.status(404).json({
          success: false,
          message: "Compra no encontrada",
        })
        return
      }

      res.status(200).json({
        success: true,
        message: "Compra obtenida exitosamente",
        data: compra,
      })
    } catch (error: any) {
      console.error("Error en obtenerCompraPorId:", error)
      res.status(500).json({
        success: false,
        message: error.message || "Error interno del servidor",
        error: error.message,
      })
    }
  }

  obtenerComprasPorMaquinaria = async (req: Request, res: Response): Promise<void> => {
    try {
      const { maquinariaId } = req.params
      const compras = await this.compraMaquinariaService.obtenerComprasPorMaquinaria(Number.parseInt(maquinariaId))

      res.status(200).json({
        success: true,
        message: "Compras por maquinaria obtenidas exitosamente",
        data: compras,
      })
    } catch (error: any) {
      console.error("Error en obtenerComprasPorMaquinaria:", error)
      res.status(500).json({
        success: false,
        message: error.message || "Error interno del servidor",
        error: error.message,
      })
    }
  }

  obtenerComprasPorFecha = async (req: Request, res: Response): Promise<void> => {
    try {
      const { fechaInicio, fechaFin } = req.query

      const compras = await this.compraMaquinariaService.obtenerComprasPorFecha(
        fechaInicio as string,
        fechaFin as string,
      )

      res.status(200).json({
        success: true,
        message: "Compras por fecha obtenidas exitosamente",
        data: compras,
      })
    } catch (error: any) {
      console.error("Error en obtenerComprasPorFecha:", error)
      res.status(500).json({
        success: false,
        message: error.message || "Error interno del servidor",
        error: error.message,
      })
    }
  }

  obtenerTotalCompras = async (req: Request, res: Response): Promise<void> => {
    try {
      const { fechaInicio, fechaFin } = req.query

      const total = await this.compraMaquinariaService.obtenerTotalCompras(fechaInicio as string, fechaFin as string)

      res.status(200).json({
        success: true,
        message: "Total de compras obtenido exitosamente",
        data: total,
      })
    } catch (error: any) {
      console.error("Error en obtenerTotalCompras:", error)
      res.status(500).json({
        success: false,
        message: error.message || "Error interno del servidor",
        error: error.message,
      })
    }
  }

  actualizarCompra = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const file = req.file
      const data = req.body

      const compraActualizada = await this.compraMaquinariaService.actualizarCompra(Number.parseInt(id), data, file)

      res.status(200).json({
        success: true,
        message: "Compra actualizada exitosamente",
        data: compraActualizada,
      })
    } catch (error: any) {
      console.error("Error en actualizarCompra:", error)
      res.status(500).json({
        success: false,
        message: error.message || "Error interno del servidor",
        error: error.message,
      })
    }
  }

  // MÉTODO eliminarCompra ELIMINADO - Ya no se puede eliminar compras completas

  eliminarPadron = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params

      const compraActualizada = await this.compraMaquinariaService.eliminarPadron(Number.parseInt(id))

      res.status(200).json({
        success: true,
        message: "Padrón eliminado exitosamente",
        data: compraActualizada,
      })
    } catch (error: any) {
      console.error("Error en eliminarPadron:", error)
      res.status(500).json({
        success: false,
        message: error.message || "Error interno del servidor",
        error: error.message,
      })
    }
  }
}
