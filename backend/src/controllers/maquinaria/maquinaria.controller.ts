import type { Request, Response } from "express"
import type { MaquinariaService } from "../../services/maquinaria/maquinaria.service.js"

export class MaquinariaController {
  constructor(private maquinariaService: MaquinariaService) {}

  async crear(req: Request, res: Response): Promise<void> {
    try {
      const maquinaria = await this.maquinariaService.crear(req.body)
      res.status(201).json({
        success: true,
        message: "Maquinaria creada exitosamente",
        data: maquinaria,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Error al crear maquinaria",
      })
    }
  }

  async obtenerTodos(req: Request, res: Response): Promise<void> {
    try {
      const maquinarias = await this.maquinariaService.obtenerTodos()
      res.json({
        success: true,
        data: maquinarias,
        total: maquinarias.length,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Error al obtener maquinarias",
      })
    }
  }

  async obtenerPorId(req: Request, res: Response): Promise<void> {
    try {
      const id = Number.parseInt(req.params.id)
      const maquinaria = await this.maquinariaService.obtenerPorId(id)

      if (!maquinaria) {
        res.status(404).json({
          success: false,
          message: "Maquinaria no encontrada",
        })
        return
      }

      res.json({
        success: true,
        data: maquinaria,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Error al obtener maquinaria",
      })
    }
  }

  async obtenerPorPatente(req: Request, res: Response): Promise<void> {
    try {
      const { patente } = req.params
      const maquinaria = await this.maquinariaService.obtenerPorPatente(patente)

      if (!maquinaria) {
        res.status(404).json({
          success: false,
          message: "Maquinaria no encontrada",
        })
        return
      }

      res.json({
        success: true,
        data: maquinaria,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Error al obtener maquinaria",
      })
    }
  }

  async actualizar(req: Request, res: Response): Promise<void> {
    try {
      const id = Number.parseInt(req.params.id)
      const maquinaria = await this.maquinariaService.actualizar(id, req.body)

      res.json({
        success: true,
        message: "Maquinaria actualizada exitosamente",
        data: maquinaria,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Error al actualizar maquinaria",
      })
    }
  }

  async eliminar(req: Request, res: Response): Promise<void> {
    try {
      const id = Number.parseInt(req.params.id)
      await this.maquinariaService.eliminar(id)

      res.json({
        success: true,
        message: "Maquinaria eliminada exitosamente",
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Error al eliminar maquinaria",
      })
    }
  }

  async buscar(req: Request, res: Response): Promise<void> {
    try {
      const criterios = req.query
      const maquinarias = await this.maquinariaService.buscar(criterios)

      res.json({
        success: true,
        data: maquinarias,
        total: maquinarias.length,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Error al buscar maquinarias",
      })
    }
  }

  async asignarConductor(req: Request, res: Response): Promise<void> {
    try {
      const maquinariaId = Number.parseInt(req.params.id)
      const { conductorId } = req.body
      const maquinaria = await this.maquinariaService.asignarConductor(maquinariaId, conductorId)

      res.json({
        success: true,
        message: "Conductor asignado exitosamente",
        data: maquinaria,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Error al asignar conductor",
      })
    }
  }

  async desasignarConductor(req: Request, res: Response): Promise<void> {
    try {
      const maquinariaId = Number.parseInt(req.params.id)
      const { conductorId } = req.body
      const maquinaria = await this.maquinariaService.desasignarConductor(maquinariaId, conductorId)

      res.json({
        success: true,
        message: "Conductor desasignado exitosamente",
        data: maquinaria,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Error al desasignar conductor",
      })
    }
  }

  async actualizarKilometraje(req: Request, res: Response): Promise<void> {
    try {
      const id = Number.parseInt(req.params.id)
      const { nuevoKilometraje } = req.body
      const maquinaria = await this.maquinariaService.actualizarKilometraje(id, nuevoKilometraje)

      res.json({
        success: true,
        message: "Kilometraje actualizado exitosamente",
        data: maquinaria,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Error al actualizar kilometraje",
      })
    }
  }

  async obtenerEstadisticas(req: Request, res: Response): Promise<void> {
    try {
      const estadisticas = await this.maquinariaService.obtenerEstadisticas()

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
