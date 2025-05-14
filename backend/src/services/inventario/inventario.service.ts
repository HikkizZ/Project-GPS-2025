import type { Repository } from "typeorm"
import { Inventario } from "../../entity/inventario/inventario.entity.js"
import { AppDataSource } from "../../config/configDB.js"

export class InventarioService {
  private inventarioRepository: Repository<Inventario>

  constructor() {
    this.inventarioRepository = AppDataSource.getRepository(Inventario)
  }

  async create(inventarioData: Partial<Inventario>): Promise<Inventario> {
    const nuevoProducto = this.inventarioRepository.create({
      ...inventarioData,
      cantidadDisponible: inventarioData.cantidadDisponible || 0,
    })

    return this.inventarioRepository.save(nuevoProducto)
  }

  async findAll(): Promise<Inventario[]> {
    return this.inventarioRepository.find()
  }

  async findOne(id: number): Promise<Inventario> {
    const producto = await this.inventarioRepository.findOne({
      where: { id },
      relations: ["entradas", "ventas"],
    })

    if (!producto) {
      throw new Error(`Producto con ID ${id} no encontrado`)
    }

    return producto
  }

  async update(id: number, inventarioData: Partial<Inventario>): Promise<Inventario> {
    const producto = await this.findOne(id)

    this.inventarioRepository.merge(producto, inventarioData)
    return this.inventarioRepository.save(producto)
  }

  async remove(id: number): Promise<void> {
    const producto = await this.findOne(id)
    await this.inventarioRepository.remove(producto)
  }

  async actualizarCantidad(id: number, cantidad: number): Promise<Inventario> {
    const producto = await this.findOne(id)

    // Actualizar la cantidad disponible
    producto.cantidadDisponible += cantidad

    // Validar que la cantidad no sea negativa
    if (producto.cantidadDisponible < 0) {
      throw new Error(`No hay suficiente stock disponible para el producto ${producto.nombreProducto}`)
    }

    return this.inventarioRepository.save(producto)
  }

  async buscarPorNombre(nombre: string): Promise<Inventario[]> {
    return this.inventarioRepository.find({
      where: {
        nombreProducto: nombre,
      },
    })
  }

  async obtenerProductosBajoStock(limite = 10): Promise<Inventario[]> {
    return this.inventarioRepository.find({
      where: {
        cantidadDisponible: {
          // Usando el operador LessThanOrEqual de TypeORM
          $lte: limite,
        } as any,
      },
      order: {
        cantidadDisponible: "ASC",
      },
    })
  }
}
