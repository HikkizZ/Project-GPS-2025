import type React from "react"
import { useState, useEffect } from "react"
import { Container, Row, Col, Button, Card } from "react-bootstrap"
import InventorySidebar from "@/components/inventory/layout/InventorySidebar"
import ProductModal from "@/components/inventory/product/ProductModal"
import ConfirmModal from "@/components/common/ConfirmModal"
import { LocalFilters } from "@/components/inventory/product/LocalFilters"
import { ProductTable } from "@/components/inventory/product/ProductTable"
import { useProducts } from "@/hooks/inventory/useProducts"
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

  // Estados para filtrado local
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

  // Manejo de filtros locales
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
                      <div>
                        <Button
                          variant={showFilters ? "outline-light" : "light"}
                          className="me-2"
                          onClick={() => setShowFilters(!showFilters)}
                        >
                          <i className={`bi bi-funnel${showFilters ? "-fill" : ""} me-2`}></i>
                          {showFilters ? "Ocultar" : "Mostrar"} Filtros
                        </Button>
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
