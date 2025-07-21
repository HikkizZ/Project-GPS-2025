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

  obtenerVentasPorPatente = async (req: Request, res: Response): Promise<void> => {
    try {
      const { patente } = req.params
      const ventas = await this.ventaMaquinariaService.obtenerVentasPorPatente(patente)
      res.status(200).json({
        success: true,
        data: ventas,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener ventas por patente",
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

  obtenerVentasPorComprador = async (req: Request, res: Response): Promise<void> => {
    try {
      const { comprador } = req.params
      const ventas = await this.ventaMaquinariaService.obtenerVentasPorComprador(comprador)
      res.status(200).json({
        success: true,
        data: ventas,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener ventas por comprador",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  // MÉTODOS ELIMINADOS como solicitaste:
  // - actualizarVenta()
  // - eliminarVenta()
  // - obtenerTotalVentas() (simplificación adicional)
  // - obtenerVentasPorMaquinaria() (simplificación adicional)
}
