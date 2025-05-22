import type { Request, Response, NextFunction } from "express"
import { MaquinariaService } from "../../services/maquinaria/maquinaria.service.js"
import { validationResult } from "express-validator"

export class MaquinariaController {
  private maquinariaService: MaquinariaService

  constructor() {
    this.maquinariaService = new MaquinariaService()
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Verificar errores de validación
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
      }

      const nuevaMaquinaria = await this.maquinariaService.create(req.body)
      res.status(201).json({
        message: "Maquinaria creada exitosamente",
        data: nuevaMaquinaria,
      })
    } catch (error: any) {
      res.status(400).json({
        message: error.message || "Error al crear la maquinaria",
      })
    }
  }

  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const maquinarias = await this.maquinariaService.findAll()
      res.status(200).json({
        data: maquinarias,
      })
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Error al obtener las maquinarias",
      })
    }
  }

  findOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number.parseInt(req.params.id)
      if (isNaN(id)) {
        res.status(400).json({
          message: "El ID debe ser un número válido",
        })
        return
      }

      const maquinaria = await this.maquinariaService.findOne(id)
      res.status(200).json({
        data: maquinaria,
      })
    } catch (error: any) {
      res.status(404).json({
        message: error.message || "Error al obtener la maquinaria",
      })
    }
  }

  findByPatente = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const patente = req.params.patente
      const maquinaria = await this.maquinariaService.findByPatente(patente)
      res.status(200).json({
        data: maquinaria,
      })
    } catch (error: any) {
      res.status(404).json({
        message: error.message || "Error al obtener la maquinaria",
      })
    }
  }

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Verificar errores de validación
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
      }

      const id = Number.parseInt(req.params.id)
      if (isNaN(id)) {
        res.status(400).json({
          message: "El ID debe ser un número válido",
        })
        return
      }

      const maquinariaActualizada = await this.maquinariaService.update(id, req.body)
      res.status(200).json({
        message: "Maquinaria actualizada exitosamente",
        data: maquinariaActualizada,
      })
    } catch (error: any) {
      res.status(400).json({
        message: error.message || "Error al actualizar la maquinaria",
      })
    }
  }

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number.parseInt(req.params.id)
      if (isNaN(id)) {
        res.status(400).json({
          message: "El ID debe ser un número válido",
        })
        return
      }

      await this.maquinariaService.remove(id)
      res.status(200).json({
        message: "Maquinaria eliminada exitosamente",
      })
    } catch (error: any) {
      res.status(400).json({
        message: error.message || "Error al eliminar la maquinaria",
      })
    }
  }

  buscarPorMarca = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const marca = req.query.marca as string
      if (!marca) {
        res.status(400).json({
          message: "Debe proporcionar una marca para la búsqueda",
        })
        return
      }

      const maquinarias = await this.maquinariaService.buscarPorMarca(marca)
      res.status(200).json({
        data: maquinarias,
      })
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Error al buscar maquinarias por marca",
      })
    }
  }

  buscarPorGrupo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const grupo = req.query.grupo as string
      if (!grupo) {
        res.status(400).json({
          message: "Debe proporcionar un grupo para la búsqueda",
        })
        return
      }

      try {
        const maquinarias = await this.maquinariaService.buscarPorGrupo(grupo)
        res.status(200).json({
          data: maquinarias,
        })
      } catch (error: any) {
        res.status(400).json({
          message: error.message,
        })
      }
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Error al buscar maquinarias por grupo",
      })
    }
  }
}
