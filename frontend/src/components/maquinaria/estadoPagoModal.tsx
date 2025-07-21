"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Modal, Button, Row, Col, Card, Form } from "react-bootstrap"
import { useArriendoMaquinaria } from "../../hooks/maquinaria/useArriendoMaquinaria"
import { useClienteMaquinaria } from "../../hooks/maquinaria/useClienteMaquinaria"
import { usePdfExport } from "../../hooks/usePdfExport"
import type { ArriendoMaquinaria, ClienteMaquinaria } from "../../types/arriendoMaquinaria.types"

interface EstadoPagoModalProps {
  show: boolean
  onHide: () => void
}

export const EstadoPagoModal: React.FC<EstadoPagoModalProps> = ({ show, onHide }) => {
  const { reportes } = useArriendoMaquinaria()
  const { clientes } = useClienteMaquinaria()
  const { exportToPdf, isExporting } = usePdfExport()

  const [selectedClienteRut, setSelectedClienteRut] = useState("")
  const [selectedMes, setSelectedMes] = useState("")
  const [selectedAno, setSelectedAno] = useState(new Date().getFullYear().toString())
  const [filteredReportes, setFilteredReportes] = useState<ArriendoMaquinaria[]>([])
  const [selectedCliente, setSelectedCliente] = useState<ClienteMaquinaria | null>(null)

  // Generar opciones de meses
  const meses = [
    { value: "01", label: "Enero" },
    { value: "02", label: "Febrero" },
    { value: "03", label: "Marzo" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Mayo" },
    { value: "06", label: "Junio" },
    { value: "07", label: "Julio" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ]

  // Generar opciones de años (últimos 3 años)
  const currentYear = new Date().getFullYear()
  const anos = Array.from({ length: 3 }, (_, i) => currentYear - i)

  // Filtrar reportes cuando cambian los filtros
  useEffect(() => {
    if (!selectedClienteRut || !selectedMes) {
      setFilteredReportes([])
      return
    }

    const reportesFiltrados = reportes.filter((reporte) => {
      const fechaReporte = new Date(reporte.fechaTrabajo)
      const mesReporte = (fechaReporte.getMonth() + 1).toString().padStart(2, "0")
      const anoReporte = fechaReporte.getFullYear().toString()

      return reporte.rutCliente === selectedClienteRut && mesReporte === selectedMes && anoReporte === selectedAno
    })

    setFilteredReportes(reportesFiltrados)
  }, [reportes, selectedClienteRut, selectedMes, selectedAno])

  // Actualizar cliente seleccionado
  useEffect(() => {
    if (selectedClienteRut) {
      const cliente = clientes.find((c) => c.rut === selectedClienteRut)
      setSelectedCliente(cliente || null)
    } else {
      setSelectedCliente(null)
    }
  }, [selectedClienteRut, clientes])

  // Inicializar mes actual
  useEffect(() => {
    if (!selectedMes) {
      const mesActual = (new Date().getMonth() + 1).toString().padStart(2, "0")
      setSelectedMes(mesActual)
    }
  }, [selectedMes])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CL")
  }

  const calcularTotal = () => {
    return filteredReportes.reduce((total, reporte) => total + (reporte.valorServicio || 0), 0)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPdf = async () => {
    if (!selectedCliente || filteredReportes.length === 0) {
      alert("Debe seleccionar un cliente y período con datos para generar el PDF")
      return
    }

    try {
      const mesNombre = meses.find((m) => m.value === selectedMes)?.label || selectedMes
      const filename = `estado_pago_${selectedCliente.nombre.replace(/\s+/g, "_")}_${mesNombre}_${selectedAno}`

      await exportToPdf("estado-pago-content", filename)
    } catch (error) {
      console.error("Error al generar PDF:", error)
      alert("Error al generar el PDF. Por favor, inténtelo nuevamente.")
    }
  }

  const mesSeleccionadoNombre = meses.find((m) => m.value === selectedMes)?.label || ""

  return (
    <>
      <Modal show={show} onHide={onHide} size="xl" centered className="estado-pago-modal">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="bi bi-file-earmark-text me-2"></i>
            Estado de Pago - Servicios de Maquinaria
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {/* Filtros */}
          <Card className="mb-4">
            <Card.Header className="bg-light">
              <h6 className="mb-0">
                <i className="bi bi-funnel me-2"></i>
                Filtros de Búsqueda
              </h6>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Label>Cliente</Form.Label>
                  <Form.Select value={selectedClienteRut} onChange={(e) => setSelectedClienteRut(e.target.value)}>
                    <option value="">Seleccione un cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.rut}>
                        {cliente.nombre} - {cliente.rut}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Label>Mes</Form.Label>
                  <Form.Select value={selectedMes} onChange={(e) => setSelectedMes(e.target.value)}>
                    <option value="">Seleccione un mes</option>
                    {meses.map((mes) => (
                      <option key={mes.value} value={mes.value}>
                        {mes.label}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Label>Año</Form.Label>
                  <Form.Select value={selectedAno} onChange={(e) => setSelectedAno(e.target.value)}>
                    {anos.map((ano) => (
                      <option key={ano} value={ano.toString()}>
                        {ano}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Estado de Pago */}
          {selectedCliente && selectedMes && (
            <div
              id="estado-pago-content"
              className="estado-pago-content"
              style={{
                backgroundColor: "white",
                padding: "30px",
                fontFamily: "Arial, sans-serif",
                lineHeight: "1.4",
              }}
            >
              {/* Header del Estado de Pago */}
              <div className="text-center mb-4" style={{ borderBottom: "3px solid #007bff", paddingBottom: "15px" }}>
                <h2 className="fw-bold text-primary mb-0" style={{ fontSize: "28px", color: "#007bff !important" }}>
                  ESTADO DE PAGO
                </h2>
                <p className="text-muted mb-0" style={{ fontSize: "14px", marginTop: "5px" }}>
                  Servicios de Maquinaria - Constructora Lamas
                </p>
              </div>

              {/* Información del período y empresa */}
              <Row className="mb-4">
                <Col md={6}>
                  {/* Información del cliente */}
                  <div style={{ border: "1px solid #dee2e6", borderRadius: "8px", padding: "20px" }}>
                    <h5
                      className="fw-bold mb-3"
                      style={{ color: "#495057", borderBottom: "2px solid #e9ecef", paddingBottom: "8px" }}
                    >
                      INFORMACIÓN DEL CLIENTE
                    </h5>
                    <table style={{ width: "100%", fontSize: "14px" }}>
                      <tbody>
                        <tr>
                          <td style={{ fontWeight: "bold", padding: "4px 0", width: "30%" }}>PERÍODO:</td>
                          <td style={{ padding: "4px 0" }}>
                            {mesSeleccionadoNombre} {selectedAno}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: "bold", padding: "4px 0" }}>CLIENTE:</td>
                          <td style={{ padding: "4px 0" }}>{selectedCliente.nombre}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: "bold", padding: "4px 0" }}>RUT:</td>
                          <td style={{ padding: "4px 0", fontFamily: "monospace" }}>{selectedCliente.rut}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: "bold", padding: "4px 0" }}>TELÉFONO:</td>
                          <td style={{ padding: "4px 0" }}>{selectedCliente.telefono || "No registrado"}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: "bold", padding: "4px 0" }}>CORREO:</td>
                          <td style={{ padding: "4px 0" }}>{selectedCliente.email || "No registrado"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Col>

                <Col md={6}>
                  {/* Información de la empresa */}
                  <div style={{ border: "1px solid #dee2e6", borderRadius: "8px", padding: "20px", height: "100%" }}>
                    <div className="text-center">
                      <h4
                        className="fw-bold text-primary mb-3"
                        style={{ color: "#007bff !important", fontSize: "20px" }}
                      >
                        CONSTRUCTORA LAMAS
                      </h4>
                      <div className="text-start" style={{ fontSize: "13px", lineHeight: "1.6" }}>
                        <p className="mb-2">
                          <strong>RUT:</strong> 76.123.456-7
                        </p>
                        <p className="mb-2">
                          <strong>DIRECCIÓN:</strong> Samuel Bambach  #254
                        </p>
                        <p className="mb-2">
                          <strong>GIRO:</strong> Alquiler de Vehículos y Maquinarias
                        </p>
                        <p className="mb-2">
                          <strong>TELÉFONO:</strong> +569-50567985
                        </p>
                        <p className="mb-0">
                          <strong>EMAIL:</strong> contacto@constructoralamas.cl
                        </p>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Fecha de emisión */}
              <div className="text-end mb-3">
                <small style={{ fontSize: "12px", color: "#6c757d" }}>
                  <strong>Fecha de emisión:</strong> {new Date().toLocaleDateString("es-CL")}
                </small>
              </div>

              {/* Tabla de servicios */}
              <div style={{ marginBottom: "20px" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "12px",
                    border: "1px solid #dee2e6",
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#007bff", color: "white" }}>
                      <th style={{ padding: "12px 8px", textAlign: "center", border: "1px solid #dee2e6" }}>
                        N° Reporte
                      </th>
                      <th style={{ padding: "12px 8px", textAlign: "center", border: "1px solid #dee2e6" }}>Fecha</th>
                      <th style={{ padding: "12px 8px", textAlign: "center", border: "1px solid #dee2e6" }}>Patente</th>
                      <th style={{ padding: "12px 8px", textAlign: "center", border: "1px solid #dee2e6" }}>Cliente</th>
                      <th style={{ padding: "12px 8px", textAlign: "center", border: "1px solid #dee2e6" }}>Obra</th>
                      <th style={{ padding: "12px 8px", textAlign: "center", border: "1px solid #dee2e6" }}>
                        Detalle/Servicio
                      </th>
                      <th style={{ padding: "12px 8px", textAlign: "center", border: "1px solid #dee2e6" }}>
                        Valor Servicio
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReportes.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          style={{
                            padding: "30px",
                            textAlign: "center",
                            color: "#6c757d",
                            border: "1px solid #dee2e6",
                          }}
                        >
                          No hay servicios registrados para el período seleccionado
                        </td>
                      </tr>
                    ) : (
                      filteredReportes.map((reporte, index) => (
                        <tr key={reporte.id} style={{ backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white" }}>
                          <td
                            style={{
                              padding: "10px 8px",
                              textAlign: "center",
                              fontFamily: "monospace",
                              border: "1px solid #dee2e6",
                            }}
                          >
                            {reporte.numeroReporte}
                          </td>
                          <td style={{ padding: "10px 8px", textAlign: "center", border: "1px solid #dee2e6" }}>
                            {formatDate(reporte.fechaTrabajo)}
                          </td>
                          <td
                            style={{
                              padding: "10px 8px",
                              textAlign: "center",
                              fontFamily: "monospace",
                              fontWeight: "bold",
                              border: "1px solid #dee2e6",
                            }}
                          >
                            {reporte.patente}
                          </td>
                          <td style={{ padding: "10px 8px", border: "1px solid #dee2e6" }}>{reporte.nombreCliente}</td>
                          <td style={{ padding: "10px 8px", border: "1px solid #dee2e6" }}>{reporte.obra}</td>
                          <td style={{ padding: "10px 8px", border: "1px solid #dee2e6" }}>
                            {reporte.detalle || "Servicio de maquinaria"}
                          </td>
                          <td
                            style={{
                              padding: "10px 8px",
                              textAlign: "right",
                              fontFamily: "monospace",
                              border: "1px solid #dee2e6",
                            }}
                          >
                            {formatCurrency(reporte.valorServicio)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {filteredReportes.length > 0 && (
                    <tfoot>
                      <tr style={{ backgroundColor: "#fff3cd", fontWeight: "bold" }}>
                        <td
                          colSpan={6}
                          style={{
                            padding: "15px 8px",
                            textAlign: "right",
                            fontSize: "14px",
                            border: "1px solid #dee2e6",
                          }}
                        >
                          TOTAL GENERAL:
                        </td>
                        <td
                          style={{
                            padding: "15px 8px",
                            textAlign: "right",
                            fontFamily: "monospace",
                            fontSize: "16px",
                            fontWeight: "bold",
                            border: "1px solid #dee2e6",
                          }}
                        >
                          {formatCurrency(calcularTotal())}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
              {/* Footer */}
              <div
                style={{
                  marginTop: "40px",
                  paddingTop: "20px",
                  borderTop: "2px solid #e9ecef",
                  textAlign: "center",
                  fontSize: "11px",
                  color: "#6c757d",
                }}
              >
                <p className="mb-0">
                  Este documento fue generado automáticamente el {new Date().toLocaleDateString("es-CL")} a las{" "}
                  {new Date().toLocaleTimeString("es-CL")}
                </p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-between w-100">
            <div>
              {filteredReportes.length > 0 && (
                <span className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  {filteredReportes.length} servicios encontrados
                </span>
              )}
            </div>
            <div>
              {filteredReportes.length > 0 && (
                <>
                  <Button variant="danger" onClick={handleDownloadPdf} className="me-2" disabled={isExporting}>
                    {isExporting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Generando PDF...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-file-earmark-pdf me-2"></i>
                        Descargar PDF
                      </>
                    )}
                  </Button>
                  <Button variant="success" onClick={handlePrint} className="me-2">
                    <i className="bi bi-printer me-2"></i>
                    Imprimir
                  </Button>
                </>
              )}
              <Button variant="secondary" onClick={onHide}>
                <i className="bi bi-x-circle me-2"></i>
                Cerrar
              </Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  )
}
