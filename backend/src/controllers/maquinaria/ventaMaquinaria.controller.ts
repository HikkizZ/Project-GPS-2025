import type { Request, Response } from "express"
import { VentaMaquinariaService } from "../../services/maquinaria/ventaMaquinaria.service.js"
import { validationResult } from "express-validator"

export class VentaMaquinariaController {
  private ventaMaquinariaService: VentaMaquinariaService

  constructor() {
    this.ventaMaquinariaService = new VentaMaquinariaService()
  }

  registrarVenta = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
      }

      const resultado = await this.ventaMaquinariaService.registrarVenta(req.body)
      res.status(201).json({
        success: true,
        message: "Venta registrada exitosamente",
        data: resultado,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al registrar la venta",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  obtenerTodasLasVentas = async (req: Request, res: Response): Promise<void> => {
    try {
      const ventas = await this.ventaMaquinariaService.obtenerTodasLasVentas()
      res.status(200).json({
        success: true,
        data: ventas,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener las ventas",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  obtenerVentaPorId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const venta = await this.ventaMaquinariaService.obtenerVentaPorId(Number(id))
      res.status(200).json({
        success: true,
        data: venta,
      })
    } catch (error) {
      res.status(404).json({
        success: false,
        message: "Venta no encontrada",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  obtenerVentasPorMaquinaria = async (req: Request, res: Response): Promise<void> => {
    try {
      const { maquinariaId } = req.params
      const ventas = await this.ventaMaquinariaService.obtenerVentasPorMaquinaria(Number(maquinariaId))
      res.status(200).json({
        success: true,
        data: ventas,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener ventas por maquinaria",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  obtenerVentasPorFecha = async (req: Request, res: Response): Promise<void> => {
    try {
      const { fechaInicio, fechaFin } = req.query
      const ventas = await this.ventaMaquinariaService.obtenerVentasPorFecha(
        new Date(fechaInicio as string),
        new Date(fechaFin as string),
      )
      res.status(200).json({
        success: true,
        data: ventas,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener ventas por fecha",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  calcularGananciaPorMaquinaria = async (req: Request, res: Response): Promise<void> => {
    try {
      const { maquinariaId } = req.params
      const ganancia = await this.ventaMaquinariaService.calcularGananciaPorMaquinaria(Number(maquinariaId))
      res.status(200).json({
        success: true,
        data: ganancia,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al calcular ganancia",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  obtenerTotalVentas = async (req: Request, res: Response): Promise<void> => {
    try {
      const { fechaInicio, fechaFin } = req.query
      const total = await this.ventaMaquinariaService.obtenerTotalVentasPorPeriodo(
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
        message: "Error al calcular total de ventas",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  actualizarVenta = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
      }

      const { id } = req.params
      const venta = await this.ventaMaquinariaService.actualizarVenta(Number(id), req.body)
      res.status(200).json({
        success: true,
        message: "Venta actualizada exitosamente",
        data: venta,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar la venta",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  eliminarVenta = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      await this.ventaMaquinariaService.eliminarVenta(Number(id))
      res.status(200).json({
        success: true,
        message: "Venta eliminada exitosamente",
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar la venta",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }
}
