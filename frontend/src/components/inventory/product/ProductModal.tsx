import type React from "react"
import { Modal } from "react-bootstrap"
import ProductForm from "./ProductForm"
import type { CreateProductData, Product, UpdateProductData, ProductType } from "@/types/inventory/product.types"

interface ProductModalProps {
  show: boolean
  onClose: () => void
  onSubmit: (data: CreateProductData | UpdateProductData) => void
  isSubmitting?: boolean
  initialData?: Product
  existingProductTypes: ProductType[] // Añade esta prop
}

const ProductModal: React.FC<ProductModalProps> = ({
  show,
  onClose,
  onSubmit,
  isSubmitting = false,
  initialData,
  existingProductTypes, // Recibe la prop
}) => {
  const isEditing = Boolean(initialData)

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className={`bi ${isEditing ? "bi-pencil" : "bi-plus-circle"} me-2`}></i>
          {isEditing ? "Editar Producto" : "Nuevo Producto"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ProductForm
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
          existingProductTypes={existingProductTypes} // Pasa la prop al ProductForm
        />
      </Modal.Body>
    </Modal>
  )
}

export default ProductModal