import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { CreateSparePartData } from '@/types/machinaryMaintenance/sparePart.types';
import { getSpareParts } from '@/services/machinaryMaintenance/sparePart.service';
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
      ...cleanInitialData,

    })


      const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value }  = e.target;

     

      setForm((prev) => ({
        ...prev,
       [name]: name === 'number' ? Number(value) : value,
      }));
    };
  
    const tieneCaracteresEspeciales = (texto: string): boolean => {
      const regex = /^[a-zA-Z0-9\s]+$/;
      return !regex.test(texto);
    };

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
          const { name, marca, modelo, stock, anio } = form;

          const anioActual = new Date().getFullYear();

          if (name.trim().length < 3) {
            showError("Nombre inválido", "El nombre debe tener al menos 3 caracteres.");
            return;
          }

          if (tieneCaracteresEspeciales(name)) {
            showError("Nombre inválido", "No se permiten caracteres especiales en el nombre.");
            return;
          }

          if (tieneCaracteresEspeciales(marca)) {
            showError("Marca inválida", "No se permiten caracteres especiales en la marca.");
            return;
          }

          if (tieneCaracteresEspeciales(modelo)) {
            showError("Modelo inválido", "No se permiten caracteres especiales en el modelo.");
            return;
          }

          if (stock < 0) {
            showError("Stock inválido", "El stock no puede ser negativo.");
            return;
          }

          if (anio < 2000 || anio > anioActual) {
            showError("Año inválido", `El año debe estar entre 2000 y ${anioActual}.`);
            return;
          }

          // Validación de duplicados
          const { data: allParts, success } = await getSpareParts();
          if (success && allParts) {
            const duplicado = allParts.find((r) =>
              r.name.trim().toLowerCase() === name.trim().toLowerCase() &&
              r.marca.trim().toLowerCase() === marca.trim().toLowerCase() &&
              r.modelo.trim().toLowerCase() === modelo.trim().toLowerCase()
            );

            if (duplicado && (!initialData || duplicado.id !== initialData.id)) {
              showError("Duplicado", "Ya existe un repuesto con el mismo nombre, marca y modelo.");
              return;
            }
          }

          const dataToSend = { name, stock, marca, modelo, anio };

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
            anio: new Date().getFullYear()
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
          pattern="[a-zA-Z0-9\s]+"
          title="Solo letras, números y espacios"
          value={form.name}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group controlId="stock">
        <Form.Label>Stock</Form.Label>
        <Form.Control
          type="text"
          name="stock"
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
          name="name"
          pattern="[a-zA-Z0-9\s]+"
          title="Solo letras, números y espacios"
          value={form.marca}
          onChange={handleChange}
          required
/>
      </Form.Group>

      <Form.Group controlId="modelo">
        <Form.Label>Modelo</Form.Label>
        <Form.Control
          type="text"
          name="name"
          pattern="[a-zA-Z0-9\s]+"
          title="Solo letras, números y espacios"
          value={form.modelo}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group controlId="anio">
        <Form.Label>Año</Form.Label>
        <Form.Control
          type="text"
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


      <Button variant="primary" type="submit" disabled={loading} className="mt-3">
        {loading ? <Spinner animation="border" size="sm" /> : 'Guardar'}
      </Button>
    </Form>
  );
};

export default SparePartForm;
