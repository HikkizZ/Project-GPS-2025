import type React from "react"
import { useState, useEffect } from "react"
import { Button, Form, Spinner, Row, Col } from "react-bootstrap"
import type { CreateSupplierData, Supplier, UpdateSupplierData } from "@/types/stakeholders/supplier.types"
import { SupplierService } from "@/services/stakeholders/supplier.service"

interface SupplierFormProps {
  initialData?: Supplier
  onSubmit: (data: CreateSupplierData | UpdateSupplierData) => void
  onCancel?: () => void
  isSubmitting?: boolean
}

const SupplierForm: React.FC<SupplierFormProps> = ({ initialData, onSubmit, onCancel, isSubmitting = false }) => {
  const [formData, setFormData] = useState<CreateSupplierData>({
    name: "",
    rut: "",
    address: "",
    phone: "",
    email: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        rut: initialData.rut || "",
        address: initialData.address || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
      })
    }
  }, [initialData])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.name) newErrors.name = "El nombre es obligatorio"
    if (!formData.rut || !SupplierService.validateRUT(formData.rut)) {
      newErrors.rut = "RUT inválido"
    }
    if (!formData.phone) newErrors.phone = "El teléfono es obligatorio"
    if (!formData.address) newErrors.address = "La dirección es obligatoria"
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Correo inválido"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit(formData)
  }

  return (
    <Form onSubmit={handleSubmit}>
      <div className="modal-info-alert">
        <i className="bi bi-info-circle-fill"></i>
        <div>
          <strong>Nota Importante:</strong>
          <p className="mb-0">Asegúrate de ingresar datos reales y válidos del proveedor. La información ingresada será utilizada en informes y procesos contables, por lo que debe ser precisa.</p>
        </div>
      </div>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="name"
              placeholder='"Juan Pérez" o "Construcciones S.A."'
              value={formData.name}
              onChange={handleChange}
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="rut">
            <Form.Label>RUT</Form.Label>
            <Form.Control
              type="text"
              name="rut"
              placeholder="12.345.678-9 o 12345678-9"
              value={formData.rut}
              onChange={handleChange}
              isInvalid={!!errors.rut}
            />
            <Form.Control.Feedback type="invalid">{errors.rut}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Correo (opcional)</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChange={handleChange}
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="phone">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="text"
              name="phone"
              placeholder="+56912345678"
              value={formData.phone}
              onChange={handleChange}
              isInvalid={!!errors.phone}
            />
            <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3" controlId="address">
        <Form.Label>Dirección</Form.Label>
        <Form.Control
          type="text"
          name="address"
          placeholder="Ej: Av. Libertador 1234, Santiago"
          value={formData.address}
          onChange={handleChange}
          isInvalid={!!errors.address}
        />
        <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
      </Form.Group>

      <div className="d-flex justify-content-end">
        {onCancel && (
          <Button variant="secondary" className="me-2" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Guardando...
            </>
          ) : initialData ? (
            "Actualizar proveedor"
          ) : (
            "Registrar proveedor"
          )}
        </Button>
      </div>
    </Form>
  )
}

export default SupplierForm