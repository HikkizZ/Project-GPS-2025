import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap";
import { useMaintenanceRecords } from "@/hooks/MachinaryMaintenance/MaintenanceRecord/useMaintenanceRecords";
import CompletedMaintenanceList from "@/components/MachineryMaintenance/MaintenanceRecord/ListCompleteMaintenance";
import MaintenanceSidebar from "@/components/MachineryMaintenance/MaintenanceSidebar";
import MantencionLocalFilters from "@/components/MachineryMaintenance/MaintenanceRecord/MantencionLocalFilters";
import { maquinariaService } from "@/services/maquinaria/maquinaria.service";
import { trabajadorService } from "@/services/recursosHumanos/trabajador.service";
import type { Maquinaria } from "@/types/maquinaria.types";
import type { Trabajador } from "@/types/recursosHumanos/trabajador.types";
import type { MaintenanceRecord } from "@/types/machinaryMaintenance/maintenanceRecord.types";
import DetalleMantencionModal from "@/components/MachineryMaintenance/MaintenanceRecord/DetalleMantencionModal";


const MantencionesCompletadasPage: React.FC = () => {
  const { records, loading, error } = useMaintenanceRecords();

  const [filteredRecords, setFilteredRecords] = useState<MaintenanceRecord[]>([]);
  const [filterValues, setFilterValues] = useState({
    estado: "",
    grupo: "",
    patente: "",
    mecanicoId: "",
  });
  const [maquinarias, setMaquinarias] = useState<Maquinaria[]>([]);
  const [mecanicos, setMecanicos] = useState<Trabajador[]>([]);
  const [showFilters, setShowFilters] = useState(false);


  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState<MaintenanceRecord | null>(null);

  const handleVerDetalle = (record: MaintenanceRecord) => {
    setDetalleSeleccionado(record);
    setShowDetalleModal(true);
  };

  const handleCerrarDetalle = () => {
    setShowDetalleModal(false);
    setDetalleSeleccionado(null);
  };

  const hasActiveFilters = Object.values(filterValues).some((v) => v.trim() !== "");

  useEffect(() => {
    const cargarAuxiliares = async () => {
      const [maqRes, mecRes] = await Promise.all([
        maquinariaService.obtenerTodasLasMaquinarias(),
        trabajadorService.getTrabajadores({ todos: true }),
      ]);

      if (maqRes.success && maqRes.data) setMaquinarias(maqRes.data);
      if (mecRes.success && mecRes.data) {
        const soloMecanicos = mecRes.data.filter(t => t.usuario?.role === "Mecánico");
        setMecanicos(soloMecanicos);
      }
    };

    cargarAuxiliares();
  }, []);

  useEffect(() => {
    let filtrados = records.filter((r) => r.estado === "completada" || r.estado === "irrecuperable");

    if (filterValues.grupo) {
      filtrados = filtrados.filter(r => r.maquinaria.grupo === filterValues.grupo);
    }
    if (filterValues.patente) {
      filtrados = filtrados.filter(r => r.maquinaria.patente === filterValues.patente);
    }
    if (filterValues.mecanicoId) {
      filtrados = filtrados.filter(r => r.mecanicoAsignado?.id?.toString() === filterValues.mecanicoId);
    }

    setFilteredRecords(filtrados);
  }, [records, filterValues]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilterValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilterValues({
      estado: "",
      grupo: "",
      patente: "",
      mecanicoId: "",
    });
    setShowFilters(false);
  };

  return (
    <div className="d-flex">
      <MaintenanceSidebar />
      <div className="flex-grow-1">
        <Container fluid className="py-4">
          <Row>
            <Col>
              {/* Header */}
              <Card className="shadow-sm mb-3">
                <Card.Header className="bg-gradient-primary text-white">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-check2-circle fs-4 me-3"></i>
                      <div>
                        <h3 className="mb-1">Mantenciones Completadas</h3>
                        <p className="mb-0 opacity-75">
                          Revisa el historial de mantenciones finalizadas
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={showFilters ? "outline-light" : "light"}
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <i className={`bi bi-funnel${showFilters ? "-fill" : ""} me-2`} />
                      {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
                    </Button>
                  </div>
                </Card.Header>
              </Card>

              {/* Filtros */}
              {showFilters && (
                <MantencionLocalFilters
                  filters={filterValues}
                  maquinarias={maquinarias}
                  mecanicos={mecanicos}
                  onFilterChange={handleFilterChange}
                  onReset={handleResetFilters}
                  hasActiveFilters={hasActiveFilters}
                />
              )}

              {/* Contenido principal */}
              <Card className="shadow-sm">
                <Card.Header className="bg-light">
                  <h5 className="mb-0">
                    <i className="bi bi-list-check me-2"></i>
                    Lista de Mantenciones Completadas
                  </h5>
                </Card.Header>
                <Card.Body className="p-0">
                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <p className="mt-3 text-muted">Cargando mantenciones completadas...</p>
                    </div>
                  ) : error ? (
                    <Alert variant="danger" className="m-3">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      {error}
                    </Alert>
                  ) : (
                    <CompletedMaintenanceList 
                      records={filteredRecords}
                      isLoading={loading}
                      onVerDetalle={handleVerDetalle}
                    />
                  )}
                </Card.Body>
                <DetalleMantencionModal
                  show={showDetalleModal}
                  onHide={handleCerrarDetalle}
                  record={detalleSeleccionado}
                />
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default MantencionesCompletadasPage;
