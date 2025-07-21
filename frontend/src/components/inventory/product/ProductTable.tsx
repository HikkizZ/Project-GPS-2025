import type React from "react"
import { Button, Card, Table } from "react-bootstrap"
import type { Product } from "@/types/inventory/product.types"

interface ProductTableProps {
  products: Product[]
  allProductsCount: number
  isLoading: boolean
  hasActiveLocalFilters: boolean
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onCreateClick: () => void
  onLocalFilterReset: () => void
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  allProductsCount,
  isLoading,
  hasActiveLocalFilters,
  onEdit,
  onDelete,
  onCreateClick,
  onLocalFilterReset,
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Cargando productos...</p>
      </div>
    )
  }

  return (
    <Card className="shadow-sm">
      <Card.Body>
        {products.length === 0 ? (
          hasActiveLocalFilters ? (
            <div className="text-center py-5">
              <i className="bi bi-box-x fs-1 text-muted mb-3 d-block"></i>
              <h5 className="text-muted">No hay resultados que coincidan con tu búsqueda</h5>
              <p className="text-muted">Intenta ajustar los filtros para obtener más resultados</p>
              <div className="d-flex gap-2 justify-content-center">
                <Button variant="outline-secondary" onClick={onLocalFilterReset}>
                  <i className="bi bi-arrow-clockwise me-2"></i> Limpiar Filtros Locales
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-box fs-1 text-muted mb-3 d-block"></i>
              <h5 className="text-muted">No hay productos registrados</h5>
              <p className="text-muted">Los productos aparecerán aquí cuando sean registrados</p>
              <Button variant="primary" onClick={onCreateClick}>
                <i className="bi bi-plus-lg me-2"></i>
                Registrar Primer Producto
              </Button>
            </div>
          )
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">
                <i className="bi bi-list-ul me-2"></i>
                Proveedores Registrados ({products.length} de {allProductsCount})
              </h6>
              {hasActiveLocalFilters && (
                <div className="d-flex align-items-center text-muted">
                  <i className="bi bi-funnel-fill me-1"></i>
                  <small>Filtros locales activos</small>
                </div>
              )}
            </div>
            <div className="table-responsive">
              <Table hover>
                <thead className="table-light">
                  <tr>
                    <th>Tipo de Producto</th>
                    <th>Precio de Venta (por m³)</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="fw-bold">{product.product}</div>
                      </td>
                      <td>
                        <span className="fw-bold text-success">${product.salePrice?.toLocaleString() || "N/A"}</span>
                      </td>
                      <td className="text-center">
                        <div className="btn-group">
                          <Button
                            variant="outline-primary"
                            className="me-2"
                            onClick={() => onEdit(product)}
                            title="Editar producto"
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button variant="outline-danger" onClick={() => onDelete(product)} title="Eliminar producto">
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
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
