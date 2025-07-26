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
import "../../styles/pages/bonos.css";
import trabajadorIcon from '../../../assets/iconSVG_2/trabajadorIcon.svg';
import updateIcon from '../../../assets/iconSVG_2/updateIcon.svg';
import configIcon from '../../../assets/iconSVG_2/configIcon.svg';

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
    const { bonos, isLoading, error, cargarBonos, searchBonos, createBono, updateBono, clearError, totalBonos } = useBono();
    const [filter, setFilter] = useState("");// Toast notifications
    const { toasts, removeToast, showSuccess, showError } = useToast();
    const { setError: setUIError, setLoading } = useUI();
    const { user } = useAuth();

    const [showFilters, setShowFilters] = useState(false);
    const [selectedBono, setSelectedBono] = useState<Bono | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchParams, setSearchParams] = useState<BonoSearchQueryData>({});
    const [searchNombre, setSearchNombre] = useState<string>('');

    /*
    
    */
    useEffect(() => {
        // Cargar los bonos al montar el componente
        
        cargarBonos();
    }, []);

    
    // Función para manejar la búsqueda
    const handleSearch = () => {
    
        searchBonos(searchParams);
    };
    // Función para limpiar filtros
    const clearFilters = () => {
        setSearchParams({});
        cargarBonos();
    };

    const handleCreateClick = () => {
        setShowCreateModal(true);
        cargarBonos();
    };
        

    const handleClickUpdate = (updateData) => {
        setSelectedBono(updateData);
        setShowEditModal(true);

        // Recargar los bonos
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

    const handleUpdateSuccess = () => {
        // Recargar los bonos
        cargarBonos();
        // Mostrar toast de éxito
        showSuccess('¡Usuario actualizado!', 'El bono se ha actualizado exitosamente', 4000);
    };

    const handleDeleteSuccess = () => {
        // Recargar los bonos
        cargarBonos();
        // Mostrar toast de éxito
        showSuccess('¡Bono eliminado!', 'El bono se ha eliminado exitosamente', 4000);
    }

    const handleDelete = async (idBono) => {
        if (idBono) {
            try {
                
                const response = await bonoService.eliminarBono(idBono);
                if (response.success) {
                    // Mostrar mensaje de éxito
                    showSuccess('Bono eliminado', 'El bono se ha eliminado exitosamente', 4000);
                    // Recargar los bonos
                    cargarBonos();
                    // Limpiar el estado del horario seleccionado
                    setSelectedBono(null);
                    
                } else {
                    // Mostrar mensaje de error
                    showError('Error al eliminar el bono', response.error || 'No se pudo eliminar el bono', 4000);
                }
            } catch (error) {
                console.error('Error al eliminar el horario:', error);
                // Mostrar mensaje de error
                showError('Error de conexión', 'No se pudo conectar al servidor para eliminar el bono', 4000);
            }
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchNombre(e.target.value);
    };

    console.log('bonos: ', bonos);
    console.log('bonos es array? ', Array.isArray(bonos));
    console.log("typeof bonos:", typeof bonos);
    console.log('bonos length:', bonos.length);

    return (
        <Container fluid className="py-2">
            <div className="main-content-formBono">
                <div 
                    className="text-center mb-5"
                >
                    <h1 
                        className="fw-bold display-4"
                        style={{ color: "#283349" }}
                    >
                        Bonos
                    </h1>
                </div>
                
            </div>
            
            <Row>
                <Col>
                    <Card className="shadow-sm mb-3">
                        <Card.Header className="text-white" style={{ backgroundColor: "#283349", color: "white" }}>
                            
                            <div className="d-flex align-items-center justify-content-between" >
                                <div className="d-flex align-items-center text-white">
                                    <i className="bi bi-people-fill fs-4 me-3"></i>
                                    <div>
                                        <h3 className="mb-1 text-white">Gestión de Bonos</h3>
                                        <p className="mb-0 opacity-75 text-white">
                                            Administrar información de bonos del sistema
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <Button 
                                        variant={showFilters ? "outline-light" : "light"}
                                        className="me-2"
                                        onClick={() => setShowFilters(!showFilters)}                                      
                                        style={{ backgroundColor: "#EDB65B" }}
                                    >
                                        <i className={`bi bi-funnel${showFilters ? '-fill' : ''} me-2`}></i>
                                        {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
                                    </Button>
                                    <Button 
                                        variant="light"
                                        onClick={handleCreateClick}
                                        style={{ backgroundColor: "#EDB65B" }}
                                    >
                                        <i className="bi bi-person-plus-fill me-2"></i>
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
                                        <option key={tipoBono} value={tipoBono}>{tipoBono}</option>
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
                                    <option value={Temporalidad.permanente}>{Temporalidad.permanente}</option>
                                    <option value={Temporalidad.recurrente}>{Temporalidad.recurrente}</option>
                                    <option value={Temporalidad.puntual}>{Temporalidad.puntual}</option>
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
                        <p className="mt-3 text-muted">Cargando trabajadores...</p>
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
                                                                <td>{bono.nombreBono}</td>
                                                                <td>{bono.monto}</td>
                                                                <td>{bono.tipoBono}</td>
                                                                <td>{bono.temporalidad}</td>
                                                                <td>{bono.imponible ? 'Sí' : 'No'}</td>
                                                                <td>{bono.duracionMes || '-'}</td>
                                                                <td>{bono.descripcion || '-'}</td>
                                                                <td className="text-center">
                                                                    <div className="btn-group">
                                                                        <Button 
                                                                            variant="outline-primary" 
                                                                            className="me-2"
                                                                            onClick={() => handleClickUpdate(bono)}
                                                                            title="Editar bono"
                                                                        >
                                                                            <i className="bi bi-pencil"></i>
                                                                        </Button>
                                                                        <Button 
                                                                            variant="outline-danger"
                                                                            onClick={() => handleDelete(bono.id)}
                                                                            title="Eliminar bono"
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
            

            <EditarBonoModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                bono={selectedBono}
                onUpdate={handleUpdateSuccess}
            />

            <CrearBonoModal
                show={showCreateModal}
                onHide={() => setShowCreateModal(false)}
                onSuccess={handleCreateSuccess}
            />


            <div className="footer-bonos">
                <p className="text-center text-muted">
                    © 2025 Project GPS. Todos los derechos reservados.
                </p>
            </div>
        </Container>
    );
};
