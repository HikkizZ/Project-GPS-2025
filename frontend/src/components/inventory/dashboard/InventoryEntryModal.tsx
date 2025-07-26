import type React from "react"
import { Modal } from "react-bootstrap"
import InventoryEntryForm from "@/components/inventory/dashboard/InventoryEntryForm"
import type { CreateInventoryEntryData } from "@/types/inventory/inventory.types"

interface InventoryEntryModalProps {
  show: boolean
  onClose: () => void
  onSubmit: (data: CreateInventoryEntryData) => void
  isSubmitting?: boolean
}

const InventoryEntryModal: React.FC<InventoryEntryModalProps> = ({ show, onClose, onSubmit, isSubmitting = false }) => {
  return (
    <Modal show={show} onHide={onClose} size="xl" centered>
      <Modal.Header className="bg-gradient-primary text-white" closeButton>
        <Modal.Title>
          <i className="bi bi-box-arrow-in-down me-2"></i>
          Registrar Ingreso de Material
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <InventoryEntryForm onSubmit={onSubmit} onCancel={onClose} isSubmitting={isSubmitting} />
      </Modal.Body>
    </Modal>
  )
}

export default InventoryEntryModal
