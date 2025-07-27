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

      // Pasar el rol del usuario al servicio
      const userRole = (req as any).user?.role || "Usuario"
      const resultado = await this.arriendoService.crearReporteTrabajo(req.body, userRole)

      res.status(201).json({
        success: true,
        message: "Reporte creado exitosamente",
        data: resultado,
      })
    } catch (error: any) {
      console.error("Error al crear reporte:", error)

      // Determinar el código de estado basado en el tipo de error
      let statusCode = 500
      if (error.message.includes("Ya existe un reporte")) {
        statusCode = 409 // Conflict
      } else if (error.message.includes("no encontrado") || error.message.includes("inactivo")) {
        statusCode = 404 // Not Found
      } else if (error.message.includes("no está disponible") || error.message.includes("debe ser mayor")) {
        statusCode = 400 // Bad Request
      }

      res.status(statusCode).json({
        success: false,
        message: "Error al crear el reporte",
        error: process.env.NODE_ENV === "development" ? error.message : "Error interno del servidor",
      })
    }
  }

  // función para incluir soft deleted en get all
  obtenerTodosLosReportes = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validar el parámetro de query
      const incluirInactivas = req.query.incluirInactivas === "true"

      // Paginación para evitar sobrecarga
      const page = Number.parseInt(req.query.page as string) || 1
      const limit = Number.parseInt(req.query.limit as string) || 50
      if (limit > 100) {
        res.status(400).json({
          success: false,
          message: "El límite máximo es 100 registros por página",
        })
        return
      }

      const reportes = await this.arriendoService.obtenerTodosLosReportes(incluirInactivas)

      // Aplicar paginación manual
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const reportesPaginados = reportes.slice(startIndex, endIndex)

      res.status(200).json({
        success: true,
        data: reportesPaginados,
        pagination: {
          currentPage: page,
          totalRecords: reportes.length,
          totalPages: Math.ceil(reportes.length / limit),
          recordsPerPage: limit,
          includeInactive: incluirInactivas,
        },
      })
    } catch (error: any) {
      console.error("Error al obtener reportes:", error)
      res.status(500).json({
        success: false,
        message: "Error al obtener reportes",
        error: process.env.NODE_ENV === "development" ? error.message : "Error interno del servidor",
      })
    }
  }

  obtenerReportePorId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const idNumerico = Number.parseInt(id)
      if (isNaN(idNumerico) || idNumerico <= 0) {
        res.status(400).json({
          success: false,
          message: "ID de reporte inválido",
        })
        return
      }

      const incluirInactivas = req.query.incluirInactivas === "true"
      const reporte = await this.arriendoService.obtenerReportePorId(idNumerico, incluirInactivas)

      res.status(200).json({
        success: true,
        data: reporte,
      })
    } catch (error: any) {
      console.error("Error al obtener reporte por ID:", error)
      res.status(404).json({
        success: false,
        message: "Reporte no encontrado",
        error: process.env.NODE_ENV === "development" ? error.message : "Reporte no encontrado",
      })
    }
  }

  obtenerReportesPorPatente = async (req: Request, res: Response): Promise<void> => {
    try {
      const { patente } = req.params
      if (!patente || typeof patente !== "string") {
        res.status(400).json({
          success: false,
          message: "Patente inválida",
        })
        return
      }

      const incluirInactivas = req.query.incluirInactivas === "true"
      const reportes = await this.arriendoService.obtenerReportesPorPatente(
        patente.trim().toUpperCase(),
        incluirInactivas,
      )

      res.status(200).json({
        success: true,
        data: reportes,
      })
    } catch (error: any) {
      console.error("Error al obtener reportes por patente:", error)
      res.status(500).json({
        success: false,
        message: "Error al obtener reportes por patente",
        error: process.env.NODE_ENV === "development" ? error.message : "Error interno del servidor",
      })
    }
  }

  obtenerReportesPorCliente = async (req: Request, res: Response): Promise<void> => {
    try {
      const { rutCliente } = req.params
      if (!rutCliente || typeof rutCliente !== "string") {
        res.status(400).json({
          success: false,
          message: "RUT de cliente inválido",
        })
        return
      }

      const incluirInactivas = req.query.incluirInactivas === "true"
      const reportes = await this.arriendoService.obtenerReportesPorCliente(rutCliente.trim(), incluirInactivas)

      res.status(200).json({
        success: true,
        data: reportes,
      })
    } catch (error: any) {
      console.error("Error al obtener reportes por cliente:", error)
      res.status(500).json({
        success: false,
        message: "Error al obtener reportes por cliente",
        error: process.env.NODE_ENV === "development" ? error.message : "Error interno del servidor",
      })
    }
  }

  obtenerReportesPorFecha = async (req: Request, res: Response): Promise<void> => {
    try {
      const { fechaInicio, fechaFin } = req.query
      if (!fechaInicio || !fechaFin) {
        res.status(400).json({
          success: false,
          message: "Fechas de inicio y fin son requeridas",
        })
        return
      }

      const incluirInactivas = req.query.incluirInactivas === "true"
      const reportes = await this.arriendoService.obtenerReportesPorFecha(
        new Date(fechaInicio as string),
        new Date(fechaFin as string),
        incluirInactivas,
      )

      res.status(200).json({
        success: true,
        data: reportes,
      })
    } catch (error: any) {
      console.error("Error al obtener reportes por fecha:", error)
      res.status(500).json({
        success: false,
        message: "Error al obtener reportes por fecha",
        error: process.env.NODE_ENV === "development" ? error.message : "Error interno del servidor",
      })
    }
  }

  actualizarReporte = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const idNumerico = Number.parseInt(id)
      if (isNaN(idNumerico) || idNumerico <= 0) {
        res.status(400).json({
          success: false,
          message: "ID de reporte inválido",
        })
        return
      }

      const reporte = await this.arriendoService.actualizarReporte(idNumerico, req.body)

      res.status(200).json({
        success: true,
        message: "Reporte actualizado exitosamente",
        data: reporte,
      })
    } catch (error: any) {
      console.error("Error al actualizar reporte:", error)
      res.status(500).json({
        success: false,
        message: "Error al actualizar reporte",
        error: process.env.NODE_ENV === "development" ? error.message : "Error interno del servidor",
      })
    }
  }

  eliminarReporte = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const idNumerico = Number.parseInt(id)
      if (isNaN(idNumerico) || idNumerico <= 0) {
        res.status(400).json({
          success: false,
          message: "ID de reporte inválido",
        })
        return
      }

      console.log(`🗑️ Controller: Eliminando reporte (soft delete) ID: ${id}`)

      await this.arriendoService.eliminarReporte(idNumerico)

      res.status(200).json({
        success: true,
        message: "Reporte eliminado exitosamente (soft delete)",
      })
    } catch (error: any) {
      console.error("💥 Controller: Error al eliminar reporte:", error)
      res.status(400).json({
        success: false,
        message: error.message || "Error al eliminar el reporte",
        error: process.env.NODE_ENV === "development" ? error.message : "Error al eliminar reporte",
      })
    }
  }

  restaurarReporte = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const idNumerico = Number.parseInt(id)
      if (isNaN(idNumerico) || idNumerico <= 0) {
        res.status(400).json({
          success: false,
          message: "ID de reporte inválido",
        })
        return
      }

      console.log(`♻️ Controller: Restaurando reporte ID: ${id}`)

      const reporte = await this.arriendoService.restaurarReporte(idNumerico)

      res.status(200).json({
        success: true,
        message: "Reporte restaurado exitosamente",
        data: reporte,
      })
    } catch (error: any) {
      console.error("💥 Controller: Error al restaurar reporte:", error)
      res.status(400).json({
        success: false,
        message: error.message || "Error al restaurar el reporte",
        error: process.env.NODE_ENV === "development" ? error.message : "Error al restaurar reporte",
      })
    }
  }

  verificarIntegridadKilometraje = async (req: Request, res: Response): Promise<void> => {
    try {
      const { maquinariaId } = req.params
      const idNumerico = Number.parseInt(maquinariaId)
      if (isNaN(idNumerico) || idNumerico <= 0) {
        res.status(400).json({
          success: false,
          message: "ID de maquinaria inválido",
        })
        return
      }

      const verificacion = await this.arriendoService.verificarIntegridadKilometraje(idNumerico)

      res.status(200).json({
        success: true,
        message: verificacion.esConsistente ? "Kilometraje consistente" : "Inconsistencia detectada",
        data: verificacion,
      })
    } catch (error: any) {
      console.error("Error al verificar integridad:", error)
      res.status(500).json({
        success: false,
        message: "Error al verificar integridad",
        error: process.env.NODE_ENV === "development" ? error.message : "Error interno del servidor",
      })
    }
  }

  corregirKilometraje = async (req: Request, res: Response): Promise<void> => {
    try {
      const { maquinariaId } = req.params
      const idNumerico = Number.parseInt(maquinariaId)
      if (isNaN(idNumerico) || idNumerico <= 0) {
        res.status(400).json({
          success: false,
          message: "ID de maquinaria inválido",
        })
        return
      }

      await this.arriendoService.corregirKilometraje(idNumerico)

      res.status(200).json({
        success: true,
        message: "Kilometraje corregido exitosamente",
      })
    } catch (error: any) {
      console.error("Error al corregir kilometraje:", error)
      res.status(500).json({
        success: false,
        message: "Error al corregir kilometraje",
        error: process.env.NODE_ENV === "development" ? error.message : "Error interno del servidor",
      })
    }
  }
}
