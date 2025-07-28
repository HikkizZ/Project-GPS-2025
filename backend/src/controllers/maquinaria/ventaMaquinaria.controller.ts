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
      const incluirInactivas = req.query.incluirInactivas === "true"
      const ventas = await this.ventaMaquinariaService.obtenerTodasLasVentas(incluirInactivas)
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
      const incluirInactivas = req.query.incluirInactivas === "true"
      const venta = await this.ventaMaquinariaService.obtenerVentaPorId(Number(id), incluirInactivas)
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
      const incluirInactivas = req.query.incluirInactivas === "true"
      const ventas = await this.ventaMaquinariaService.obtenerVentasPorPatente(patente, incluirInactivas)
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
      const incluirInactivas = req.query.incluirInactivas === "true"
      const ventas = await this.ventaMaquinariaService.obtenerVentasPorFecha(
        new Date(fechaInicio as string),
        new Date(fechaFin as string),
        incluirInactivas,
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
      const incluirInactivas = req.query.incluirInactivas === "true"
      const ventas = await this.ventaMaquinariaService.obtenerVentasPorCustomer(comprador, incluirInactivas)
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
  // SoftDelete
  eliminarVenta = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      await this.ventaMaquinariaService.eliminarVenta(Number(id))

      res.status(200).json({
        success: true,
        message: "Venta eliminada exitosamente (soft delete)",
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar venta",
        error: error.message,
      })
    }
  }
  // Restaurar una venta con softdelete
  restaurarVenta = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const ventaRestaurada = await this.ventaMaquinariaService.restaurarVenta(Number(id))

      res.status(200).json({
        success: true,
        message: "Venta restaurada exitosamente",
        data: ventaRestaurada,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error al restaurar venta",
        error: error.message,
      })
    }
  }
}