import React, { useState, useCallback } from 'react';
import { useBono } from '@/hooks/recursosHumanos/useBonos';
import { useAuth, useUI } from '@/context';
import BonoCard from "../../components/recursosHumanos/BonoCard.jsx";
import "../../styles/pages/bonos.css";
import {
    Bono,
    CreateBonoData,
    UpdateBonoData, 
    BonoSearchQueryData,
    BonoSearchParamsData,
    BonoResponseData,
    BonoOperationResult

} from '@/types/recursosHumanos/bono.types';
import { Trabajador } from '@/types/recursosHumanos/trabajador.types';
import { FiltrosBusquedaHeader } from '@/components/common/FiltrosBusquedaHeader';
import { Container, Row, Col, Card, Button, Alert, Table, Form } from 'react-bootstrap';
import { Toast, useToast } from '@/components/common/Toast';
import bonoService, { 
  BonoService
} from '../../services/recursosHumanos/bono.service';
import { EditarBonoModal } from '@/components/recursosHumanos/EditarBono.js';

export const BonosPage = () => {
    const {
        bonos: bonosData,
        setBonos,
        isLoading,
        error: bonoError,
        //loadBonos: searchBonos,
        cargarBonos: cargarBonos,
        updateBono
      } = useBono();
    const [filter, setFilter] = useState("");// Toast notifications
    const { toasts, removeToast, showSuccess, showError } = useToast();
    const { setSuccess, setError } = useUI();
    const [localError, setLocalError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState<BonoSearchParamsData>({
        
    });

    const [showFilters, setShowFilters] = useState(false);
    const [selectedBono, setSelectedBono] = useState<Bono | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
    const handleCreateClick = () => {
        setIsCreatePopupOpen(true);
    };
    console.log("CONSOLE DE PAGE");
        

    const handleClickUpdate = (updateData) => {
        setSelectedBono(updateData);
        setShowEditModal(true);
    
        // Recargar los bonos
        cargarBonos();
        // Mostrar toast de éxito
        showSuccess('Bono actualizado!', 'El bono se ha actualizado exitosamente', 4000);
    };

    const handleUpdateSuccess = () => {
        // Recargar los bonos
        cargarBonos();
        // Mostrar toast de éxito
        showSuccess('¡Usuario actualizado!', 'El bono se ha actualizado exitosamente', 4000);
    };

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

    const bonosOrdenados = ["puntual", "recurrente", "permanente"];
    console.log('bonos: ', bonosData);
    console.log('bonos es array? ', Array.isArray(bonosData));
    const listarBonos = Array.isArray(bonosData)? bonosData : [];
    console.log("typeof bonos:", typeof bonosData);

    const bonosList = Array.isArray(bonosData) ? bonosData : []; // Usar directamente el array


    let groupedAndOrderedBonos: Record<string, Bono[]> = {
        puntual: [],
        recurrente: [],
        permanente: [],
    };
    if (bonosList.length > 0) {

        groupedAndOrderedBonos = bonosOrdenados.reduce<Record<string, Bono[]>>((acc, temporalidad) => {
            // Mostrar qué temporalidad estamos procesando

            // Obtener los bonos que coinciden con esta temporalidad
            acc[temporalidad] = bonosList.filter(
                (b) => b.temporalidad.toLowerCase() === temporalidad
            );
            // Mostrar cómo va quedando el acumulador hasta ahora
            return acc;
        }, {});

    }



    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilter(e.target.value);
    };

    


    


    

    return (
        <div>
            <div className="main-content-formBono">
                <div 
                    className="text-center mb-5"
                >
                    <h1 
                        className="fw-bold display-4"
                        style={{ color: "#1A5E63" }}
                    >
                        Bonos
                    </h1>
                </div>
                <div className="controls-formBono">
                    <div className="button-container">
                        <button 
                            style={{
                                borderRadius: '10px', 
                                background: ' #EDB65B',
                                border: 'none',
                                padding: '1rem 1.25rem'
                            }}
                            className="btn btn-outline-dark p-3"                            
                            onClick={handleCreateClick}
                        >
                            Crear Bono
                        </button>
                        <input
                            value={filter}
                            onChange={handleFilterChange}
                            placeholder="Filtrar por temporalidad"
                            className="search-input-table placeholder:text-[1A5E63]"
                        />
                    </div>
                </div>
                <div className="schedule-bonos">
                    {bonosList.length === 0 ?  (
                        <p>No hay bonos para mostrar.</p>
                    ) : (
                        bonosOrdenados.map(
                            (temporalidad) => 
                                groupedAndOrderedBonos[temporalidad]?.length > 0 && (
                                <div key={temporalidad} className="temporalidad-group-bonos">
                                    <h2 className="temporalidad-title-bonos">
                                        {temporalidad.toUpperCase()}
                                    </h2>
                                    <div className="bonos-grid">
                                        {groupedAndOrderedBonos[temporalidad].map(bono => (
                                            <BonoCard
                                                key={bono.id}
                                                bono={bono}
                                                onEdit={() => handleClickUpdate(bono)}
                                                onDelete={() => handleDelete(bono.id)}
                                            />
                                        ))}
                                    </div>
                                </div>
                        ))
                    )}
                </div>

                <EditarBonoModal
                    show={showEditModal}
                    onHide={() => setShowEditModal(false)}
                    bono={selectedBono}
                    onUpdate={handleUpdateSuccess}
                />
            </div>
            <div className="footer-bonos">
                <p className="text-center text-muted">
                    © 2025 Project GPS. Todos los derechos reservados.
                </p>
            </div>
        </div>
    );
};
