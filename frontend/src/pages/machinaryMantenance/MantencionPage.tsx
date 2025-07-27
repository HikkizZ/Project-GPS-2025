import type React from "react"
import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap";
import type { MaintenanceRecord } from "@/types/machinaryMaintenance/maintenanceRecord.types"
import type { UpdateMaintenanceRecordData,  } from "@/types/machinaryMaintenance/maintenanceRecord.types"
import { EstadoMantencion } from "@/types/machinaryMaintenance/maintenanceRecord.types";
import maintenanceRecordService from "@/services/machinaryMaintenance/maintenanceRecord.service";
import { useMaintenanceRecords } from "@/hooks/MachinaryMaintenance/MaintenanceRecord/useMaintenanceRecords"
import { useCreateMaintenanceRecord } from "@/hooks/MachinaryMaintenance/MaintenanceRecord/useCreateMaintenanceRecord"
import { useUpdateMaintenanceRecord } from "@/hooks/MachinaryMaintenance/MaintenanceRecord/useUpdateMaintenanceRecord"
import { useDeleteMaintenanceRecord } from "@/hooks/MachinaryMaintenance/MaintenanceRecord/useDeleteMaintenanceRecord"
import MaintenanceRecordList from "@/components/MachineryMaintenance/MaintenanceRecord/MaintenanceRecordList"
import MaintenanceRecordModal from "@/components/MachineryMaintenance/MaintenanceRecord/MaintenanceRecordModal"
import "@/styles/pages/mantencionMaquinaria.css"
import { Toast, useToast } from "@/components/common/Toast"
import MaintenanceSparePartPanel from "@/components/MachineryMaintenance/MaintenanceSpareParts/MaintenanceSparePartPanel"
import FinalizeMaintenanceModal from '@/components/MachineryMaintenance/MaintenanceRecord/FinalizeMaintenanceModal';
import MaintenanceSidebar from "@/components/MachineryMaintenance/MaintenanceSidebar";
import MantencionLocalFilters from "@/components/MachineryMaintenance/MaintenanceRecord/MantencionLocalFilters"
import { maquinariaService } from "@/services/maquinaria/maquinaria.service"
import { trabajadorService } from "@/services/recursosHumanos/trabajador.service"
import type { Maquinaria } from "@/types/maquinaria.types"
import type { Trabajador } from "@/types/recursosHumanos/trabajador.types"
import AssignMecanicoModal from "@/components/MachineryMaintenance/MaintenanceRecord/AssignMecanicoModal"
import EstadoFinalizacionModal from "@/components/MachineryMaintenance/MaintenanceRecord/EstadoFinalizacionModal";
import Pagination from "@/components/MachineryMaintenance/Pagination";
import { useAuth } from "@/context/useAuth";




const MantencionPage: React.FC = () => {
  const { records, loading, error, reload } = useMaintenanceRecords()
  const { create, loading: creating } = useCreateMaintenanceRecord()
  const { update, loading: updating } = useUpdateMaintenanceRecord()
  const { deleteRecord, loading: deleting } = useDeleteMaintenanceRecord()

  const { toasts, removeToast, showSuccess, showError } = useToast()

  const [showModal, setShowModal] = useState(false)
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null)
  const [showSparePartPanel, setShowSparePartPanel] = useState(false)
  const [finishingRecord, setFinishingRecord] = useState<MaintenanceRecord | null>(null);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [selectedMantencionId, setSelectedMantencionId] = useState<number | null>(null)
  const [grupoMaquinariaSeleccionado, setGrupoMaquinariaSeleccionado] = useState<string>("")
  const [filteredRecords, setFilteredRecords] = useState<MaintenanceRecord[]>([])
  const [maquinarias, setMaquinarias] = useState<Maquinaria[]>([])
  const [mecanicos, setMecanicos] = useState<Trabajador[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [recordToAssign, setRecordToAssign] = useState<MaintenanceRecord | null>(null);
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<EstadoMantencion.COMPLETADA | EstadoMantencion.IRRECUPERABLE | null>(null);


  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const sortedRecords = [...filteredRecords].sort((a, b) =>
    a.maquinaria.patente.localeCompare(b.maquinaria.patente)
  );

  const paginatedRecords = sortedRecords.slice(startIndex, endIndex);

  


  const handleOpenAssignModal = (record: MaintenanceRecord) => {
    setRecordToAssign(record);
    setShowAssignModal(true); 
  };

  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
    setRecordToAssign(null);
  };


   const { user } = useAuth();
   
   const resolveUserIdFromRut = async (rut: string): Promise<number | null> => {
      try {
        const result = await trabajadorService.getTrabajadores({ rut, todos: true });

        if (!result.success || !result.data || result.data.length === 0) return null;

        const trabajador = result.data[0];

        // Retornar el ID del usuario (no del trabajador)
        return trabajador.usuario?.id || null;
      } catch (error) {
        console.error("Error al buscar trabajador por RUT:", error);
        return null;
      }
    };

const handleAcceptMaintenance = async (record: MaintenanceRecord) => {
  console.log("1");
  console.log("USER CONTEXT:", user);

  let mecanicoId = user?.id || 0;

  if (mecanicoId <= 0 && user?.rut) {
    try {
      const result = await trabajadorService.getTrabajadores({ rut: user.rut, todos: true });

      if (!result.success || !result.data || result.data.length === 0) {
        showError("Error", "No se encontró un trabajador con tu RUT.");
        return;
      }

      const trabajador = result.data[0];

      if (!trabajador.usuario?.id || trabajador.usuario.id <= 0) {
        showError("Error", "El trabajador no tiene un ID de usuario válido.");
        return;
      }

      mecanicoId = trabajador.usuario.id;
      console.log("ID obtenido desde trabajador:", mecanicoId);
    } catch (error) {
      console.error("Error al buscar trabajador por RUT:", error);
      showError("Error", "Ocurrió un error al buscar tu ID como mecánico.");
      return;
    }
  }

  if (mecanicoId <= 0) {
    showError("Error", "El usuario actual no tiene un ID válido.");
    return;
  }

  console.log("2");
  try {
    console.log("3");
    await update(record.id, {
      mecanicoId,
      estado: "en_proceso",
    });
    console.log("5");
    showSuccess("Mantención aceptada", "Has sido asignado como mecánico responsable.");
    reload();
  } catch (error) {
    console.error("Error al aceptar mantención:", error);
    showError("Error", "No se pudo aceptar la mantención");
  }
};


/* ---------------------------------------------------------------------------------------------------------- */
  const handleAssignMecanico = async (mecanicoId: number) => {
    if (!recordToAssign) return;

    const data: UpdateMaintenanceRecordData = {
      mecanicoId,
    };

    await update(recordToAssign.id, data);
      showSuccess("Mecánico asignado", "La mantención ahora tiene un mecánico asignado.");
      handleCloseAssignModal();
      reload();
    };

    const [filterValues, setFilterValues] = useState({
    estado: "",
    grupo: "",
    patente: "",
    mecanicoId: "",
    })

    useEffect(() => {
      const cargarDatosAuxiliares = async () => {
        const [maqRes, mecRes] = await Promise.all([
          maquinariaService.obtenerTodasLasMaquinarias(),
          trabajadorService.getTrabajadores({ todos: true }),
        ])

        if (maqRes.success && maqRes.data) setMaquinarias(maqRes.data)

        if (mecRes.success && mecRes.data) {
          const mecanicosFiltrados = mecRes.data.filter(
          (trab) => trab.usuario?.role === "Mecánico"
          )
          setMecanicos(mecanicosFiltrados)
        }

      }

      cargarDatosAuxiliares()
    }, [])

  useEffect(() => {
  let filtrados = records.filter(
    (r) => r.estado !== "completada" && r.estado !== "irrecuperable"
  );

  if (filterValues.estado) {
    filtrados = filtrados.filter((r) => r.estado === filterValues.estado);
  }
  
  if (filterValues.estado) {
    filtrados = filtrados.filter((r) => r.estado === filterValues.estado);
  }

  if (filterValues.grupo) {
    filtrados = filtrados.filter((r) => r.maquinaria.grupo === filterValues.grupo);
  }

  if (filterValues.patente) {
    filtrados = filtrados.filter((r) => r.maquinaria.patente === filterValues.patente);
  }

  if (filterValues.mecanicoId) {
    filtrados = filtrados.filter(
      (r) => r.mecanicoAsignado?.id?.toString() === filterValues.mecanicoId
    );
  }

  setFilteredRecords(filtrados);
   setCurrentPage(1);
}, [records, filterValues]);


  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFilterValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleResetFilters = () => {
    setFilterValues({
      estado: "",
      grupo: "",
      patente: "",
      mecanicoId: "",
    })
  }

  const hasActiveFilters = Object.values(filterValues).some((v) => v.trim() !== "")


  const handleOpenSpareParts = (mantencion: MaintenanceRecord) => {
    setSelectedMantencionId(mantencion.id)
    setGrupoMaquinariaSeleccionado(mantencion.maquinaria.grupo)
    setShowSparePartPanel(true)
  }

  const handleOpenModal = (record?: MaintenanceRecord) => {
    setEditingRecord(record || null)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingRecord(null)
  }

  




  

  const handleOpenFinishModal = async (record: MaintenanceRecord) => {
    if (!record.mecanicoAsignado?.id) {
      showError("No se puede finalizar", "Debe asignar un mecánico antes de finalizar la mantención.");
      return;
    }

    const { data: actualizado, success } = await maintenanceRecordService.getById(record.id);

    if (!success || !actualizado) {
      showError("Error", "No se pudo verificar los repuestos asignados.");
      return;
    }

    const tieneRepuestos = actualizado.repuestosUtilizados && actualizado.repuestosUtilizados.length > 0;

    if (!tieneRepuestos) {
      showError("No se puede finalizar", "Debe registrar al menos un repuesto utilizado antes de finalizar la mantención.");
      return;
    }

    setFinishingRecord(actualizado);
    setShowEstadoModal(true);
  };


    const handleCloseFinishModal = () => {
      setFinishingRecord(null);
      setShowFinishModal(false);
    };

    const handleSeleccionEstado = (estado: "completada" | "irrecuperable") => {
      const estadoEnum = estado === "completada"
        ? EstadoMantencion.COMPLETADA
        : EstadoMantencion.IRRECUPERABLE;

      setEstadoSeleccionado(estadoEnum);
      setShowEstadoModal(false);
      setShowFinishModal(true);
    };

    const handleFinalize = async (data: any) => {

      if (!finishingRecord  || !estadoSeleccionado) return;

      const datosFinales = {
        ...data,
        estado: estadoSeleccionado,
      };

      await update(finishingRecord.id, datosFinales);

      showSuccess("Mantención finalizada", "Se ha completado la mantención");
      handleCloseFinishModal();
      setEstadoSeleccionado(null); 
      setShowFinishModal(false);
      reload();
    };

    const handleCreateOrUpdate = async (data) => {
      try {
        if (editingRecord) {
          const transformed = {
            maquinariaId: data.maquinariaId ?? editingRecord.maquinaria.id,
            mecanicoId: data.mecanicoId ?? editingRecord.mecanicoAsignado.id,
            razonMantencion: data.razonMantencion ?? editingRecord.razonMantencion,
            descripcionEntrada: data.descripcionEntrada ?? editingRecord.descripcionEntrada,
            descripcionSalida: data.descripcionSalida ?? editingRecord.descripcionSalida,
            estado: data.estado ?? editingRecord.estado,
            fechaSalida: data.fechaSalida ?? editingRecord.fechaSalida?.toString().split("T")[0],

            repuestosUtilizados: (data.repuestosUtilizados ?? editingRecord.repuestosUtilizados)?.map((r) => ({
              repuestoId: r.repuestoId ?? r.id ?? r.repuesto?.id,
              cantidad: r.cantidad ?? r.cantidadUtilizada ?? r.cantidad,
            })).filter(r => !!r.repuestoId && r.cantidad > 0),
          };

          await update(editingRecord.id, transformed);
          showSuccess("Mantención actualizada", "Los cambios han sido guardados exitosamente");
        } else {
          await create(data);
          showSuccess("Mantención registrada", "La mantención ha sido creada correctamente");
        }

        handleCloseModal();
        reload();
      } catch (error) {
        console.error(error);
        showError("Error al guardar", "Ocurrió un problema al guardar la mantención");
      }
  };

    const handleDelete = async (id: number) => {
      {
        try {
          await deleteRecord(id)
          showSuccess("Mantención eliminada", "Se eliminó correctamente")
          reload()
        } catch (error) {
          console.error(error)
          showError("Error al eliminar", "No se pudo eliminar la mantención")
        }
      }
    }

   return (
     <div className="d-flex">
      <MaintenanceSidebar />
      <div className="flex-grow-1"></div>
    <Container fluid className="py-4">
      <Row>
        <Col>
          {/* Header */}
          <Card className="shadow-sm mb-3">
            <Card.Header className="bg-gradient-primary text-white">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <i className="bi bi-tools fs-4 me-3"></i>
                  <div>
                    <h3 className="mb-1">Registro de Mantenciones</h3>
                    <p className="mb-0 opacity-75">
                      Administra mantenciones activas y realiza nuevos registros
                    </p>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <Button
                    variant={showFilters ? "outline-light" : "light"}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <i className={`bi bi-funnel${showFilters ? "-fill" : ""} me-2`} />
                    {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
                  </Button>

                  <Button variant="light" onClick={() => handleOpenModal()}>
                    <i className="bi bi-plus-circle me-2"></i>
                    Registrar Mantención
                  </Button>
                </div>
              </div>
            </Card.Header>
          </Card>

  
          {showFilters && (
            <MantencionLocalFilters
              filters={filterValues}
              maquinarias={maquinarias}
              mecanicos={mecanicos}
              onFilterChange={handleFilterChange}
              onReset={() => {
                handleResetFilters()
                setShowFilters(false) 
              }}
              hasActiveFilters={hasActiveFilters}
            />
          )}


          {/* Contenido principal */}
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <i className="bi bi-list-ul me-2"></i>
                Lista de Mantenciones
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3 text-muted">Cargando mantenciones...</p>
                </div>
              ) : error ? (
                <Alert variant="danger" className="m-3">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              ) : (
                

                //Lista las mantenciones
                <MaintenanceRecordList
                  records={paginatedRecords}
                  onEdit={handleOpenModal}
                  onDelete={handleDelete}
                  onFinish={handleOpenFinishModal}
                  onSpareParts={handleOpenSpareParts}
                  onAssignMecanico={handleOpenAssignModal}
                  onReload={reload}
                  onAccept={handleAcceptMaintenance}
                />
              )}{!loading && !error && filteredRecords.length > itemsPerPage && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              )}
            </Card.Body>
          </Card>
          {/*Asigna Mecanico */}
          <AssignMecanicoModal
            show={showAssignModal}
            onHide={handleCloseAssignModal}
            onSubmit={handleAssignMecanico}
            mecanicos={mecanicos}
            currentMecanicoId={recordToAssign?.mecanicoAsignado?.id}
          />
          
          {/* Cambiar el estado de completada o irrecuerable */}
          <EstadoFinalizacionModal
            show={showEstadoModal}
            onHide={() => setShowEstadoModal(false)}
            onSelectEstado={handleSeleccionEstado}
          />
          
          {/* Modales */}
          <MaintenanceRecordModal
            show={showModal}
            onHide={handleCloseModal}
            onSubmit={handleCreateOrUpdate}
            initialData={
              editingRecord
                ? {
                    ...editingRecord,
                    repuestosUtilizados: editingRecord.repuestosUtilizados.map((r) => ({
                      repuestoId: r.id,
                      cantidad: r.cantidad,
                    })),
                  }
                : undefined
            }
            loading={creating || updating}
          />

          {selectedMantencionId !== null && (
            <MaintenanceSparePartPanel
              mantencionId={selectedMantencionId}
              show={showSparePartPanel}
              onHide={() => setShowSparePartPanel(false)}
              onReload={reload}
            />
          )}
          
          <FinalizeMaintenanceModal
            show={showFinishModal}
            onHide={handleCloseFinishModal}
            onSubmit={handleFinalize}
            loading={updating}
            fechaEntrada={finishingRecord?.fechaEntrada?.toString().split("T")[0] ?? ""}
            estadoActual={finishingRecord?.estado ?? ""}
            estadoSeleccionado={estadoSeleccionado ?? ""}
          />

          {/* Toasts */}
          <Toast toasts={toasts} removeToast={removeToast} />
        </Col>
      </Row>
    </Container>
    </div>
  );
}

export default MantencionPage