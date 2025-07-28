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
      res.status(500).json({
        success: false,
        message: error.message || "Error al registrar compra",
        error: error.message,
      })
    }
  }
  obtenerTodasLasCompras = async (req: Request, res: Response): Promise<void> => {
    try {
      const incluirInactivas = req.query.incluirInactivas === "true"
      const compras = await this.compraMaquinariaService.obtenerTodasLasCompras(incluirInactivas)

      res.status(200).json({
        success: true,
        data: compras,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error al obtener compras",
        error: error.message,
      })
    }
  }
  obtenerCompraPorId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const incluirInactivas = req.query.incluirInactivas === "true"
      const compra = await this.compraMaquinariaService.obtenerCompraPorId(Number(id), incluirInactivas)

      if (!compra) {
        res.status(404).json({
          success: false,
          message: "Compra no encontrada",
        })
        return
      }
      res.status(200).json({
        success: true,
        data: compra,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error al obtener compra",
        error: error.message,
      })
    }
  }
  obtenerComprasPorMaquinaria = async (req: Request, res: Response): Promise<void> => {
    try {
      const { maquinariaId } = req.params
      const incluirInactivas = req.query.incluirInactivas === "true"
      const compras = await this.compraMaquinariaService.obtenerComprasPorMaquinaria(
        Number(maquinariaId),
        incluirInactivas,
      )
      res.status(200).json({
        success: true,
        data: compras,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error al obtener compras por maquinaria",
        error: error.message,
      })
    }
  }
  obtenerComprasPorFecha = async (req: Request, res: Response): Promise<void> => {
    try {
      const { fechaInicio, fechaFin } = req.query
      const incluirInactivas = req.query.incluirInactivas === "true"

      const compras = await this.compraMaquinariaService.obtenerComprasPorFecha(
        fechaInicio as string,
        fechaFin as string,
        incluirInactivas,
      )
      res.status(200).json({
        success: true,
        data: compras,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error al obtener compras por fecha",
        error: error.message,
      })
    }
  }
  actualizarCompra = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const file = req.file
      const data = req.body
      const compraActualizada = await this.compraMaquinariaService.actualizarCompra(Number(id), data, file)
      res.status(200).json({
        success: true,
        message: "Compra actualizada exitosamente",
        data: compraActualizada,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar compra",
        error: error.message,
      })
    }
  }
  eliminarCompra = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      await this.compraMaquinariaService.eliminarCompra(Number(id))
      res.status(200).json({
        success: true,
        message: "Compra eliminada exitosamente (soft delete)",
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar compra",
        error: error.message,
      })
    }
  }
  restaurarCompra = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const compraRestaurada = await this.compraMaquinariaService.restaurarCompra(Number(id))

      res.status(200).json({
        success: true,
        message: "Compra restaurada exitosamente",
        data: compraRestaurada,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error al restaurar compra",
        error: error.message,
      })
    }
  }
  obtenerPadronCompra = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const compra = await this.compraMaquinariaService.obtenerCompraPorId(Number(id), false)

      if (!compra) {
        res.status(404).json({
          success: false,
          message: "Compra no encontrada",
        })
        return
      }

      if (!compra.padronUrl) {
        res.status(404).json({
          success: false,
          message: "Esta compra no tiene padrón asociado",
        })
        return
      }

      res.status(200).json({
        success: true,
        data: {
          padronUrl: compra.padronUrl,
        },
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error al obtener padrón de la compra",
        error: error.message,
      })
    }
  }

  eliminarPadronCompra = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const resultado = await this.compraMaquinariaService.eliminarPadronCompra(Number(id))

      res.status(200).json({
        success: true,
        message: "Padrón eliminado exitosamente",
        data: resultado,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar padrón de la compra",
        error: error.message,
      })
    }
  }
}
