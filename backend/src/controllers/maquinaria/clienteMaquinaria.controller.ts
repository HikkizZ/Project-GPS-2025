import type { Request, Response } from "express"
import { ClienteMaquinariaService } from "../../services/maquinaria/clienteMaquinaria.service.js"
import { validationResult } from "express-validator"

export class ClienteMaquinariaController {
  private clienteMaquinariaService: ClienteMaquinariaService

  constructor() {
    this.clienteMaquinariaService = new ClienteMaquinariaService()
  }

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
      }

      const cliente = await this.clienteMaquinariaService.create(req.body)
      res.status(201).json({
        success: true,
        message: "Cliente creado exitosamente",
        data: cliente,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al crear el cliente",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  findAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const clientes = await this.clienteMaquinariaService.findAll()
      res.status(200).json({
        success: true,
        data: clientes,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener los clientes",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  findOne = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const cliente = await this.clienteMaquinariaService.findOne(Number(id))
      res.status(200).json({
        success: true,
        data: cliente,
      })
    } catch (error) {
      res.status(404).json({
        success: false,
        message: "Cliente no encontrado",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  findByRut = async (req: Request, res: Response): Promise<void> => {
    try {
      const { rut } = req.params
      const cliente = await this.clienteMaquinariaService.findByRut(rut)
      res.status(200).json({
        success: true,
        data: cliente,
      })
    } catch (error) {
      res.status(404).json({
        success: false,
        message: "Cliente no encontrado",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const cliente = await this.clienteMaquinariaService.update(Number(id), req.body)
      res.status(200).json({
        success: true,
        message: "Cliente actualizado exitosamente",
        data: cliente,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar el cliente",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  remove = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      await this.clienteMaquinariaService.remove(Number(id))
      res.status(200).json({
        success: true,
        message: "Cliente eliminado exitosamente",
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar el cliente",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  searchByName = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nombre } = req.query
      const clientes = await this.clienteMaquinariaService.searchByName(nombre as string)
      res.status(200).json({
        success: true,
        data: clientes,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al buscar clientes",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }
}
