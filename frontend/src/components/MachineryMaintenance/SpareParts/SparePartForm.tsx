import React, { useState } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { CreateSparePartData, SparePart } from '@/types/machinaryMaintenance/sparePart.types';
import { useToast } from '@/components/common/Toast';

interface Props {
  initialData?: Partial<CreateSparePartData> & { id?: number }; 
  onSubmit: (data: CreateSparePartData) => void; 
  loading?: boolean;
  allParts: SparePart[]; 
}

  const SparePartForm: React.FC<Props> = ({ initialData = {}, onSubmit, loading, allParts }) => {
    const { id, ...cleanInitialData } = initialData || {};
    const { showError } = useToast();

    const [form, setForm] = useState<CreateSparePartData>({
      name: '',
      stock: 0,
      marca: '',
      modelo: '',
      anio: new Date().getFullYear(),
      ...cleanInitialData,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({
        ...prev,
        [name]: ['stock', 'anio'].includes(name) ? Number(value) : value,
      }));
    };

    const tieneCaracteresEspeciales = (texto: string): boolean => {
      const regex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s().-]+$/;
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

        const duplicado = allParts.find((r) =>
          r.name.trim().toLowerCase() === name.trim().toLowerCase() &&
          r.marca.trim().toLowerCase() === marca.trim().toLowerCase() &&
          r.modelo.trim().toLowerCase() === modelo.trim().toLowerCase()
        );

        if (duplicado && (!initialData?.id || duplicado.id !== initialData.id)) {
          showError("Duplicado", "Ya existe un repuesto con el mismo nombre, marca y modelo.");
          return;
        }

        const dataToSend = { name, stock, marca, modelo, anio };
        onSubmit(dataToSend);

        if (!initialData?.id) {
          setForm({
            name: '',
            stock: 0,
            marca: '',
            modelo: '',
            anio: new Date().getFullYear()
          });
        }

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
            value={form.stock === 0 ? "" : form.stock}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="marca">
          <Form.Label>Marca</Form.Label>
          <Form.Control
            type="text"
            name="marca"
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
            min={2000}
            max={new Date().getFullYear()}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit" disabled={loading} className="mt-3">
          {loading ? <Spinner animation="border" size="sm" /> : 'Guardar'}
        </Button>
      </Form>
    );
  };

export default SparePartForm;
