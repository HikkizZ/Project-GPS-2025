import type React from "react"
import { Modal, Button } from "react-bootstrap"

interface ConfirmModalProps {
  show: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isConfirming?: boolean
  headerVariant?: "primary" | "danger" // 'primary' para azul, 'danger' para rojo
  headerIcon?: string // Icono personalizado para el encabezado
  warningContent?: React.ReactNode // Contenido para el mensaje de advertencia
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  show,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isConfirming = false,
  headerVariant = "primary", // Por defecto azul
  headerIcon,
  warningContent,
}) => {
  const headerBgClass = headerVariant === "danger" ? "bg-gradient-danger" : "bg-gradient-primary"
  const defaultHeaderIcon = headerVariant === "danger" ? "bi-exclamation-triangle-fill" : "bi-info-circle-fill" // Icono por defecto según la variante

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header className={`${headerBgClass} text-white`} closeButton>
        <Modal.Title>
          <i className={`${headerIcon || defaultHeaderIcon} me-2`}></i>
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {warningContent && (
          <div className="modal-warning-alert d-flex align-items-start mb-3">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <div>
              <strong>Advertencia:</strong>
              {warningContent}
            </div>
          </div>
        )}
        <p>{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={isConfirming}>
          {cancelText}
        </Button>
        <Button variant={headerVariant === "danger" ? "danger" : "primary"} onClick={onConfirm} disabled={isConfirming}>
          {isConfirming ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {confirmText}...
            </>
          ) : (
            confirmText
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ConfirmModal