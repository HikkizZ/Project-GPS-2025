import type { Request, Response } from "express"
import type { ConductorService } from "../../services/maquinaria/conductor.service.js"

export class ConductorController {
  constructor(private conductorService: ConductorService) {}

  async crear(req: Request, res: Response): Promise<void> {
    try {
      const conductor = await this.conductorService.crear(req.body)
      res.status(201).json({
        success: true,
        message: "Conductor creado exitosamente",
        data: conductor,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Error al crear conductor",
      })
    }
  }

  async obtenerTodos(req: Request, res: Response): Promise<void> {
    try {
      const conductores = await this.conductorService.obtenerTodos()
      res.json({
        success: true,
        data: conductores,
        total: conductores.length,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Error al obtener conductores",
      })
    }
  }

  async obtenerPorId(req: Request, res: Response): Promise<void> {
    try {
      const id = Number.parseInt(req.params.id)
      const conductor = await this.conductorService.obtenerPorId(id)

      if (!conductor) {
        res.status(404).json({
          success: false,
          message: "Conductor no encontrado",
        })
        return
      }

      res.json({
        success: true,
        data: conductor,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Error al obtener conductor",
      })
    }
  }

  async obtenerPorRut(req: Request, res: Response): Promise<void> {
    try {
      const { rut } = req.params
      const conductor = await this.conductorService.obtenerPorRut(rut)

      if (!conductor) {
        res.status(404).json({
          success: false,
          message: "Conductor no encontrado",
        })
        return
      }

      res.json({
        success: true,
        data: conductor,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Error al obtener conductor",
      })
    }
  }

  async actualizar(req: Request, res: Response): Promise<void> {
    try {
      const id = Number.parseInt(req.params.id)
      const conductor = await this.conductorService.actualizar(id, req.body)

      res.json({
        success: true,
        message: "Conductor actualizado exitosamente",
        data: conductor,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Error al actualizar conductor",
      })
    }
  }

  async eliminar(req: Request, res: Response): Promise<void> {
    try {
      const id = Number.parseInt(req.params.id)
      await this.conductorService.eliminar(id)

      res.json({
        success: true,
        message: "Conductor eliminado exitosamente",
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Error al eliminar conductor",
      })
    }
  }

  async buscar(req: Request, res: Response): Promise<void> {
    try {
      const criterios = req.query
      const conductores = await this.conductorService.buscar(criterios)

      res.json({
        success: true,
        data: conductores,
        total: conductores.length,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Error al buscar conductores",
      })
    }
  }

  async asignarMaquinaria(req: Request, res: Response): Promise<void> {
    try {
      const conductorId = Number.parseInt(req.params.id)
      const { maquinariaId } = req.body
      const conductor = await this.conductorService.asignarMaquinaria(conductorId, maquinariaId)

      res.json({
        success: true,
        message: "Maquinaria asignada exitosamente",
        data: conductor,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Error al asignar maquinaria",
      })
    }
  }

  async desasignarMaquinaria(req: Request, res: Response): Promise<void> {
    try {
      const conductorId = Number.parseInt(req.params.id)
      const { maquinariaId } = req.body
      const conductor = await this.conductorService.desasignarMaquinaria(conductorId, maquinariaId)

      res.json({
        success: true,
        message: "Maquinaria desasignada exitosamente",
        data: conductor,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Error al desasignar maquinaria",
      })
    }
  }

  async obtenerEstadisticas(req: Request, res: Response): Promise<void> {
    try {
      const estadisticas = await this.conductorService.obtenerEstadisticas()

      res.json({
        success: true,
        data: estadisticas,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Error al obtener estadísticas",
      })
    }
  }
}