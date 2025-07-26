import type { Request, Response } from "express"
import { ArriendoMaquinariaService } from "../../services/maquinaria/arriendoMaquinaria.service.js"
import { validationResult } from "express-validator"

export class ArriendoMaquinariaController {
  private arriendoService: ArriendoMaquinariaService

  constructor() {
    this.arriendoService = new ArriendoMaquinariaService()
  }

  crearReporteTrabajo = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Errores de validación",
          errors: errors.array(),
        })
        return
      }

      const resultado = await this.arriendoService.crearReporteTrabajo(req.body)

      res.status(201).json({
        success: true,
        message: "Reporte creado exitosamente",
        data: resultado,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error al crear el reporte",
        error: error.message,
      })
    }
  }

  obtenerTodosLosReportes = async (req: Request, res: Response): Promise<void> => {
    try {
      const reportes = await this.arriendoService.obtenerTodosLosReportes()
      res.status(200).json({
        success: true,
        data: reportes,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error al obtener reportes",
        error: error.message,
      })
    }
  }

  obtenerReportePorId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const reporte = await this.arriendoService.obtenerReportePorId(Number(id))

      res.status(200).json({
        success: true,
        data: reporte,
      })
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: "Reporte no encontrado",
        error: error.message,
      })
    }
  }

  obtenerReportesPorPatente = async (req: Request, res: Response): Promise<void> => {
    try {
      const { patente } = req.params
      const reportes = await this.arriendoService.obtenerReportesPorPatente(patente)

      res.status(200).json({
        success: true,
        data: reportes,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error al obtener reportes por patente",
        error: error.message,
      })
    }
  }

  obtenerReportesPorCliente = async (req: Request, res: Response): Promise<void> => {
    try {
      const { rutCliente } = req.params
      const reportes = await this.arriendoService.obtenerReportesPorCliente(rutCliente)

      res.status(200).json({
        success: true,
        data: reportes,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error al obtener reportes por cliente",
        error: error.message,
      })
    }
  }

  obtenerReportesPorFecha = async (req: Request, res: Response): Promise<void> => {
    try {
      const { fechaInicio, fechaFin } = req.query
      const reportes = await this.arriendoService.obtenerReportesPorFecha(
        new Date(fechaInicio as string),
        new Date(fechaFin as string),
      )

      res.status(200).json({
        success: true,
        data: reportes,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error al obtener reportes por fecha",
        error: error.message,
      })
    }
  }

  actualizarReporte = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const reporte = await this.arriendoService.actualizarReporte(Number(id), req.body)

      res.status(200).json({
        success: true,
        message: "Reporte actualizado exitosamente",
        data: reporte,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar reporte",
        error: error.message,
      })
    }
  }

  eliminarReporte = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      await this.arriendoService.eliminarReporte(Number(id))

      res.status(200).json({
        success: true,
        message: "Reporte eliminado exitosamente",
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar reporte",
        error: error.message,
      })
    }
  }
}
