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
      const compras = await this.compraMaquinariaService.obtenerTodasLasCompras()

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
      const compra = await this.compraMaquinariaService.obtenerCompraPorId(Number(id))

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
      const compras = await this.compraMaquinariaService.obtenerComprasPorMaquinaria(Number(maquinariaId))

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

      const compras = await this.compraMaquinariaService.obtenerComprasPorFecha(
        fechaInicio as string,
        fechaFin as string,
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
}
