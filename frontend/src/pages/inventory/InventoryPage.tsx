import type React from "react"
import { Container, Row, Col, Card, Button } from "react-bootstrap"
import InventorySidebar from "@/components/inventory/layout/InventorySidebar"
import InventoryChart from "@/components/inventory/dashboard/InventoryChart"
import InventoryHistoryTable from "@/components/inventory/dashboard/InventoryHistoryTable"
import { useProducts } from "@/hooks/inventory/useProducts"
import { useSuppliers } from "@/hooks/stakeholders/useSuppliers"
import { ProductType } from "@/types/inventory/product.types"
import InventoryEntryModal from "@/components/inventory/dashboard/InventoryEntryModal"
import { useInventoryEntries } from "@/hooks/inventory/useInventoryEntry"
import type { CreateInventoryEntryData, InventoryEntry } from "@/types/inventory/inventory.types"
import { useMemo, useState, useCallback } from "react"
import { useToast, Toast } from "@/components/common/Toast"

import "../../styles/pages/inventory.css"
import { InventoryMovementSelectionModal } from "@/components/inventory/dashboard/InventoryMovementSelectionModal"
import ConfirmModal from "@/components/stakeholders/ConfirmModal"

export const InventoryPage: React.FC = () => {
  const { products, loadProducts, isLoading: isLoadingProducts } = useProducts()
  const { suppliers, isLoading: isLoadingSuppliers } = useSuppliers()
  const { entries, loadEntries, createEntry, deleteEntry, isLoadingEntries, isCreatingEntry, isDeletingEntry } = useInventoryEntries()

  const { toasts, removeToast, showSuccess, showError } = useToast()

  const [showMovementSelectionModal, setShowMovementSelectionModal] = useState(false)
  const [showPurchaseEntryModal, setShowPurchaseEntryModal] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<InventoryEntry | null>(null) // Para confirmar eliminación
  const [entryToViewDetails, setEntryToViewDetails] = useState<InventoryEntry | null>(null) // Para ver detalles

  // Transforma los datos de productos en el formato que necesita el gráfico
  const chartData = useMemo(() => {
    const productTypeStockMap = new Map<ProductType, number>()

    const uniqueProductTypes = Array.from(new Set(products.map((p) => p.product)))
    uniqueProductTypes.forEach((type) => {
      productTypeStockMap.set(type, Math.floor(Math.random() * 251)) // 0 a 250
    })

    return Array.from(productTypeStockMap.entries()).map(([type, stock]) => ({
      label: type,
      value: stock,
    }))
  }, [products])

  // Cálculos para las tarjetas de métricas y las nuevas categorías
  const metrics = useMemo(() => {
    const allPossibleProductTypes = Object.values(ProductType)
    const registeredProductTypes = new Set(products.map((p) => p.product))
    const activeProductTypesCount = registeredProductTypes.size
    const inactiveProductTypesCount = allPossibleProductTypes.length - activeProductTypesCount

    const inStockProducts: ProductType[] = []
    const lowStockProducts: ProductType[] = []
    const outOfStockProducts: ProductType[] = []

    const maxSimulatedStock = 250
    const lowStockThreshold = maxSimulatedStock * 0.4

    chartData.forEach((item) => {
      if (item.value === 0) {
        outOfStockProducts.push(item.label)
      } else if (item.value <= lowStockThreshold) {
        lowStockProducts.push(item.label)
      } else {
        inStockProducts.push(item.label)
      }
    })

    return {
      allPossibleProductTypesCount: allPossibleProductTypes.length,
      activeProductTypesCount,
      inactiveProductTypesCount,
      inStock: inStockProducts.length,
      lowStock: lowStockProducts.length,
      outOfStock: outOfStockProducts.length,
      inStockProducts,
      lowStockProducts,
      outOfStockProducts,
    }
  }, [products, chartData])

  const handleNewMovementClick = useCallback(() => {
    setShowMovementSelectionModal(true)
  }, [])

  const handleSelectPurchase = useCallback(() => {
    setShowMovementSelectionModal(false)
    setShowPurchaseEntryModal(true)
  }, [])

  const handleSelectSale = useCallback(() => {
    setShowMovementSelectionModal(false)
    alert("Funcionalidad de Vender Materiales no implementada aún.")
  }, [])

  const handleCreateEntry = useCallback(
    async (data: CreateInventoryEntryData) => {
      const result = await createEntry(data)
      if (result.success) {
        showSuccess("¡Entrada registrada!", result.message, 4000)
        setShowPurchaseEntryModal(false)
        loadProducts() // Recargar productos para actualizar el gráfico y métricas
        loadEntries() // Recargar entradas para actualizar la tabla de historial
      } else {
        showError("Error al registrar entrada", result.message || "Ocurrió un error inesperado.")
      }
    },
    [createEntry, loadProducts, loadEntries, showSuccess, showError],
  )

  const handleViewEntryDetails = useCallback((entry: InventoryEntry) => {
    setEntryToViewDetails(entry)
    // Aquí podrías abrir un modal de detalles de entrada
    alert(`Ver detalles de la entrada ID: ${entry.id}`)
  }, [])

  const handleDeleteEntry = useCallback((entry: InventoryEntry) => {
    setEntryToDelete(entry)
  }, [])

  const confirmDeleteEntry = useCallback(async () => {
    if (!entryToDelete) return

    const result = await deleteEntry(entryToDelete.id)
    if (result.success) {
      showSuccess("¡Movimiento eliminado!", "El movimiento se ha eliminado exitosamente.", 4000)
      loadProducts() // Recargar productos por si el stock cambió
      loadEntries() // Recargar entradas para actualizar la tabla
    } else {
      showError("Error al eliminar", result.message || "Ocurrió un error al eliminar el movimiento.")
    }
    setEntryToDelete(null)
  }, [entryToDelete, deleteEntry, loadProducts, loadEntries, showSuccess, showError])

  const isLoadingPage = isLoadingProducts || isLoadingSuppliers || isLoadingEntries

  return (
    <Container fluid className="inventory-page p-0">
      <div className="d-flex">
        {/* Sidebar lateral */}
        <div className="inventory-sidebar-wrapper">
          <InventorySidebar />
        </div>

        {/* Contenido principal */}
        <div className="inventory-main-content flex-grow-1">
          <Container fluid className="py-2 pb-4">
            <Row>
              <Col>
                {/* Encabezado de página */}
                <Card className="shadow-sm mb-3">
                  <Card.Header className="bg-gradient-primary text-white">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-boxes fs-4 me-3"></i>
                        <div>
                          <h3 className="mb-1">Gestión de Inventario</h3>
                          <p className="mb-0 opacity-75">Control y seguimiento de stock de productos</p>
                        </div>
                      </div>
                      <div>
                        <Button variant="outline-light" className="me-2">
                          <i className="bi bi-download me-2"></i>
                          Exportar
                        </Button>
                        <Button variant="light" onClick={handleNewMovementClick}>
                          <i className="bi bi-plus-lg me-2"></i>
                          Nuevo Movimiento
                        </Button>
                      </div>
                    </div>
                  </Card.Header>
                </Card>

                {/* Tarjetas de métricas rápidas */}
                <Row className="mb-4">
                  <Col md={3}>
                    <Card className="inventory-metric-card shadow-sm h-100">
                      <Card.Body className="text-center d-flex flex-column justify-content-between">
                        <div>
                          <div className="metric-icon bg-primary bg-opacity-10 text-primary mb-3">
                            <i className="bi bi-box-seam fs-2"></i>
                          </div>
                          <h4 className="metric-value text-primary mb-1">{metrics.allPossibleProductTypesCount}</h4>
                          <p className="metric-label text-muted mb-0">Total Tipos de Productos</p>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="inventory-metric-card shadow-sm h-100">
                      <Card.Body className="text-center d-flex flex-column justify-content-between">
                        <div>
                          <div className="metric-icon bg-success bg-opacity-10 text-success mb-3">
                            <i className="bi bi-check-circle fs-2"></i>
                          </div>
                          <h4 className="metric-value text-success mb-1">{metrics.inStock}</h4>
                          <p className="metric-label text-muted mb-2">En Stock</p>
                        </div>
                        <div className="d-flex flex-wrap gap-1 justify-content-center">
                          {metrics.inStockProducts.length > 0 ? (
                            metrics.inStockProducts.map((productName, index) => (
                              <span key={index} className="badge bg-success-subtle text-success">
                                {productName}
                              </span>
                            ))
                          ) : (
                            <small className="text-muted">Ninguno</small>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="inventory-metric-card shadow-sm h-100">
                      <Card.Body className="text-center d-flex flex-column justify-content-between">
                        <div>
                          <div className="metric-icon bg-warning bg-opacity-10 text-warning mb-3">
                            <i className="bi bi-exclamation-triangle fs-2"></i>
                          </div>
                          <h4 className="metric-value text-warning mb-1">{metrics.lowStock}</h4>
                          <p className="metric-label text-muted mb-2">Stock Bajo</p>
                        </div>
                        <div className="d-flex flex-wrap gap-1 justify-content-center">
                          {metrics.lowStockProducts.length > 0 ? (
                            metrics.lowStockProducts.map((productName, index) => (
                              <span key={index} className="badge bg-warning-subtle text-warning">
                                {productName}
                              </span>
                            ))
                          ) : (
                            <small className="text-muted">Ninguno</small>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="inventory-metric-card shadow-sm h-100">
                      <Card.Body className="text-center d-flex flex-column justify-content-between">
                        <div>
                          <div className="metric-icon bg-danger bg-opacity-10 text-danger mb-3">
                            <i className="bi bi-x-circle fs-2"></i>
                          </div>
                          <h4 className="metric-value text-danger mb-1">{metrics.outOfStock}</h4>
                          <p className="metric-label text-muted mb-2">Sin Stock</p>
                        </div>
                        <div className="d-flex flex-wrap gap-1 justify-content-center">
                          {metrics.outOfStockProducts.length > 0 ? (
                            metrics.outOfStockProducts.map((productName, index) => (
                              <span key={index} className="badge bg-danger-subtle text-danger">
                                {productName}
                              </span>
                            ))
                          ) : (
                            <small className="text-muted">Ninguno</small>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Gráfico de inventario */}
                <Row className="mb-4">
                  <Col>
                    <InventoryChart
                      data={chartData}
                      onRefresh={loadProducts}
                      activeProductTypesCount={metrics.activeProductTypesCount}
                      inactiveProductTypesCount={metrics.inactiveProductTypesCount}
                    />
                  </Col>
                </Row>

                {/* Tabla de movimientos recientes */}
                <Row>
                  <Col>
                    <Card className="inventory-history-card shadow-sm">
                      <Card.Header className="bg-light border-bottom">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <i className="bi bi-clock-history fs-5 me-2 text-primary"></i>
                            <h5 className="mb-0">Movimientos Recientes</h5>
                          </div>
                          <div className="d-flex gap-2">
                            <Button variant="outline-primary" size="sm">
                              <i className="bi bi-funnel me-1"></i>
                              Filtrar
                            </Button>
                            <Button variant="outline-secondary" size="sm">
                              <i className="bi bi-eye me-1"></i>
                              Ver Todos
                            </Button>
                          </div>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        <InventoryHistoryTable
                          entries={entries}
                          products={products}
                          suppliers={suppliers}
                          isLoading={isLoadingPage}
                          onViewDetails={handleViewEntryDetails}
                          onDeleteEntry={handleDeleteEntry}
                        />
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Container>
        </div>
      </div>

      {/* Modal de selección de tipo de movimiento */}
      <InventoryMovementSelectionModal
        show={showMovementSelectionModal}
        onClose={() => setShowMovementSelectionModal(false)}
        onSelectPurchase={handleSelectPurchase}
        onSelectSale={handleSelectSale}
      />

      {/* Modal para la entrada de compra */}
      <InventoryEntryModal
        show={showPurchaseEntryModal}
        onClose={() => setShowPurchaseEntryModal(false)}
        onSubmit={handleCreateEntry}
        isSubmitting={isCreatingEntry}
      />
      {/* Modal de confirmación para eliminar movimiento */}
      <ConfirmModal
        show={!!entryToDelete}
        onClose={() => setEntryToDelete(null)}
        onConfirm={confirmDeleteEntry}
        title="Eliminar Movimiento"
        message={`¿Estás seguro que deseas eliminar el movimiento con fecha ${entryToDelete ? new Date(entryToDelete.entryDate).toLocaleDateString() : ""}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        headerVariant="danger"
      />
      {/* Sistema de notificaciones */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </Container>
  )
}