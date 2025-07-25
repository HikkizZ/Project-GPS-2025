import type React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import InventorySidebar from "@/components/inventory/layout/InventorySidebar";
import InventoryChart from "@/components/inventory/dashboard/InventoryChart";
import InventoryHistoryTable from "@/components/inventory/dashboard/InventoryHistoryTable";
import { useProducts } from "@/hooks/inventory/useProducts";
import { useSuppliers } from "@/hooks/stakeholders/useSuppliers";
import { ProductType } from "@/types/inventory/product.types";
import { useMemo, useState, useCallback } from "react";
import { InventoryMovementSelectionModal } from "@/components/inventory/dashboard/InventoryMovementSelectionModal";
import InventoryEntryModal from "@/components/inventory/dashboard/InventoryEntryModal";
import { useInventoryEntries } from "@/hooks/inventory/useInventoryEntry";
import type {
  CreateInventoryEntryData,
  InventoryEntry,
  CreateInventoryExitData,
} from "@/types/inventory/inventory.types";
import { useToast, Toast } from "@/components/common/Toast";
import { useInventoryExits } from "@/hooks/inventory/useInventoryExit";
import InventoryExitModal from "@/components/inventory/dashboard/InventoryExitModal";
import ConfirmModal from "@/components/common/ConfirmModal";
import type { InventoryExit } from "@/types/inventory/inventory.types";
import { useInventory } from "@/hooks/inventory/useInventory";

import "../../styles/pages/inventory.css";

export const InventoryPage: React.FC = () => {
  const {
    products,
    loadProducts,
    isLoading: isLoadingProducts,
  } = useProducts();
  const { suppliers, isLoading: isLoadingSuppliers } = useSuppliers();
  const {
    entries,
    loadEntries,
    createEntry,
    deleteEntry,
    isLoadingEntries,
    isCreatingEntry,
  } = useInventoryEntries();
  const {
    exits,
    loadExits,
    createExit,
    deleteExit,
    isLoadingExits,
    isCreatingExit,
  } = useInventoryExits();
  const {
    inventory,
    isLoading: isLoadingInventory,
    loadInventory,
  } = useInventory();

  const { toasts, removeToast, showSuccess, showError } = useToast();

  const [showMovementSelectionModal, setShowMovementSelectionModal] =
    useState(false);
  const [showPurchaseEntryModal, setShowPurchaseEntryModal] = useState(false);
  const [showSaleExitModal, setShowSaleExitModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<InventoryEntry | null>(
    null
  );
  const [exitToDelete, setExitToDelete] = useState<InventoryExit | null>(null);
  const [entryToViewDetails, setEntryToViewDetails] =
    useState<InventoryEntry | null>(null);

  const chartData = useMemo(() => {
    return inventory.map((item) => ({
      label: item.product.product,
      value: item.quantity,
    }));
  }, [inventory]);

  const metrics = useMemo(() => {
    const allPossibleProductTypes = Object.values(ProductType);
    const registeredProductTypes = new Set(products.map((p) => p.product));
    const activeProductTypesCount = registeredProductTypes.size;
    const inactiveProductTypesCount =
      allPossibleProductTypes.length - activeProductTypesCount;

    const inStockProducts: ProductType[] = [];
    const lowStockProducts: ProductType[] = [];
    const outOfStockProducts: ProductType[] = [];

    const totalStock = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const averageStock =
      inventory.length > 0 ? totalStock / inventory.length : 0;
    const lowStockThreshold = averageStock > 0 ? averageStock * 0.4 : 10;

    inventory.forEach((item) => {
      if (item.quantity === 0) {
        outOfStockProducts.push(item.product.product);
      } else if (item.quantity <= lowStockThreshold) {
        lowStockProducts.push(item.product.product);
      } else {
        inStockProducts.push(item.product.product);
      }
    });

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
    };
  }, [products, inventory]);

  const handleNewMovementClick = useCallback(() => {
    setShowMovementSelectionModal(true);
  }, []);

  const handleSelectPurchase = useCallback(() => {
    setShowMovementSelectionModal(false);
    setShowPurchaseEntryModal(true);
  }, []);

  const handleSelectSale = useCallback(() => {
    setShowMovementSelectionModal(false);
    setShowSaleExitModal(true);
  }, []);

  const handleCreateEntry = useCallback(
    async (data: CreateInventoryEntryData) => {
      const result = await createEntry(data);
      if (result.success) {
        showSuccess("¡Entrada registrada!", result.message, 4000);
        setShowPurchaseEntryModal(false);
        loadProducts();
        loadEntries();
        loadInventory();
      } else {
        showError(
          "Error al registrar entrada",
          result.message || "Ocurrió un error inesperado."
        );
      }
    },
    [
      createEntry,
      loadProducts,
      loadEntries,
      loadInventory,
      showSuccess,
      showError,
    ]
  );

  const handleCreateExit = useCallback(
    async (data: CreateInventoryExitData) => {
      const result = await createExit(data);
      if (result.success) {
        showSuccess("¡Salida registrada!", result.message, 4000);
        setShowSaleExitModal(false);
        loadProducts();
        loadExits();
        loadInventory();
      } else {
        showError(
          "Error al registrar salida",
          result.message || "Ocurrió un error inesperado."
        );
      }
    },
    [createExit, loadProducts, loadExits, loadInventory, showSuccess, showError]
  );

  const handleViewEntryDetails = useCallback((entry: InventoryEntry) => {
    setEntryToViewDetails(entry);
    alert(`Ver detalles de la entrada ID: ${entry.id}`);
  }, []);

  const handleDeleteEntry = useCallback((entry: InventoryEntry) => {
    setEntryToDelete(entry);
  }, []);

  const handleDeleteExit = useCallback((exit: InventoryExit) => {
    setExitToDelete(exit);
  }, []);

  const confirmDeleteEntry = useCallback(async () => {
    if (!entryToDelete) return;

    const result = await deleteEntry(entryToDelete.id);
    if (result.success) {
      showSuccess(
        "¡Movimiento eliminado!",
        "El movimiento se ha eliminado exitosamente.",
        4000
      );
      loadProducts();
      loadEntries();
      loadInventory();
    } else {
      showError(
        "Error al eliminar",
        result.message || "Ocurrió un error al eliminar el movimiento."
      );
    }
    setEntryToDelete(null);
  }, [
    entryToDelete,
    deleteEntry,
    loadProducts,
    loadEntries,
    loadInventory,
    showSuccess,
    showError,
  ]);

  const confirmDeleteExit = useCallback(async () => {
    if (!exitToDelete) return;

    const result = await deleteExit(exitToDelete.id);
    if (result.success) {
      showSuccess(
        "¡Movimiento eliminado!",
        "El movimiento se ha eliminado exitosamente.",
        4000
      );
      loadProducts();
      loadExits();
      loadInventory();
    } else {
      showError(
        "Error al eliminar",
        result.message || "Ocurrió un error al eliminar el movimiento."
      );
    }
    setExitToDelete(null);
  }, [
    exitToDelete,
    deleteExit,
    loadProducts,
    loadExits,
    loadInventory,
    showSuccess,
    showError,
  ]);

  const isLoadingPage =
    isLoadingProducts ||
    isLoadingSuppliers ||
    isLoadingEntries ||
    isLoadingExits ||
    isLoadingInventory;

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
                          <p className="mb-0 opacity-75">
                            Control y seguimiento de stock de productos
                          </p>
                        </div>
                      </div>
                      <div>
                        <Button variant="outline-light" className="me-2">
                          <i className="bi bi-download me-2"></i>
                          Exportar
                        </Button>
                        <Button
                          variant="light"
                          onClick={handleNewMovementClick}
                        >
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
                          <h4 className="metric-value text-primary mb-1">
                            {metrics.allPossibleProductTypesCount}
                          </h4>
                          <p className="metric-label text-muted mb-0">
                            Total Tipos de Productos
                          </p>
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
                          <h4 className="metric-value text-success mb-1">
                            {metrics.inStock}
                          </h4>
                          <p className="metric-label text-muted mb-2">
                            En Stock
                          </p>
                        </div>
                        <div className="d-flex flex-wrap gap-1 justify-content-center">
                          {metrics.inStockProducts.length > 0 ? (
                            metrics.inStockProducts.map(
                              (productName, index) => (
                                <span
                                  key={index}
                                  className="badge bg-success-subtle text-success"
                                >
                                  {productName}
                                </span>
                              )
                            )
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
                          <h4 className="metric-value text-warning mb-1">
                            {metrics.lowStock}
                          </h4>
                          <p className="metric-label text-muted mb-2">
                            Stock Bajo
                          </p>
                        </div>
                        <div className="d-flex flex-wrap gap-1 justify-content-center">
                          {metrics.lowStockProducts.length > 0 ? (
                            metrics.lowStockProducts.map(
                              (productName, index) => (
                                <span
                                  key={index}
                                  className="badge bg-warning-subtle text-warning"
                                >
                                  {productName}
                                </span>
                              )
                            )
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
                          <h4 className="metric-value text-danger mb-1">
                            {metrics.outOfStock}
                          </h4>
                          <p className="metric-label text-muted mb-2">
                            Sin Stock
                          </p>
                        </div>
                        <div className="d-flex flex-wrap gap-1 justify-content-center">
                          {metrics.outOfStockProducts.length > 0 ? (
                            metrics.outOfStockProducts.map(
                              (productName, index) => (
                                <span
                                  key={index}
                                  className="badge bg-danger-subtle text-danger"
                                >
                                  {productName}
                                </span>
                              )
                            )
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
                      inventory={inventory}
                      onRefresh={loadInventory}
                      activeProductTypesCount={metrics.activeProductTypesCount}
                      inactiveProductTypesCount={
                        metrics.inactiveProductTypesCount
                      }
                    />
                  </Col>
                </Row>

                {/* Tabla de movimientos recientes */}
                <Row>
                  <Col>
                    <InventoryHistoryTable
                      entries={entries}
                      exits={exits}
                      products={products}
                      suppliers={suppliers}
                      isLoading={isLoadingPage}
                      onViewDetails={handleViewEntryDetails}
                      onDeleteEntry={handleDeleteEntry}
                      onDeleteExit={handleDeleteExit}
                      allEntriesCount={entries.length + exits.length}
                    />
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

      {/* Modal para la salida de venta */}
      <InventoryExitModal
        show={showSaleExitModal}
        onClose={() => setShowSaleExitModal(false)}
        onSubmit={handleCreateExit}
        isSubmitting={isCreatingExit}
      />

      {/* Modal de confirmación para eliminar movimiento de entrada */}
      <ConfirmModal
        show={!!entryToDelete}
        onClose={() => setEntryToDelete(null)}
        onConfirm={confirmDeleteEntry}
        title="Eliminar compra"
        confirmText="Eliminar"
        cancelText="Cancelar"
        headerVariant="danger"
        headerIcon="bi-exclamation-triangle-fill"
        confirmIcon="bi-trash"
        cancelIcon="bi-x-circle"
        warningContent={
          <>
            <p className="mb-2 mt-1">Esta acción:</p>
            <ul className="mb-0">
              <li>
                 Eliminará la compra realizada con fecha{" "}
                {entryToDelete?.entryDate ? new Date(entryToDelete.entryDate).toLocaleDateString() : "N/A"} del sistema.
              </li>
              <li>Esta acción no se puede deshacer.</li>
              <li>
                El material asociado a esta compra también será eliminado y
                descontado del inventario.
              </li>
            </ul>
          </>
        }
      >
        <div className="mb-3 p-3 bg-light rounded-3">
          <p className="mb-2 fw-semibold">
            ¿Estás seguro que deseas eliminar la compra?
          </p>
          <div className="d-flex flex-column gap-1">
            <div>
              <span className="fw-semibold text-muted">
                Proveedor a quien se compró:
              </span>{" "}
              <span className="ms-2">
                {entryToDelete?.supplier.name || "N/A"}
              </span>
            </div>
            <div>
              <span className="fw-semibold text-muted">Fecha de compra:</span>{" "}
              <span className="ms-2">
                {entryToDelete?.entryDate
                  ? new Date(entryToDelete.entryDate).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
            <div>
              <span className="fw-semibold text-muted">
                Productos comprado:
              </span>{" "}
              <span className="ms-2">
                {entryToDelete?.details
                  .map((detail) => detail.product.product)
                  .join(", ") || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </ConfirmModal>

      {/* Modal de confirmación para eliminar movimiento de salida */}
      <ConfirmModal
        show={!!exitToDelete}
        onClose={() => setExitToDelete(null)}
        onConfirm={confirmDeleteExit}
        title="Eliminar venta"
        confirmText="Eliminar"
        cancelText="Cancelar"
        headerVariant="danger"
        headerIcon="bi-exclamation-triangle-fill"
        confirmIcon="bi-trash"
        cancelIcon="bi-x-circle"
        warningContent={
          <>
            <p className="mb-2 mt-1">Esta acción:</p>
            <ul className="mb-0">
              <li>
                Marcará la venta realizada con fecha{" "}
                {exitToDelete?.exitDate ? new Date(exitToDelete.exitDate).toLocaleDateString() : "N/A"} eliminada del sistema.
              </li>
              <li>Esta acción no se puede deshacer.</li>
              <li>
                El material asociado a esta venta será restaurado al inventario.
              </li>
            </ul>
          </>
        }
      >
        <div className="mb-3 p-3 bg-light rounded-3">
          <p className="mb-2 fw-semibold">
            ¿Estás seguro que deseas eliminar la venta?
          </p>
          <div className="d-flex flex-column gap-1">
            <div>
              <span className="fw-semibold text-muted">
                Cliente a quien se le realizó la venta:
              </span>{" "}
              <span className="ms-2">
                {exitToDelete?.customer.name || "N/A"}
              </span>
            </div>
            <div>
              <span className="fw-semibold text-muted">Fecha de compra:</span>{" "}
              <span className="ms-2">
                {exitToDelete?.exitDate
                  ? new Date(exitToDelete.exitDate).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
            <div>
              <span className="fw-semibold text-muted">
                Productos vendidos:
              </span>{" "}
              <span className="ms-2">
                {exitToDelete?.details
                  .map((detail) => detail.product.product)
                  .join(", ") || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </ConfirmModal>

      {/* Sistema de notificaciones */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </Container>
  );
};
