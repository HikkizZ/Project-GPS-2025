import type React from "react"
import { Container, Row, Col, Card, Button } from "react-bootstrap"
import InventorySidebar from "@/components/inventory/layout/InventorySidebar"
import ReportsTable from "@/components/inventory/reports/InventoryReportsTable"
import { useProducts } from "@/hooks/inventory/useProducts"
import { useSuppliers } from "@/hooks/stakeholders/useSuppliers"
import { useInventoryEntries } from "@/hooks/inventory/useInventoryEntry"
import { useInventoryExits } from "@/hooks/inventory/useInventoryExit"
import { useToast, Toast } from "@/components/common/Toast"
import { usePdfExport } from "@/hooks/usePdfExport"
import { useExcelExport } from "@/hooks/useExcelExport"
import { useMemo, useState, useCallback } from "react"
import "../../styles/pages/inventory.css"

export const ReportsPage: React.FC = () => {
  const { products, isLoading: isLoadingProducts } = useProducts()
  const { suppliers, isLoading: isLoadingSuppliers } = useSuppliers()
  const { entries, isLoadingEntries } = useInventoryEntries()
  const { exits, isLoadingExits } = useInventoryExits()
  const { toasts, removeToast, showSuccess, showError } = useToast()
  const { exportToPdf, isExporting: isExportingPdf } = usePdfExport()
  const { exportToExcel, exportMultipleSheets, isExporting: isExportingExcel } = useExcelExport()

  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [movementFilter, setMovementFilter] = useState<"all" | "entry" | "exit">("all")

  const availableMonths = useMemo(() => {
    const allMovements = [
      ...entries.map((e) => ({ date: e.entryDate, type: "entry" })),
      ...exits.map((x) => ({ date: x.exitDate, type: "exit" })),
    ]

    const monthsSet = new Set<string>()

    allMovements.forEach((movement) => {
      if (movement.date) {
        const date = new Date(movement.date)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        monthsSet.add(monthKey)
      }
    })

    const monthsArray = Array.from(monthsSet).sort((a, b) => b.localeCompare(a))

    return monthsArray.map((monthKey) => {
      const [year, month] = monthKey.split("-")
      const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
      return {
        value: monthKey,
        label: date
          .toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
          })
          .replace(/^\w/, (c) => c.toUpperCase()),
      }
    })
  }, [entries, exits])

  const filteredMovements = useMemo(() => {
    if (!selectedMonth) return { entries: [], exits: [] }

    const [year, month] = selectedMonth.split("-").map(Number)

    const filteredEntries = entries.filter((entry) => {
      if (!entry.entryDate) return false
      const entryDate = new Date(entry.entryDate)
      return entryDate.getFullYear() === year && entryDate.getMonth() === month - 1
    })

    const filteredExits = exits.filter((exit) => {
      if (!exit.exitDate) return false
      const exitDate = new Date(exit.exitDate)
      return exitDate.getFullYear() === year && exitDate.getMonth() === month - 1
    })

    return { entries: filteredEntries, exits: filteredExits }
  }, [entries, exits, selectedMonth])

  const monthMetrics = useMemo(() => {
    const { entries: monthEntries, exits: monthExits } = filteredMovements

    const totalPurchases = monthEntries.reduce(
      (sum, entry) => sum + entry.details.reduce((detailSum, detail) => detailSum + detail.totalPrice, 0),
      0,
    )

    const totalSales = monthExits.reduce(
      (sum, exit) => sum + exit.details.reduce((detailSum, detail) => detailSum + detail.totalPrice, 0),
      0,
    )

    const totalMovements = monthEntries.length + monthExits.length
    const netBalance = totalSales - totalPurchases

    return {
      totalPurchases,
      totalSales,
      totalMovements,
      netBalance,
      purchaseCount: monthEntries.length,
      saleCount: monthExits.length,
    }
  }, [filteredMovements])

  const handleExportToPdf = useCallback(async () => {
    if (!selectedMonth) {
      showError("Selecciona un mes", "Debes seleccionar un mes para exportar el reporte.")
      return
    }

    const tempDiv = document.createElement("div")
    tempDiv.id = "temp-reports-export"
    tempDiv.style.position = "absolute"
    tempDiv.style.left = "-9999px"
    tempDiv.style.top = "0"
    tempDiv.style.width = "1200px"
    tempDiv.style.backgroundColor = "white"
    tempDiv.style.padding = "20px"
    document.body.appendChild(tempDiv)

    try {
      const { createRoot } = await import("react-dom/client")
      const root = createRoot(tempDiv)
      const React = await import("react")

      const selectedMonthLabel = availableMonths.find((m) => m.value === selectedMonth)?.label || selectedMonth

      const ExportTable = React.createElement(ReportsTable, {
        entries: filteredMovements.entries,
        exits: filteredMovements.exits,
        products,
        suppliers,
        isLoading: false,
        selectedMonth: selectedMonthLabel,
        movementFilter,
        monthMetrics,
        tableId: "temp-reports-export-content",
        exportMode: true,
      })

      root.render(ExportTable)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const currentDate = new Date().toLocaleDateString("es-ES")
      const filename = `reporte-inventario-${selectedMonth}-${currentDate.replace(/\//g, "-")}.pdf`

      const success = await exportToPdf("temp-reports-export-content", filename)

      if (success) {
        showSuccess("¡Exportación exitosa!", "El reporte PDF se ha exportado correctamente.", 4000)
      } else {
        showError("Error en la exportación", "No se pudo exportar el reporte PDF. Por favor, inténtalo de nuevo.")
      }
    } catch (error) {
      console.error("Error en exportación PDF:", error)
      showError("Error en la exportación", "No se pudo exportar el reporte PDF. Por favor, inténtalo de nuevo.")
    } finally {
      if (document.body.contains(tempDiv)) {
        document.body.removeChild(tempDiv)
      }
    }
  }, [
    selectedMonth,
    filteredMovements,
    products,
    suppliers,
    movementFilter,
    monthMetrics,
    availableMonths,
    exportToPdf,
    showSuccess,
    showError,
  ])

  const handleExportToExcel = useCallback(async () => {
    if (!selectedMonth) {
      showError("Selecciona un mes", "Debes seleccionar un mes para exportar el reporte.")
      return
    }

    try {
      const selectedMonthLabel = availableMonths.find((m) => m.value === selectedMonth)?.label || selectedMonth

      const allMovements = [
        ...filteredMovements.entries.map((entry) => ({
          Fecha: new Date(entry.entryDate).toLocaleDateString("es-ES"),
          Hora: new Date(entry.entryDate).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
          Tipo: "Compra",
          "Proveedor/Cliente": entry.supplier.name,
          RUT: entry.supplier.rut,
          Productos: entry.details.map((d) => d.product.product).join(", "),
          "Cantidad Total (m³)": entry.details.reduce((sum, d) => sum + d.quantity, 0),
          "Monto Total": entry.details.reduce((sum, d) => sum + d.totalPrice, 0),
          "Precio Promedio por m³":
            entry.details.reduce((sum, d) => sum + d.totalPrice, 0) /
            entry.details.reduce((sum, d) => sum + d.quantity, 0),
        })),
        ...filteredMovements.exits.map((exit) => ({
          Fecha: new Date(exit.exitDate).toLocaleDateString("es-ES"),
          Hora: new Date(exit.exitDate).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
          Tipo: "Venta",
          "Proveedor/Cliente": exit.customer.name,
          RUT: exit.customer.rut,
          Productos: exit.details.map((d) => d.product.product).join(", "),
          "Cantidad Total (m³)": exit.details.reduce((sum, d) => sum + d.quantity, 0),
          "Monto Total": exit.details.reduce((sum, d) => sum + d.totalPrice, 0),
          "Precio Promedio por m³":
            exit.details.reduce((sum, d) => sum + d.totalPrice, 0) /
            exit.details.reduce((sum, d) => sum + d.quantity, 0),
        })),
      ]

      allMovements.sort((a, b) => {
        const dateA = new Date(`${a.Fecha} ${a.Hora}`)
        const dateB = new Date(`${b.Fecha} ${b.Hora}`)
        return dateB.getTime() - dateA.getTime()
      })

      const filteredData =
        movementFilter === "all"
          ? allMovements
          : allMovements.filter((movement) =>
              movementFilter === "entry" ? movement.Tipo === "Compra" : movement.Tipo === "Venta",
            )

      const summaryData = [
        { Métrica: "Total Movimientos", Valor: monthMetrics.totalMovements },
        { Métrica: "Total Compras", Valor: monthMetrics.totalPurchases },
        { Métrica: "Cantidad de Compras", Valor: monthMetrics.purchaseCount },
        { Métrica: "Total Ventas", Valor: monthMetrics.totalSales },
        { Métrica: "Cantidad de Ventas", Valor: monthMetrics.saleCount },
        { Métrica: "Balance Neto", Valor: monthMetrics.netBalance },
      ]

      const sheets = [
        { data: summaryData, sheetName: "Resumen" },
        { data: filteredData, sheetName: "Movimientos" },
      ]

      const filename = `reporte-inventario-${selectedMonth}`
      await exportMultipleSheets(sheets, filename)

      showSuccess("¡Exportación exitosa!", "El reporte Excel se ha exportado correctamente.", 4000)
    } catch (error) {
      console.error("Error en exportación Excel:", error)
      showError("Error en la exportación", "No se pudo exportar el reporte Excel. Por favor, inténtalo de nuevo.")
    }
  }, [
    selectedMonth,
    filteredMovements,
    movementFilter,
    monthMetrics,
    availableMonths,
    exportMultipleSheets,
    showSuccess,
    showError,
  ])

  const isLoadingPage = isLoadingProducts || isLoadingSuppliers || isLoadingEntries || isLoadingExits

  return (
    <Container fluid className="inventory-page p-0">
      <div className="d-flex">
        <div className="inventory-sidebar-wrapper">
          <InventorySidebar />
        </div>

        <div className="inventory-main-content flex-grow-1">
          <Container fluid className="py-2 pb-4">
            <Row>
              <Col>
                {/* Encabezado de página */}
                <Card className="shadow-sm mb-3">
                  <Card.Header className="bg-gradient-primary text-white">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-bar-chart-line fs-4 me-3"></i>
                        <div>
                          <h3 className="mb-1">Reportes de Inventario</h3>
                          <p className="mb-0 opacity-75">Análisis mensual de movimientos de inventario</p>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-light"
                          onClick={handleExportToPdf}
                          disabled={isExportingPdf || !selectedMonth || isLoadingPage}
                        >
                          {isExportingPdf ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Exportando PDF...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-file-earmark-pdf me-2"></i>
                              Exportar PDF
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline-light"
                          onClick={handleExportToExcel}
                          disabled={isExportingExcel || !selectedMonth || isLoadingPage}
                        >
                          {isExportingExcel ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Exportando Excel...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-file-earmark-excel me-2"></i>
                              Exportar Excel
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card.Header>
                </Card>

                {/* Métricas del mes seleccionado */}
                {selectedMonth && (
                  <Row className="mb-4">
                    <Col md={3}>
                      <Card className="inventory-metric-card shadow-sm h-100">
                        <Card.Body className="text-center">
                          <div className="metric-icon bg-info bg-opacity-10 text-info mb-3">
                            <i className="bi bi-calendar-month fs-2"></i>
                          </div>
                          <h4 className="metric-value text-info mb-1">{monthMetrics.totalMovements}</h4>
                          <p className="metric-label text-muted mb-0">Total Movimientos</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="inventory-metric-card shadow-sm h-100">
                        <Card.Body className="text-center">
                          <div className="metric-icon bg-secondary bg-opacity-10 text-secondary mb-3">
                            <i className="bi bi-arrow-down-circle fs-2"></i>
                          </div>
                          <h4 className="metric-value text-secondary mb-1">
                            ${monthMetrics.totalPurchases.toLocaleString("es-ES")}
                          </h4>
                          <p className="metric-label text-muted mb-0">Total Compras ({monthMetrics.purchaseCount})</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="inventory-metric-card shadow-sm h-100">
                        <Card.Body className="text-center">
                          <div className="metric-icon bg-success bg-opacity-10 text-success mb-3">
                            <i className="bi bi-arrow-up-circle fs-2"></i>
                          </div>
                          <h4 className="metric-value text-success mb-1">
                            ${monthMetrics.totalSales.toLocaleString("es-ES")}
                          </h4>
                          <p className="metric-label text-muted mb-0">Total Ventas ({monthMetrics.saleCount})</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="inventory-metric-card shadow-sm h-100">
                        <Card.Body className="text-center">
                          <div
                            className={`metric-icon ${monthMetrics.netBalance >= 0 ? "bg-success bg-opacity-10 text-success" : "bg-danger bg-opacity-10 text-danger"} mb-3`}
                          >
                            <i
                              className={`bi ${monthMetrics.netBalance >= 0 ? "bi-graph-up" : "bi-graph-down"} fs-2`}
                            ></i>
                          </div>
                          <h4
                            className={`metric-value ${monthMetrics.netBalance >= 0 ? "text-success" : "text-danger"} mb-1`}
                          >
                            ${Math.abs(monthMetrics.netBalance).toLocaleString("es-ES")}
                          </h4>
                          <p className="metric-label text-muted mb-0">
                            Balance {monthMetrics.netBalance >= 0 ? "Positivo" : "Negativo"}
                          </p>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                )}

                {/* Tabla de reportes */}
                <Row>
                  <Col>
                    <ReportsTable
                      entries={filteredMovements.entries}
                      exits={filteredMovements.exits}
                      products={products}
                      suppliers={suppliers}
                      isLoading={isLoadingPage}
                      availableMonths={availableMonths}
                      selectedMonth={selectedMonth}
                      onMonthChange={setSelectedMonth}
                      movementFilter={movementFilter}
                      onMovementFilterChange={setMovementFilter}
                      monthMetrics={monthMetrics}
                      tableId="reports-table"
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </Container>
        </div>
      </div>

      <Toast toasts={toasts} removeToast={removeToast} />
    </Container>
  )
}
