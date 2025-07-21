import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { CreateSparePartData } from '@/types/machinaryMaintenance/sparePart.types';
import { getSpareParts } from '@/services/machinaryMaintenance/sparePart.service';
import {GrupoMaquinaria} from '@/types/maquinaria/maquinaria.types'
import { obtenerTodasLasMaquinarias } from '@/services/maquinaria/maquinaria.service'
import { useToast } from '@/components/common/Toast';
import { updateSparePart, createSparePart } from '@/services/machinaryMaintenance/sparePart.service';


interface Props {
  initialData?: Partial<CreateSparePartData> & { id?: number }; 
  onSubmit: (data: CreateSparePartData) => void; 
  loading?: boolean;
}



const SparePartForm: React.FC<Props>= ({initialData = {}, onSubmit, loading}) => {

  const { id, ...cleanInitialData } = initialData || {};
  const { showError } = useToast();

    const [form, setForm] = useState<CreateSparePartData>({
      name: '',
      stock: 0,
      marca: '',
      modelo: '',
      anio: new Date().getFullYear(),
      grupo: '' as unknown as GrupoMaquinaria,
      ...cleanInitialData,

    })

      const [maquinaria, setGruposMaquinaria] = useState<string[]>([]);
      useEffect(() => {
        const cargarGrupos = async () => {
          const { data, success } = await obtenerTodasLasMaquinarias();
          if (success && data) {
            const gruposUnicos = [...new Set(data.map((r) => r.grupo))];
            setGruposMaquinaria(gruposUnicos);
          }
        };
        cargarGrupos();
      }, []);

      const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value }  = e.target;

     

      setForm((prev) => ({
        ...prev,
       [name]: name === 'number' ? Number(value) : value,
      }));
    };
  

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        

        try {
          
          if (form.name.trim().length < 3) {
            showError("Nombre inválido", "El nombre debe tener al menos 3 caracteres.");
            return;
          }

          if (form.stock < 0) {
            showError("Stock inválido", "El stock no puede ser negativo.");
            return;
          }

          const anioActual = new Date().getFullYear();
          if (form.anio < 2000 || form.anio > anioActual) {
            showError("Año inválido", `El año debe estar entre 2000 y ${anioActual}.`);
            return;
          }

          const { data: allParts, success } = await getSpareParts();
          if (success && allParts) {
            const duplicado = allParts.find((r) =>
              r.name.trim().toLowerCase() === form.name.trim().toLowerCase() &&
              r.grupo === form.grupo
            );
            if (duplicado && (!initialData || duplicado.id !== initialData.id)) {
              showError("Error de duplicado", "Ya existe un repuesto con ese nombre en ese grupo de maquinaria.");
              return;
            }
          }

          const dataToSend = {
            name: form.name,
            stock: form.stock,
            marca: form.marca,
            modelo: form.modelo,
            anio: form.anio,
            grupo: form.grupo,
          };

          if (initialData?.id) {
            await updateSparePart(initialData.id, dataToSend);
          } else {
            await createSparePart(dataToSend);
          }

          onSubmit(form); 

          
          setForm({
            name: '',
            stock: 0,
            marca: '',
            modelo: '',
            anio: new Date().getFullYear(),
            grupo: '' as unknown as GrupoMaquinaria,
          });
        } catch (error) {
          console.error("Error en el handleSubmit:", error);
          showError("Error inesperado", "Ocurrió un problema al guardar el repuesto.");
        }
      };


  
  
  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="name">
        <Form.Label>Nombre</Form.Label>
        <Form.Control
          type="text"
          name="name"
          minLength={3}
          value={form.name}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group controlId="stock">
        <Form.Label>Stock</Form.Label>
        <Form.Control
          type="number"
          name="stock"
          min={1}
          value={form.stock}
          onChange={handleChange}
          required
          className="no-spinner"
        />
      </Form.Group>

      <Form.Group controlId="marca">
        <Form.Label>Marca</Form.Label>
        <Form.Control
          type="text"
          name="marca"
          minLength={3}
          value={form.marca}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group controlId="modelo">
        <Form.Label>Modelo</Form.Label>
        <Form.Control
          type="text"
          name="modelo"
          minLength={3}
          value={form.modelo}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group controlId="anio">
        <Form.Label>Año</Form.Label>
        <Form.Control
          type="number"
          name="anio"
          value={form.anio}
          min={1950}
          max={new Date().getFullYear() + 1}
          onChange={handleChange}
          required
        />
      </Form.Group>

      {/*<Form.Group controlId="maquinariaId">
        <Form.Label>Maquinaria</Form.Label>
        <Form.Select
          name="maquinariaId"
          value={form.maquinariaId}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione maquinaria</option>
          {maquinarias.map((m) => (
            <option key={m.id} value={m.id}>
              {`${m.patente} - ${m.modelo}`}
            </option>
          ))}
        </Form.Select>
      </Form.Group> */}

     <Form.Group controlId="grupo">
        <Form.Label>Grupo</Form.Label>
        <Form.Select
          name="grupo"
          value={form.grupo}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione-grupo</option>
          {maquinaria.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Button variant="primary" type="submit" disabled={loading} className="mt-3">
        {loading ? <Spinner animation="border" size="sm" /> : 'Guardar'}
      </Button>
    </Form>
  );
};

export default SparePartForm;
