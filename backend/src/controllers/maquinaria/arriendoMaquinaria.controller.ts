import type { Request, Response } from "express"
import { ArriendoMaquinariaService } from "../../services/maquinaria/arriendoMaquinaria.service.js"
import { validationResult } from "express-validator"

export class ArriendoMaquinariaController {
  private arriendoService: ArriendoMaquinariaService

  constructor() {
    this.arriendoService = new ArriendoMaquinariaService()
  }

  crearArriendo = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
      }

      const arriendo = await this.arriendoService.crearArriendo(req.body)
      res.status(201).json({
        success: true,
        message: "Arriendo creado exitosamente",
        data: arriendo,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al crear el arriendo",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  obtenerTodosLosArriendos = async (req: Request, res: Response): Promise<void> => {
    try {
      const arriendos = await this.arriendoService.obtenerTodosLosArriendos()
      res.status(200).json({
        success: true,
        data: arriendos,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener los arriendos",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  obtenerArriendoPorId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const arriendo = await this.arriendoService.obtenerArriendoPorId(Number(id))
      res.status(200).json({
        success: true,
        data: arriendo,
      })
    } catch (error) {
      res.status(404).json({
        success: false,
        message: "Arriendo no encontrado",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  obtenerArriendosPorFecha = async (req: Request, res: Response): Promise<void> => {
    try {
      const { fecha } = req.params
      const arriendos = await this.arriendoService.obtenerArriendosPorFecha(new Date(fecha))
      res.status(200).json({
        success: true,
        data: arriendos,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener arriendos por fecha",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  obtenerArriendosPorCliente = async (req: Request, res: Response): Promise<void> => {
    try {
      const { clienteId } = req.params
      const arriendos = await this.arriendoService.obtenerArriendosPorCliente(Number(clienteId))
      res.status(200).json({
        success: true,
        data: arriendos,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener arriendos por cliente",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  obtenerArriendosPorConductor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { conductorId } = req.params
      const arriendos = await this.arriendoService.obtenerArriendosPorConductor(Number(conductorId))
      res.status(200).json({
        success: true,
        data: arriendos,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener arriendos por conductor",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  obtenerArriendosPorMaquinaria = async (req: Request, res: Response): Promise<void> => {
    try {
      const { maquinariaId } = req.params
      const arriendos = await this.arriendoService.obtenerArriendosPorMaquinaria(Number(maquinariaId))
      res.status(200).json({
        success: true,
        data: arriendos,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener arriendos por maquinaria",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  obtenerArriendosPorObra = async (req: Request, res: Response): Promise<void> => {
    try {
      const { obra } = req.params
      const arriendos = await this.arriendoService.obtenerArriendosPorObra(obra)
      res.status(200).json({
        success: true,
        data: arriendos,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener arriendos por obra",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  finalizarArriendo = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
      }

      const { id } = req.params
      const { kilometrajeFinal } = req.body
      const arriendo = await this.arriendoService.finalizarArriendo(Number(id), kilometrajeFinal)

      res.status(200).json({
        success: true,
        message: "Arriendo finalizado exitosamente",
        data: arriendo,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al finalizar el arriendo",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  actualizarArriendo = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
      }

      const { id } = req.params
      const arriendo = await this.arriendoService.actualizarArriendo(Number(id), req.body)

      res.status(200).json({
        success: true,
        message: "Arriendo actualizado exitosamente",
        data: arriendo,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar el arriendo",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  obtenerArriendosPorRangoFecha = async (req: Request, res: Response): Promise<void> => {
    try {
      const { fechaInicio, fechaFin } = req.query
      const arriendos = await this.arriendoService.obtenerArriendosPorRangoFecha(
        new Date(fechaInicio as string),
        new Date(fechaFin as string),
      )

      res.status(200).json({
        success: true,
        data: arriendos,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener arriendos por rango de fecha",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  obtenerIngresosPorPeriodo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { fechaInicio, fechaFin } = req.query
      const ingresos = await this.arriendoService.obtenerIngresosPorPeriodo(
        new Date(fechaInicio as string),
        new Date(fechaFin as string),
      )

      res.status(200).json({
        success: true,
        data: { ingresos },
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al calcular ingresos",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  eliminarArriendo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      await this.arriendoService.eliminarArriendo(Number(id))
      res.status(200).json({
        success: true,
        message: "Arriendo eliminado exitosamente",
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar el arriendo",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }
}
