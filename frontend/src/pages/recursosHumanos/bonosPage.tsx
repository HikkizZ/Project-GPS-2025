import React, { useState, useCallback, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Table, Form , Modal, Spinner} from 'react-bootstrap';
import { useBono } from '@/hooks/recursosHumanos/useBonos';
import { Bono, BonoSearchQueryData, BonoSearchParamsData } from '@/types/recursosHumanos/bono.types';
import { useAuth, useUI } from '@/context';
import BonoCard from "../../components/recursosHumanos/BonoCard.jsx";
import { EditarBonoModal } from '@/components/recursosHumanos/EditarBono.js';
import { CrearBonoModal } from '@/components/recursosHumanos/CrearBono.js';
import { FiltrosBusquedaHeader } from '@/components/common/FiltrosBusquedaHeader';
import { Toast, useToast } from '@/components/common/Toast';
import { bonoService } from '../../services/recursosHumanos/bono.service';
import { formatTipoBono, formatTemporalidad } from '../../utils/index';
import "../../styles/pages/bonos.css";

enum TipoBono {
    estatal = "estatal",
    empresarial = "empresarial"
}

enum Temporalidad {
    permanente = "permanente",
    recurrente = "recurrente",
    puntual = "puntual"
}

export const BonosPage: React.FC = () => {
    const { bonos, isLoading, error, cargarBonos, searchBonos, clearError, totalBonos, desactivarBono } = useBono();
    const [filter, setFilter] = useState("");// Toast notifications
    const { toasts, removeToast, showSuccess, showError } = useToast();
    const { setError: setUIError, setLoading } = useUI();
    const { user } = useAuth();

    const [showDesactivarModal, setShowDesactivarModal] = useState(false);
    const [bonoToDesactivar, setBonoToDesactivar] = useState<Bono | null>(null);
    const [motivoDesactivacion, setMotivoDesactivacion] = useState('');
    const [desactivarError, setDesactivarError] = useState<string>('');
    const [motivoDesactivacionError, setMotivoDesactivacionError] = useState<string>('');
    const [isDesactivado, setIsDesactivado] = useState(false);
    
    const [incluirInactivos, setIncluirInactivos] = useState(false);

    const [showFilters, setShowFilters] = useState(false);
    const [selectedBono, setSelectedBono] = useState<Bono | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchParams, setSearchParams] = useState<BonoSearchQueryData>({});
    const [searchNombre, setSearchNombre] = useState<string>('');

    const handleMotivoDesactivacionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setMotivoDesactivacion(value);
        if (motivoDesactivacionError) {
            setMotivoDesactivacionError('');
        }
    };

    const handleDesactivarClick = (bono: Bono) => {
        setBonoToDesactivar(bono);
        setShowDesactivarModal(true);
        setMotivoDesactivacion('');
        setMotivoDesactivacionError('');
        setDesactivarError('');
    };

    const handleDesactivarConfirm = async () => {
        if (!bonoToDesactivar) return;
        if (!motivoDesactivacion.trim()) {
            setMotivoDesactivacionError('El motivo de desactivación es obligatorio');
            return;
        } else if (motivoDesactivacion.trim().length < 3) {
            setMotivoDesactivacionError('El motivo de desactivación debe tener al menos 3 caracteres');
            return;
        }
        try {
            setIsDesactivado(true);
            setDesactivarError('');
            setMotivoDesactivacion('');
            const result = await desactivarBono(bonoToDesactivar.id, motivoDesactivacion);
            if (result.success) {
                setShowDesactivarModal(false);
                cargarBonos(); // Recargar la lista de bonos
                showSuccess('Bono desactivado', 'El bono se ha desactivado exitosamente', 4000);
            } else {
                setDesactivarError(result.error || 'Error al desactivar el bono');
            }
        } catch (error) {
            setDesactivarError('Error de conexión al desactivar el bono');
        } finally {
            setIsDesactivado(false);
        }
    };

    useEffect(() => {
        // Cargar los bonos al montar el componente
        
        cargarBonos();
    }, []);

    
    // Función para manejar la búsqueda
    const handleSearch = () => {
        const paramsWithInactivos = {
            ...searchParams,
            incluirInactivos: incluirInactivos ? 'true' : 'false'
        };
        searchBonos(paramsWithInactivos);
    };
    // Función para limpiar filtros
    const clearFilters = () => {
        setSearchParams({});
        setIncluirInactivos(false);
        cargarBonos();
    };

    const handleCreateClick = () => {
        setShowCreateModal(true);
        cargarBonos();
    };

    const handleCreateSuccess = () => {
        // Cerrar el modal
        setShowCreateModal(false);
        // Recargar los bonos
        cargarBonos();
        // Mostrar toast de éxito
        showSuccess('¡Bono creado!', 'El bono se ha creado exitosamente', 4000);
    }

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchNombre(e.target.value);
    };

    console.log('bonos: ', bonos);
    console.log('bonos es array? ', Array.isArray(bonos));
    console.log("typeof bonos:", typeof bonos);
    console.log('bonos length:', bonos.length);

    return (
        <Container fluid className="py-2">
            <Row>
                <Col>
                    {/* Encabezado de página */}
                    <Card className="shadow-sm mb-3">
                        <Card.Header className="bg-gradient-primary text-white">
                            <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center">
                                    <i className="bi bi-gift fs-4 me-3"></i>
                                    <div>
                                        <h3 className="mb-1">Gestión de Bonos</h3>
                                        <p className="mb-0 opacity-75">
                                            Administrar información de bonos del sistema
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <Button 
                                        variant={showFilters ? "outline-light" : "light"}
                                        className="me-2"
                                        onClick={() => setShowFilters(!showFilters)}
                                    >
                                        <i className={`bi bi-funnel${showFilters ? '-fill' : ''} me-2`}></i>
                                        {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
                                    </Button>
                                    <Button 
                                        variant="light"
                                        onClick={handleCreateClick}
                                    >
                                        <i className="bi bi-gift me-2"></i>
                                        Crear Bono
                                    </Button>
                                </div>
                            </div>
                        </Card.Header>
                    </Card>

                    {showFilters && (
                        <Card className="shadow-sm mb-3">
                            <FiltrosBusquedaHeader />
                            <Card.Body>
                            <Row>
                                <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Bono</Form.Label>
                                    <Form.Control
                                    type="text"
                                    value={searchParams.nombreBono || ''}
                                    onChange={(e) => setSearchParams({ ...searchParams, nombreBono: e.target.value })}
                                    placeholder="Ej: Bono de Navidad"
                                    style={{ borderRadius: '8px' }}
                                    />
                                </Form.Group>
                                </Col>
                                <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tipo de bono:</Form.Label>
                                    <Form.Select
                                    value={searchParams.tipoBono || ''}
                                    onChange={(e) => setSearchParams({ ...searchParams, tipoBono: e.target.value as TipoBono})}
                                    style={{ borderRadius: '8px' }}
                                    >
                                    <option value="">Seleccione una opción</option>
                                    {Object.values(TipoBono).map(tipoBono => (
                                        <option key={tipoBono} value={tipoBono}>{tipoBono.charAt(0).toUpperCase() + tipoBono.slice(1)}</option>
                                    ))}
                                    </Form.Select>
                                </Form.Group>
                                </Col>
                                <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Temporalidad:</Form.Label>
                                    <Form.Select
                                    value={searchParams.temporalidad || ''}
                                    onChange={(e) => setSearchParams({ ...searchParams, temporalidad: e.target.value as Temporalidad})}
                                    style={{ borderRadius: '8px' }}
                                    >
                                    <option value="">Seleccione una opción</option>
                                    <option value={Temporalidad.permanente}>{Temporalidad.permanente.charAt(0).toUpperCase() + Temporalidad.permanente.slice(1)}</option>
                                    <option value={Temporalidad.recurrente}>{Temporalidad.recurrente.charAt(0).toUpperCase() + Temporalidad.recurrente.slice(1)}</option>
                                    <option value={Temporalidad.puntual}>{Temporalidad.puntual.charAt(0).toUpperCase() + Temporalidad.puntual.slice(1)}</option>
                                    </Form.Select>
                                </Form.Group>
                                </Col>
                                <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Imponible</Form.Label>
                                    <Form.Switch
                                    checked={searchParams.imponible || false}
                                    onChange={(e) => setSearchParams({ ...searchParams, imponible: e.target.checked })}
                                    style={{ borderRadius: '8px' }}
                                    >
                                    </Form.Switch>
                                </Form.Group>
                                </Col>
                                <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Duracion en meses</Form.Label>
                                    <Form.Control
                                    type="text"
                                    inputMode='numeric'
                                    placeholder="Cantidad de meses que se efectuara el bono"
                                    value={searchParams.duracionMes || ''}
                                    onChange={(e) => setSearchParams({ ...searchParams, duracionMes: e.target.value })}
                                    style={{ borderRadius: '8px' }}
                                    >
                                    </Form.Control>
                                </Form.Group>
                                </Col>
                                <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Incluir Bonos Inactivos</Form.Label>
                                    <Form.Switch
                                    checked={incluirInactivos}
                                    onChange={(e) => setIncluirInactivos(e.target.checked)}
                                    style={{ borderRadius: '8px' }}
                                    >
                                    </Form.Switch>
                                </Form.Group>
                                </Col>
                                <Col md={6} className="d-flex align-items-end">
                                <div className="d-flex gap-2 mb-3">
                                    <Button variant="primary" onClick={handleSearch}>
                                    <i className="bi bi-search me-2"></i>
                                    Buscar
                                    </Button>
                                    <Button variant="outline-secondary" onClick={clearFilters}>
                                    <i className="bi bi-x-circle me-2"></i>
                                    Limpiar
                                    </Button>
                                </div>
                                </Col>
                            </Row>
                            </Card.Body>
                        </Card>
                    )}

                    {/* Mensajes de error o carga */}
                    {error && (
                        <Alert variant="danger" className="mb-3">
                        <i className="bi bi-exclamation-circle me-2"></i>
                        {error}
                        </Alert>
                    )}

                    {/* Loading spinner */}
                    {isLoading && (
                        <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3 text-muted">Cargando bonos...</p>
                        </div>
                    )}

                    {/* Tabla de bonos */}
                    {!isLoading && !error && (
                        <Card className="shadow-sm">
                            <Card.Body>
                                {bonos.length === 0 ? (
                                    Object.values(searchParams).some(value => value) ? (
                                        <div className="text-center py-5">
                                            <i className="bi bi-emoji-frown-fill fs-1 text-muted"></i>
                                            <h5 className="mt-3">No se encontraron bonos</h5>
                                            <p className="text-muted">Intenta ajustar los filtros o crear un nuevo bono.</p>
                                            <Button variant='outline-primary' onClick={clearFilters}>
                                                <i className="bi bi-arrow-clockwise me-2"></i>
                                                Recargar Bonos
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="text-center py-5">
                                            <i className="bi bi-emoji-smile-fill fs-1 text-muted"></i>
                                            <h5 className="mt-3">¡No hay bonos registrados!</h5>
                                            <p className="text-muted">Puedes crear un nuevo bono haciendo clic en el botón "Crear Bono".</p>
                                            <Button variant='outline-primary' onClick={handleCreateClick}>
                                                <i className="bi bi-plus-circle me-2"></i>
                                                Crear Bono
                                            </Button>
                                        </div>
                                    )
                                 ) : (
                                        <>
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h6 className="mb-0">
                                                    <i className="bi bi-list-ul me-2"></i>
                                                    Bonos ({bonos.length})
                                                    <small className="text-muted ms-2">
                                                        (Activos: {bonos.filter(t => t.enSistema).length} • 
                                                        Desvinculados: {bonos.filter(t => !t.enSistema).length})
                                                    </small>
                                                </h6>
                                            </div>

                                            <div className='table-responsive'>
                                                <Table hover>
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>ID</th>
                                                            <th>Nombre bono</th>
                                                            <th>Monto</th>
                                                            <th>Tipo del Bono</th>
                                                            <th>Temporalidad</th>
                                                            <th>Imponible</th>
                                                            <th>Duracion en meses</th>
                                                            <th>Descripción</th>
                                                            <th className="text-center">Acciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {bonos.map((bono) => (
                                                            <tr key={bono.id}>
                                                                <td>{bono.id}</td>
                                                                <td>
                                                                    <div>
                                                                        <div className="fw-bold">
                                                                            {bono.nombreBono}
                                                                        </div>
                                                                        {!bono.enSistema && (
                                                                            <span className="badge bg-secondary bg-opacity-25 text-secondary" style={{ fontSize: '0.75em' }}>
                                                                                <i className="bi bi-person-x me-1"></i>
                                                                                Desvinculado
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td>{bono.monto}</td>
                                                                <td>{formatTipoBono(bono.tipoBono)}</td>
                                                                <td>{formatTemporalidad(bono.temporalidad)}</td>
                                                                <td>{bono.imponible ? 'Sí' : 'No'}</td>
                                                                <td>{bono.duracionMes || '-'}</td>
                                                                <td>{bono.descripcion || '-'}</td>
                                                                <td className="text-center">
                                                                    <div className="btn-group">
                                                                        <Button 
                                                                            variant="outline-danger"
                                                                            onClick={() => handleDesactivarClick(bono)}
                                                                            title="Desactivar bono"
                                                                            disabled={!bono.enSistema}
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
                                    )
                                }
                            </Card.Body>
                        </Card>
                    )}
                    
                </Col>
            </Row>
        
            <CrearBonoModal
                show={showCreateModal}
                onHide={() => setShowCreateModal(false)}
                onSuccess={handleCreateSuccess}
            />

             {/* Modal reactivación */}
            <Modal
                show={showDesactivarModal}
                onHide={() => setShowDesactivarModal(false)}
                centered
            >
                <Modal.Header 
                    closeButton 
                    style={{
                    background: 'linear-gradient(135deg, #dc3545 0%, #a71e2a 100%)',
                    border: 'none'
                    }}
                    className="text-white"
                >
                    <Modal.Title className="fw-semibold">
                        <i className="bi bi-person-x me-2"></i>
                        Desactivar Bono
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: '1.5rem' }}>
                    <Alert variant="warning" className="border-0 mb-3" style={{ borderRadius: '12px' }}>
                        <div className="d-flex align-items-start">
                            <i className="bi bi-exclamation-triangle me-3 mt-1 text-warning"></i>
                            <div>
                                <strong>Advertencia:</strong>
                                <p className="mb-2 mt-1">Esta acción:</p>
                                <ul className="mb-0">
                                    <li>Marcará al bono como desactivado en el sistema</li>
                                    <li>Cambiará el estado de las asignaciones a "Desactivado"</li>
                                    <li>No contará este bono para los calculos de remuneraciones</li>
                                </ul>
                            </div>
                        </div>
                    </Alert>
                      
                    <div className="mb-3 p-3 bg-light rounded-3">
                        <p className="mb-2 fw-semibold">¿Estás seguro que deseas desactivar el bono?</p>
                        <div className="d-flex flex-column gap-1">
                            <div>
                                <span className="fw-semibold text-muted">Nombre:</span> 
                                <span className="ms-2">{bonoToDesactivar ? `${bonoToDesactivar.nombreBono}` : ''}</span>
                            </div>
                        </div>
                    </div>
                      
                    <Form.Group>
                        <Form.Label className="fw-semibold">Motivo de Desactivación <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={motivoDesactivacion}
                            onChange={handleMotivoDesactivacionChange}
                            isInvalid={!!motivoDesactivacionError}
                            placeholder="Ingrese el motivo de la desactivación..."
                            required
                            style={{ borderRadius: '8px' }}
                        />
                        <Form.Control.Feedback type="invalid">
                            {motivoDesactivacionError}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                            <i className="bi bi-info-circle me-1"></i>
                            Es importante documentar el motivo de la desactivación para seguimiento.
                        </Form.Text>
                    </Form.Group>
                        {desactivarError && (
                            <Alert variant="danger" className="border-0 mt-3 mb-0" style={{ borderRadius: '12px' }}>
                                <i className="bi bi-exclamation-circle me-2"></i>
                                {desactivarError}
                            </Alert>
                        )}
                </Modal.Body>

                <Modal.Footer style={{ padding: '1rem 1.5rem', borderTop: '1px solid #dee2e6' }}>
                    <Button 
                        variant="outline-secondary" 
                        onClick={() => setShowDesactivarModal(false)}
                        disabled={isDesactivado}
                        style={{ borderRadius: '20px', fontWeight: '500' }}
                    >
                        <i className="bi bi-x-circle me-2"></i>
                        Cancelar
                    </Button>
                    <Button 
                        variant="danger"
                        onClick={handleDesactivarConfirm}
                        disabled={isDesactivado || !motivoDesactivacion.trim() || !!motivoDesactivacionError}
                        style={{ borderRadius: '20px', fontWeight: '500' }}
                    >
                        {isDesactivado ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                />
                                Desactivando...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-person-x me-2"></i>
                                Desactivar
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};
