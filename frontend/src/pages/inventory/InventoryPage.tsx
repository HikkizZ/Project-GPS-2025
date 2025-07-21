"use client"

import type React from "react"
import { Container, Row, Col, Card, Button } from "react-bootstrap"
import InventorySidebar from "@/components/inventory/layout/InventorySidebar"
import InventoryChart from "@/components/inventory/dashboard/InventoryChart"
import InventoryHistoryTable from "@/components/inventory/dashboard/InventoryHistoryTable"
import "../../styles/pages/inventory.css"

export const InventoryPage: React.FC = () => {
  return (
    <Container fluid className="inventory-page p-0">
      <div className="d-flex">
        {/* Sidebar lateral */}
        <div className="inventory-sidebar-wrapper">
          <InventorySidebar />
        </div>

        {/* Contenido principal */}
        <div className="inventory-main-content flex-grow-1">
          <Container fluid className="py-2">
            <Row>
              <Col>
                {/* Encabezado de página */}
                <Card className="shadow-sm mb-3">
                  <Card.Header className="bg-gradient-primary text-white">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-boxes fs-4 me-3"></i>
                        <div>
                          <h3 className="mb-1">Gestión de Inventario</h3>
                          <p className="mb-0 opacity-75">Control y seguimiento de stock de productos</p>
                        </div>
                      </div>
                      <div>
                        <Button variant="outline-light" className="me-2">
                          <i className="bi bi-download me-2"></i>
                          Exportar
                        </Button>
                        <Button variant="light">
                          <i className="bi bi-plus-lg me-2"></i>
                          Nuevo Movimiento
                        </Button>
                      </div>
                    </div>
                  </Card.Header>
                </Card>

                {/* Tarjetas de métricas rápidas */}
                <Row className="mb-4">
                  <Col md={3}>
                    <Card className="inventory-metric-card shadow-sm h-100">
                      <Card.Body className="text-center">
                        <div className="metric-icon bg-primary bg-opacity-10 text-primary mb-3">
                          <i className="bi bi-box-seam fs-2"></i>
                        </div>
                        <h4 className="metric-value text-primary mb-1">1,234</h4>
                        <p className="metric-label text-muted mb-0">Total Productos</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="inventory-metric-card shadow-sm h-100">
                      <Card.Body className="text-center">
                        <div className="metric-icon bg-success bg-opacity-10 text-success mb-3">
                          <i className="bi bi-check-circle fs-2"></i>
                        </div>
                        <h4 className="metric-value text-success mb-1">987</h4>
                        <p className="metric-label text-muted mb-0">En Stock</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="inventory-metric-card shadow-sm h-100">
                      <Card.Body className="text-center">
                        <div className="metric-icon bg-warning bg-opacity-10 text-warning mb-3">
                          <i className="bi bi-exclamation-triangle fs-2"></i>
                        </div>
                        <h4 className="metric-value text-warning mb-1">45</h4>
                        <p className="metric-label text-muted mb-0">Stock Bajo</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="inventory-metric-card shadow-sm h-100">
                      <Card.Body className="text-center">
                        <div className="metric-icon bg-danger bg-opacity-10 text-danger mb-3">
                          <i className="bi bi-x-circle fs-2"></i>
                        </div>
                        <h4 className="metric-value text-danger mb-1">12</h4>
                        <p className="metric-label text-muted mb-0">Sin Stock</p>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Gráfico de inventario - SIN contenedor duplicado */}
                <Row className="mb-4">
                  <Col>
                    <InventoryChart />
                  </Col>
                </Row>

                {/* Tabla de movimientos recientes */}
                <Row>
                  <Col>
                    <Card className="inventory-history-card shadow-sm">
                      <Card.Header className="bg-light border-bottom">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <i className="bi bi-clock-history fs-5 me-2 text-primary"></i>
                            <h5 className="mb-0">Movimientos Recientes</h5>
                          </div>
                          <div className="d-flex gap-2">
                            <Button variant="outline-primary" size="sm">
                              <i className="bi bi-funnel me-1"></i>
                              Filtrar
                            </Button>
                            <Button variant="outline-secondary" size="sm">
                              <i className="bi bi-eye me-1"></i>
                              Ver Todos
                            </Button>
                          </div>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        <InventoryHistoryTable />
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </Container>
  )
}
