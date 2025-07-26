import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Container, Row, Col, Button, Card } from "react-bootstrap"
import InventorySidebar from "@/components/inventory/layout/InventorySidebar"
import SupplierModal from "@/components/stakeholders/SupplierModal"
import ConfirmModal from "@/components/common/ConfirmModal"
import { FiltersPanel } from "@/components/stakeholders/filters/FiltersPanel"
import { SupplierTable } from "@/components/stakeholders/SupplierTable"
import { useSuppliers } from "@/hooks/stakeholders/useSuppliers"
import { usePdfExport } from "@/hooks/usePdfExport"
import { useExcelExport } from "@/hooks/useExcelExport"
import type { Supplier, CreateSupplierData, UpdateSupplierData } from "@/types/stakeholders/supplier.types"
import { useToast, Toast } from "@/components/common/Toast"
import "../../styles/pages/suppliers.css"

export const SupplierPage: React.FC = () => {
  const {
    suppliers,
    loadSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
  } = useSuppliers()

  const { toasts, removeToast, showSuccess, showError } = useToast()
  const { exportToPdf, isExporting: isExportingPdf } = usePdfExport()
  const { exportToExcel, isExporting: isExportingExcel } = useExcelExport()

  const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([])
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([])
  const [localFilters, setLocalFilters] = useState({
    name: "",
    rut: "",
    email: "",
    address: "",
    phone: "",
  })
  const [showModal, setShowModal] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>(undefined)
  const [filters, setFilters] = useState({ rut: "", email: "" })
  const [showFilters, setShowFilters] = useState(false)
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null)

  useEffect(() => {
    setAllSuppliers(suppliers)
    setFilteredSuppliers(suppliers)
  }, [suppliers])

  useEffect(() => {
    let filtered = [...allSuppliers]
    if (localFilters.name) {
      filtered = filtered.filter((supplier) => supplier.name.toLowerCase().includes(localFilters.name.toLowerCase()))
    }
    if (localFilters.rut) {
      filtered = filtered.filter((supplier) => supplier.rut.toLowerCase().includes(localFilters.rut.toLowerCase()))
    }
    if (localFilters.email) {
      filtered = filtered.filter((supplier) => supplier.email.toLowerCase().includes(localFilters.email.toLowerCase()))
    }
    if (localFilters.address) {
      filtered = filtered.filter((supplier) =>
        supplier.address.toLowerCase().includes(localFilters.address.toLowerCase()),
      )
    }
    if (localFilters.phone) {
      filtered = filtered.filter((supplier) => supplier.phone.includes(localFilters.phone))
    }
    setFilteredSuppliers(filtered)
  }, [allSuppliers, localFilters])

  const handleCreateClick = () => {
    setEditingSupplier(undefined)
    setShowModal(true)
  }

  const handleEditClick = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setShowModal(true)
  }

  const handleDeleteClick = (supplier: Supplier) => {
    setSupplierToDelete(supplier)
  }

  const confirmDeleteSupplier = async () => {
    const result = await deleteSupplier(supplierToDelete.id)
    if (result.success) {
      showSuccess("¡Proveedor eliminado!", "El proveedor se ha eliminado exitosamente del sistema", 4000)
    } else {
      showError("Error al eliminar", result.error || "Ocurrió un error al eliminar el proveedor.")
    }
    setSupplierToDelete(null)
  }

  const handleSubmit = async (data: CreateSupplierData | UpdateSupplierData) => {
    const isEdit = Boolean(editingSupplier)
    const result = isEdit
      ? await updateSupplier(editingSupplier!.id, data as UpdateSupplierData)
      : await createSupplier(data as CreateSupplierData)
    if (result.success) {
      showSuccess(isEdit ? "¡Proveedor actualizado!" : "¡Proveedor creado!", result.message, 4000)
      setShowModal(false)
    } else {
      showError("Error", result.error || "Ocurrió un error inesperado")
    }
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleFilterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await loadSuppliers(filters)
  }

  const handleFilterReset = async () => {
    setFilters({ rut: "", email: "" })
    await loadSuppliers({})
  }

  const handleLocalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLocalFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleLocalFilterReset = () => {
    setLocalFilters({
      name: "",
      rut: "",
      email: "",
      address: "",
      phone: "",
    })
  }

  const handleExportToPdf = useCallback(async () => {
    if (filteredSuppliers.length === 0) {
      showError("Sin datos para exportar", "No hay proveedores para exportar.")
      return
    }

    const tempDiv = document.createElement("div")
    tempDiv.id = "temp-suppliers-export"
    tempDiv.style.position = "absolute"
    tempDiv.style.left = "-9999px"
    tempDiv.style.top = "0"
    tempDiv.style.width = "1400px"
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
          id: "temp-suppliers-export-content",
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
              React.createElement("h2", { key: "title" }, "Directorio de Proveedores"),
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
                `Total de proveedores: ${filteredSuppliers.length}`,
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
                fontSize: "12px",
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
                        key: "name-header",
                        style: {
                          border: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "left",
                          fontWeight: "bold",
                          width: "20%",
                        },
                      },
                      "Nombre",
                    ),
                    React.createElement(
                      "th",
                      {
                        key: "rut-header",
                        style: {
                          border: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "left",
                          fontWeight: "bold",
                          width: "15%",
                        },
                      },
                      "RUT",
                    ),
                    React.createElement(
                      "th",
                      {
                        key: "address-header",
                        style: {
                          border: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "left",
                          fontWeight: "bold",
                          width: "25%",
                        },
                      },
                      "Dirección",
                    ),
                    React.createElement(
                      "th",
                      {
                        key: "phone-header",
                        style: {
                          border: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "left",
                          fontWeight: "bold",
                          width: "15%",
                        },
                      },
                      "Teléfono",
                    ),
                    React.createElement(
                      "th",
                      {
                        key: "email-header",
                        style: {
                          border: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "left",
                          fontWeight: "bold",
                          width: "25%",
                        },
                      },
                      "Correo Electrónico",
                    ),
                  ],
                ),
              ),
              React.createElement(
                "tbody",
                { key: "tbody" },
                filteredSuppliers.map((supplier, index) =>
                  React.createElement(
                    "tr",
                    {
                      key: supplier.id,
                      style: { backgroundColor: index % 2 === 0 ? "#fff" : "#f8f9fa" },
                    },
                    [
                      React.createElement(
                        "td",
                        {
                          key: "name",
                          style: {
                            border: "1px solid #ddd",
                            padding: "8px",
                            fontWeight: "bold",
                          },
                        },
                        supplier.name,
                      ),
                      React.createElement(
                        "td",
                        {
                          key: "rut",
                          style: {
                            border: "1px solid #ddd",
                            padding: "8px",
                          },
                        },
                        supplier.rut,
                      ),
                      React.createElement(
                        "td",
                        {
                          key: "address",
                          style: {
                            border: "1px solid #ddd",
                            padding: "8px",
                          },
                        },
                        supplier.address,
                      ),
                      React.createElement(
                        "td",
                        {
                          key: "phone",
                          style: {
                            border: "1px solid #ddd",
                            padding: "8px",
                          },
                        },
                        supplier.phone,
                      ),
                      React.createElement(
                        "td",
                        {
                          key: "email",
                          style: {
                            border: "1px solid #ddd",
                            padding: "8px",
                          },
                        },
                        supplier.email,
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
      const filename = `directorio-proveedores-${currentDate.replace(/\//g, "-")}.pdf`
      const success = await exportToPdf("temp-suppliers-export-content", filename)

      if (success) {
        showSuccess("¡Exportación exitosa!", "El directorio PDF se ha exportado correctamente.", 4000)
      } else {
        showError("Error en la exportación", "No se pudo exportar el directorio PDF. Por favor, inténtalo de nuevo.")
      }
    } catch (error) {
      console.error("Error en exportación PDF:", error)
      showError("Error en la exportación", "No se pudo exportar el directorio PDF. Por favor, inténtalo de nuevo.")
    } finally {
      if (document.body.contains(tempDiv)) {
        document.body.removeChild(tempDiv)
      }
    }
  }, [filteredSuppliers, exportToPdf, showSuccess, showError])

  const handleExportToExcel = useCallback(async () => {
    if (filteredSuppliers.length === 0) {
      showError("Sin datos para exportar", "No hay proveedores para exportar.")
      return
    }

    try {
      const excelData = filteredSuppliers.map((supplier, index) => ({
        "N°": index + 1,
        "Nombre de la Empresa": supplier.name,
        RUT: supplier.rut,
        Dirección: supplier.address,
        Teléfono: supplier.phone,
        "Correo Electrónico": supplier.email,
      }))

      const summaryData = [
        { Métrica: "Total de Proveedores", Valor: filteredSuppliers.length },
        {
          Métrica: "Proveedores con Email",
          Valor: filteredSuppliers.filter((s) => s.email && s.email.trim() !== "").length,
        },
        {
          Métrica: "Proveedores con Teléfono",
          Valor: filteredSuppliers.filter((s) => s.phone && s.phone.trim() !== "").length,
        },
        {
          Métrica: "Proveedores con Dirección",
          Valor: filteredSuppliers.filter((s) => s.address && s.address.trim() !== "").length,
        },
        { Métrica: "Fecha de Exportación", Valor: new Date().toLocaleDateString("es-ES") },
      ]

      const filename = "directorio-proveedores"
      await exportToExcel(excelData, filename, "Proveedores")

      showSuccess("¡Exportación exitosa!", "El directorio Excel se ha exportado correctamente.", 4000)
    } catch (error) {
      console.error("Error en exportación Excel:", error)
      showError("Error en la exportación", "No se pudo exportar el directorio Excel. Por favor, inténtalo de nuevo.")
    }
  }, [filteredSuppliers, exportToExcel, showSuccess, showError])

  const hasActiveFilters = Object.values(filters).some((value) => value.trim() !== "")
  const hasActiveLocalFilters = Object.values(localFilters).some((value) => value.trim() !== "")

  return (
    <Container fluid className="inventory-page p-0">
      <div className="d-flex">
        {/* Sidebar lateral */}
        <div className="inventory-sidebar-wrapper">
          <InventorySidebar />
        </div>
        {/* Contenido principal */}
        <div className="inventory-main-content flex-grow-1">
          <Container fluid className="py-2">
            <Row>
              <Col>
                {/* Encabezado de página */}
                <Card className="shadow-sm mb-3">
                  <Card.Header className="bg-gradient-primary text-white">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-truck fs-4 me-3"></i>
                        <div>
                          <h3 className="mb-1">Gestión de Proveedores</h3>
                          <p className="mb-0 opacity-75">Administrar información de proveedores del sistema</p>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        {/* Botones de exportación */}
                        <Button
                          variant="outline-light"
                          onClick={handleExportToPdf}
                          disabled={isExportingPdf || filteredSuppliers.length === 0 || isLoading}
                          title="Exportar directorio a PDF"
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
                          disabled={isExportingExcel || filteredSuppliers.length === 0 || isLoading}
                          title="Exportar directorio a Excel"
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
                        <Button
                          variant={showFilters ? "outline-light" : "light"}
                          className="me-2"
                          onClick={() => setShowFilters(!showFilters)}
                        >
                          <i className={`bi bi-funnel${showFilters ? "-fill" : ""} me-2`}></i>
                          {showFilters ? "Ocultar" : "Mostrar"} Panel de Filtros
                        </Button>
                        <Button variant="light" onClick={handleCreateClick}>
                          <i className="bi bi-plus-lg me-2"></i>
                          Nuevo Proveedor
                        </Button>
                      </div>
                    </div>
                  </Card.Header>
                </Card>
                {/* Panel de filtros */}
                <FiltersPanel
                  showFilters={showFilters}
                  serverFilters={filters}
                  onServerFilterChange={handleFilterChange}
                  onServerFilterSubmit={handleFilterSubmit}
                  onServerFilterReset={handleFilterReset}
                  localFilters={localFilters}
                  onLocalFilterChange={handleLocalFilterChange}
                  onLocalFilterReset={handleLocalFilterReset}
                  hasActiveLocalFilters={hasActiveLocalFilters}
                />
                {/* Tabla de proveedores */}
                <SupplierTable
                  suppliers={filteredSuppliers}
                  allSuppliersCount={allSuppliers.length}
                  isLoading={isLoading}
                  hasActiveFilters={hasActiveFilters}
                  hasActiveLocalFilters={hasActiveLocalFilters}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onCreateClick={handleCreateClick}
                  onFilterReset={handleFilterReset}
                  onLocalFilterReset={handleLocalFilterReset}
                />
              </Col>
            </Row>
            <SupplierModal
              show={showModal}
              onClose={() => setShowModal(false)}
              onSubmit={handleSubmit}
              isSubmitting={isCreating || isUpdating}
              initialData={editingSupplier}
            />
            <ConfirmModal
              show={!!supplierToDelete}
              onClose={() => setSupplierToDelete(null)}
              onConfirm={confirmDeleteSupplier}
              title="Eliminar proveedor"
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
                    <li>Marcará el proveedor como eliminado en el sistema.</li>
                    <li>No podrá ser utilizado hasta que sea restaurado.</li>
                    <li>Las transacciones asociadas no se verán afectadas.</li>
                  </ul>
                </>
              }
            >
              <div className="mb-3 p-3 bg-light rounded-3">
                <p className="mb-2 fw-semibold">¿Estás seguro que deseas eliminar al proveedor?</p>
                <div className="d-flex flex-column gap-1">
                  <div>
                    <span className="fw-semibold text-muted">Nombre:</span>{" "}
                    <span className="ms-2">{supplierToDelete?.name || "N/A"}</span>
                  </div>
                  <div>
                    <span className="fw-semibold text-muted">RUT:</span>{" "}
                    <span className="ms-2">{supplierToDelete?.rut || "N/A"}</span>
                  </div>
                </div>
              </div>
            </ConfirmModal>
            <Toast toasts={toasts} removeToast={removeToast} />
          </Container>
        </div>
      </div>
    </Container>
  )
}