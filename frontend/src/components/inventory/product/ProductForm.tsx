import type React from "react"
import { useState, useEffect } from "react"
import { Button, Form, Spinner } from "react-bootstrap"
import {
  ProductType,
  type CreateProductData,
  type Product,
  type UpdateProductData,
} from "@/types/inventory/product.types"

interface ProductFormProps {
  initialData?: Product
  onSubmit: (data: CreateProductData | UpdateProductData) => void
  onCancel?: () => void
  isSubmitting?: boolean
  existingProductTypes: ProductType[] // Añade esta prop
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  existingProductTypes, // Recibe la prop
}) => {
  const [formData, setFormData] = useState<CreateProductData>({
    product: ProductType.ARENA,
    salePrice: 0,
  })
  const [displaySalePrice, setDisplaySalePrice] = useState<string>(
    initialData?.salePrice === 0 ? "" : initialData?.salePrice?.toString() || "",
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        product: initialData.product,
        salePrice: initialData.salePrice || 0,
      })
      setDisplaySalePrice(initialData.salePrice === 0 ? "" : initialData.salePrice.toString())
    } else {
      setFormData({
        product: ProductType.ARENA,
        salePrice: 0,
      })
      setDisplaySalePrice("")
    }
  }, [initialData])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.product) {
      newErrors.product = "El tipo de producto es obligatorio"
    }

    if (formData.salePrice === null || formData.salePrice === undefined || formData.salePrice <= 0) {
      newErrors.salePrice = "El precio de venta debe ser mayor a 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === "salePrice") {
      setDisplaySalePrice(value)
      const numericValue = Number.parseFloat(value)
      setFormData((prev) => ({
        ...prev,
        salePrice: isNaN(numericValue) ? 0 : numericValue,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }

    setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit(formData)
  }

  const isEditing = Boolean(initialData)

  // Lógica para filtrar los tipos de producto disponibles
  const getAvailableProductTypes = () => {
    if (isEditing) {
      // Si estamos editando, el tipo de producto actual está deshabilitado y pre-seleccionado.
      // No necesitamos filtrar las opciones, ya que el usuario no puede cambiarlo.
      return Object.values(ProductType)
    } else {
      // Si estamos creando un nuevo producto, filtramos los tipos que ya existen.
      return Object.values(ProductType).filter((type) => !existingProductTypes.includes(type))
    }
  }

  const availableProductTypes = getAvailableProductTypes()

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="productType">
        <Form.Label>Tipo de Producto</Form.Label>
        <Form.Control
          as="select"
          name="product"
          value={formData.product}
          onChange={handleChange}
          isInvalid={!!errors.product}
          disabled={isEditing} // Si estamos editando, el campo está deshabilitado
        >
          <option value="">Selecciona un tipo</option>
          {availableProductTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Form.Control>
        <Form.Control.Feedback type="invalid">{errors.product}</Form.Control.Feedback>
        {isEditing && <Form.Text className="text-muted">El tipo de producto no se puede modificar</Form.Text>}
      </Form.Group>

      <Form.Group className="mb-3" controlId="salePrice">
        <Form.Label>Precio de Venta</Form.Label>
        <div className="input-group">
          <span className="input-group-text">$</span>
          <Form.Control
            type="number"
            name="salePrice"
            placeholder="0"
            value={displaySalePrice}
            onChange={handleChange}
            isInvalid={!!errors.salePrice}
            min="0"
            step="0.01"
          />
        </div>
        <Form.Control.Feedback type="invalid">{errors.salePrice}</Form.Control.Feedback>
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
          ) : isEditing ? (
            "Actualizar Producto"
          ) : (
            "Registrar Producto"
          )}
        </Button>
      </div>
    </Form>
  )
}

export default ProductForm
