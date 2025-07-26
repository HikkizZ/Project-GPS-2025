import type React from "react";
import { useState, useMemo } from "react";
import {
  Button,
  Form,
  Spinner,
  Row,
  Col,
  InputGroup,
  Card,
} from "react-bootstrap";
import { useSuppliers } from "@/hooks/stakeholders/useSuppliers";
import { useProducts } from "@/hooks/inventory/useProducts";
import type {
  CreateInventoryEntryData,
  InventoryEntryDetailData,
} from "@/types/inventory/inventory.types";
import type { Product } from "@/types/inventory/product.types";
import type { Supplier } from "@/types/stakeholders/supplier.types";

interface InventoryEntryFormProps {
  onSubmit: (data: CreateInventoryEntryData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const InventoryEntryForm: React.FC<InventoryEntryFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const { suppliers, isLoading: isLoadingSuppliers } = useSuppliers();
  const { products, isLoading: isLoadingProducts } = useProducts();

  const [formData, setFormData] = useState<CreateInventoryEntryData>({
    supplierRut: "",
    details: [
      {
        productId: 0,
        quantity: 0,
        purchasePrice: 0,
      },
    ],
  });
  const [entryDate, setEntryDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [errors, setErrors] = useState<Record<string, string | string[]>>({});

  const activeProducts = useMemo(() => {
    return products.filter((product) => (product as any).isActive !== false);
  }, [products]);

  const validate = (): boolean => {
    const newErrors: Record<string, string | string[]> = {};

    if (!formData.supplierRut) {
      newErrors.supplierRut = "Debe seleccionar un proveedor.";
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
        } else if (detail.purchasePrice <= 0) {
          detailErrors[index] = "El precio de compra debe ser mayor a 0.";
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
    if (name === "supplierRut") {
      setFormData((prev) => ({ ...prev, supplierRut: value }));
    } else if (name === "entryDate") {
      setEntryDate(value);
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
    const numericValue = ["quantity", "purchasePrice"].includes(name)
      ? Number.parseFloat(value)
      : value;

    newDetails[index] = {
      ...newDetails[index],
      [name]: isNaN(numericValue as number) ? 0 : numericValue,
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
      details: [
        ...prev.details,
        { productId: 0, quantity: 0, purchasePrice: 0 },
      ],
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

  const calculateDetailTotalPrice = (detail: InventoryEntryDetailData) => {
    return detail.quantity * detail.purchasePrice;
  };

  const grandTotal = useMemo(() => {
    return formData.details.reduce(
      (sum, detail) => sum + calculateDetailTotalPrice(detail),
      0
    );
  }, [formData.details]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const dataToSubmit: CreateInventoryEntryData = {
      supplierRut: formData.supplierRut,
      details: formData.details,
    };
    if (entryDate) {
      try {
        const now = new Date();
        const currentTime = now.toTimeString().split(" ")[0]; // "HH:MM:SS"
        const combinedLocalDateTime = new Date(`${entryDate}T${currentTime}`);

        if (!isNaN(combinedLocalDateTime.getTime())) {
          (dataToSubmit as any).entryDate = combinedLocalDateTime.toISOString();
        } else {
          console.warn(
            "Fecha/hora combinada no válida:",
            entryDate,
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

  if (isLoadingSuppliers || isLoadingProducts) {
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
            Al registrar una compra, el stock de los productos se actualizará
            automáticamente.
          </p>
        </div>
      </div>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="supplierRut">
            <Form.Label>Proveedor</Form.Label>
            <Form.Control
              as="select"
              name="supplierRut"
              value={formData.supplierRut}
              onChange={handleChange}
              isInvalid={!!errors.supplierRut}
            >
              <option value="">Selecciona un proveedor</option>
              {suppliers.map((supplier: Supplier) => (
                <option key={supplier.id} value={supplier.rut}>
                  {supplier.name} ({supplier.rut})
                </option>
              ))}
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              {errors.supplierRut}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="entryDate">
            <Form.Label>Fecha de Compra</Form.Label>
            <Form.Control
              type="date"
              name="entryDate"
              value={entryDate}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>

      <h5 className="mt-4 mb-3">Detalles de Productos</h5>
      {formData.details.map((detail, index) => (
        <Card key={index} className="mb-3 p-3 inventory-detail-card">
          <Row className="align-items-end">
            <Col md={4}>
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
            </Col>
            <Col md={3}>
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
            <Col md={3}>
              <Form.Group className="mb-3" controlId={`purchasePrice-${index}`}>
                <Form.Label>Precio Compra (m³)</Form.Label>
                <InputGroup>
                  <InputGroup.Text>$</InputGroup.Text>
                  <Form.Control
                    type="number"
                    name="purchasePrice"
                    placeholder="0"
                    value={
                      detail.purchasePrice === 0 ? "" : detail.purchasePrice
                    }
                    onChange={(e) => handleDetailChange(index, e)}
                    isInvalid={
                      Array.isArray(errors.details) && !!errors.details[index]
                    }
                    min="0"
                    step="0.01"
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex justify-content-end">
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
            "Registrar Compra"
          )}
        </Button>
      </div>
    </Form>
  );
};

export default InventoryEntryForm;
