import React, { useState } from "react"
import { Table, Button, Spinner } from "react-bootstrap"
import type { InventoryEntry } from "@/types/inventory/inventory.types"
import type { Product } from "@/types/inventory/product.types"
import type { Supplier } from "@/types/stakeholders/supplier.types"

interface InventoryHistoryTableProps {
  entries: InventoryEntry[]
  products: Product[]
  suppliers: Supplier[]
  isLoading: boolean
  onViewDetails: (entry: InventoryEntry) => void
  onDeleteEntry: (entry: InventoryEntry) => void
}

const InventoryHistoryTable: React.FC<InventoryHistoryTableProps> = ({
  entries,
  products,
  suppliers,
  isLoading,
  onViewDetails,
  onDeleteEntry,
}) => {
  const [expandedEntryId, setExpandedEntryId] = useState<number | null>(null)

  const getProductNameFromDetail = (detailProduct: { id: number; product: string; salePrice: number }): string => {
    return detailProduct.product
  }

  const getSupplierName = (entrySupplier: { rut: string; name: string }): string => {
    return entrySupplier.name
  }

  const calculateEntryGrandTotal = (entry: InventoryEntry): number => {
    return entry.details.reduce((sum, detail) => sum + detail.totalPrice, 0)
  }

  const toggleDetails = (entryId: number) => {
    setExpandedEntryId(expandedEntryId === entryId ? null : entryId)
  }

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando movimientos...</span>
        </Spinner>
        <p className="mt-3 text-muted">Cargando historial de movimientos...</p>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-journal-text fs-1 text-muted mb-3 d-block"></i>
        <h5 className="text-muted">No hay movimientos de inventario registrados</h5>
        <p className="text-muted">Los movimientos de entrada y salida aparecerán aquí.</p>
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <Table hover className="inventory-history-table">
        {" "}
        {/* Added class for main table */}
        <thead className="table-light">
          <tr>
            <th>Tipo de Movimiento</th>
            <th>Fecha</th>
            <th>Proveedor/Cliente</th>
            <th>Total</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <React.Fragment key={entry.id}>
              <tr>
                <td>
                  <span className="badge bg-success">Entrada (Compra)</span>
                </td>
                <td>{new Date(entry.entryDate || "").toLocaleDateString()}</td>
                <td>{getSupplierName(entry.supplier)}</td>
                <td>
                  <span className="fw-bold text-success">${calculateEntryGrandTotal(entry).toLocaleString()}</span>
                </td>
                <td className="text-center">
                  <div className="btn-group">
                    <Button
                      variant="outline-info"
                      size="sm"
                      className="me-2"
                      onClick={() => toggleDetails(entry.id)}
                      title={expandedEntryId === entry.id ? "Ocultar detalles" : "Ver detalles"}
                    >
                      <i className={`bi ${expandedEntryId === entry.id ? "bi-eye-slash" : "bi-eye"}`}></i>
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => onDeleteEntry(entry)}
                      title="Eliminar movimiento"
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                </td>
              </tr>
              {expandedEntryId === entry.id && (
                <tr>
                  <td colSpan={5} className="p-0">
                    <div className="bg-light p-3 border-top">
                      <Table striped bordered size="sm" className="mb-0 inventory-history-subtable">
                        {" "}
                        {/* Added class for subtable */}
                        <thead>
                          <tr>
                            <th>Producto</th>
                            <th>Cantidad (m³)</th>
                            <th>Precio Compra (m³)</th>
                            <th>Total por Producto</th>
                          </tr>
                        </thead>
                        <tbody>
                          {entry.details.map((detail) => (
                            <tr key={detail.id}>
                              <td>{getProductNameFromDetail(detail.product)}</td>
                              <td>{detail.quantity}</td>
                              <td>${detail.purchasePrice.toLocaleString()}</td>
                              <td>${detail.totalPrice.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </Table>
    </div>
  )
}

export default InventoryHistoryTable