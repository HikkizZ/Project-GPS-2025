import { expect } from "chai"
import { CompraMaquinariaService } from "../../services/maquinaria/compraMaquinaria.service.js"
import { GrupoMaquinaria } from "../../types/maquinaria/maquinaria.types.js"

describe("Test aislado de CompraMaquinariaService", () => {
  const service = new CompraMaquinariaService()

  it("debería fallar si falta grupo", async () => {
    const entradaInvalida = {
      patente: "TEST123",
      marca: "TestMarca",
      modelo: "X",
      anio: 2024,
      fechaCompra: "2025-01-01",
      valorCompra: 5000000,
      avaluoFiscal: 4800000,
      numeroChasis: "CH123",
      kilometrajeInicial: 0,
    } as any

    let errorLanzado = false
    try {
      await service.registrarCompra(entradaInvalida)
    } catch {
      errorLanzado = true
    }

    expect(errorLanzado).to.be.true
  })
})
