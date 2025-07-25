import React, { useState, useMemo, useEffect } from "react"
import { Table, Button, Spinner, Card, Form, Pagination } from "react-bootstrap"
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

type MovementFilter = "all" | "entry" | "exit"
type SortOrder = "newest" | "oldest"

const ITEMS_PER_PAGE = 10

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
  const [movementFilter, setMovementFilter] = useState<MovementFilter>("all")
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest")
  const [currentPage, setCurrentPage] = useState(1)

  const getProductNameFromDetail = (detailProduct: {
    id: number
    product: string
    salePrice: number
  }): string => {
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

  const filteredAndSortedMovements = useMemo(() => {
    const allMovements = [
      ...entries.map((e) => ({
        ...e,
        type: "entry" as const,
        sortDate: (e as any).createdAt || e.entryDate,
        displayDate: e.entryDate,
      })),
      ...exits.map((x) => ({
        ...x,
        type: "exit" as const,
        sortDate: (x as any).createdAt || x.exitDate,
        displayDate: x.exitDate,
      })),
    ]

    const filteredMovements = allMovements.filter((movement) => {
      if (movementFilter === "all") return true
      return movement.type === movementFilter
    })

    return filteredMovements.sort((a, b) => {
      const dateA = new Date(a.sortDate!)
      const dateB = new Date(b.sortDate!)

      if (dateA.getTime() === dateB.getTime()) {
        return sortOrder === "newest" ? b.id - a.id : a.id - b.id
      }

      return sortOrder === "newest" ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime()
    })
  }, [entries, exits, movementFilter, sortOrder])

  const totalPages = Math.ceil(filteredAndSortedMovements.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentMovements = filteredAndSortedMovements.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [movementFilter, sortOrder])

  const getFilteredCount = () => {
    return filteredAndSortedMovements.length
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setExpandedMovementKey(null)
  }

  const renderPaginationItems = () => {
    const items = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <Pagination.Item key={i} active={i === currentPage} onClick={() => handlePageChange(i)}>
            {i}
          </Pagination.Item>,
        )
      }
    } else {
      const startPage = Math.max(1, currentPage - 2)
      const endPage = Math.min(totalPages, currentPage + 2)

      if (startPage > 1) {
        items.push(
          <Pagination.Item key={1} onClick={() => handlePageChange(1)}>
            1
          </Pagination.Item>,
        )
        if (startPage > 2) {
          items.push(<Pagination.Ellipsis key="start-ellipsis" />)
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <Pagination.Item key={i} active={i === currentPage} onClick={() => handlePageChange(i)}>
            {i}
          </Pagination.Item>,
        )
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          items.push(<Pagination.Ellipsis key="end-ellipsis" />)
        }
        items.push(
          <Pagination.Item key={totalPages} onClick={() => handlePageChange(totalPages)}>
            {totalPages}
          </Pagination.Item>,
        )
      }
    }

    return items
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

  return (
    <Card className="shadow-sm">
      <Card.Body>
        {/* Controles de filtro y ordenamiento */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0">
            <i className="bi bi-list-ul me-2"></i>
            {movementFilter === "all" && "Movimientos Registrados"}
            {movementFilter === "entry" && "Compras Registradas"}
            {movementFilter === "exit" && "Ventas Registradas"} ({getFilteredCount()} de {allEntriesCount})
          </h6>

          <div className="d-flex align-items-center gap-2">
            <Form.Select
              size="sm"
              value={movementFilter}
              onChange={(e) => setMovementFilter(e.target.value as MovementFilter)}
              style={{ width: "180px" }}
            >
              <option value="all">Todos</option>
              <option value="entry">Compras</option>
              <option value="exit">Ventas</option>
            </Form.Select>

            <Form.Select
              size="sm"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              style={{ width: "160px" }}
            >
              <option value="newest">Más reciente</option>
              <option value="oldest">Más antiguo</option>
            </Form.Select>

            {movementFilter !== "all" && (
              <Button variant="outline-secondary" size="sm" onClick={() => setMovementFilter("all")}>
                <i className="bi bi-x-circle"></i>
              </Button>
            )}
          </div>
        </div>

        {filteredAndSortedMovements.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-journal-text fs-1 text-muted mb-3 d-block"></i>
            <h5 className="text-muted">
              {movementFilter === "all"
                ? "No hay movimientos de inventario registrados"
                : movementFilter === "entry"
                  ? "No hay compras registradas"
                  : "No hay ventas registradas"}
            </h5>
            <p className="text-muted">
              {movementFilter === "all"
                ? "Los movimientos de compra y venta aparecerán aquí."
                : movementFilter === "entry"
                  ? "Las compras realizadas aparecerán aquí."
                  : "Las ventas realizadas aparecerán aquí."}
            </p>
          </div>
        ) : (
          <>
            {/* Información de paginación */}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <small className="text-muted">
                Mostrando {startIndex + 1} - {Math.min(endIndex, filteredAndSortedMovements.length)} de{" "}
                {filteredAndSortedMovements.length} movimientos
              </small>
              <small className="text-muted">
                Página {currentPage} de {totalPages}
              </small>
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
                  {currentMovements.map((movement, index) => (
                    <React.Fragment key={`${movement.type}-${movement.id}`}>
                      <tr>
                        <td>
                          <div className="d-flex align-items-center">
                            {movement.type === "entry" ? (
                              <>
                                <span className="badge bg-secondary me-2">Compra (Entrada)</span>
                                <i className="bi bi-arrow-down-circle text-secondary"></i>
                              </>
                            ) : (
                              <>
                                <span className="badge bg-success me-2">Venta (Salida)</span>
                                <i className="bi bi-arrow-up-circle text-success"></i>
                              </>
                            )}
                          </div>
                        </td>
                        <td>
                          <div>
                            <div>
                              {new Date(movement.displayDate!).toLocaleDateString("es-ES", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                            <small className="text-muted">
                              {new Date(movement.displayDate!).toLocaleTimeString("es-ES", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div className="fw-medium">
                              {movement.type === "entry"
                                ? getPartyName(movement.supplier)
                                : getPartyName(movement.customer)}
                            </div>
                            <small className="text-muted">{movement.type === "entry" ? "Proveedor" : "Cliente"}</small>
                          </div>
                        </td>
                        <td>
                          <span className={`fw-bold ${movement.type === "entry" ? "text-secondary" : "text-success"}`}>
                            $ {calculateMovementGrandTotal(movement).toLocaleString("es-ES")}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="btn-group">
                            <Button
                              variant="outline-info"
                              size="sm"
                              className="me-2"
                              onClick={() => toggleDetails(movement.id, movement.type)}
                              title={
                                expandedMovementKey === `${movement.type}-${movement.id}`
                                  ? "Ocultar detalles"
                                  : "Ver detalles"
                              }
                            >
                              <i
                                className={`bi ${
                                  expandedMovementKey === `${movement.type}-${movement.id}` ? "bi-eye-slash" : "bi-eye"
                                }`}
                              ></i>
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
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="mb-0">
                                  <i className="bi bi-list-check me-2"></i>
                                  Detalles del {movement.type === "entry" ? "Compra" : "Venta"}
                                </h6>
                              </div>
                              <Table striped bordered size="sm" className="mb-0 inventory-history-subtable">
                                <thead>
                                  <tr>
                                    <th>Producto</th>
                                    <th>Cantidad (m³)</th>
                                    <th>{movement.type === "entry" ? "Precio Compra (m³)" : "Precio Venta (m³)"}</th>
                                    <th>Total por Producto</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {movement.details.map((detail, detailIndex) => (
                                    <tr key={detail.id}>
                                      <td>
                                        <div className="d-flex align-items-center">
                                          <i className="bi bi-box me-2 text-muted"></i>
                                          {getProductNameFromDetail(detail.product)}
                                        </div>
                                      </td>
                                      <td>
                                        <span className="badge bg-light text-dark">{detail.quantity} m³</span>
                                      </td>
                                      <td>
                                        <span className="fw-medium">
                                          ${" "}
                                          {(movement.type === "entry"
                                            ? (detail as any).purchasePrice
                                            : (detail as any).salePrice
                                          )?.toLocaleString("es-ES")}
                                        </span>
                                      </td>
                                      <td>
                                        <span
                                          className={`fw-bold ${
                                            movement.type === "entry" ? "text-secondary" : "text-success"
                                          }`}
                                        >
                                          $ {detail.totalPrice.toLocaleString("es-ES")}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot>
                                  <tr className="table-active">
                                    <th colSpan={3} className="text-end">
                                      Total General:
                                    </th>
                                    <th>
                                      <span
                                        className={`fw-bold ${
                                          movement.type === "entry" ? "text-secondary" : "text-success"
                                        }`}
                                      >
                                        $ {calculateMovementGrandTotal(movement).toLocaleString("es-ES")}
                                      </span>
                                    </th>
                                  </tr>
                                </tfoot>
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

            {/* Controles de paginación */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-3">
                <Pagination>
                  <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                  <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                  {renderPaginationItems()}
                  <Pagination.Next
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                  <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
                </Pagination>
              </div>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  )
}

export default InventoryHistoryTable