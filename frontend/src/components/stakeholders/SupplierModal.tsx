import type React from "react"
import { Modal } from "react-bootstrap"
import SupplierForm from "./SupplierForm"
import type { Supplier, CreateSupplierData, UpdateSupplierData } from "@/types/stakeholders/supplier.types"

interface SupplierModalProps {
  show: boolean
  onClose: () => void
  onSubmit: (data: CreateSupplierData | UpdateSupplierData) => void
  isSubmitting?: boolean
  initialData?: Supplier
}

const SupplierModal: React.FC<SupplierModalProps> = ({
  show,
  onClose,
  onSubmit,
  isSubmitting = false,
  initialData,
}) => {
  const isEditMode = Boolean(initialData)
  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header className="bg-gradient-primary text-white" closeButton>
        <Modal.Title>
          <i className={`bi ${isEditMode ? "bi-pencil" : "bi-plus-circle"} me-2`}></i>
          {isEditMode ? "Editar Proveedor" : "Nuevo Proveedor"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <SupplierForm initialData={initialData} onSubmit={onSubmit} onCancel={onClose} isSubmitting={isSubmitting} />
      </Modal.Body>
    </Modal>
  )
}

export default SupplierModal
