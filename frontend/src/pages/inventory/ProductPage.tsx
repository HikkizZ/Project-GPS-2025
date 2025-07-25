import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Container, Row, Col, Button, Card } from "react-bootstrap"
import InventorySidebar from "@/components/inventory/layout/InventorySidebar"
import ProductModal from "@/components/inventory/product/ProductModal"
import ConfirmModal from "@/components/common/ConfirmModal"
import { LocalFilters } from "@/components/inventory/product/LocalFilters"
import { ProductTable } from "@/components/inventory/product/ProductTable"
import { useProducts } from "@/hooks/inventory/useProducts"
import { usePdfExport } from "@/hooks/usePdfExport"
import { useExcelExport } from "@/hooks/useExcelExport"
import type { Product, CreateProductData, UpdateProductData, ProductType } from "@/types/inventory/product.types"
import { useToast, Toast } from "@/components/common/Toast"
import "../../styles/pages/product.css"

export const ProductPage: React.FC = () => {
  const {
    products,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
  } = useProducts()

  const { toasts, removeToast, showSuccess, showError } = useToast()
  const { exportToPdf, isExporting: isExportingPdf } = usePdfExport()
  const { exportToExcel, isExporting: isExportingExcel } = useExcelExport()

  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [localFilters, setLocalFilters] = useState({
    product: "",
    salePrice: "",
  })
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined)
  const [showFilters, setShowFilters] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  useEffect(() => {
    setAllProducts(products)
    setFilteredProducts(products)
  }, [products])

  useEffect(() => {
    let filtered = [...allProducts]
    if (localFilters.product) {
      filtered = filtered.filter((product) =>
        product.product.toLowerCase().includes(localFilters.product.toLowerCase()),
      )
    }
    if (localFilters.salePrice) {
      filtered = filtered.filter((product) => product.salePrice?.toString().includes(localFilters.salePrice))
    }
    setFilteredProducts(filtered)
  }, [allProducts, localFilters])

  const handleCreateClick = () => {
    setEditingProduct(undefined)
    setShowModal(true)
  }

  const handleEditClick = (product: Product) => {
    setEditingProduct(product)
    setShowModal(true)
  }

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
  }

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return
    const result = await deleteProduct(productToDelete.id)
    if (result.success) {
      showSuccess("¡Producto eliminado!", "El producto se ha eliminado exitosamente del sistema", 4000)
    } else {
      showError("Error al eliminar", result.message || "Ocurrió un error al eliminar el producto.")
    }
    setProductToDelete(null)
  }

  const handleSubmit = async (data: CreateProductData | UpdateProductData) => {
    const isEdit = Boolean(editingProduct)
    const result = isEdit
      ? await updateProduct(editingProduct!.id, data as UpdateProductData)
      : await createProduct(data as CreateProductData)
    if (result.success) {
      showSuccess(isEdit ? "¡Producto actualizado!" : "¡Producto creado!", result.message, 4000)
      setShowModal(false)
    } else {
      showError("Error", result.message || "Ocurrió un error inesperado")
    }
  }

  const handleLocalFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setLocalFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleLocalFilterReset = () => {
    setLocalFilters({
      product: "",
      salePrice: "",
    })
  }

  const handleExportToPdf = useCallback(async () => {
    if (filteredProducts.length === 0) {
      showError("Sin datos para exportar", "No hay productos para exportar.")
      return
    }

    const tempDiv = document.createElement("div")
    tempDiv.id = "temp-products-export"
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

      const ExportTable = React.createElement(
        "div",
        {
          id: "temp-products-export-content",
          style: { fontFamily: "Arial, sans-serif" },
        },
        [
          React.createElement(
            "div",
            {
              key: "header",
              style: { marginBottom: "20px", textAlign: "center" },
            },
            [
              React.createElement("h2", { key: "title" }, "Catálogo de Productos"),
              React.createElement(
                "p",
                {
                  key: "date",
                  style: { color: "#666", margin: "5px 0" },
                },
                `Generado el: ${new Date().toLocaleDateString("es-ES")}`,
              ),
              React.createElement(
                "p",
                {
                  key: "count",
                  style: { color: "#666", margin: "5px 0" },
                },
                `Total de productos: ${filteredProducts.length}`,
              ),
            ],
          ),
          React.createElement(
            "table",
            {
              key: "table",
              style: {
                width: "100%",
                borderCollapse: "collapse",
                border: "1px solid #ddd",
              },
            },
            [
              React.createElement(
                "thead",
                { key: "thead" },
                React.createElement(
                  "tr",
                  {
                    style: { backgroundColor: "#f8f9fa" },
                  },
                  [
                    React.createElement(
                      "th",
                      {
                        key: "product-header",
                        style: {
                          border: "1px solid #ddd",
                          padding: "12px",
                          textAlign: "left",
                          fontWeight: "bold",
                        },
                      },
                      "Tipo de Producto",
                    ),
                    React.createElement(
                      "th",
                      {
                        key: "price-header",
                        style: {
                          border: "1px solid #ddd",
                          padding: "12px",
                          textAlign: "right",
                          fontWeight: "bold",
                        },
                      },
                      "Precio de Venta (por m³)",
                    ),
                  ],
                ),
              ),
              React.createElement(
                "tbody",
                { key: "tbody" },
                filteredProducts.map((product, index) =>
                  React.createElement(
                    "tr",
                    {
                      key: product.id,
                      style: { backgroundColor: index % 2 === 0 ? "#fff" : "#f8f9fa" },
                    },
                    [
                      React.createElement(
                        "td",
                        {
                          key: "product",
                          style: {
                            border: "1px solid #ddd",
                            padding: "12px",
                          },
                        },
                        product.product,
                      ),
                      React.createElement(
                        "td",
                        {
                          key: "price",
                          style: {
                            border: "1px solid #ddd",
                            padding: "12px",
                            textAlign: "right",
                            fontWeight: "bold",
                            color: "#28a745",
                          },
                        },
                        `$${product.salePrice?.toLocaleString("es-ES") || "N/A"}`,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      )

      root.render(ExportTable)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const currentDate = new Date().toLocaleDateString("es-ES")
      const filename = `catalogo-productos-${currentDate.replace(/\//g, "-")}.pdf`
      const success = await exportToPdf("temp-products-export-content", filename)

      if (success) {
        showSuccess("¡Exportación exitosa!", "El catálogo PDF se ha exportado correctamente.", 4000)
      } else {
        showError("Error en la exportación", "No se pudo exportar el catálogo PDF. Por favor, inténtalo de nuevo.")
      }
    } catch (error) {
      console.error("Error en exportación PDF:", error)
      showError("Error en la exportación", "No se pudo exportar el catálogo PDF. Por favor, inténtalo de nuevo.")
    } finally {
      if (document.body.contains(tempDiv)) {
        document.body.removeChild(tempDiv)
      }
    }
  }, [filteredProducts, exportToPdf, showSuccess, showError])

  const handleExportToExcel = useCallback(async () => {
    if (filteredProducts.length === 0) {
      showError("Sin datos para exportar", "No hay productos para exportar.")
      return
    }

    try {
      const excelData = filteredProducts.map((product, index) => ({
        "N°": index + 1,
        "Tipo de Producto": product.product,
        "Precio de Venta (CLP)": product.salePrice || 0,
      }))

      const summaryData = [
        { Métrica: "Total de Productos", Valor: filteredProducts.length },
        { Métrica: "Productos con Precio", Valor: filteredProducts.filter((p) => p.salePrice).length },
        {
          Métrica: "Precio Promedio",
          Valor: `$${Math.round(filteredProducts.reduce((sum, p) => sum + (p.salePrice || 0), 0) / filteredProducts.length).toLocaleString("es-ES")}`,
        },
        {
          Métrica: "Precio Más Alto",
          Valor: `$${Math.max(...filteredProducts.map((p) => p.salePrice || 0)).toLocaleString("es-ES")}`,
        },
        {
          Métrica: "Precio Más Bajo",
          Valor: `$${Math.min(...filteredProducts.filter((p) => p.salePrice).map((p) => p.salePrice || 0)).toLocaleString("es-ES")}`,
        },
        { Métrica: "Fecha de Exportación", Valor: new Date().toLocaleDateString("es-ES") },
      ]

      const filename = "catalogo-productos"
      await exportToExcel(excelData, filename, "Productos")

      showSuccess("¡Exportación exitosa!", "El catálogo Excel se ha exportado correctamente.", 4000)
    } catch (error) {
      console.error("Error en exportación Excel:", error)
      showError("Error en la exportación", "No se pudo exportar el catálogo Excel. Por favor, inténtalo de nuevo.")
    }
  }, [filteredProducts, exportToExcel, showSuccess, showError])

  const hasActiveLocalFilters = Object.values(localFilters).some((value) => value.trim() !== "")
  const existingProductTypes: ProductType[] = allProducts.map((p) => p.product)

  return (
    <Container fluid className="inventory-page p-0">
      <div className="d-flex">
        {/* Sidebar lateral */}
        <div className="inventory-sidebar-wrapper">
          <InventorySidebar />
        </div>
        {/* Contenido principal */}
        <div className="inventory-main-content flex-grow-1">
          <Container fluid className="py-2 h-100">
            <Row className="h-100">
              <Col>
                {/* Encabezado de página */}
                <Card className="shadow-sm mb-3">
                  <Card.Header className="bg-gradient-primary text-white">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-boxes fs-4 me-3"></i>
                        <div>
                          <h3 className="mb-1">Gestión de Productos</h3>
                          <p className="mb-0 opacity-75">Administrar catálogo de productos del sistema</p>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        {/* Botones de exportación */}
                        <Button
                          variant="outline-light"
                          onClick={handleExportToPdf}
                          disabled={isExportingPdf || filteredProducts.length === 0 || isLoading}
                          title="Exportar catálogo a PDF"
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
                          disabled={isExportingExcel || filteredProducts.length === 0 || isLoading}
                          title="Exportar catálogo a Excel"
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
                        {/*<Button
                          variant={showFilters ? "outline-light" : "light"}
                          className="me-2"
                          onClick={() => setShowFilters(!showFilters)}
                        >
                          <i className={`bi bi-funnel${showFilters ? "-fill" : ""} me-2`}></i>
                          {showFilters ? "Ocultar" : "Mostrar"} Filtros
                        </Button>*/}
                        <Button variant="light" onClick={handleCreateClick}>
                          <i className="bi bi-plus-lg me-2"></i>
                          Nuevo Producto
                        </Button>
                      </div>
                    </div>
                  </Card.Header>
                </Card>

                {/* Panel de filtros */}
                {showFilters && (
                  <LocalFilters
                    filters={localFilters}
                    onFilterChange={handleLocalFilterChange}
                    onReset={handleLocalFilterReset}
                    hasActiveFilters={hasActiveLocalFilters}
                  />
                )}

                {/* Tabla de productos */}
                <ProductTable
                  products={filteredProducts}
                  allProductsCount={allProducts.length}
                  isLoading={isLoading}
                  hasActiveLocalFilters={hasActiveLocalFilters}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onCreateClick={handleCreateClick}
                  onLocalFilterReset={handleLocalFilterReset}
                />
              </Col>
            </Row>
            <ProductModal
              show={showModal}
              onClose={() => setShowModal(false)}
              onSubmit={handleSubmit}
              isSubmitting={isCreating || isUpdating}
              initialData={editingProduct}
              existingProductTypes={existingProductTypes}
            />
            <ConfirmModal
              show={!!productToDelete}
              onClose={() => setProductToDelete(null)}
              onConfirm={confirmDeleteProduct}
              title="Eliminar Producto"
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
                    <li>Marcará el producto como eliminado en el sistema.</li>
                    <li>No podrá ser utilizado hasta que sea restaurado.</li>
                    <li>Las transacciones asociadas no se verán afectadas.</li>
                  </ul>
                </>
              }
            >
              <div className="mb-3 p-3 bg-light rounded-3">
                <p className="mb-2 fw-semibold">¿Estás seguro que deseas eliminar el producto?</p>
                <div className="d-flex flex-column gap-1">
                  <div>
                    <span className="fw-semibold text-muted">Nombre:</span>{" "}
                    <span className="ms-2">{productToDelete?.product || "N/A"}</span>
                  </div>
                </div>
              </div>
            </ConfirmModal>
            {/* Sistema de notificaciones */}
            <Toast toasts={toasts} removeToast={removeToast} />
          </Container>
        </div>
      </div>
    </Container>
  )
}