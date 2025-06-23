import type { Request, Response } from "express"
import { MaquinariaService } from "../../services/maquinaria/maquinaria.service.js"
import { validationResult } from "express-validator"

export class MaquinariaController {
  private maquinariaService: MaquinariaService

  constructor() {
    this.maquinariaService = new MaquinariaService()
  }

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
      }

      const maquinaria = await this.maquinariaService.create(req.body)
      res.status(201).json({
        success: true,
        message: "Maquinaria creada exitosamente",
        data: maquinaria,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al crear la maquinaria",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  findAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const maquinarias = await this.maquinariaService.findAll()
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
      const maquinaria = await this.maquinariaService.findOne(Number(id))
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
      const maquinaria = await this.maquinariaService.findByPatente(patente)
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
      const maquinaria = await this.maquinariaService.update(Number(id), req.body)
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

  obtenerPorGrupo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { grupo } = req.params
      const maquinarias = await this.maquinariaService.obtenerMaquinariaPorGrupo(grupo)
      res.status(200).json({
        success: true,
        data: maquinarias,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener maquinarias por grupo",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  actualizarKilometraje = async (req: Request, res: Response): Promise<void> => {
    try {
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
}
