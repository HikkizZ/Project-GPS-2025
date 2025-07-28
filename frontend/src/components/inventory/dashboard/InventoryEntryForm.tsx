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
import SupplierModal from "../../stakeholders/SupplierModal";
import type {
  CreateInventoryEntryData,
  InventoryEntryDetailData,
} from "@/types/inventory/inventory.types";
import type { Product } from "@/types/inventory/product.types";
import type {
  Supplier,
  CreateSupplierData,
} from "@/types/stakeholders/supplier.types";

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
  const {
    suppliers,
    isLoading: isLoadingSuppliers,
    loadSuppliers,
    createSupplier,
    isCreating,
  } = useSuppliers();
  const { products, isLoading: isLoadingProducts } = useProducts();

  const [showSupplierModal, setShowSupplierModal] = useState(false);

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

  const [useCustomTime, setUseCustomTime] = useState(false);

  const getLocalToday = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getLocalCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};


  const minDate = useMemo(() => {
    const today = new Date();
    today.setDate(today.getDate() - 10); // retrocede 10 días
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const [entryDate, setEntryDate] = useState<string>(getLocalToday());

  const [isDateModified, setIsDateModified] = useState(false);

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
      const today = getLocalToday();
      const isDifferentFromToday = value !== today;

      setIsDateModified(isDifferentFromToday);

      if (isDifferentFromToday) {
        setUseCustomTime(true);
        setCustomTime(getLocalCurrentTime());
      }
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

  const [customTime, setCustomTime] = useState<string>("");

  const todayDate = new Date().toISOString().split("T")[0];
  const isCustomDate = entryDate !== todayDate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const dataToSubmit: CreateInventoryEntryData = {
      supplierRut: formData.supplierRut,
      details: formData.details,
    };

    try {
      let finalDateTime: string;

      if (entryDate) {
        if (useCustomTime && customTime) {
          const combinedDateTime = new Date(`${entryDate}T${customTime}`);
          if (!isNaN(combinedDateTime.getTime())) {
            finalDateTime = combinedDateTime.toISOString();
          } else {
            console.warn(
              "Fecha/hora personalizada no válida:",
              entryDate,
              customTime
            );
          }
        } else {
          const now = new Date();
          const currentTime = now.toTimeString().split(" ")[0];
          const combinedDateTime = new Date(`${entryDate}T${currentTime}`);
          if (!isNaN(combinedDateTime.getTime())) {
            finalDateTime = combinedDateTime.toISOString();
          } else {
            console.warn(
              "Fecha con hora actual no válida:",
              entryDate,
              currentTime
            );
          }
        }

        if (finalDateTime) {
          (dataToSubmit as any).entryDate = finalDateTime;
        }
      }
    } catch (error) {
      console.error("Error al construir fecha completa:", error);
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

  const handleOpenSupplierModal = () => {
    setShowSupplierModal(true);
  };

  const handleCloseSupplierModal = () => {
    setShowSupplierModal(false);
  };

  const handleCreateSupplier = async (supplierData: CreateSupplierData) => {
    try {
      const result = await createSupplier(supplierData);

      if (result.success) {
        setFormData((prev) => ({ ...prev, supplierRut: supplierData.rut }));

        setShowSupplierModal(false);

        setErrors((prev) => ({ ...prev, supplierRut: "" }));
      }
    } catch (error) {
      console.error("Error inesperado al crear proveedor:", error);
    }
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
    <>
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

              {/* Sección para crear nuevo proveedor */}
              <div className="mt-2 d-flex align-items-center justify-content-between">
                <small className="text-muted">
                  ¿No encuentras el proveedor que necesitas?
                </small>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={handleOpenSupplierModal}
                  disabled={isSubmitting}
                  className="d-flex align-items-center gap-1"
                >
                  <i className="bi bi-plus-circle"></i>
                  Crear nuevo proveedor
                </Button>
              </div>
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
                min={minDate}
              />
              <Form.Check
                type="switch"
                id="toggleCustomTime"
                label="Ingrese hora de la compra"
                checked={useCustomTime}
                onChange={(e) => {
                  setUseCustomTime(e.target.checked);
                  if (e.target.checked && !customTime) {
                    setCustomTime(getLocalCurrentTime());
                  }
                }}
                disabled={entryDate !== getLocalToday()}
                className="mb-2"
              />
              {useCustomTime && (
                <Form.Group className="mb-3" controlId="customTime">
                  <Form.Label>Hora de la compra</Form.Label>
                  <Form.Control
                    type="time"
                    name="customTime"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                  />
                  <Form.Text className="text-muted">
                    Se usará esta hora para la fecha seleccionada.
                  </Form.Text>
                </Form.Group>
              )}
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
                <Form.Group
                  className="mb-3"
                  controlId={`purchasePrice-${index}`}
                >
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

      {/* Modal para crear nuevo proveedor */}
      <SupplierModal
        show={showSupplierModal}
        onClose={handleCloseSupplierModal}
        onSubmit={handleCreateSupplier}
        isSubmitting={isCreating}
      />
    </>
  );
};

export default InventoryEntryForm;