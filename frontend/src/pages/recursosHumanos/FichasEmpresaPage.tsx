import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFichaEmpresa } from '@/hooks/recursosHumanos/useFichaEmpresa';
import { useAuth, useUI } from '@/context';
import { useRut } from '@/hooks/useRut';
import { formatAFP } from '@/utils/index';
import { 
  FichaEmpresa, 
  FichaEmpresaSearchParams,
  EstadoLaboral,
  AsignacionesBonos
} from '@/types/recursosHumanos/fichaEmpresa.types';
import { Trabajador } from '@/types/recursosHumanos/trabajador.types';
import { EditarFichaEmpresaModal } from '@/components/recursosHumanos/EditarFichaEmpresaModal';
import '../../styles/pages/fichasEmpresa.css';
import { FiltrosBusquedaHeader } from '@/components/common/FiltrosBusquedaHeader';
import { Container, Row, Col, Card, Button, Alert, Table, Form } from 'react-bootstrap';
import { Toast, useToast } from '@/components/common/Toast';
import { ModalHistorialLaboral } from '@/components/recursosHumanos/ModalHistorialLaboral';
import { useHistorialLaboral } from '@/hooks/recursosHumanos/useHistorialLaboral';
import historialLaboralService from '@/services/recursosHumanos/historialLaboral.service';
import { TrabajadorDetalleModal } from '@/components/recursosHumanos/TrabajadorDetalleModal';
import { AsignarBonosFichaEmpresaModal } from '@/components/recursosHumanos/ModalAsignarBonos';
import { ModalDetallesBono } from '@/components/recursosHumanos/ModalDetallesBono';
import { ModalRemuneraciones } from '@/components/recursosHumanos/ModalRemuneraciones';

interface FichasEmpresaPageProps {
  trabajadorRecienRegistrado?: Trabajador | null;
  onTrabajadorModalClosed?: () => void;
}

// Utilidad para formatear con puntos de miles
function formatMiles(value: string | number): string {
  const num = typeof value === 'number' ? value : value.replace(/\D/g, '');
  if (!num) return '';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export const FichasEmpresaPage: React.FC<FichasEmpresaPageProps> = ({ 
  trabajadorRecienRegistrado, 
  onTrabajadorModalClosed 
}) => {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { setSuccess, setError } = useUI();
  const { formatRUT } = useRut();
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Toast notifications
  const { toasts, removeToast, showSuccess, showError } = useToast();
  
  const {
    fichas,
    currentFicha: miFicha,
    isLoading,
    error: fichaError,
    loadFichas: searchFichas,
    loadFichaById: loadMiFicha,
    formatSalario: formatSueldo,
    formatFecha,
    searchByRUT,
    clearError,
    downloadContrato
  } = useFichaEmpresa();

  const [searchQuery, setSearchQuery] = useState<FichaEmpresaSearchParams>({
    estado: EstadoLaboral.ACTIVO,
    afp: '',
    previsionSalud: '',
    seguroCesantia: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFicha, setSelectedFicha] = useState<FichaEmpresa | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Estados para los checkboxes de filtrado
  const [incluirDesvinculados, setIncluirDesvinculados] = useState(false);
  const [incluirLicencias, setIncluirLicencias] = useState(false);
  const [incluirPermisos, setIncluirPermisos] = useState(false);
  const [incluirSinFechaFin, setIncluirSinFechaFin] = useState(false);
  const [showAsignarBonoModal, setShowAsignarBonoModal] = useState(false);
  const [showDetallesBonoModal, setShowDetallesBonoModal] = useState(false);
  const [selectedBono, setSelectedBono] = useState<any>(null);
  const [selectedAsignacion, setSelectedAsignacion] = useState<any>(null);
  const [showRemuneracionesModal, setShowRemuneracionesModal] = useState(false);

  // Función para filtrar las fichas según los estados seleccionados
  // Ya no necesitamos filtrar aquí porque todo se maneja en el backend
  const fichasFiltradas = fichas;

  // Definir roles y permisos
  const esSuperAdministrador = user?.role === 'SuperAdministrador';
  const esAdminORecursosHumanos = user?.role === 'Administrador' || user?.role === 'RecursosHumanos';
  const puedeGestionarFichas = esSuperAdministrador || esAdminORecursosHumanos;
  const puedeAccederModulosPersonales = user && user.role !== 'SuperAdministrador';

  // Estado para modal de historial laboral
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [trabajadorNombreHistorial, setTrabajadorNombreHistorial] = useState('');
  const [trabajadorIdHistorial, setTrabajadorIdHistorial] = useState<number | null>(null);
  const [descargandoContratoId, setDescargandoContratoId] = useState<number | null>(null);
  const {
    historial,
    loading: loadingHistorial,
    error: errorHistorial,
    fetchHistorial,
    setHistorial,
    setError: setErrorHistorial
  } = useHistorialLaboral();

  // Estado para modal de detalles de trabajador desde ficha
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [trabajadorDetalle, setTrabajadorDetalle] = useState<any | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    // No ejecutar si aún está cargando la autenticación
    if (isAuthLoading) {
      return;
    }

    // No ejecutar si no hay usuario autenticado
    if (!user) {
      return;
    }

    // Para SuperAdministrador: solo gestión
    if (esSuperAdministrador) {
      setIncluirDesvinculados(false);
      setIncluirLicencias(false);
      setIncluirPermisos(false);
      setIncluirSinFechaFin(false);
      setSearchQuery({ estado: EstadoLaboral.ACTIVO });
      searchFichas({ estado: EstadoLaboral.ACTIVO });
    } 
    // Para Administrador y RecursosHumanos: cargar tanto gestión como su ficha
    else if (esAdminORecursosHumanos) {
      if (window.location.pathname === '/fichas-empresa/mi-ficha') {
        loadMiFicha(); // Cargar su ficha personal en la vista personal
      } else {
        setIncluirDesvinculados(false);
        setIncluirLicencias(false);
        setIncluirPermisos(false);
        setIncluirSinFechaFin(false);
        setSearchQuery({ estado: EstadoLaboral.ACTIVO });
        searchFichas({ estado: EstadoLaboral.ACTIVO });
      }
    }
    // Para todos los demás roles: solo su ficha
    else {
      loadMiFicha();
    }
  }, [user, isAuthLoading, loadMiFicha, esSuperAdministrador, esAdminORecursosHumanos]);

  // Detectar trabajador recién registrado y abrir modal automáticamente
  useEffect(() => {
    if (trabajadorRecienRegistrado) {
      // Si no tiene ficha, intentar buscarla
      const buscarYAbrirModal = async () => {
        try {
          // Esperar un momento para asegurar que la ficha esté creada en la base de datos
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Usar búsqueda específica por RUT
          const ficha = await searchByRUT(trabajadorRecienRegistrado.rut);
          
          if (ficha) {
            // Abrir modal de edición
            setSelectedFicha(ficha);
            setShowEditModal(true);
          } else {
            console.error('No se pudo encontrar la ficha del trabajador recién registrado');
            setError('No se pudo encontrar la ficha del trabajador. Por favor, intente más tarde.');
          }
        } catch (error) {
          console.error('Error al buscar la ficha:', error);
          setError('Error al buscar la ficha del trabajador. Por favor, intente más tarde.');
        } finally {
          // Limpiar el trabajador recién registrado
          if (onTrabajadorModalClosed) {
            onTrabajadorModalClosed();
          }
        }
      };
      
      buscarYAbrirModal();
    }
  }, [trabajadorRecienRegistrado, searchByRUT, onTrabajadorModalClosed, setError]);

  const handleSearch = async () => {
    // Crear un objeto de búsqueda que incluya todos los filtros
    const searchParams = { ...searchQuery };
    
    // Armar el array de estados combinando select y checkboxes
    const estadosIncluidos = [];
    if (searchQuery.estado) estadosIncluidos.push(searchQuery.estado);
    if (incluirDesvinculados) estadosIncluidos.push(EstadoLaboral.DESVINCULADO);
    if (incluirLicencias) estadosIncluidos.push(EstadoLaboral.LICENCIA);
    if (incluirPermisos) estadosIncluidos.push(EstadoLaboral.PERMISO);

    // Lógica: si solo hay un estado, usar 'estado'; si hay más de uno, usar 'estados' (array)
    if (estadosIncluidos.length === 1) {
      searchParams.estado = estadosIncluidos[0];
      delete searchParams.estados;
    } else if (estadosIncluidos.length > 1) {
      searchParams.estados = Array.from(new Set(estadosIncluidos)); // Evitar duplicados
      delete searchParams.estado;
    } else {
      delete searchParams.estados;
      delete searchParams.estado;
    }

    // Agregar flag para incluir fichas sin fecha fin
    if (incluirSinFechaFin) {
      searchParams.incluirSinFechaFin = true;
    }

    // Siempre usar searchFichas, sin importar si hay RUT o no
    await searchFichas(searchParams);
  };

  const handleReset = () => {
    setSearchQuery({ 
      estado: EstadoLaboral.ACTIVO,
      afp: '',
      previsionSalud: '',
      seguroCesantia: ''
    });
    setIncluirDesvinculados(false);
    setIncluirLicencias(false);
    setIncluirPermisos(false);
    setIncluirSinFechaFin(false);
    if (puedeGestionarFichas) {
      searchFichas({ estado: EstadoLaboral.ACTIVO });
    }
  };

  const handleEditFicha = (ficha: FichaEmpresa) => {
    setSelectedFicha(ficha);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedFicha(null);
  };

  const handleUpdateSuccess = () => {
    // Recargar las fichas
    handleSearch();
    // Mostrar toast de éxito
    showSuccess('¡Usuario actualizado!', 'La ficha de empresa se ha actualizado exitosamente', 4000);
  };

  const handleDownloadContrato = async (fichaId: number) => {
    try {
      await downloadContrato(fichaId);
      showSuccess('Descarga exitosa', 'El contrato se ha descargado correctamente', 4000);
    } catch (error) {
      showError('Error de descarga', 'Error al descargar el contrato. Por favor, intente nuevamente.', 6000);
    }
  };

  // Handler para navegar al historial laboral
  const handleOpenHistorialLaboral = (ficha: FichaEmpresa) => {
    navigate('/trabajadores/historial-laboral', { state: { trabajadorId: ficha.trabajador.id } });
  };

  // Handler para descargar contrato histórico
  const handleDescargarContratoHistorial = async (historialId: number) => {
    try {
      setDescargandoContratoId(historialId);
      const result = await historialLaboralService.descargarContratoHistorial(historialId);
      
      if (result.success && result.blob && result.filename) {
        // Crear URL del blob y descarga
        const url = window.URL.createObjectURL(result.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        
        // Limpiar
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        showSuccess('Descarga exitosa', 'El contrato histórico se ha descargado correctamente', 4000);
      } else {
        console.error('Error al descargar:', result.error);
        showError('Error de descarga', result.error || 'Error al descargar el contrato histórico', 6000);
      }
    } catch (error) {
      console.error('Error al descargar contrato histórico:', error);
      showError('Error de descarga', 'Error inesperado al descargar el contrato histórico', 6000);
    } finally {
      setDescargandoContratoId(null);
    }
  };

  const getEstadoBadgeClass = (estado: EstadoLaboral) => {
    switch (estado) {
      case EstadoLaboral.ACTIVO:
        return 'bg-success';
      case EstadoLaboral.LICENCIA:
        return 'bg-info';
      case EstadoLaboral.PERMISO:
        return 'bg-warning';
      case EstadoLaboral.DESVINCULADO:
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const getSeguroBadgeClass = (seguroCesantia: string | null | undefined) => {
    if (seguroCesantia === 'Sí') return 'bg-success';
    if (seguroCesantia === 'No') return 'bg-danger';
    return 'bg-warning';
  }

  // Función helper para campos "Por Definir"
  const getFieldClass = (value: string) => {
    return value === 'Por Definir' ? 'por-definir' : '';
  };

  // Función para verificar si la ficha pertenece al usuario actual
  const esFichaActual = (ficha: FichaEmpresa) => {
    return user && ficha.trabajador.rut && user.rut && ficha.trabajador.rut.replace(/\.|-/g, '') === user.rut.replace(/\.|-/g, '');
  };

  const getTipoContratoColor = (tipo: string) => {
    if (tipo === 'Por Definir') {
      return 'por-definir';
    }
    
    switch (tipo.toLowerCase()) {
      case 'indefinido':
        return 'text-success';
      case 'plazo fijo':
        return 'text-warning';
      case 'por obra':
        return 'text-info';
      case 'part-time':
        return 'text-secondary';
      default:
        return 'text-muted';
    }
  };

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedRut = formatRUT(e.target.value);
    setSearchQuery({ ...searchQuery, rut: formattedRut });
  };

  // Función para calcular la edad
  const calcularEdad = (fechaNacimiento: string | Date): number => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  // Función para formatear teléfono
  const formatTelefono = (telefono: string): string => {
    // Si ya tiene formato internacional, mantenerlo
    if (telefono.startsWith('+')) return telefono;
    
    // Si es un número chileno de 9 dígitos, agregar +56 9
    if (telefono.length === 9 && telefono.startsWith('9')) {
      return `+56 ${telefono}`;
    }
    
    // Si es un número de 8 dígitos (fijo), agregar +56
    if (telefono.length === 8) {
      return `+56 ${telefono}`;
    }
    
    return telefono;
  };

  // Función para ver detalles del trabajador desde ficha
  const handleVerDetalle = (ficha: FichaEmpresa) => {
    // Pasar el trabajador y la ficha actual como fichaEmpresa
    const trabajador = {
      ...ficha.trabajador,
      fichaEmpresa: ficha
    };
    setTrabajadorDetalle(trabajador);
    setShowDetalleModal(true);
  };

  const handleAsignarBono = (ficha: FichaEmpresa) => {
    setSelectedFicha(ficha);
    setShowAsignarBonoModal(true);
  };

  const handleVerDetallesBono = (bono: any, asignacion: any, ficha: FichaEmpresa) => {
    setSelectedBono(bono);
    setSelectedAsignacion(asignacion);
    setSelectedFicha(ficha);
    setShowDetallesBonoModal(true);
  };

  // Función para calcular sueldo líquido
  const calcularSueldoLiquido = (ficha: FichaEmpresa): number => {
    const sueldoBase = ficha.sueldoBase;
    const bonos = ficha.asignacionesBonos?.filter(bono => bono.activo) || [];
    const totalBonos = bonos.reduce((total, bono) => total + parseInt(bono.bono?.monto || '0'), 0);
    
    const sueldoBruto = sueldoBase + totalBonos;
    
    // Descuentos legales (simplificados)
    const afp = Math.round(sueldoBruto * 0.10); // 10% AFP
    const salud = Math.round(sueldoBruto * 0.07); // 7% Salud
    const seguroCesantia = Math.round(sueldoBruto * 0.03); // 3% Seguro Cesantía
    
    const totalDescuentos = afp + salud + seguroCesantia;
    return sueldoBruto - totalDescuentos;
  };

  const handleVerRemuneraciones = async () => {
    // Recargar la ficha para obtener los datos más actualizados
    try {
      await loadMiFicha();
      setShowRemuneracionesModal(true);
    } catch (error) {
      console.error('Error al recargar datos de remuneraciones:', error);
      // Aún así abrir el modal con los datos disponibles
      setShowRemuneracionesModal(true);
    }
  };

  // Modal de remuneraciones - FUERA de los returns condicionales
  const modalRemuneraciones = showRemuneracionesModal && miFicha ? (
    <ModalRemuneraciones
      show={showRemuneracionesModal}
      onHide={() => setShowRemuneracionesModal(false)}
      ficha={miFicha}
    />
  ) : null;

  // Si es usuario sin permisos administrativos o está en la ruta de ficha personal
  if ((user && !puedeGestionarFichas) || (puedeAccederModulosPersonales && window.location.pathname === '/fichas-empresa/mi-ficha')) {
    return (
      <>
        <Container fluid className="py-2">
        <Row>
          <Col>
            <Card className="shadow-sm main-card-spacing">
              <Card.Header className="bg-gradient-primary text-white">
                <div className="d-flex align-items-center">
                  <i className="bi bi-person-badge fs-4 me-3"></i>
                  <div>
                    <h3 className="mb-1">Mi Ficha de Empresa</h3>
                    <p className="mb-0 opacity-75">Información personal y laboral</p>
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                {isLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-2 text-muted">Cargando mi ficha...</p>
                  </div>
                ) : localError || fichaError ? (
                  <div className="alert alert-danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {localError || fichaError}
                  </div>
                ) : miFicha ? (
                  <div className="row">
                    <div className="col-lg-8">
                      <div className="info-section">
                        <h2>Información Laboral</h2>
                        <div className="info-grid">
                          <div className="info-field">
                            <i className="bi bi-person-badge"></i>
                            <label>Cargo</label>
                            <div className={`value ${getFieldClass(miFicha.cargo)}`}>
                              {miFicha.cargo === 'Por Definir' ? 
                                <span className="pending">Por Definir</span> : 
                                miFicha.cargo
                              }
                            </div>
                          </div>

                          <div className="info-field">
                            <i className="bi bi-diagram-3"></i>
                            <label>Área</label>
                            <div className={`value ${getFieldClass(miFicha.area)}`}>
                              {miFicha.area === 'Por Definir' ? 
                                <span className="pending">Por Definir</span> : 
                                miFicha.area
                              }
                            </div>
                          </div>

                          <div className="info-field">
                            <i className="bi bi-file-text"></i>
                            <label>Tipo de Contrato</label>
                            <div className={`value ${getTipoContratoColor(miFicha.tipoContrato)}`}>
                              {miFicha.tipoContrato === 'Por Definir' ? 
                                <span className="pending">Por Definir</span> : 
                                miFicha.tipoContrato
                              }
                            </div>
                          </div>

                          <div className="info-field">
                            <i className="bi bi-clock"></i>
                            <label>Jornada Laboral</label>
                            <div className={`value ${getFieldClass(miFicha.jornadaLaboral)}`}>
                              {miFicha.jornadaLaboral === 'Por Definir' ? 
                                <span className="pending">Por Definir</span> : 
                                miFicha.jornadaLaboral
                              }
                            </div>
                          </div>

                          <div className="info-field">
                            <i className="bi bi-calendar-event"></i>
                            <label>Fecha Inicio</label>
                            <div className="value">{formatFecha(miFicha.fechaInicioContrato)}</div>
                          </div>

                          <div className="info-field">
                            <i className="bi bi-calendar-x"></i>
                            <label>Fecha Fin</label>
                            <div className="value">
                              {miFicha.fechaFinContrato ? 
                                formatFecha(miFicha.fechaFinContrato) : 
                                "-"
                              }
                            </div>
                          </div>

                          <div className="info-field">
                            <i className="bi bi-cash"></i>
                            <label>Sueldo Líquido</label>
                            <div className="value">
                              <span 
                                className="text-success text-decoration-underline"
                                onClick={handleVerRemuneraciones}
                                title="Ver detalle de remuneraciones"
                                style={{ cursor: 'pointer' }}
                              >
                                {formatSueldo(calcularSueldoLiquido(miFicha))}
                              </span>
                            </div>
                          </div>

                          <div className="info-field">
                            <i className="bi bi-graph-up"></i>
                            <label>AFP</label>
                            <div className={`value ${getFieldClass(miFicha.afp)}`}>
                              {miFicha.afp === 'Por Definir' ? 
                                <span className="pending">Por Definir</span> : 
                                formatAFP(miFicha.afp)
                              }
                            </div>
                          </div>

                          <div className="info-field">
                            <i className="bi bi-heart"></i>
                            <label>Previsión salud</label>
                            <div className={`value ${getFieldClass(miFicha.previsionSalud)}`}>
                              {miFicha.previsionSalud === 'Por Definir' ? 
                                <span className="pending">Por Definir</span> : 
                                miFicha.previsionSalud
                              }
                            </div>
                          </div>

                          <div className="info-field">
                            <i className="bi bi-shield-check"></i>
                            <label>Seguro Cesantía</label>
                            <div className="value">
                              {miFicha.seguroCesantia ? (
                                <span className={`status-badge ${miFicha.seguroCesantia === 'Sí' ? 'success' : 'danger'}`}>
                                  {miFicha.seguroCesantia}
                                </span>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </div>
                          </div>

                          <div className="info-field">
                            <i className="bi bi-person-check"></i>
                            <label>Estado</label>
                            <div className="value">
                              <span className={`status-badge ${miFicha.estado.toLowerCase()}`}>
                                {miFicha.estado}
                              </span>
                            </div>
                          </div>

                          <div className ="info-field">
                            <i className='bi bi-calendar2-check'></i>
                            <label> Bonos Asignados </label>
                            <div className="value">
                              {miFicha.asignacionesBonos && miFicha.asignacionesBonos.length > 0 ? (
                              <span className="status-badge">
                                {miFicha.asignacionesBonos
                                  .filter(asig => asig.activo && asig.bono && asig.bono.nombreBono)
                                  .map(asig => asig.bono.nombreBono)
                                  .join(', ')
                                }
                              </span>
                            ) : (
                              <span className="text-muted">No hay bonos asignados</span>
                            )}
                            </div>
                          </div>

                          <div className="info-field">
                            <i className="bi bi-file-earmark-text"></i>
                            <label>Contrato</label>
                            <div className="value">
                              {miFicha.contratoURL ? (
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleDownloadContrato(miFicha.id)}
                                  className="btn-download-contrato"
                                >
                                  <i className="bi bi-download me-1"></i>
                                  Descargar Contrato
                                </Button>
                              ) : (
                                <span className="text-muted">No hay contrato adjunto</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-4">
                      <div className="info-section">
                        <h2>Información del Trabajador</h2>
                        <div className="info-field">
                          <i className="bi bi-person"></i>
                          <label>Nombre</label>
                          <div className="value">
                            {miFicha.trabajador.nombres} {miFicha.trabajador.apellidoPaterno} {miFicha.trabajador.apellidoMaterno}
                          </div>
                        </div>

                        <div className="info-field">
                          <i className="bi bi-person-vcard"></i>
                          <label>RUT</label>
                          <div className="value">{formatRUT(miFicha.trabajador.rut)}</div>
                        </div>

                        {miFicha.trabajador.usuario?.corporateEmail && (
                          <div className="info-field">
                            <i className="bi bi-envelope"></i>
                            <label>Correo Corporativo</label>
                            <div className="value">{miFicha.trabajador.usuario.corporateEmail}</div>
                          </div>
                        )}

                        <div className="info-field">
                          <i className="bi bi-telephone"></i>
                          <label>Teléfono</label>
                          <div className="value">{formatTelefono(miFicha.trabajador.telefono)}</div>
                        </div>

                        {miFicha.trabajador.numeroEmergencia && (
                          <div className="info-field">
                            <i className="bi bi-telephone-plus"></i>
                            <label>Teléfono de Emergencia</label>
                            <div className="value">{formatTelefono(miFicha.trabajador.numeroEmergencia)}</div>
                          </div>
                        )}

                        {miFicha.trabajador.direccion && (
                          <div className="info-field">
                            <i className="bi bi-geo-alt"></i>
                            <label>Dirección</label>
                            <div className="value">{miFicha.trabajador.direccion}</div>
                          </div>
                        )}

                        <div className="info-field">
                          <i className="bi bi-calendar-check"></i>
                          <label>Fecha Ingreso</label>
                          <div className="value">{formatFecha(miFicha.trabajador.fechaIngreso)}</div>
                        </div>

                        {miFicha.trabajador.fechaNacimiento && (
                          <div className="info-field">
                            <i className="bi bi-calendar-heart"></i>
                            <label>Edad</label>
                            <div className="value">{calcularEdad(miFicha.trabajador.fechaNacimiento)} años</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <i className="bi bi-person-x display-1 text-muted"></i>
                    <h5 className="mt-3">No tienes ficha asignada</h5>
                    <p className="text-muted">Contacta con Recursos Humanos para más información.</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      {modalRemuneraciones}
    </>
  );
  }

  // Vista para RRHH/Admin
  return (
    <Container fluid className="py-2">
      <Row>
        <Col>
          {/* Encabezado de página */}
          <Card className="shadow-sm mb-3">
            <Card.Header className="bg-gradient-primary text-white">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <i className="bi bi-clipboard-data fs-4 me-3"></i>
                  <div>
                    <h3 className="mb-1">Fichas de Empresa</h3>
                    <p className="mb-0 opacity-75">
                      Gestión de información laboral y contratos
                    </p>
                  </div>
                </div>
                <div>
                  <Button 
                    variant={showFilters ? "outline-light" : "light"}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <i className={`bi bi-funnel${showFilters ? '-fill' : ''} me-2`}></i>
                    {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
                  </Button>
                </div>
              </div>
            </Card.Header>
          </Card>

          {/* Panel de filtros */}
          {showFilters && (
            <Card className="shadow-sm mb-3">
              <FiltrosBusquedaHeader />
              <Card.Body>
                {/* Checkboxes de estado */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h6 className="mb-3 fw-semibold">Estados a mostrar:</h6>
                    <div className="d-flex gap-4">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="incluirDesvinculados"
                          checked={incluirDesvinculados}
                          onChange={(e) => setIncluirDesvinculados(e.target.checked)}
                        />
                        <label className="form-check-label fw-semibold" htmlFor="incluirDesvinculados">
                          Desvinculados
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="incluirLicencias"
                          checked={incluirLicencias}
                          onChange={(e) => setIncluirLicencias(e.target.checked)}
                        />
                        <label className="form-check-label fw-semibold" htmlFor="incluirLicencias">
                          Licencia Médica
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="incluirPermisos"
                          checked={incluirPermisos}
                          onChange={(e) => setIncluirPermisos(e.target.checked)}
                        />
                        <label className="form-check-label fw-semibold" htmlFor="incluirPermisos">
                          Permisos Administrativos
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-3">
                    <Form.Group>
                      <Form.Label className="fw-semibold">RUT:</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Ej: 12.345.678-9"
                        value={searchQuery.rut || ''}
                        onChange={handleRutChange}
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group>
                      <Form.Label className="fw-semibold">Estado:</Form.Label>
                      <Form.Select
                        value={searchQuery.estado || ''}
                        onChange={(e) => setSearchQuery({ ...searchQuery, estado: e.target.value as EstadoLaboral })}
                        style={{ borderRadius: '8px' }}
                      >
                        <option value="">Todos los estados</option>
                        {Object.values(EstadoLaboral).map(estado => (
                          <option key={estado} value={estado}>{estado}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group>
                      <Form.Label className="fw-semibold">Cargo:</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Cargo"
                        value={searchQuery.cargo || ''}
                        onChange={(e) => setSearchQuery({ ...searchQuery, cargo: e.target.value })}
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group>
                      <Form.Label className="fw-semibold">Área:</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Área"
                        value={searchQuery.area || ''}
                        onChange={(e) => setSearchQuery({ ...searchQuery, area: e.target.value })}
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group>
                      <Form.Label className="fw-semibold">Tipo de Contrato:</Form.Label>
                      <Form.Select
                        value={searchQuery.tipoContrato || ''}
                        onChange={(e) => setSearchQuery({ ...searchQuery, tipoContrato: e.target.value })}
                        style={{ borderRadius: '8px' }}
                      >
                        <option value="">Todos los tipos</option>
                        <option value="Indefinido">Indefinido</option>
                        <option value="Plazo Fijo">Plazo Fijo</option>
                        <option value="Por Obra">Por Obra</option>
                        <option value="Part-Time">Part-Time</option>
                      </Form.Select>
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group>
                      <Form.Label className="fw-semibold">AFP:</Form.Label>
                      <Form.Select
                        value={searchQuery.afp || ''}
                        onChange={(e) => setSearchQuery({ ...searchQuery, afp: e.target.value })}
                        style={{ borderRadius: '8px' }}
                      >
                        <option value="">Todas las AFP</option>
                        <option value="habitat">AFP Habitat</option>
                        <option value="provida">AFP Provida</option>
                        <option value="modelo">AFP Modelo</option>
                        <option value="cuprum">AFP Cuprum</option>
                        <option value="capital">AFP Capital</option>
                        <option value="planvital">AFP PlanVital</option>
                        <option value="uno">AFP Uno</option>
                      </Form.Select>
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group>
                      <Form.Label className="fw-semibold">Previsión Salud:</Form.Label>
                      <Form.Select
                        value={searchQuery.previsionSalud || ''}
                        onChange={(e) => setSearchQuery({ ...searchQuery, previsionSalud: e.target.value })}
                        style={{ borderRadius: '8px' }}
                      >
                        <option value="">Todas las previsiones</option>
                        <option value="FONASA">FONASA</option>
                        <option value="ISAPRE">ISAPRE</option>
                      </Form.Select>
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group>
                      <Form.Label className="fw-semibold">Seguro Cesantía:</Form.Label>
                      <Form.Select
                        value={searchQuery.seguroCesantia || ''}
                        onChange={(e) => setSearchQuery({ ...searchQuery, seguroCesantia: e.target.value })}
                        style={{ borderRadius: '8px' }}
                      >
                        <option value="">Todos los seguros</option>
                        <option value="Sí">Sí</option>
                        <option value="No">No</option>
                      </Form.Select>
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group>
                      <Form.Label className="fw-semibold">Sueldo desde:</Form.Label>
                      <Form.Control
                        type="text"
                        inputMode="numeric"
                        placeholder="Monto mínimo"
                        value={searchQuery.sueldoBaseDesde !== undefined && searchQuery.sueldoBaseDesde !== null ? formatMiles(searchQuery.sueldoBaseDesde) : ''}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '');
                          if (raw === '') {
                            setSearchQuery({ ...searchQuery, sueldoBaseDesde: undefined });
                          } else {
                            setSearchQuery({ ...searchQuery, sueldoBaseDesde: Number(raw) });
                          }
                        }}
                        maxLength={12}
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group>
                      <Form.Label className="fw-semibold">Sueldo hasta:</Form.Label>
                      <Form.Control
                        type="text"
                        inputMode="numeric"
                        placeholder="Monto máximo"
                        value={searchQuery.sueldoBaseHasta !== undefined && searchQuery.sueldoBaseHasta !== null ? formatMiles(searchQuery.sueldoBaseHasta) : ''}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '');
                          if (raw === '') {
                            setSearchQuery({ ...searchQuery, sueldoBaseHasta: undefined });
                          } else {
                            setSearchQuery({ ...searchQuery, sueldoBaseHasta: Number(raw) });
                          }
                        }}
                        maxLength={12}
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group>
                      <Form.Label className="fw-semibold">Fecha Inicio Desde:</Form.Label>
                      <Form.Control
                        type="date"
                        value={searchQuery.fechaInicioDesde || ''}
                        onChange={(e) => setSearchQuery({ ...searchQuery, fechaInicioDesde: e.target.value })}
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group>
                      <Form.Label className="fw-semibold">Fecha Inicio Hasta:</Form.Label>
                      <Form.Control
                        type="date"
                        value={searchQuery.fechaInicioHasta || ''}
                        onChange={(e) => setSearchQuery({ ...searchQuery, fechaInicioHasta: e.target.value })}
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group>
                      <Form.Label className="fw-semibold">Fecha Fin Desde:</Form.Label>
                      <Form.Control
                        type="date"
                        value={searchQuery.fechaFinDesde || ''}
                        onChange={(e) => setSearchQuery({ ...searchQuery, fechaFinDesde: e.target.value })}
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group>
                      <Form.Label className="fw-semibold">Fecha Fin Hasta:</Form.Label>
                      <Form.Control
                        type="date"
                        value={searchQuery.fechaFinHasta || ''}
                        onChange={(e) => setSearchQuery({ ...searchQuery, fechaFinHasta: e.target.value })}
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6 d-flex align-items-end">
                    <div className="d-flex gap-2 mb-3">
                      <Button variant="primary" onClick={handleSearch} style={{ borderRadius: '20px', fontWeight: '500' }}>
                        <i className="bi bi-search me-2"></i>
                        Buscar
                      </Button>
                      <Button variant="outline-secondary" onClick={handleReset} style={{ borderRadius: '20px', fontWeight: '500' }}>
                        <i className="bi bi-x-circle me-2"></i>
                        Limpiar
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Opción adicional */}
                <div className="row">
                  <div className="col-12">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="incluirSinFechaFin"
                        checked={incluirSinFechaFin}
                        onChange={(e) => setIncluirSinFechaFin(e.target.checked)}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="incluirSinFechaFin">
                        Incluir fichas sin fecha de fin
                      </label>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Contenido principal */}
          <Card className="shadow-sm">
            <Card.Body>
              {/* Mostrar errores */}
              {(localError || fichaError) && (
                <Alert variant="danger" className="border-0 mb-3" style={{ borderRadius: '12px' }}>
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {localError || fichaError}
                </Alert>
              )}

              {/* Contenido de la tabla */}
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <p className="mt-2 text-muted">Cargando fichas...</p>
                </div>
              ) : fichas.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-clipboard-x display-1 text-muted"></i>
                  <h5 className="mt-3">
                    {Object.keys(searchQuery).length === 1 && searchQuery.estado === EstadoLaboral.ACTIVO ? 
                      'No hay fichas de empresa en el sistema' : 
                      'No hay resultados que coincidan con tu búsqueda'}
                  </h5>
                  <p className="text-muted">
                    {Object.keys(searchQuery).length === 1 && searchQuery.estado === EstadoLaboral.ACTIVO ? 
                      'Las fichas de empresa se crean automáticamente al registrar un nuevo trabajador' : 
                      'Intenta ajustar los filtros para obtener más resultados'}
                  </p>
                  {Object.keys(searchQuery).length > 1 || searchQuery.estado !== EstadoLaboral.ACTIVO ? (
                    <Button variant="outline-primary" onClick={handleReset}>
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Mostrar Todas
                    </Button>
                  ) : null}
                </div>
              ) : (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">
                      <i className="bi bi-list-ul me-2"></i>
                      Fichas de Empresa ({fichas.length})
                      <small className="text-muted ms-2">
                        (Activos: {fichas.filter(f => f.estado === EstadoLaboral.ACTIVO).length} • 
                        Licencias: {fichas.filter(f => f.estado === EstadoLaboral.LICENCIA).length} • 
                        Permisos: {fichas.filter(f => f.estado === EstadoLaboral.PERMISO).length} • 
                        Desvinculados: {fichas.filter(f => f.estado === EstadoLaboral.DESVINCULADO).length})
                      </small>
                    </h6>
                  </div>
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Trabajador</th>
                        <th>Cargo</th>
                        <th>Área</th>
                        <th>Estado</th>
                        <th>Tipo Contrato</th>
                        <th>Jornada Laboral</th>
                        <th>Fecha Inicio</th>
                        <th>Fecha Fin</th>
                        <th>
                          <span 
                            className="text-primary fw-semibold" 
                            style={{ cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => navigate('/gestion-sueldos')}
                            title="Ver gestión de sueldos"
                          >
                            Sueldo Base
                          </span>
                        </th>
                        <th>AFP</th>
                        <th>Previsión Salud</th>
                        <th>Seguro Cesantía</th>
                        <th>
                          <span 
                            className="text-primary fw-semibold" 
                            style={{ cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => navigate('/bonos')}
                            title="Ver gestión de bonos"
                          >
                            Bonos Asignados
                          </span>
                        </th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fichas.map((ficha) => (
                        <tr key={ficha.id}>
                          <td>
                            <div>
                              <strong>{ficha.trabajador.nombres} {ficha.trabajador.apellidoPaterno} {ficha.trabajador.apellidoMaterno}</strong>
                              <br />
                              <small className="text-muted">{formatRUT(ficha.trabajador.rut)}</small>
                            </div>
                          </td>
                          <td>
                            <span className={getFieldClass(ficha.cargo || '-')}>
                              {ficha.cargo || '-'}
                            </span>
                          </td>
                          <td>
                            <span className={getFieldClass(ficha.area || '-')}>
                              {ficha.area || '-'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getEstadoBadgeClass(ficha.estado)}`}>
                              {ficha.estado}
                            </span>
                          </td>
                          <td>
                            <span className={getTipoContratoColor(ficha.tipoContrato)}>
                              {ficha.tipoContrato}
                            </span>
                          </td>
                          <td>
                            <span className={getFieldClass(ficha.jornadaLaboral || '-')}>
                              {ficha.jornadaLaboral || '-'}
                            </span>
                          </td>
                          <td>{formatFecha(ficha.fechaInicioContrato)}</td>
                          <td>{ficha.fechaFinContrato ? formatFecha(ficha.fechaFinContrato) : '-'}</td>
                          <td>{formatSueldo(ficha.sueldoBase)}</td>
                          <td>
                            <span className={getFieldClass(ficha.afp || '-')}>
                              {formatAFP(ficha.afp)}
                            </span>
                          </td>
                          <td>
                            <span className={getFieldClass(ficha.previsionSalud || '-')}>
                              {ficha.previsionSalud || '-'}
                            </span>
                          </td>
                          <td>
                            {ficha.seguroCesantia ? (
                              <span className={`badge ${ficha.seguroCesantia === 'Sí' ? 'bg-success' : 'bg-danger'}`}>
                                {ficha.seguroCesantia}
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td> 
                            {ficha.asignacionesBonos && ficha.asignacionesBonos.length > 0 ? (
                              <div>
                                {ficha.asignacionesBonos
                                  .filter(asig => asig.activo && asig.bono && asig.bono.nombreBono)
                                  .map((asig, index) => (
                                    <span key={asig.id}>
                                      <span 
                                        className="status-badge cursor-pointer text-decoration-underline"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleVerDetallesBono(asig.bono, asig, ficha)}
                                        title={`Ver detalles de ${asig.bono.nombreBono}`}
                                      >
                                        {asig.bono.nombreBono}
                                      </span>
                                      {index < ficha.asignacionesBonos.filter(asig => asig.activo && asig.bono && asig.bono.nombreBono).length - 1 && ', '}
                                    </span>
                                  ))
                                }
                              </div>
                            ) : (
                              <span className="text-muted">No hay bonos asignados</span>
                            )}
                          </td>

                          <td>
                            <div className="btn-group">
                              {/* Ocultar botón de editar si es la ficha del usuario actual */}
                              {!esFichaActual(ficha) && (
                                <Button 
                                  variant="outline-primary" 
                                  onClick={() => handleEditFicha(ficha)}
                                  title="Editar ficha"
                                  disabled={ficha.estado === EstadoLaboral.DESVINCULADO}
                                >
                                  <i className="bi bi-pencil"></i>
                                </Button>
                              )}
                              {ficha.contratoURL && (
                                <Button 
                                  variant="outline-success" 
                                  onClick={() => handleDownloadContrato(ficha.id)}
                                  title="Descargar contrato"
                                >
                                  <i className="bi bi-download"></i>
                                </Button>
                              )}
                              {puedeGestionarFichas && (
                                <Button
                                  variant="outline-info"
                                  onClick={() => handleOpenHistorialLaboral(ficha)}
                                  title="Ver historial laboral"
                                >
                                  <i className="bi bi-clock-history"></i>
                                </Button>
                              )}
                              <Button
                                variant="outline-warning"
                                onClick={() => handleAsignarBono(ficha)}
                                title="Asignar Bono"
                              >
                                <i className="bi bi-plus"></i>
                              </Button>
                              <Button
                                variant="outline-secondary"
                                onClick={() => handleVerDetalle(ficha)}
                                title="Ver detalles"
                              >
                                <i className="bi bi-eye"></i>
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
        </Col>
      </Row>

      {/* Modal de edición */}
      {selectedFicha && (
        <EditarFichaEmpresaModal
          show={showEditModal}
          onHide={handleCloseEditModal}
          ficha={selectedFicha}
          onUpdate={handleUpdateSuccess}
        />
      )}

      {/* Modal de historial laboral */}
      <ModalHistorialLaboral
        show={showHistorialModal}
        onHide={() => setShowHistorialModal(false)}
        historial={historial}
        loading={loadingHistorial}
        error={errorHistorial}
        trabajadorNombre={trabajadorNombreHistorial}
        onDescargarContrato={handleDescargarContratoHistorial}
        descargandoId={descargandoContratoId}
      />

      {/* Modal de detalles de trabajador desde ficha */}
      <TrabajadorDetalleModal
        show={showDetalleModal}
        onHide={() => setShowDetalleModal(false)}
        trabajador={trabajadorDetalle}
      />

      {/* Modal para asignar bonos */}
      <AsignarBonosFichaEmpresaModal
        show={showAsignarBonoModal}
        onHide={() => setShowAsignarBonoModal(false)}
        asignaciones={{
          fechaAsignacion: new Date(),
          fechaFinAsignacion: null,
          activo: true,
          bono: '',
          fichaEmpresa: selectedFicha!,
          observaciones: ''
        }}
        ficha={selectedFicha!}
        onSuccess={handleUpdateSuccess}
      />

      {/* Modal de detalles del bono */}
      <ModalDetallesBono
        show={showDetallesBonoModal}
        onHide={() => setShowDetallesBonoModal(false)}
        bono={selectedBono}
        ficha={selectedFicha}
        asignacion={selectedAsignacion}
      />

      {/* Sistema de notificaciones */}
      <Toast toasts={toasts} removeToast={removeToast} />
      {modalRemuneraciones}
    </Container>
  );
}; 