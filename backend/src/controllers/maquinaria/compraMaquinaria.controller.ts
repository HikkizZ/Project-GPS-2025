 import type { Request, Response } from "express"
import { CompraMaquinariaService } from "../../services/maquinaria/compraMaquinaria.service.js"
import { validationResult } from "express-validator"

export class CompraMaquinariaController {
  private compraMaquinariaService: CompraMaquinariaService

  constructor() {
    this.compraMaquinariaService = new CompraMaquinariaService()
  }

  registrarCompra = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
      }

      const resultado = await this.compraMaquinariaService.registrarCompra(req.body)
      res.status(201).json({
        success: true,
        message: "Compra registrada exitosamente",
        data: resultado,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al registrar la compra",
        error: error instanceof Error ? error.message : "Error desconocido",
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
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener las compras",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  obtenerCompraPorId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const compra = await this.compraMaquinariaService.obtenerCompraPorId(Number(id))
      res.status(200).json({
        success: true,
        data: compra,
      })
    } catch (error) {
      res.status(404).json({
        success: false,
        message: "Compra no encontrada",
        error: error instanceof Error ? error.message : "Error desconocido",
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
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener compras por maquinaria",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  obtenerComprasPorFecha = async (req: Request, res: Response): Promise<void> => {
    try {
      const { fechaInicio, fechaFin } = req.query
      const compras = await this.compraMaquinariaService.obtenerComprasPorFecha(
        new Date(fechaInicio as string),
        new Date(fechaFin as string),
      )
      res.status(200).json({
        success: true,
        data: compras,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener compras por fecha",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  obtenerTotalCompras = async (req: Request, res: Response): Promise<void> => {
    try {
      const { fechaInicio, fechaFin } = req.query
      const total = await this.compraMaquinariaService.obtenerTotalComprasPorPeriodo(
        new Date(fechaInicio as string),
        new Date(fechaFin as string),
      )
      res.status(200).json({
        success: true,
        data: { total },
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al calcular total de compras",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  actualizarCompra = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
      }

      const { id } = req.params
      const compra = await this.compraMaquinariaService.actualizarCompra(Number(id), req.body)
      res.status(200).json({
        success: true,
        message: "Compra actualizada exitosamente",
        data: compra,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar la compra",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  eliminarCompra = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      await this.compraMaquinariaService.eliminarCompra(Number(id))
      res.status(200).json({
        success: true,
        message: "Compra eliminada exitosamente",
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar la compra",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }
}
