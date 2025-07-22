"use client"

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
  existingProductTypes: ProductType[]
}

const ProductModal: React.FC<ProductModalProps> = ({
  show,
  onClose,
  onSubmit,
  isSubmitting = false,
  initialData,
  existingProductTypes,
}) => {
  const isEditing = Boolean(initialData)

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header className="bg-gradient-primary text-white" closeButton>
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
          existingProductTypes={existingProductTypes}
        />
      </Modal.Body>
    </Modal>
  )
}

export default ProductModal
