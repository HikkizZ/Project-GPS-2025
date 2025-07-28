import type React from "react"
import { useEffect } from "react"
import { Card, Row, Col, Container } from "react-bootstrap"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/useAuth"
import type { UserRole } from "../../types/auth.types"
import { useState } from "react"
import { Modal, Button, Form, Spinner } from "react-bootstrap"
import { userService } from "../../services/user.service"
import { useToast } from "@/components/common/Toast"
import { PasswordInput } from "@/components/common/LoginForm"

const DashboardMaquinaria: React.FC = () => {
  const { user } = useAuth()
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const { showSuccess } = useToast()

  // Roles que tienen acceso completo a todas las funcionalidades
  const rolesPrivilegiados: UserRole[] = ["SuperAdministrador", "Arriendo", "Mecánico", "Mantenciones de Maquinaria"]

  // Verificar si el usuario tiene permisos completos
  const tienePermisosCompletos = user && rolesPrivilegiados.includes(user.role as UserRole)

  // Super Administrador no debe poder acceder a módulos personales (es un usuario ficticio)
  const puedeAccederModulosPersonales = user && user.role !== "SuperAdministrador"

  // Validación de contraseña
  const validatePassword = (password: string): string | null => {
    if (password.length === 0) return null
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres"
    if (password.length > 16) return "La contraseña debe tener máximo 16 caracteres"
    if (!/(?=.*[a-z])/.test(password)) return "Debe tener al menos una letra minúscula"
    if (!/(?=.*[A-Z])/.test(password)) return "Debe tener al menos una letra mayúscula"
    if (!/(?=.*\d)/.test(password)) return "Debe tener al menos un número"
    if (!/(?=.*[!@#$%^&*()_\-=[\]{};':"\\|,.<>/?]).*/.test(password)) return "Debe tener al menos un carácter especial"
    return null
  }

  // Validar contraseña en tiempo real
  useEffect(() => {
    if (newPassword) {
      const validation = validatePassword(newPassword)
      setPasswordError(validation)
    } else {
      setPasswordError(null)
    }
  }, [newPassword])

  const handleChangePassword = async () => {
    setErrorMsg("")
    setSuccessMsg("")
    setPasswordError(null)
    if (!user) return
    if (!newPassword) {
      setPasswordError("Debes ingresar una nueva contraseña")
      return
    }
    const validation = validatePassword(newPassword)
    if (validation) {
      setPasswordError(validation)
      return
    }
    setIsUpdating(true)
    try {
      // Asegurar que siempre se envía id, rut o corporateEmail
      const query: any = {}
      if (user.id) query.id = String(user.id)
      else if (user.rut) query.rut = user.rut
      else if (user.corporateEmail) query.corporateEmail = user.corporateEmail
      else throw new Error("No se puede identificar al usuario (falta id, rut o corporateEmail)")
      await userService.updateUser(query, { password: newPassword })
      setSuccessMsg("")
      setShowAccountModal(false)
      showSuccess("¡Contraseña actualizada!", "Tu contraseña se ha actualizado exitosamente", 3000) // Toast global
      setNewPassword("")
    } catch (err: any) {
      setErrorMsg(err.message || "Error al cambiar la contraseña")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Container fluid className="py-2" style={{ paddingBottom: "2.3rem" }}>
      <Row>
        <Col>
          {/* Header */}
          <div
            className="card shadow-lg border-0 mb-4 main-card-spacing"
            style={{ borderRadius: "12px", overflow: "hidden" }}
          >
            <div
              className="card-header bg-gradient-primary text-white border-0 header-text-white"
              style={{ padding: "0.75rem 1.25rem" }}
            >
              <div className="d-flex align-items-center">
                <i className="bi bi-truck fs-5 me-2"></i>
                <div>
                  <h5 className="mb-0 fw-bold">Gestión de Maquinaria</h5>
                  <small className="opacity-75" style={{ fontSize: "0.75rem" }}>
                    Control integral de equipos y mantenimientos
                  </small>
                </div>
              </div>
            </div>

            {/* Sección de módulos */}
            <div className="card-body" style={{ padding: "1.5rem" }}>
              <div className="mb-3">
                <div className="d-flex align-items-center mb-3">
                  <div className="p-2 rounded-circle bg-primary bg-opacity-10 me-2">
                    <i className="bi bi-grid fs-5 text-primary"></i>
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold text-dark">Módulos Disponibles</h6>
                    <small className="text-muted">Accede a las funcionalidades de gestión de maquinaria</small>
                  </div>
                </div>
              </div>

              <Row className="g-4">
                {/* TARJETAS PARA ROLES PRIVILEGIADOS */}
                {tienePermisosCompletos && (
                  <>
                    {/* Tarjeta de Gestión Trabajo Maquinaria */}
                    <Col md={3}>
                      <Link to="/maquinaria/trabajo" style={{ textDecoration: "none" }}>
                        <Card
                          className="h-100 border-0 shadow-lg"
                          style={{
                            cursor: "pointer",
                            borderRadius: "20px",
                            transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                            background: "white",
                            border: "1px solid #e3f2fd",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-12px) scale(1.02)"
                            e.currentTarget.style.boxShadow = "0 25px 50px rgba(13, 110, 253, 0.25)"
                            e.currentTarget.style.borderColor = "#0d6efd"
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0) scale(1)"
                            e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.1)"
                            e.currentTarget.style.borderColor = "#e3f2fd"
                          }}
                        >
                          <Card.Body className="p-4 text-center">
                            <div
                              className="d-inline-flex align-items-center justify-content-center mb-4"
                              style={{
                                width: "80px",
                                height: "80px",
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                borderRadius: "24px",
                                position: "relative",
                                boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
                              }}
                            >
                              <i className="bi bi-tools text-white" style={{ fontSize: "2.5rem" }}></i>
                            </div>
                            <Card.Title className="fw-bold text-dark mb-2 fs-5">Gestión Trabajo Maquinaria</Card.Title>
                            <Card.Text className="text-muted small mb-3">
                              Administra equipos, especificaciones y operaciones
                            </Card.Text>
                            <div className="d-flex align-items-center justify-content-center">
                              <small className="text-primary fw-semibold">
                                <i className="bi bi-arrow-right me-1"></i>
                                Acceder
                              </small>
                            </div>
                          </Card.Body>
                        </Card>
                      </Link>
                    </Col>

                    {/* Tarjeta de Gestión Mantenciones Maquinaria */}
                    <Col md={3}>
                      <Link to="/maintenance-records" style={{ textDecoration: "none" }}>
                        <Card
                          className="h-100 border-0 shadow-lg"
                          style={{
                            cursor: "pointer",
                            borderRadius: "20px",
                            transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                            background: "white",
                            border: "1px solid #fef3c7",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-12px) scale(1.02)"
                            e.currentTarget.style.boxShadow = "0 25px 50px rgba(245, 158, 11, 0.25)"
                            e.currentTarget.style.borderColor = "#f59e0b"
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0) scale(1)"
                            e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.1)"
                            e.currentTarget.style.borderColor = "#fef3c7"
                          }}
                        >
                          <Card.Body className="p-4 text-center">
                            <div
                              className="d-inline-flex align-items-center justify-content-center mb-4"
                              style={{
                                width: "80px",
                                height: "80px",
                                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                                borderRadius: "24px",
                                boxShadow: "0 8px 32px rgba(245, 158, 11, 0.3)",
                              }}
                            >
                              <i className="bi bi-clipboard-data text-white" style={{ fontSize: "2.5rem" }}></i>
                            </div>
                            <Card.Title className="fw-bold text-dark mb-2 fs-5">
                              Gestión Mantenciones Maquinaria
                            </Card.Title>
                            <Card.Text className="text-muted small mb-3">
                              Historial completo de mantenciones y reparaciones
                            </Card.Text>
                            <div className="d-flex align-items-center justify-content-center">
                              <small className="text-primary fw-semibold">
                                <i className="bi bi-arrow-right me-1"></i>
                                Acceder
                              </small>
                            </div>
                          </Card.Body>
                        </Card>
                      </Link>
                    </Col>

                    {/* Tarjeta de Inventario de Repuestos */}
                    <Col md={3}>
                      <Link to="/spare-parts" style={{ textDecoration: "none" }}>
                        <Card
                          className="h-100 border-0 shadow-lg"
                          style={{
                            cursor: "pointer",
                            borderRadius: "20px",
                            transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                            background: "white",
                            border: "1px solid #f3e8ff",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-12px) scale(1.02)"
                            e.currentTarget.style.boxShadow = "0 25px 50px rgba(139, 92, 246, 0.25)"
                            e.currentTarget.style.borderColor = "#8b5cf6"
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0) scale(1)"
                            e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.1)"
                            e.currentTarget.style.borderColor = "#f3e8ff"
                          }}
                        >
                          <Card.Body className="p-4 text-center">
                            <div
                              className="d-inline-flex align-items-center justify-content-center mb-4"
                              style={{
                                width: "80px",
                                height: "80px",
                                background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                                borderRadius: "24px",
                                boxShadow: "0 8px 32px rgba(139, 92, 246, 0.3)",
                              }}
                            >
                              <i className="bi bi-box-seam text-white" style={{ fontSize: "2.5rem" }}></i>
                            </div>
                            <Card.Title className="fw-bold text-dark mb-2 fs-5">Inventario de Repuestos</Card.Title>
                            <Card.Text className="text-muted small mb-3">
                              Control de stock y gestión de repuestos
                            </Card.Text>
                            <div className="d-flex align-items-center justify-content-center">
                              <small className="text-primary fw-semibold">
                                <i className="bi bi-arrow-right me-1"></i>
                                Acceder
                              </small>
                            </div>
                          </Card.Body>
                        </Card>
                      </Link>
                    </Col>
                  </>
                )}
              

                {/* Tarjeta de Reportes de Eficiencia - Visible para SuperAdministrador */}
                
                {/* Tarjeta de Mis Asignaciones - Visible para todos excepto SuperAdministrador */}
                

                {/* Tarjeta de Mi Cuenta - Visible para todos excepto SuperAdministrador que no tienen permisos completos */}
                
              </Row>
            </div>
          </div>
        </Col>
      </Row>

      {/* Modal de Mi Cuenta */}
      <Modal
        show={showAccountModal}
        onHide={() => {
          setShowAccountModal(false)
          setNewPassword("")
          setPasswordError(null)
          setSuccessMsg("")
          setErrorMsg("")
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-person-circle me-2"></i>
            Mi Cuenta
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {user && (
            <>
              <div className="mb-3">
                <strong>Nombre:</strong> {user.name}
              </div>
              <div className="mb-3">
                <strong>Correo Corporativo:</strong> {user.corporateEmail}
              </div>
              <div className="mb-3">
                <strong>RUT:</strong> {user.rut}
              </div>
              <div className="mb-3">
                <strong>Rol:</strong> {user.role}
              </div>
              <hr />
              <h6 className="mb-3 text-primary">
                <i className="bi bi-key me-2"></i>Cambiar Contraseña
              </h6>
              <Form.Group className="mb-3">
                <Form.Label>Nueva Contraseña</Form.Label>
                <PasswordInput
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ingrese la nueva contraseña"
                  maxLength={16}
                  isInvalid={!!passwordError}
                  feedback={passwordError || ""}
                  disabled={isUpdating}
                  name="newPassword"
                  autoComplete="new-password"
                />
                <Form.Text className="text-muted">
                  La contraseña debe tener entre 8 y 16 caracteres, al menos una mayúscula, una minúscula, un número y
                  un carácter especial.
                </Form.Text>
              </Form.Group>
              {errorMsg && <div className="alert alert-danger py-2">{errorMsg}</div>}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowAccountModal(false)
              setNewPassword("")
              setPasswordError(null)
              setSuccessMsg("")
              setErrorMsg("")
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleChangePassword}
            disabled={isUpdating || !newPassword || !!passwordError}
          >
            {isUpdating ? (
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
            ) : (
              <i className="bi bi-check-circle me-2"></i>
            )}
            Cambiar Contraseña
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default DashboardMaquinaria
