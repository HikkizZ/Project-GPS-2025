import type { Request, Response } from "express"
import { MaquinariaService } from "../../services/maquinaria/maquinaria.service.js"
import { validationResult } from "express-validator"
import fs from "fs"

export class MaquinariaController {
  private maquinariaService: MaquinariaService

  constructor() {
    this.maquinariaService = new MaquinariaService()
  }

  findAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const incluirInactivas = req.query.incluirInactivas === "true"
      const maquinarias = await this.maquinariaService.findAll(incluirInactivas)
      res.status(200).json({
        success: true,
        data: maquinarias,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener las maquinarias",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  findOne = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const incluirInactivas = req.query.incluirInactivas === "true"
      const maquinaria = await this.maquinariaService.findOne(Number(id), incluirInactivas)
      res.status(200).json({
        success: true,
        data: maquinaria,
      })
    } catch (error) {
      res.status(404).json({
        success: false,
        message: "Maquinaria no encontrada",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  findByPatente = async (req: Request, res: Response): Promise<void> => {
    try {
      const { patente } = req.params
      const incluirInactivas = req.query.incluirInactivas === "true"
      const maquinaria = await this.maquinariaService.findByPatente(patente, incluirInactivas)
      res.status(200).json({
        success: true,
        data: maquinaria,
      })
    } catch (error) {
      res.status(404).json({
        success: false,
        message: "Maquinaria no encontrada",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
      }
      const { id } = req.params
      const file = req.file
      const maquinaria = await this.maquinariaService.update(Number(id), req.body, file)
      res.status(200).json({
        success: true,
        message: "Maquinaria actualizada exitosamente",
        data: maquinaria,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar la maquinaria",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  remove = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      await this.maquinariaService.remove(Number(id))
      res.status(200).json({
        success: true,
        message: "Maquinaria eliminada exitosamente",
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar la maquinaria",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  obtenerDisponible = async (req: Request, res: Response): Promise<void> => {
    try {
      const maquinarias = await this.maquinariaService.obtenerMaquinariaDisponible()
      res.status(200).json({
        success: true,
        data: maquinarias,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener maquinaria disponible",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  actualizarKilometraje = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
      }
      const { id } = req.params
      const { kilometraje } = req.body
      const maquinaria = await this.maquinariaService.actualizarKilometraje(Number(id), kilometraje)
      res.status(200).json({
        success: true,
        message: "Kilometraje actualizado exitosamente",
        data: maquinaria,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar kilometraje",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  cambiarEstado = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
      }
      const { id } = req.params
      const { estado } = req.body
      const maquinaria = await this.maquinariaService.cambiarEstado(Number(id), estado)
      res.status(200).json({
        success: true,
        message: "Estado actualizado exitosamente",
        data: maquinaria,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al cambiar estado",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  softRemove = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      await this.maquinariaService.softRemove(Number(id))
      res.status(200).json({
        success: true,
        message: "Maquinaria desactivada exitosamente (soft delete)",
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al desactivar la maquinaria",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  restore = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const maquinaria = await this.maquinariaService.restore(Number(id))
      res.status(200).json({
        success: true,
        message: "Maquinaria restaurada exitosamente",
        data: maquinaria,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al restaurar la maquinaria",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  actualizarPadron = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const file = req.file

      if (!file) {
        res.status(400).json({
          success: false,
          message: "No se proporcionó ningún archivo PDF",
        })
        return
      }
      const maquinaria = await this.maquinariaService.actualizarPadron(Number(id), file)
      res.status(200).json({
        success: true,
        message: "Padrón PDF actualizado exitosamente",
        data: maquinaria,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar el padrón PDF",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  eliminarPadron = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const maquinaria = await this.maquinariaService.eliminarPadron(Number(id))
      res.status(200).json({
        success: true,
        message: "Padrón eliminado exitosamente",
        data: maquinaria,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar el padrón",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  // Nueva función para descargar padrón PDF
  descargarPadron = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const { filePath, customFilename } = await this.maquinariaService.descargarPadron(Number(id))

      // Verificar que el archivo existe
      if (!fs.existsSync(filePath)) {
        res.status(404).json({
          success: false,
          message: "El archivo del padrón no se encuentra en el servidor",
        })
        return
      }

      // Headers de seguridad para descarga
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate")
      res.setHeader("Pragma", "no-cache")
      res.setHeader("Expires", "0")
      res.setHeader("Content-Type", "application/pdf")
      res.setHeader("Content-Disposition", `attachment; filename="${customFilename}"`)
      res.setHeader("Access-Control-Expose-Headers", "Content-Disposition")

      // Descargar archivo
      res.download(filePath, customFilename, (err) => {
        if (err && !res.headersSent) {
          res.status(500).json({
            success: false,
            message: "No se pudo descargar el archivo del padrón",
          })
        }
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al descargar el padrón",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }
}
