"use client"

import type React from "react"
import { Button, Card, Table } from "react-bootstrap"
import type { Supplier } from "@/types/stakeholders/supplier.types"

interface SupplierTableProps {
  suppliers: Supplier[]
  allSuppliersCount: number
  isLoading: boolean
  hasActiveFilters: boolean
  hasActiveLocalFilters: boolean
  onEdit: (supplier: Supplier) => void
  onDelete: (supplier: Supplier) => void
  onCreateClick: () => void
  onFilterReset: () => void
  onLocalFilterReset: () => void
}

export const SupplierTable: React.FC<SupplierTableProps> = ({
  suppliers,
  allSuppliersCount,
  isLoading,
  hasActiveFilters,
  hasActiveLocalFilters,
  onEdit,
  onDelete,
  onCreateClick,
  onFilterReset,
  onLocalFilterReset,
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Cargando proveedores...</p>
      </div>
    )
  }

  return (
    <Card className="shadow-sm">
      <Card.Body>
        {suppliers.length === 0 ? (
          hasActiveFilters || hasActiveLocalFilters ? (
            <div className="text-center py-5">
              <i className="bi bi-building-x fs-1 text-muted mb-3 d-block"></i>
              <h5 className="text-muted">No hay resultados que coincidan con tu búsqueda</h5>
              <p className="text-muted">Intenta ajustar los filtros para obtener más resultados</p>
              <div className="d-flex gap-2 justify-content-center">
                {hasActiveLocalFilters && (
                  <Button variant="outline-secondary" onClick={onLocalFilterReset}>
                    <i className="bi bi-arrow-clockwise me-2"></i> Limpiar Filtros Locales
                  </Button>
                )}
                {hasActiveFilters && (
                  <Button variant="outline-primary" onClick={onFilterReset}>
                    <i className="bi bi-arrow-clockwise me-2"></i> Mostrar Todos
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-building fs-1 text-muted mb-3 d-block"></i>
              <h5 className="text-muted">No hay proveedores registrados</h5>
              <p className="text-muted">Los proveedores aparecerán aquí cuando sean registrados</p>
              <Button variant="primary" onClick={onCreateClick}>
                <i className="bi bi-plus-lg me-2"></i>
                Registrar Primer Proveedor
              </Button>
            </div>
          )
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">
                <i className="bi bi-list-ul me-2"></i>
                Proveedores Registrados ({suppliers.length} de {allSuppliersCount})
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
                    <th>Nombre</th>
                    <th>RUT</th>
                    <th>Dirección</th>
                    <th>Teléfono</th>
                    <th>Correo</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((supplier) => (
                    <tr key={supplier.id}>
                      <td>
                        <div className="fw-bold">{supplier.name}</div>
                      </td>
                      <td>{supplier.rut}</td>
                      <td>{supplier.address}</td>
                      <td>{supplier.phone}</td>
                      <td>{supplier.email}</td>
                      <td className="text-center">
                        <div className="btn-group">
                          <Button
                            variant="outline-primary"
                            className="me-2"
                            onClick={() => onEdit(supplier)}
                            title="Editar proveedor"
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            onClick={() => onDelete(supplier)}
                            title="Eliminar proveedor"
                          >
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
