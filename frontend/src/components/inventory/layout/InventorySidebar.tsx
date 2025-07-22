import type React from "react"
import { Nav, OverlayTrigger, Tooltip } from "react-bootstrap"
import { NavLink } from "react-router-dom"

const InventorySidebar: React.FC = () => {
  return (
    <div className="d-flex flex-column p-3 bg-light" style={{ height: "100%", width: "250px" }}>
      <h5 className="mb-4">Inventario</h5>
      <Nav className="flex-column" variant="pills">
        <Nav.Link as={NavLink} to="/inventario" end>
          <i className="bi bi-box-seam me-2" /> Inventario General
        </Nav.Link>
        <Nav.Link as={NavLink} to="/inventario/productos">
          <i className="bi bi-boxes me-2" /> Productos
        </Nav.Link>
        <Nav.Link as={NavLink} to="/inventario/proveedores">
          <i className="bi bi-truck me-2" /> Proveedores
        </Nav.Link>
        <Nav.Link as={NavLink} to="/inventario/clientes">
          <i className="bi bi-person-lines-fill me-2" /> Clientes
        </Nav.Link>

        {/* Reportes deshabilitado con tooltip */}
        <OverlayTrigger
          placement="right"
          overlay={<Tooltip id="tooltip-disabled">Módulo en mantenimiento</Tooltip>}
        >
          <span className="d-inline-block">
            <Nav.Link
              as="span"
              onClick={(e) => e.preventDefault()}
              style={{ pointerEvents: "none", opacity: 0.5 }}
            >
              <i className="bi bi-bar-chart-line me-2" /> Reportes
            </Nav.Link>
          </span>
        </OverlayTrigger>
      </Nav>
    </div>
  )
}

export default InventorySidebar
