import React, { useState, useMemo } from "react"
import { Table, Button, Spinner, Card } from "react-bootstrap"
import type { InventoryEntry } from "@/types/inventory/inventory.types"
import type { Product } from "@/types/inventory/product.types"
import type { Supplier } from "@/types/stakeholders/supplier.types"
import type { InventoryExit, MovementDetail } from "@/types/inventory/inventory.types"

interface InventoryHistoryTableProps {
  entries: InventoryEntry[]
  exits: InventoryExit[]
  products: Product[]
  suppliers: Supplier[]
  isLoading: boolean
  onViewDetails: (entry: InventoryEntry) => void
  onDeleteEntry: (entry: InventoryEntry) => void
  onDeleteExit: (exit: InventoryExit) => void
  allEntriesCount: number
}

const InventoryHistoryTable: React.FC<InventoryHistoryTableProps> = ({
  entries,
  exits,
  products,
  suppliers,
  isLoading,
  onViewDetails,
  onDeleteEntry,
  onDeleteExit,
  allEntriesCount,
}) => {
  const [expandedMovementKey, setExpandedMovementKey] = useState<string | null>(null)


  const getProductNameFromDetail = (detailProduct: { id: number; product: string; salePrice: number }): string => {
    return detailProduct.product
  }

  const getPartyName = (party: { rut: string; name: string }): string => {
    return party.name
  }

  const calculateMovementGrandTotal = (movement: InventoryEntry | InventoryExit): number => {
    const details = movement.details as MovementDetail[]
    return details.reduce((sum, detail) => sum + detail.totalPrice, 0)
  }

  const toggleDetails = (movementId: number, type: "entry" | "exit") => {
    const key = `${type}-${movementId}`
    setExpandedMovementKey(expandedMovementKey === key ? null : key)
  }


  const combinedMovements = useMemo(() => {
    const allMovements = [
      ...entries.map((e) => ({ ...e, type: "entry" as const })),
      ...exits.map((x) => ({ ...x, type: "exit" as const })),
    ]
    return allMovements.sort((a, b) => {
      const dateA = a.type === "entry" ? a.entryDate : a.exitDate
      const dateB = b.type === "entry" ? b.entryDate : b.exitDate
      return new Date(dateB!).getTime() - new Date(dateA!).getTime()
    })
  }, [entries, exits])

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

  return (
    <Card className="shadow-sm">
      <Card.Body>
        {combinedMovements.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-journal-text fs-1 text-muted mb-3 d-block"></i>
            <h5 className="text-muted">No hay movimientos de inventario registrados</h5>
            <p className="text-muted">Los movimientos de entrada y salida aparecerán aquí.</p>
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">
                <i className="bi bi-list-ul me-2"></i>
                Movimientos Registrados ({combinedMovements.length} de {allEntriesCount})
              </h6>
            </div>
            <div className="table-responsive">
              <Table hover>
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
                  {combinedMovements.map((movement) => (
                    <React.Fragment key={`${movement.type}-${movement.id}`}>
                      <tr>
                        <td>
                          {movement.type === "entry" ? (
                            <span className="badge bg-secondary">Entrada (Compra)</span>
                          ) : (
                            <span className="badge bg-success">Salida (Venta)</span>
                          )}
                        </td>
                        <td>
                          {new Date(
                            movement.type === "entry" ? movement.entryDate! : movement.exitDate!,
                          ).toLocaleDateString()}
                        </td>
                        <td>
                          {movement.type === "entry"
                            ? getPartyName(movement.supplier)
                            : getPartyName(movement.customer)}
                        </td>
                        <td>
                          <span className={`fw-bold ${movement.type === "entry" ? "text-secondary" : "text-success"}`}>
                            ${calculateMovementGrandTotal(movement).toLocaleString()}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="btn-group">
                            <Button
                              variant="outline-info"
                              size="sm"
                              className="me-2"
                              onClick={() => toggleDetails(movement.id, movement.type)}
                              title={expandedMovementKey === `${movement.type}-${movement.id}` ? "Ocultar detalles" : "Ver detalles"}
                            >
                              <i className={`bi ${expandedMovementKey === `${movement.type}-${movement.id}` ? "bi-eye-slash" : "bi-eye"}`}></i>
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() =>
                                movement.type === "entry"
                                  ? onDeleteEntry(movement as InventoryEntry)
                                  : onDeleteExit(movement as InventoryExit)
                              }
                              title="Eliminar movimiento"
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {expandedMovementKey === `${movement.type}-${movement.id}` && (
                        <tr>
                          <td colSpan={5} className="p-0">
                            <div className="bg-light p-3 border-top">
                              <h6 className="mb-3">

                              </h6>
                              <Table striped bordered size="sm" className="mb-0">
                                <thead>
                                  <tr>
                                    <th>Producto</th>
                                    <th>Cantidad (m³)</th>
                                    <th>{movement.type === "entry" ? "Precio Compra (m³)" : "Precio Venta (m³)"}</th>
                                    <th>Total por Producto</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {movement.details.map((detail) => (
                                    <tr key={detail.id}>
                                      <td>{getProductNameFromDetail(detail.product)}</td>
                                      <td>{detail.quantity}</td>
                                      <td>
                                        $
                                        {(movement.type === "entry"
                                          ? (detail as any).purchasePrice
                                          : (detail as any).salePrice
                                        ) 
                                          ?.toLocaleString()}
                                      </td>
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
          </>
        )}
      </Card.Body>
    </Card>
  )
}

export default InventoryHistoryTable