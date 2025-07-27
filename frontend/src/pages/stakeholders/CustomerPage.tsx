import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import InventorySidebar from "@/components/inventory/layout/InventorySidebar";
import MaquinariaSidebar from "@/components/maquinaria/maquinariaSideBar";
import CustomerModal from "@/components/stakeholders/CustomerModal";
import ConfirmModal from "@/components/common/ConfirmModal";
import { FiltersPanel } from "@/components/stakeholders/filters/FiltersPanel";
import { CustomerTable } from "@/components/stakeholders/CustomerTable";
import { useCustomers } from "@/hooks/stakeholders/useCustomers";
import { usePdfExport } from "@/hooks/usePdfExport";
import { useExcelExport } from "@/hooks/useExcelExport";
import type {
  Customer,
  CreateCustomerData,
  UpdateCustomerData,
} from "@/types/stakeholders/customer.types";
import { useToast, Toast } from "@/components/common/Toast";
import "../../styles/pages/customers.css";

export const CustomerPage: React.FC = () => {
  const {
    customers,
    loadCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
  } = useCustomers();

  const { toasts, removeToast, showSuccess, showError } = useToast();
  const { exportToPdf, isExporting: isExportingPdf } = usePdfExport();
  const { exportToExcel, isExporting: isExportingExcel } = useExcelExport();

  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [localFilters, setLocalFilters] = useState({
    name: "",
    rut: "",
    email: "",
    address: "",
    phone: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(
    undefined
  );
  const [filters, setFilters] = useState({ rut: "", email: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null
  );

  useEffect(() => {
    setAllCustomers(customers);
    setFilteredCustomers(customers);
  }, [customers]);

  useEffect(() => {
    let filtered = [...allCustomers];
    if (localFilters.name) {
      filtered = filtered.filter((customer) =>
        customer.name.toLowerCase().includes(localFilters.name.toLowerCase())
      );
    }
    if (localFilters.rut) {
      filtered = filtered.filter((customer) =>
        customer.rut.toLowerCase().includes(localFilters.rut.toLowerCase())
      );
    }
    if (localFilters.email) {
      filtered = filtered.filter((customer) =>
        customer.email.toLowerCase().includes(localFilters.email.toLowerCase())
      );
    }
    if (localFilters.address) {
      filtered = filtered.filter((customer) =>
        customer.address
          .toLowerCase()
          .includes(localFilters.address.toLowerCase())
      );
    }
    if (localFilters.phone) {
      filtered = filtered.filter((customer) =>
        customer.phone.includes(localFilters.phone)
      );
    }
    setFilteredCustomers(filtered);
  }, [allCustomers, localFilters]);

  const handleCreateClick = () => {
    setEditingCustomer(undefined);
    setShowModal(true);
  };

  const handleEditClick = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowModal(true);
  };

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
  };

  const confirmDeleteCustomer = async () => {
    if (!customerToDelete) return;
    const result = await deleteCustomer(customerToDelete.id);
    if (result.success) {
      showSuccess(
        "¡Cliente eliminado!",
        "El cliente se ha eliminado exitosamente del sistema",
        4000
      );
    } else {
      showError(
        "Error al eliminar",
        result.error || "Ocurrió un error al eliminar el cliente."
      );
    }
    setCustomerToDelete(null);
  };

  const handleSubmit = async (
    data: CreateCustomerData | UpdateCustomerData
  ) => {
    const isEdit = Boolean(editingCustomer);
    const result = isEdit
      ? await updateCustomer(editingCustomer!.id, data as UpdateCustomerData)
      : await createCustomer(data as CreateCustomerData);
    if (result.success) {
      showSuccess(
        isEdit ? "¡Cliente actualizado!" : "¡Cliente creado!",
        result.message,
        4000
      );
      setShowModal(false);
    } else {
      showError("Error", result.error || "Ocurrió un error inesperado");
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loadCustomers(filters);
  };

  const handleFilterReset = async () => {
    setFilters({ rut: "", email: "" });
    await loadCustomers({});
  };

  const handleLocalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocalFilterReset = () => {
    setLocalFilters({
      name: "",
      rut: "",
      email: "",
      address: "",
      phone: "",
    });
  };

  const handleExportToPdf = useCallback(async () => {
    if (filteredCustomers.length === 0) {
      showError("Sin datos para exportar", "No hay clientes para exportar.");
      return;
    }

    const tempDiv = document.createElement("div");
    tempDiv.id = "temp-customers-export";
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";
    tempDiv.style.top = "0";
    tempDiv.style.width = "1400px";
    tempDiv.style.backgroundColor = "white";
    tempDiv.style.padding = "20px";
    document.body.appendChild(tempDiv);

    try {
      const { createRoot } = await import("react-dom/client");
      const root = createRoot(tempDiv);
      const React = await import("react");

      const ExportTable = React.createElement(
        "div",
        {
          id: "temp-customers-export-content",
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
              React.createElement(
                "h2",
                { key: "title" },
                "Directorio de Clientes"
              ),
              React.createElement(
                "p",
                {
                  key: "date",
                  style: { color: "#666", margin: "5px 0" },
                },
                `Generado el: ${new Date().toLocaleDateString("es-ES")}`
              ),
              React.createElement(
                "p",
                {
                  key: "count",
                  style: { color: "#666", margin: "5px 0" },
                },
                `Total de clientes: ${filteredCustomers.length}`
              ),
            ]
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
                      "Nombre"
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
                      "RUT"
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
                      "Dirección"
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
                      "Teléfono"
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
                      "Correo Electrónico"
                    ),
                  ]
                )
              ),
              React.createElement(
                "tbody",
                { key: "tbody" },
                filteredCustomers.map((customer, index) =>
                  React.createElement(
                    "tr",
                    {
                      key: customer.id,
                      style: {
                        backgroundColor: index % 2 === 0 ? "#fff" : "#f8f9fa",
                      },
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
                        customer.name
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
                        customer.rut
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
                        customer.address
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
                        customer.phone
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
                        customer.email
                      ),
                    ]
                  )
                )
              ),
            ]
          ),
        ]
      );

      root.render(ExportTable);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const currentDate = new Date().toLocaleDateString("es-ES");
      const filename = `directorio-clientes-${currentDate.replace(
        /\//g,
        "-"
      )}.pdf`;
      const success = await exportToPdf(
        "temp-customers-export-content",
        filename
      );

      if (success) {
        showSuccess(
          "¡Exportación exitosa!",
          "El directorio PDF se ha exportado correctamente.",
          4000
        );
      } else {
        showError(
          "Error en la exportación",
          "No se pudo exportar el directorio PDF. Por favor, inténtalo de nuevo."
        );
      }
    } catch (error) {
      console.error("Error en exportación PDF:", error);
      showError(
        "Error en la exportación",
        "No se pudo exportar el directorio PDF. Por favor, inténtalo de nuevo."
      );
    } finally {
      if (document.body.contains(tempDiv)) {
        document.body.removeChild(tempDiv);
      }
    }
  }, [filteredCustomers, exportToPdf, showSuccess, showError]);

  const handleExportToExcel = useCallback(async () => {
    if (filteredCustomers.length === 0) {
      showError("Sin datos para exportar", "No hay clientes para exportar.");
      return;
    }

    try {
      const excelData = filteredCustomers.map((customer, index) => ({
        "N°": index + 1,
        "Nombre Completo": customer.name,
        RUT: customer.rut,
        Dirección: customer.address,
        Teléfono: customer.phone,
        "Correo Electrónico": customer.email,
      }));

      const summaryData = [
        { Métrica: "Total de Clientes", Valor: filteredCustomers.length },
        {
          Métrica: "Clientes con Email",
          Valor: filteredCustomers.filter(
            (c) => c.email && c.email.trim() !== ""
          ).length,
        },
        {
          Métrica: "Clientes con Teléfono",
          Valor: filteredCustomers.filter(
            (c) => c.phone && c.phone.trim() !== ""
          ).length,
        },
        {
          Métrica: "Clientes con Dirección",
          Valor: filteredCustomers.filter(
            (c) => c.address && c.address.trim() !== ""
          ).length,
        },
        {
          Métrica: "Fecha de Exportación",
          Valor: new Date().toLocaleDateString("es-ES"),
        },
      ];

      const sheets = [
        { data: summaryData, sheetName: "Resumen" },
        { data: excelData, sheetName: "Clientes" },
      ];

      const filename = "directorio-clientes";
      await exportToExcel(excelData, filename, "Clientes");

      showSuccess(
        "¡Exportación exitosa!",
        "El directorio Excel se ha exportado correctamente.",
        4000
      );
    } catch (error) {
      console.error("Error en exportación Excel:", error);
      showError(
        "Error en la exportación",
        "No se pudo exportar el directorio Excel. Por favor, inténtalo de nuevo."
      );
    }
  }, [filteredCustomers, exportToExcel, showSuccess, showError]);

  const hasActiveFilters = Object.values(filters).some(
    (value) => value.trim() !== ""
  );
  const hasActiveLocalFilters = Object.values(localFilters).some(
    (value) => value.trim() !== ""
  );

  const location = useLocation();
  const currentPath = location.pathname;

  const SidebarComponent = currentPath.startsWith("/maquinaria")
    ? MaquinariaSidebar
    : InventorySidebar;

  return (
    <Container fluid className="inventory-page p-0">
      <div className="d-flex">
        {/* Sidebar lateral */}
        <div className="inventory-sidebar-wrapper">
          <SidebarComponent />
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
                        <i className="bi bi-people fs-4 me-3"></i>
                        <div>
                          <h3 className="mb-1">Gestión de Clientes</h3>
                          <p className="mb-0 opacity-75">
                            Administrar información de clientes del sistema
                          </p>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        {/* Botones de exportación */}
                        <Button
                          variant="outline-light"
                          onClick={handleExportToPdf}
                          disabled={
                            isExportingPdf ||
                            filteredCustomers.length === 0 ||
                            isLoading
                          }
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
                          disabled={
                            isExportingExcel ||
                            filteredCustomers.length === 0 ||
                            isLoading
                          }
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
                          <i
                            className={`bi bi-funnel${
                              showFilters ? "-fill" : ""
                            } me-2`}
                          ></i>
                          {showFilters ? "Ocultar" : "Mostrar"} Panel de Filtros
                        </Button>
                        <Button variant="light" onClick={handleCreateClick}>
                          <i className="bi bi-plus-lg me-2"></i>
                          Nuevo Cliente
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
                {/* Tabla de clientes */}
                <CustomerTable
                  customers={filteredCustomers}
                  allCustomersCount={allCustomers.length}
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
            <CustomerModal
              show={showModal}
              onClose={() => setShowModal(false)}
              onSubmit={handleSubmit}
              isSubmitting={isCreating || isUpdating}
              initialData={editingCustomer}
            />
            <ConfirmModal
              show={!!customerToDelete}
              onClose={() => setCustomerToDelete(null)}
              onConfirm={confirmDeleteCustomer}
              title="Eliminar cliente"
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
                    <li>Marcará el cliente como eliminado en el sistema.</li>
                    <li>No podrá ser utilizado hasta que sea restaurado.</li>
                    <li>Las transacciones asociadas no se verán afectadas.</li>
                  </ul>
                </>
              }
            >
              <div className="mb-3 p-3 bg-light rounded-3">
                <p className="mb-2 fw-semibold">
                  ¿Estás seguro que deseas eliminar al cliente?
                </p>
                <div className="d-flex flex-column gap-1">
                  <div>
                    <span className="fw-semibold text-muted">Nombre:</span>{" "}
                    <span className="ms-2">
                      {customerToDelete?.name || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="fw-semibold text-muted">RUT:</span>{" "}
                    <span className="ms-2">
                      {customerToDelete?.rut || "N/A"}
                    </span>
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
  );
};
