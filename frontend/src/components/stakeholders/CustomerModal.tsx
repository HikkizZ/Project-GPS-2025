import type React from "react"
import { Modal } from "react-bootstrap"
import CustomerForm from "./CustomerForm"
import type { Customer, CreateCustomerData, UpdateCustomerData } from "@/types/stakeholders/customer.types"

interface CustomerModalProps {
  show: boolean
  onClose: () => void
  onSubmit: (data: CreateCustomerData | UpdateCustomerData) => void
  isSubmitting?: boolean
  initialData?: Customer
}

const CustomerModal: React.FC<CustomerModalProps> = ({
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
          {isEditMode ? "Editar Cliente" : "Nuevo Cliente"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <CustomerForm initialData={initialData} onSubmit={onSubmit} onCancel={onClose} isSubmitting={isSubmitting} />
      </Modal.Body>
    </Modal>
  )
}

export default CustomerModal
