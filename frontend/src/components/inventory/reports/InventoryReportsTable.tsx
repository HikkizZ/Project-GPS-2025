import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { Table, Button, Spinner, Card, Form, Pagination, Row, Col } from "react-bootstrap"
import type { InventoryEntry } from "@/types/inventory/inventory.types"
import type { Product } from "@/types/inventory/product.types"
import type { Supplier } from "@/types/stakeholders/supplier.types"
import type { InventoryExit, MovementDetail } from "@/types/inventory/inventory.types"

interface MonthOption {
  value: string
  label: string
}

interface MonthMetrics {
  totalPurchases: number
  totalSales: number
  totalMovements: number
  netBalance: number
  purchaseCount: number
  saleCount: number
}

interface ReportsTableProps {
  entries: InventoryEntry[]
  exits: InventoryExit[]
  products: Product[]
  suppliers: Supplier[]
  isLoading: boolean
  availableMonths?: MonthOption[]
  selectedMonth?: string
  onMonthChange?: (month: string) => void
  movementFilter?: "all" | "entry" | "exit"
  onMovementFilterChange?: (filter: "all" | "entry" | "exit") => void
  monthMetrics?: MonthMetrics
  tableId?: string
  exportMode?: boolean
}

type SortOrder = "newest" | "oldest"

const ITEMS_PER_PAGE = 20

const ReportsTable: React.FC<ReportsTableProps> = ({
  entries,
  exits,
  products,
  suppliers,
  isLoading,
  availableMonths = [],
  selectedMonth = "",
  onMonthChange,
  movementFilter = "all",
  onMovementFilterChange,
  monthMetrics,
  tableId = "reports-table",
  exportMode = false,
}) => {
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

  const totalPages = exportMode ? 1 : Math.ceil(filteredAndSortedMovements.length / ITEMS_PER_PAGE)

  const startIndex = exportMode ? 0 : (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = exportMode ? filteredAndSortedMovements.length : startIndex + ITEMS_PER_PAGE

  const currentMovements = filteredAndSortedMovements.slice(startIndex, endIndex)

  useEffect(() => {
    if (!exportMode) {
      setCurrentPage(1)
    }
  }, [movementFilter, sortOrder, selectedMonth, exportMode])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
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

  if (isLoading && !exportMode) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando reportes...</span>
        </Spinner>
        <p className="mt-3 text-muted">Cargando datos de reportes...</p>
      </div>
    )
  }

  return (
    <div
      style={{
        width: exportMode ? "1200px" : "auto",
        overflow: "visible",
        display: exportMode ? "block" : "unset",
      }}
    >
      <Card
        id={tableId}
        className={!exportMode ? "shadow-sm" : ""}
        style={exportMode ? { border: "none", boxShadow: "none", borderRadius: 0 } : undefined}
      >
        <Card.Body>
          {/* Título para el PDF */}
          <div className={exportMode ? "mb-4 text-center" : "d-none d-print-block mb-4 text-center"}>
            <h2>Reporte de Inventario</h2>
            {selectedMonth && (
              <h4 className="text-muted">
                {availableMonths.find((m) => m.value === selectedMonth)?.label || selectedMonth}
              </h4>
            )}
            <p className="text-muted">Generado el {new Date().toLocaleDateString("es-ES")}</p>
            {monthMetrics && (
              <div className="row mt-4">
                <div className="col-3 text-center">
                  <h5>Total Movimientos</h5>
                  <p className="h4 text-info">{monthMetrics.totalMovements}</p>
                </div>
                <div className="col-3 text-center">
                  <h5>Total Compras</h5>
                  <p className="h4 text-secondary">${monthMetrics.totalPurchases.toLocaleString("es-ES")}</p>
                </div>
                <div className="col-3 text-center">
                  <h5>Total Ventas</h5>
                  <p className="h4 text-success">${monthMetrics.totalSales.toLocaleString("es-ES")}</p>
                </div>
                <div className="col-3 text-center">
                  <h5>Balance Neto</h5>
                  <p className={`h4 ${monthMetrics.netBalance >= 0 ? "text-success" : "text-danger"}`}>
                    ${Math.abs(monthMetrics.netBalance).toLocaleString("es-ES")}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Controles de filtro - ocultos en modo exportación */}
          {!exportMode && (
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Seleccionar Mes</Form.Label>
                  <Form.Select value={selectedMonth} onChange={(e) => onMonthChange?.(e.target.value)}>
                    <option value="">Selecciona un mes...</option>
                    {availableMonths.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Tipo de Movimiento</Form.Label>
                  <Form.Select
                    value={movementFilter}
                    onChange={(e) => onMovementFilterChange?.(e.target.value as "all" | "entry" | "exit")}
                    disabled={!selectedMonth}
                  >
                    <option value="all">Todos</option>
                    <option value="entry">Compras</option>
                    <option value="exit">Ventas</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Ordenar por</Form.Label>
                  <Form.Select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                    disabled={!selectedMonth}
                  >
                    <option value="newest">Más reciente</option>
                    <option value="oldest">Más antiguo</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                {selectedMonth && (
                  <Button variant="outline-secondary" onClick={() => onMonthChange?.("")} className="w-100">
                    <i className="bi bi-x-circle me-1"></i>
                    Limpiar
                  </Button>
                )}
              </Col>
            </Row>
          )}

          {!selectedMonth && !exportMode ? (
            <div className="text-center py-5">
              <i className="bi bi-calendar-month fs-1 text-muted mb-3 d-block"></i>
              <h5 className="text-muted">Selecciona un mes para ver el reporte</h5>
              <p className="text-muted">
                Elige un mes de la lista desplegable para visualizar los movimientos de inventario.
              </p>
            </div>
          ) : filteredAndSortedMovements.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-journal-text fs-1 text-muted mb-3 d-block"></i>
              <h5 className="text-muted">No hay movimientos en el período seleccionado</h5>
              <p className="text-muted">
                {movementFilter === "all"
                  ? "No se encontraron movimientos para este mes."
                  : movementFilter === "entry"
                    ? "No se encontraron compras para este mes."
                    : "No se encontraron ventas para este mes."}
              </p>
            </div>
          ) : (
            <>
              {/* Información de paginación - oculta en modo exportación */}
              {!exportMode && (
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <small className="text-muted">
                    Mostrando {startIndex + 1} - {Math.min(endIndex, filteredAndSortedMovements.length)} de{" "}
                    {filteredAndSortedMovements.length} movimientos
                  </small>
                  <small className="text-muted">
                    Página {currentPage} de {totalPages}
                  </small>
                </div>
              )}

              <div className={exportMode ? "" : "table-responsive"}>
                <Table hover size={exportMode ? "sm" : undefined}>
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: exportMode ? "150px" : "auto" }}>Fecha</th>
                      <th style={{ width: exportMode ? "150px" : "auto" }}>Tipo</th>
                      <th style={{ width: exportMode ? "250px" : "auto" }}>Proveedor/Cliente</th>
                      <th style={{ width: exportMode ? "200px" : "auto" }}>Productos</th>
                      <th style={{ width: exportMode ? "120px" : "auto" }}>Cantidad Total</th>
                      <th style={{ width: exportMode ? "150px" : "auto" }}>Monto Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentMovements.map((movement) => (
                      <tr key={`${movement.type}-${movement.id}`}>
                        <td>
                          <div>
                            <div>
                              {new Date(movement.displayDate!).toLocaleDateString("es-ES", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
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
                          <div className="d-flex align-items-center">
                            {movement.type === "entry" ? (
                              <>
                                <span className="badge bg-secondary me-2">Compra</span>
                                {!exportMode && <i className="bi bi-arrow-down-circle text-secondary"></i>}
                              </>
                            ) : (
                              <>
                                <span className="badge bg-success me-2">Venta</span>
                                {!exportMode && <i className="bi bi-arrow-up-circle text-success"></i>}
                              </>
                            )}
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
                          <div>
                            {movement.details.slice(0, 2).map((detail, index) => (
                              <div key={detail.id}>
                                <small className="text-muted">{getProductNameFromDetail(detail.product)}</small>
                              </div>
                            ))}
                            {movement.details.length > 2 && (
                              <small className="text-muted">+{movement.details.length - 2} más...</small>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark">
                            {(movement.details as MovementDetail[]).reduce((sum, detail) => sum + detail.quantity, 0)} m³
                          </span>
                        </td>
                        <td>
                          <span className={`fw-bold ${movement.type === "entry" ? "text-secondary" : "text-success"}`}>
                            $ {calculateMovementGrandTotal(movement).toLocaleString("es-ES")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Controles de paginación - ocultos en modo exportación */}
              {!exportMode && totalPages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                  <Pagination>
                    <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                    <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                    {renderPaginationItems()}
                    <Pagination.Next
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    />
                    <Pagination.Last
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}

export default ReportsTable