import type React from "react"
import { Modal } from "react-bootstrap"
import InventoryExitForm from "@/components/inventory/dashboard/InventoryExitForm"
import type { CreateInventoryExitData } from "@/types/inventory/inventory.types"

interface InventoryExitModalProps {
  show: boolean
  onClose: () => void
  onSubmit: (data: CreateInventoryExitData) => void
  isSubmitting?: boolean
}

const InventoryExitModal: React.FC<InventoryExitModalProps> = ({ show, onClose, onSubmit, isSubmitting = false }) => {
  return (
    <Modal show={show} onHide={onClose} size="xl" centered>
      <Modal.Header className="bg-gradient-primary text-white" closeButton>
        <Modal.Title>
          <i className="bi bi-box-arrow-up me-2"></i>
          Registrar Venta
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <InventoryExitForm onSubmit={onSubmit} onCancel={onClose} isSubmitting={isSubmitting} />
      </Modal.Body>
    </Modal>
  )
}

export default InventoryExitModal