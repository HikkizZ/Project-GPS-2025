"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { Button, Form, Spinner, Row, Col, Card } from "react-bootstrap";
import { useCustomers } from "@/hooks/stakeholders/useCustomers";
import { useProducts } from "@/hooks/inventory/useProducts";
import type {
  CreateInventoryExitData,
  InventoryExitDetailData,
} from "@/types/inventory/inventory.types";
import type { Product } from "@/types/inventory/product.types";
import type { Customer } from "@/types/stakeholders/customer.types";

interface InventoryExitFormProps {
  onSubmit: (data: CreateInventoryExitData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const InventoryExitForm: React.FC<InventoryExitFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const { customers, isLoading: isLoadingCustomers } = useCustomers();
  const { products, isLoading: isLoadingProducts } = useProducts();

  const [formData, setFormData] = useState<CreateInventoryExitData>({
    customerRut: "",
    details: [
      {
        productId: 0,
        quantity: 0,
      },
    ],
  });
  const [exitDate, setExitDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [errors, setErrors] = useState<Record<string, string | string[]>>({});

  const activeProducts = useMemo(() => {
    return products.filter((product) => (product as any).isActive !== false);
  }, [products]); // Memoize the filtered list of active products [^1]

  const validate = (): boolean => {
    const newErrors: Record<string, string | string[]> = {};
    if (!formData.customerRut) {
      newErrors.customerRut = "Debe seleccionar un cliente.";
    }
    if (formData.details.length === 0) {
      newErrors.details = "Debe agregar al menos un producto.";
    } else {
      const detailErrors: string[] = [];
      formData.details.forEach((detail, index) => {
        if (!detail.productId || detail.productId === 0) {
          detailErrors[index] = "Seleccione un producto.";
        } else if (detail.quantity <= 0) {
          detailErrors[index] = "La cantidad debe ser mayor a 0.";
        }
      });
      if (detailErrors.some(Boolean)) {
        newErrors.details = detailErrors;
      }
    }
    setErrors(newErrors);
    return (
      Object.keys(newErrors).length === 0 &&
      (!Array.isArray(newErrors.details) || newErrors.details.every((e) => !e))
    );
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "customerRut") {
      setFormData((prev) => ({ ...prev, customerRut: value }));
    } else if (name === "exitDate") {
      setExitDate(value);
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDetailChange = (
    index: number,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    const newDetails = [...formData.details];
    let parsedValue: number | string = value;
    if (name === "quantity" || name === "productId") {
      parsedValue = Number.parseFloat(value);
      if (isNaN(parsedValue)) {
        parsedValue = 0;
      }
    }
    newDetails[index] = {
      ...newDetails[index],
      [name]: parsedValue,
    };
    setFormData((prev) => ({ ...prev, details: newDetails }));
    if (Array.isArray(errors.details) && errors.details[index]) {
      const newDetailErrors = [...errors.details];
      newDetailErrors[index] = "";
      setErrors((prev) => ({ ...prev, details: newDetailErrors }));
    }
  };

  const handleAddDetail = () => {
    setFormData((prev) => ({
      ...prev,
      details: [...prev.details, { productId: 0, quantity: 0 }],
    }));
  };

  const handleRemoveDetail = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index),
    }));
    setErrors((prev) => {
      if (Array.isArray(prev.details)) {
        const newDetailErrors = prev.details.filter((_, i) => i !== index);
        return { ...prev, details: newDetailErrors };
      }
      return prev;
    });
  };

  const calculateDetailTotalPrice = (detail: InventoryExitDetailData) => {
    const product = activeProducts.find((p) => p.id === detail.productId);
    return product ? detail.quantity * product.salePrice : 0;
  };

  const grandTotal = useMemo(() => {
    return formData.details.reduce(
      (sum, detail) => sum + calculateDetailTotalPrice(detail),
      0
    );
  }, [formData.details, activeProducts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const dataToSubmit: CreateInventoryExitData = {
      customerRut: formData.customerRut,
      details: formData.details,
    };

    if (exitDate) {
      try {
        const now = new Date();
        const currentTime = now.toTimeString().split(" ")[0]; // "HH:MM:SS"
        const combinedLocalDateTime = new Date(`${exitDate}T${currentTime}`);

        if (!isNaN(combinedLocalDateTime.getTime())) {
          (dataToSubmit as any).exitDate = combinedLocalDateTime.toISOString();
        } else {
          console.warn(
            "Fecha/hora combinada no válida:",
            exitDate,
            currentTime
          );
        }
      } catch (error) {
        console.error("Error combinando fecha con hora actual:", error);
      }
    }
    onSubmit(dataToSubmit);
  };

  const getProductOptions = (currentProductId: number) => {
    const selectedProductIds = new Set(
      formData.details.map((d) => d.productId)
    );
    return activeProducts.filter(
      (product) =>
        !selectedProductIds.has(product.id) || product.id === currentProductId
    );
  };

  if (isLoadingCustomers || isLoadingProducts) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" className="me-2" />
        <p className="mt-3 text-muted">Cargando datos...</p>
      </div>
    );
  }

  return (
    <Form onSubmit={handleSubmit}>
      <div className="modal-warning-alert">
        <i className="bi bi-info-circle-fill"></i>
        <div>
          <strong>Importante:</strong>
          <p className="mb-0">
            Al registrar una venta, se descontará el stock de los productos
            seleccionados.
          </p>
        </div>
      </div>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="customerRut">
            <Form.Label>Cliente</Form.Label>
            <Form.Control
              as="select"
              name="customerRut"
              value={formData.customerRut}
              onChange={handleChange}
              isInvalid={!!errors.customerRut}
            >
              <option value="">Selecciona un cliente</option>
              {customers.map((customer: Customer) => (
                <option key={customer.id} value={customer.rut}>
                  {customer.name} ({customer.rut})
                </option>
              ))}
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              {errors.customerRut}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="exitDate">
            <Form.Label>Fecha de Salida (Opcional)</Form.Label>
            <Form.Control
              type="date"
              name="exitDate"
              value={exitDate}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>

      <h5 className="mt-4 mb-3">Detalles de Productos</h5>
      {formData.details.map((detail, index) => (
        <Card key={index} className="mb-3 p-3 inventory-detail-card">
          <Row>
            <Col md={5}>
              <Form.Group className="mb-3" controlId={`productId-${index}`}>
                <Form.Label>Producto</Form.Label>
                <Form.Control
                  as="select"
                  name="productId"
                  value={detail.productId}
                  onChange={(e) => handleDetailChange(index, e)}
                  isInvalid={
                    Array.isArray(errors.details) && !!errors.details[index]
                  }
                >
                  <option value={0}>Selecciona un producto</option>
                  {getProductOptions(detail.productId).map(
                    (product: Product) => (
                      <option key={product.id} value={product.id}>
                        {product.product}
                      </option>
                    )
                  )}
                </Form.Control>
                {Array.isArray(errors.details) && errors.details[index] && (
                  <Form.Control.Feedback type="invalid" className="d-block">
                    {errors.details[index]}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
              <Form.Group className="mb-3" controlId={`pricePerM3-${index}`}>
                <Form.Label>Precio por m³</Form.Label>
                <Form.Control
                  type="text"
                  readOnly
                  value={`$${
                    activeProducts
                      .find((p) => p.id === detail.productId)
                      ?.salePrice.toLocaleString() || "0"
                  }`}
                  className="fw-bold text-success"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3" controlId={`quantity-${index}`}>
                <Form.Label>Cantidad (m³)</Form.Label>
                <Form.Control
                  type="number"
                  name="quantity"
                  placeholder="0"
                  value={detail.quantity === 0 ? "" : detail.quantity}
                  onChange={(e) => handleDetailChange(index, e)}
                  isInvalid={
                    Array.isArray(errors.details) && !!errors.details[index]
                  }
                  min="0"
                  step="0.01"
                />
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex justify-content-end">
              <div className="mb-3">
                <Button
                  variant="outline-danger"
                  onClick={() => handleRemoveDetail(index)}
                  disabled={formData.details.length === 1}
                >
                  <i className="bi bi-trash"></i>
                </Button>
              </div>
            </Col>
          </Row>
          <div className="text-end fw-bold text-muted">
            Total por producto: $
            {calculateDetailTotalPrice(detail).toLocaleString()}
          </div>
        </Card>
      ))}
      {Array.isArray(errors.details) &&
        errors.details.length > 0 &&
        typeof errors.details[0] === "string" && (
          <div className="text-danger mb-3">{errors.details[0]}</div>
        )}
      <Button
        variant="outline-primary"
        onClick={handleAddDetail}
        className="mb-4"
      >
        <i className="bi bi-plus-circle me-2"></i>
        Agregar Otro Producto
      </Button>

      <div className="text-end mb-4">
        <h4>
          Total General:{" "}
          <span className="text-success">${grandTotal.toLocaleString()}</span>
        </h4>
      </div>

      <div className="d-flex justify-content-end">
        <Button
          variant="secondary"
          className="me-2"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Registrando...
            </>
          ) : (
            "Registrar Salida"
          )}
        </Button>
      </div>
    </Form>
  );
};

export default InventoryExitForm;
