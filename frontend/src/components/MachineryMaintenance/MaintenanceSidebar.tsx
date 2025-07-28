import type React from "react";
import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";

const MaintenanceSidebar: React.FC = () => {
  return (
    <div className="d-flex flex-column p-3 bg-light" style={{ minHeight: "100vh", width: "255px" }}>
      <h5 className="mb-4">
        <i className="bi bi-gear-wide-connected me-2"></i>
        Mantención de Maquinaria
      </h5>

      {/* Agrupar dentro de Nav con variant="pills" para que funcione el estilo activo */}
      <Nav className="flex-column" variant="pills"style={{ minHeight: "100vh", width: "230px" }}>
        <Nav.Link as={NavLink} to="/maintenance-records" end>
          <i className="bi bi-list-ul me-2" />
          Registro de Mantención
        </Nav.Link>
        <Nav.Link as={NavLink} to="/spare-parts" end>
          <i className="bi bi-wrench-adjustable me-2" />
          Repuestos
        </Nav.Link>
        <Nav.Link as={NavLink} to="/maintenance-completed" end>
          <i className="bi bi-truck me-2" />
          Mantenciones Finales
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default MaintenanceSidebar;
