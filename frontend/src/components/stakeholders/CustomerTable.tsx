"use client"

import type React from "react"
import { Button, Card, Table } from "react-bootstrap"
import type { Customer } from "@/types/stakeholders/customer.types"

interface CustomerTableProps {
  customers: Customer[]
  allCustomersCount: number
  isLoading: boolean
  hasActiveFilters: boolean
  hasActiveLocalFilters: boolean
  onEdit: (customer: Customer) => void
  onDelete: (customer: Customer) => void
  onCreateClick: () => void
  onFilterReset: () => void
  onLocalFilterReset: () => void
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  allCustomersCount,
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
        <p className="mt-3 text-muted">Cargando clientes...</p>
      </div>
    )
  }

  return (
    <Card className="shadow-sm">
      <Card.Body>
        {customers.length === 0 ? (
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
              <h5 className="text-muted">No hay clientes registrados</h5>
              <p className="text-muted">Los clientes aparecerán aquí cuando sean registrados</p>
              <Button variant="primary" onClick={onCreateClick}>
                <i className="bi bi-plus-lg me-2"></i>
                Registrar Primer Cliente
              </Button>
            </div>
          )
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">
                <i className="bi bi-list-ul me-2"></i>
                Clientes Registrados ({customers.length} de {allCustomersCount})
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
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <div className="fw-bold">{customer.name}</div>
                      </td>
                      <td>{customer.rut}</td>
                      <td>{customer.address}</td>
                      <td>{customer.phone}</td>
                      <td>{customer.email}</td>
                      <td className="text-center">
                        <div className="btn-group">
                          <Button
                            variant="outline-primary"
                            className="me-2"
                            onClick={() => onEdit(customer)}
                            title="Editar cliente"
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            onClick={() => onDelete(customer)}
                            title="Eliminar cliente"
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
