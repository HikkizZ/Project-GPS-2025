import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Breadcrumb, Nav, Form } from 'react-bootstrap';
import { HistorialLaboral, HistorialUnificado } from '@/types/recursosHumanos/historialLaboral.types';
import historialLaboralService from '@/services/recursosHumanos/historialLaboral.service';
import '@/styles/pages/historialLaboral.css';

type FiltroTipo = 'todos' | 'inicial' | 'laboral' | 'licencias' | 'personales' | 'usuario';
type ModoVista = 'tradicional' | 'unificado';

export default function HistorialLaboralPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [historial, setHistorial] = useState<HistorialLaboral[]>([]);
  const [historialUnificado, setHistorialUnificado] = useState<HistorialUnificado[]>([]);
  const [historialFiltrado, setHistorialFiltrado] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trabajadorNombre, setTrabajadorNombre] = useState<string>('');
  const [descargandoId, setDescargandoId] = useState<number | null>(null);
  const [filtroActivo, setFiltroActivo] = useState<FiltroTipo>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [modoVista, setModoVista] = useState<ModoVista>('unificado');

  useEffect(() => {
    if (id) {
      cargarHistorial(parseInt(id));
    }
  }, [id]);

  useEffect(() => {
    aplicarFiltros();
  }, [historial, historialUnificado, filtroActivo, busqueda, modoVista]);

  const cargarHistorial = async (trabajadorId: number) => {
    try {
      setLoading(true);
      setError(null);

      // Cargar historial tradicional
      const responseTradicional = await historialLaboralService.getHistorialByTrabajadorId(trabajadorId);
      if (responseTradicional.success && responseTradicional.data) {
        setHistorial(responseTradicional.data);
        if (responseTradicional.data.length > 0 && responseTradicional.data[0].trabajador) {
          const trabajador = responseTradicional.data[0].trabajador;
          setTrabajadorNombre(`${trabajador.nombres} ${trabajador.apellidoPaterno} ${trabajador.apellidoMaterno}`);
        }
      }

      // Cargar historial unificado
      const responseUnificado = await historialLaboralService.getHistorialUnificadoByTrabajadorId(trabajadorId);
      if (responseUnificado.success && responseUnificado.data) {
        setHistorialUnificado(responseUnificado.data);
      } else {
        setError('Error al cargar el historial unificado');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    const datosBase = modoVista === 'unificado' ? historialUnificado : historial;
    let resultado = [...datosBase];

    // Filtro por tipo
    if (filtroActivo !== 'todos') {
      resultado = resultado.filter(item => {
        if (modoVista === 'unificado') {
          const itemUnificado = item as HistorialUnificado;
          switch (filtroActivo) {
            case 'inicial':
              return itemUnificado.descripcion.includes('Registro inicial') || itemUnificado.descripcion.includes('Ingreso al sistema') || itemUnificado.descripcion.includes('Creación de cuenta de usuario');
            case 'laboral':
              return itemUnificado.tipo === 'laboral' && !itemUnificado.descripcion.includes('Registro inicial');
            case 'licencias':
              return itemUnificado.descripcion.includes('Licencia') || itemUnificado.descripcion.includes('Permiso');
            case 'personales':
              return itemUnificado.tipo === 'trabajador' && !itemUnificado.descripcion.includes('Ingreso al sistema');
            case 'usuario':
              return itemUnificado.tipo === 'usuario' && !itemUnificado.descripcion.includes('Creación de cuenta de usuario');
            default:
              return true;
          }
        } else {
          const itemTradicional = item as HistorialLaboral;
          const obs = itemTradicional.observaciones?.toLowerCase() || '';
          switch (filtroActivo) {
            case 'inicial':
              return obs.includes('registro inicial');
            case 'laboral':
              return obs.includes('actualización de ficha') || obs.includes('desvinculación') || obs.includes('reactivación') || obs.includes('subida de contrato pdf');
            case 'licencias':
              return obs.includes('licencia') || obs.includes('permiso');
            case 'personales':
              return obs.includes('datos personales');
            case 'usuario':
              return obs.includes('correo corporativo') || obs.includes('rol');
            default:
              return true;
          }
        }
      });
    }

    // Filtro por búsqueda
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      resultado = resultado.filter(item => {
        if (modoVista === 'unificado') {
          const itemUnificado = item as HistorialUnificado;
          return itemUnificado.descripcion.toLowerCase().includes(termino) ||
                 itemUnificado.detalles.cargo?.toLowerCase().includes(termino) ||
                 itemUnificado.detalles.area?.toLowerCase().includes(termino) ||
                 itemUnificado.registradoPor?.name.toLowerCase().includes(termino);
        } else {
          const itemTradicional = item as HistorialLaboral;
          return itemTradicional.cargo.toLowerCase().includes(termino) ||
                 itemTradicional.area.toLowerCase().includes(termino) ||
                 itemTradicional.observaciones?.toLowerCase().includes(termino) ||
                 itemTradicional.registradoPor?.name.toLowerCase().includes(termino);
        }
      });
    }

    setHistorialFiltrado(resultado);
  };

  const formatFecha = (fecha?: string | null) => {
    if (!fecha) return '-';
    const [year, month, day] = fecha.split('T')[0].split('-');
    return `${day}-${month}-${year}`;
  };

  const formatFechaHora = (fecha?: string | null) => {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatSueldo = (sueldo: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(sueldo);
  };



  const getEstadoBadge = (estado?: string | null) => {
    if (!estado) return <Badge bg="secondary">-</Badge>;
    const color =
      estado.toLowerCase().includes('activo') ? 'success' :
      estado.toLowerCase().includes('licencia') ? 'info' :
      estado.toLowerCase().includes('permiso') ? 'warning' :
      estado.toLowerCase().includes('desvinculado') ? 'danger' :
      'secondary';
    return <Badge bg={color}>{estado}</Badge>;
  };

  const formatSeguroCesantia = (seguro?: boolean | null) => {
    if (seguro === null || seguro === undefined) return '-';
    return seguro ? <Badge bg="success">Sí</Badge> : <Badge bg="danger">No</Badge>;
  };

  const handleDescargarContrato = async (historialId: number) => {
    try {
      setDescargandoId(historialId);
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
      } else {
        console.error('Error al descargar:', result.error);
        alert(result.error || 'Error al descargar el contrato');
      }
    } catch (error) {
      console.error('Error al descargar contrato:', error);
      alert('Error inesperado al descargar el contrato');
    } finally {
      setDescargandoId(null);
    }
  };

  const handleDescargarLicenciaMedica = async (licenciaId: number) => {
    try {
      setDescargandoId(licenciaId);
      const result = await historialLaboralService.descargarLicenciaMedica(licenciaId);
      
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
      } else {
        console.error('Error al descargar:', result.error);
        alert(result.error || 'Error al descargar el archivo');
      }
    } catch (error) {
      console.error('Error al descargar licencia médica:', error);
      alert('Error inesperado al descargar el archivo');
    } finally {
      setDescargandoId(null);
    }
  };

  const getTipoRegistro = (observaciones?: string | null) => {
    if (!observaciones) return { tipo: 'General', color: 'secondary', icono: 'file-text' };
    if (observaciones.includes('Registro inicial')) 
      return { tipo: 'Registro Inicial', color: 'primary', icono: 'person-plus' };
    if (observaciones.includes('Actualización de ficha') || observaciones.includes('Actualización de información laboral') || observaciones.includes('Subida de contrato')) 
      return { tipo: 'Actualización Laboral', color: 'purple', icono: 'pencil-square' };
    if (observaciones.includes('Licencia médica') || observaciones.includes('Permiso administrativo')) 
      return { tipo: 'Licencia/Permiso', color: 'warning', icono: 'calendar-check' };
    if (observaciones.includes('Desvinculación')) 
      return { tipo: 'Desvinculación', color: 'danger', icono: 'person-dash' };
    if (observaciones.includes('Reactivación')) 
      return { tipo: 'Reactivación', color: 'success', icono: 'arrow-clockwise' };
    if (observaciones.includes('datos personales')) 
      return { tipo: 'Datos Personales', color: 'secondary', icono: 'person-gear' };
    return { tipo: 'Cambio', color: 'light', icono: 'file-text' };
  };

  const getContadorPorTipo = (tipo: FiltroTipo) => {
    const datosBase = modoVista === 'unificado' ? historialUnificado : historial;
    if (tipo === 'todos') return datosBase.length;
    
    return datosBase.filter(item => {
      if (modoVista === 'unificado') {
        const itemUnificado = item as HistorialUnificado;
        switch (tipo) {
          case 'inicial': return itemUnificado.descripcion.includes('Registro inicial') || itemUnificado.descripcion.includes('Ingreso al sistema') || itemUnificado.descripcion.includes('Creación de cuenta de usuario');
          case 'laboral': return itemUnificado.tipo === 'laboral' && !itemUnificado.descripcion.includes('Registro inicial');
          case 'licencias': return itemUnificado.descripcion.includes('Licencia') || itemUnificado.descripcion.includes('Permiso');
          case 'personales': return itemUnificado.tipo === 'trabajador' && !itemUnificado.descripcion.includes('Ingreso al sistema');
          case 'usuario': return itemUnificado.tipo === 'usuario' && !itemUnificado.descripcion.includes('Creación de cuenta de usuario');
          default: return false;
        }
      } else {
        const itemTradicional = item as HistorialLaboral;
        const obs = itemTradicional.observaciones?.toLowerCase() || '';
        switch (tipo) {
          case 'inicial': return obs.includes('registro inicial');
          case 'laboral': return obs.includes('actualización de ficha') || obs.includes('desvinculación') || obs.includes('reactivación') || obs.includes('subida de contrato pdf');
          case 'licencias': return obs.includes('licencia') || obs.includes('permiso');
          case 'personales': return obs.includes('datos personales');
          case 'usuario': return obs.includes('correo corporativo') || obs.includes('rol');
          default: return false;
        }
      }
    }).length;
  };

  const renderCamposManuales = (item: any) => {
    const campos = [];
    
    if (modoVista === 'unificado') {
      const itemUnificado = item as HistorialUnificado;
      const detalles = itemUnificado.detalles;
      const obs = itemUnificado.descripcion;
      const esActualizacionLaboral = obs === 'Actualización de información laboral';
      const esSubidaContrato = obs === 'Subida de contrato PDF';
      const esAmbos = obs === 'Actualización de información laboral y subida de contrato PDF';
      const esLicenciaPermiso = obs.includes('Licencia') || obs.includes('Permiso');
      const esDesvinculacion = obs.includes('Desvinculación');
      
      // Para desvinculaciones, mostrar solo el motivo de desvinculación
      if (esDesvinculacion) {
        if (detalles.motivoDesvinculacion) {
          campos.push(`Motivo: ${detalles.motivoDesvinculacion}`);
        }
      }
      // Para licencias/permisos, mostrar solo fechas y motivo
      else if (esLicenciaPermiso) {
        if (detalles.fechaInicioLicenciaPermiso) {
          campos.push(`Licencia: ${formatFecha(detalles.fechaInicioLicenciaPermiso)} - ${formatFecha(detalles.fechaFinLicenciaPermiso)}`);
        }
        if (detalles.motivoLicenciaPermiso) {
          campos.push(`Motivo: ${detalles.motivoLicenciaPermiso}`);
        }
      }
      // Para actualizaciones laborales, mostrar solo los campos que se modifican manualmente
      else if (esActualizacionLaboral) {
        if (detalles.cargo) {
          campos.push(`Cargo: ${detalles.cargo}`);
        }
        if (detalles.area) {
          campos.push(`Área: ${detalles.area}`);
        }
        if (detalles.tipoContrato) {
          campos.push(`Tipo Contrato: ${detalles.tipoContrato}`);
        }
        if (detalles.jornadaLaboral) {
          campos.push(`Jornada: ${detalles.jornadaLaboral}`);
        }
        if (detalles.sueldoBase !== undefined && detalles.sueldoBase !== null) {
          campos.push(`Sueldo: ${formatSueldo(detalles.sueldoBase)}`);
        }
        if (detalles.afp) {
          campos.push(`AFP: ${detalles.afp}`);
        }
        if (detalles.previsionSalud) {
          campos.push(`Previsión Salud: ${detalles.previsionSalud}`);
        }
        if (detalles.seguroCesantia !== undefined && detalles.seguroCesantia !== null) {
          campos.push(`Seguro Cesantía: ${formatSeguroCesantia(detalles.seguroCesantia)}`);
        }
      } else if (esSubidaContrato) {
        campos.push('Subida de Contrato');
      } else if (esAmbos) {
        // Mostrar campos modificados y "Subida de Contrato"
        if (detalles.cargo) campos.push(`Cargo: ${detalles.cargo}`);
        if (detalles.area) campos.push(`Área: ${detalles.area}`);
        if (detalles.tipoContrato) campos.push(`Tipo Contrato: ${detalles.tipoContrato}`);
        if (detalles.jornadaLaboral) campos.push(`Jornada: ${detalles.jornadaLaboral}`);
        if (detalles.sueldoBase !== undefined && detalles.sueldoBase !== null) campos.push(`Sueldo: ${formatSueldo(detalles.sueldoBase)}`);
        if (detalles.afp) campos.push(`AFP: ${detalles.afp}`);
        if (detalles.previsionSalud) campos.push(`Previsión Salud: ${detalles.previsionSalud}`);
        if (detalles.seguroCesantia !== undefined && detalles.seguroCesantia !== null) campos.push(`Seguro Cesantía: ${formatSeguroCesantia(detalles.seguroCesantia)}`);
        campos.push('Subida de Contrato');
      } else {
        // Para otros tipos de registro, usar la lógica anterior (más selectiva)
        if (detalles.cargo && detalles.cargo !== 'Por Definir' && detalles.cargo !== 'Actualización de datos personales') {
          campos.push(`Cargo: ${detalles.cargo}`);
        }
        if (detalles.area && detalles.area !== 'Por Definir' && detalles.area !== 'N/A') {
          campos.push(`Área: ${detalles.area}`);
        }
        if (detalles.sueldoBase && detalles.sueldoBase > 0) {
          campos.push(`Sueldo: ${formatSueldo(detalles.sueldoBase)}`);
        }
      }
      
      // Campos específicos para otros tipos (no licencias/permisos ni desvinculaciones)
      if (!esLicenciaPermiso && !esDesvinculacion) {
        if (detalles.rut) {
          campos.push(`RUT: ${detalles.rut}`);
        }
        if (detalles.corporateEmail) {
          campos.push(`Email: ${detalles.corporateEmail}`);
        }
        if (detalles.role) {
          campos.push(`Rol: ${detalles.role}`);
        }
      }
    } else {
      const itemTradicional = item as HistorialLaboral;
      const esLicenciaPermisoTradicional = itemTradicional.observaciones?.includes('Licencia') || itemTradicional.observaciones?.includes('Permiso');
      const esDesvinculacionTradicional = itemTradicional.observaciones?.includes('Desvinculación');
      
      // Para desvinculaciones en vista tradicional, mostrar solo el motivo
      if (esDesvinculacionTradicional) {
        if (itemTradicional.motivoDesvinculacion) {
          campos.push(`Motivo: ${itemTradicional.motivoDesvinculacion}`);
        }
      }
      // Para licencias/permisos en vista tradicional, mostrar solo fechas y motivo
      else if (esLicenciaPermisoTradicional) {
        if (itemTradicional.fechaInicioLicencia) {
          campos.push(`Licencia: ${formatFecha(itemTradicional.fechaInicioLicencia)} - ${formatFecha(itemTradicional.fechaFinLicencia)}`);
        }
        if (itemTradicional.motivoLicencia) {
          campos.push(`Motivo: ${itemTradicional.motivoLicencia}`);
        }
      } else {
        // Para otros tipos, mostrar los campos normales
        if (itemTradicional.cargo !== 'Por Definir' && itemTradicional.cargo !== 'Actualización de datos personales') {
          campos.push(`Cargo: ${itemTradicional.cargo}`);
        }
        if (itemTradicional.area !== 'Por Definir' && itemTradicional.area !== 'N/A') {
          campos.push(`Área: ${itemTradicional.area}`);
        }
        if (itemTradicional.sueldoBase > 0) {
          campos.push(`Sueldo: ${formatSueldo(itemTradicional.sueldoBase)}`);
        }
        if (itemTradicional.estado) {
          campos.push(`Estado: ${itemTradicional.estado}`);
        }
      }
    }
    
    return campos;
  };



  const getTipoRegistroUnificado = (item: HistorialUnificado) => {
    if (item.tipo === 'laboral') {
      if (item.descripcion.includes('Registro inicial')) 
        return { tipo: 'Registro Inicial', color: 'primary', icono: 'person-plus' };
      if (item.descripcion.includes('Actualización de información laboral') || item.descripcion.includes('Subida de contrato')) 
        return { tipo: 'Actualización Laboral', color: 'purple', icono: 'pencil-square' };
      if (item.descripcion.includes('Licencia') || item.descripcion.includes('Permiso')) 
        return { tipo: 'Licencia/Permiso', color: 'warning', icono: 'calendar-check' };
      if (item.descripcion.includes('Desvinculación')) 
        return { tipo: 'Desvinculación', color: 'danger', icono: 'person-dash' };
      if (item.descripcion.includes('Reactivación')) 
        return { tipo: 'Reactivación', color: 'success', icono: 'arrow-clockwise' };
    } else if (item.tipo === 'trabajador') {
      return { tipo: 'Datos Personales', color: 'secondary', icono: 'person-gear' };
    } else if (item.tipo === 'usuario') {
      return { tipo: 'Usuario', color: 'dark', icono: 'person-badge' };
    }
    
    return { tipo: 'Cambio', color: 'light', icono: 'file-text' };
  };

  return (
    <Container fluid className="py-4">
      {/* Breadcrumbs */}
      <Row className="mb-4">
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item onClick={() => navigate('/fichas-empresa')} style={{ cursor: 'pointer' }}>
              <i className="bi bi-building me-1"></i>
              Fichas de Empresa
            </Breadcrumb.Item>
            <Breadcrumb.Item active>
              <i className="bi bi-clock-history me-1"></i>
              Historial Laboral - {trabajadorNombre}
            </Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      {/* Header */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="bg-gradient-primary text-white">
              <Row className="align-items-center">
                <Col>
                  <h2 className="mb-0 text-white">
                    <i className="bi bi-clock-history me-3"></i>
                    Historial Laboral
                  </h2>
                  <p className="mb-0 opacity-75 text-white">
                    <i className="bi bi-person me-1"></i>
                    {trabajadorNombre}
                  </p>
                </Col>
                <Col xs="auto">
                  <div className="d-flex gap-2">
                    <Button 
                      variant={modoVista === 'unificado' ? 'light' : 'outline-light'} 
                      onClick={() => setModoVista('unificado')}
                      className="d-flex align-items-center"
                    >
                      <i className="bi bi-collection me-2"></i>
                      Vista Unificada
                    </Button>
                    <Button 
                      variant={modoVista === 'tradicional' ? 'light' : 'outline-light'} 
                      onClick={() => setModoVista('tradicional')}
                      className="d-flex align-items-center"
                    >
                      <i className="bi bi-list-ul me-2"></i>
                      Vista Tradicional
                    </Button>
                    <Button 
                      variant="light" 
                      onClick={() => navigate('/fichas-empresa')}
                      className="d-flex align-items-center"
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Volver
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtros y búsqueda */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Row className="align-items-center">
                <Col lg={8}>
                  <Nav variant="pills" className="flex-nowrap">
                    <Nav.Item>
                      <Nav.Link 
                        active={filtroActivo === 'todos'} 
                        onClick={() => setFiltroActivo('todos')}
                        className="d-flex align-items-center"
                      >
                        <i className="bi bi-list-ul me-1"></i>
                        Todos <Badge bg="primary" className="ms-1">{getContadorPorTipo('todos')}</Badge>
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link 
                        active={filtroActivo === 'inicial'} 
                        onClick={() => setFiltroActivo('inicial')}
                        className="d-flex align-items-center"
                      >
                        <i className="bi bi-person-plus me-1"></i>
                        Inicial <Badge bg="primary" className="ms-1">{getContadorPorTipo('inicial')}</Badge>
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link 
                        active={filtroActivo === 'laboral'} 
                        onClick={() => setFiltroActivo('laboral')}
                        className="d-flex align-items-center"
                      >
                        <i className="bi bi-briefcase me-1"></i>
                        Laborales <Badge bg="primary" className="ms-1">{getContadorPorTipo('laboral')}</Badge>
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link 
                        active={filtroActivo === 'licencias'} 
                        onClick={() => setFiltroActivo('licencias')}
                        className="d-flex align-items-center"
                      >
                        <i className="bi bi-calendar-check me-1"></i>
                        Licencias <Badge bg="warning" className="ms-1">{getContadorPorTipo('licencias')}</Badge>
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link 
                        active={filtroActivo === 'personales'} 
                        onClick={() => setFiltroActivo('personales')}
                        className="d-flex align-items-center"
                      >
                        <i className="bi bi-person-gear me-1"></i>
                        Personales <Badge bg="secondary" className="ms-1">{getContadorPorTipo('personales')}</Badge>
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Col>
                <Col lg={4}>
                  <Form.Control
                    type="text"
                    placeholder="Buscar en historial..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="d-flex align-items-center"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <i className="bi bi-search position-absolute" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }}></i>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Contenido - Timeline de Cards */}
      <Row>
        <Col>
          {loading ? (
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Cargando historial laboral...</p>
              </Card.Body>
            </Card>
          ) : error ? (
            <Alert variant="danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          ) : historialFiltrado.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5">
                <i className="bi bi-archive display-1 text-muted"></i>
                <h5 className="mt-3">No hay registros que coincidan</h5>
                <p className="text-muted">
                  {busqueda ? 'Intenta con otros términos de búsqueda.' : 'Este trabajador no tiene registros históricos del tipo seleccionado.'}
                </p>
              </Card.Body>
            </Card>
          ) : (
            <div className="timeline-container">
              {historialFiltrado.map((item, index) => {
                const tipoInfo = modoVista === 'unificado' 
                  ? getTipoRegistroUnificado(item as HistorialUnificado)
                  : getTipoRegistro((item as HistorialLaboral).observaciones);
                const camposManuales = renderCamposManuales(item);
                const itemId = modoVista === 'unificado' ? (item as HistorialUnificado).id : (item as HistorialLaboral).id;
                const fechaItem = modoVista === 'unificado' ? (item as HistorialUnificado).fecha : (item as HistorialLaboral).createAt;
                const estadoItem = modoVista === 'unificado' ? (item as HistorialUnificado).detalles.estado : (item as HistorialLaboral).estado;
                const observacionesItem = modoVista === 'unificado' ? (item as HistorialUnificado).descripcion : (item as HistorialLaboral).observaciones;
                const registradoPorItem = modoVista === 'unificado' ? (item as HistorialUnificado).registradoPor : (item as HistorialLaboral).registradoPor;
                const contratoURLItem = modoVista === 'unificado' ? (item as HistorialUnificado).detalles.contratoURL : (item as HistorialLaboral).contratoURL;
                const licenciaIdItem = modoVista === 'unificado' ? (item as HistorialUnificado).detalles.licenciaId : null;
                const archivoAdjuntoURLItem = modoVista === 'unificado' ? (item as HistorialUnificado).detalles.archivoAdjuntoURL : null;
                const esLicenciaMedica = observacionesItem?.includes('Licencia médica') || observacionesItem?.includes('licencia médica');
                const esSubidaContrato = observacionesItem?.includes('Subida de contrato PDF');
                
                return (
                  <div key={itemId} className="timeline-item">
                    <div className="timeline-marker">
                      <div className={`timeline-marker-circle bg-${tipoInfo.color}`}>
                        <i className={`bi bi-${tipoInfo.icono} text-white`}></i>
                      </div>
                      <div className="timeline-number">
                        <Badge bg="dark">#{historialFiltrado.length - index}</Badge>
                      </div>
                    </div>
                    
                    <Card className="timeline-card border-0 shadow-sm">
                      <Card.Header className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <Badge bg={tipoInfo.color} className="me-2">
                            <i className={`bi bi-${tipoInfo.icono} me-1`}></i>
                            {tipoInfo.tipo}
                          </Badge>
                          <small className="text-muted">
                            <i className="bi bi-clock me-1"></i>
                            {formatFechaHora(fechaItem)}
                          </small>
                        </div>
                        <div className="d-flex align-items-center">
                          {contratoURLItem && modoVista === 'tradicional' && (
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleDescargarContrato((item as HistorialLaboral).id)}
                              disabled={descargandoId === (item as HistorialLaboral).id}
                              className="me-2"
                            >
                              {descargandoId === (item as HistorialLaboral).id ? (
                                <Spinner size="sm" />
                              ) : (
                                <i className="bi bi-download"></i>
                              )}
                            </Button>
                          )}

                          {getEstadoBadge(estadoItem)}
                        </div>
                      </Card.Header>
                      
                      <Card.Body>
                        <Row>
                          <Col md={8}>
                            {/* Datos Modificados */}
                            {camposManuales.length > 0 && (
                              <div className="mb-3">
                                <h6 className="text-muted mb-2">
                                  {modoVista === 'unificado' && (item as HistorialUnificado).descripcion.includes('Actualización de información laboral')
                                    ? 'Datos Modificados'
                                    : 'Información Principal'
                                  }
                                </h6>
                                <div className="campos-principales">
                                  {camposManuales.map((campo, idx) => (
                                    <Badge key={idx} bg="light" text="dark" className="me-2 mb-1 p-2">
                                      {campo}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}



                            {camposManuales.length === 0 && (
                              <div className="mb-3">
                                <h6 className="text-muted mb-2">Información Principal</h6>
                                <p className="text-muted mb-0">Sin cambios relevantes en campos principales.</p>
                              </div>
                            )}
                            
                            {observacionesItem && (
                              <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <h6 className="text-muted mb-0">
                                    {modoVista === 'unificado' ? 'Descripción' : 'Observaciones'}
                                  </h6>
                                  {esLicenciaMedica && licenciaIdItem && archivoAdjuntoURLItem && (
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() => handleDescargarLicenciaMedica(licenciaIdItem)}
                                      disabled={descargandoId === licenciaIdItem}
                                      title="Descargar certificado médico"
                                    >
                                      {descargandoId === licenciaIdItem ? (
                                        <Spinner size="sm" />
                                      ) : (
                                        <>
                                          <i className="bi bi-file-earmark-medical me-1"></i>
                                          Descargar
                                        </>
                                      )}
                                    </Button>
                                  )}
                                  {esSubidaContrato && contratoURLItem && (
                                    <Button
                                      variant="outline-success"
                                      size="sm"
                                      onClick={() => handleDescargarContrato(modoVista === 'unificado' ? parseInt((item as HistorialUnificado).id.split('-')[1]) : (item as HistorialLaboral).id)}
                                      disabled={descargandoId === (modoVista === 'unificado' ? parseInt((item as HistorialUnificado).id.split('-')[1]) : (item as HistorialLaboral).id)}
                                      title="Descargar contrato PDF"
                                    >
                                      {descargandoId === (modoVista === 'unificado' ? parseInt((item as HistorialUnificado).id.split('-')[1]) : (item as HistorialLaboral).id) ? (
                                        <Spinner size="sm" />
                                      ) : (
                                        <>
                                          <i className="bi bi-file-earmark-pdf me-1"></i>
                                          Descargar
                                        </>
                                      )}
                                    </Button>
                                  )}
                                </div>
                                <p className="mb-0 small bg-light p-2 rounded">
                                  <i className="bi bi-info-circle me-1"></i>
                                  {observacionesItem}
                                </p>
                              </div>
                            )}
                          </Col>
                          
                          <Col md={4}>
                            <div className="info-adicional">
                              <h6 className="text-muted mb-2">Detalles Técnicos</h6>
                              {modoVista === 'tradicional' ? (
                                <>
                                  <small className="d-block mb-1">
                                    <strong>Tipo Contrato:</strong> {(item as HistorialLaboral).tipoContrato}
                                  </small>
                                  <small className="d-block mb-1">
                                    <strong>Jornada:</strong> {(item as HistorialLaboral).jornadaLaboral}
                                  </small>
                                  <small className="d-block mb-1">
                                    <strong>Período:</strong> {formatFecha((item as HistorialLaboral).fechaInicio)} 
                                    {(item as HistorialLaboral).fechaFin && ` - ${formatFecha((item as HistorialLaboral).fechaFin)}`}
                                  </small>
                                </>
                              ) : (
                                <>
                                  <small className="d-block mb-1">
                                    <strong>Tipo:</strong> <Badge bg={tipoInfo.color} className="small">{tipoInfo.tipo}</Badge>
                                  </small>
                                  <small className="d-block mb-1">
                                    <strong>Fecha:</strong> {formatFechaHora(fechaItem)}
                                  </small>
                                  
                                </>
                              )}
                              
                              {registradoPorItem && (
                                <div className="mt-2 pt-2 border-top">
                                  <small className="text-muted d-block mb-1">Registrado por:</small>
                                  <div className="d-flex align-items-center">
                                    <div className="flex-grow-1">
                                      <small className="fw-semibold d-block">{registradoPorItem.name}</small>
                                      <Badge bg="outline-secondary" className="small">
                                        {registradoPorItem.role}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
} 