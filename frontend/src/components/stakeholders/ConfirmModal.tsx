import type React from "react"
import { Modal, Button, Spinner } from "react-bootstrap"

interface ConfirmModalProps {
  show: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  confirmText?: string
  cancelText?: string
  isConfirming?: boolean
  headerVariant?: "primary" | "danger"
  headerIcon?: string 
  warningContent?: React.ReactNode 
  children: React.ReactNode 
  confirmIcon?: string 
  cancelIcon?: string 
  disableConfirm?: boolean 
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  show,
  onClose,
  onConfirm,
  title,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isConfirming = false,
  headerVariant = "primary", 
  headerIcon,
  warningContent,
  children, 
  confirmIcon,
  cancelIcon,
  disableConfirm = false,
}) => {
  const headerBgStyle =
    headerVariant === "danger"
      ? { background: "linear-gradient(135deg, #dc3545 0%, #a71e2a 100%)", border: "none" }
      : { background: "linear-gradient(135deg, #007bff 0%, #0056b3 100%)", border: "none" }

  const defaultHeaderIcon = headerVariant === "danger" ? "bi-exclamation-triangle-fill" : "bi-info-circle-fill"

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header style={headerBgStyle} className="text-white" closeButton>
        <Modal.Title className="fw-semibold">
          <i className={`${headerIcon || defaultHeaderIcon} me-2`}></i>
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: "1.5rem" }}>
        {warningContent && (
          <div
            className="modal-warning-alert d-flex align-items-start mb-3 p-3 rounded-3"
            style={{ backgroundColor: "#fff3cd", border: "1px solid #ffeeba" }}
          >
            <i className="bi bi-exclamation-triangle me-3 mt-1 text-warning"></i>
            <div>
              <strong>Advertencia:</strong>
              {warningContent}
            </div>
          </div>
        )}
        {children}
      </Modal.Body>
      <Modal.Footer style={{ padding: "1rem 1.5rem", borderTop: "1px solid #dee2e6" }}>
        <Button
          variant="outline-secondary"
          onClick={onClose}
          disabled={isConfirming}
          style={{ borderRadius: "20px", fontWeight: "500" }}
        >
          {cancelIcon && <i className={`${cancelIcon} me-2`}></i>}
          {cancelText}
        </Button>
        <Button
          variant={headerVariant === "danger" ? "danger" : "primary"}
          onClick={onConfirm}
          disabled={isConfirming || disableConfirm} 
          style={{ borderRadius: "20px", fontWeight: "500" }}
        >
          {isConfirming ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              {confirmText}...
            </>
          ) : (
            <>
              {confirmIcon && <i className={`${confirmIcon} me-2`}></i>}
              {confirmText}
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ConfirmModal