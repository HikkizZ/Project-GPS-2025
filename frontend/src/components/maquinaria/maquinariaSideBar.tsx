"use client"

import type React from "react"
import { Nav } from "react-bootstrap"
import { NavLink } from "react-router-dom"

const MaquinariaSidebar: React.FC = () => {
  return (
    <div className="d-flex flex-column p-3 bg-light" style={{ minHeight: "100vh", width: "250px" }}>
      <h5 className="mb-4">
        <i className="bi bi-gear-wide-connected me-2"></i>
        Maquinaria
      </h5>
      <Nav className="flex-column" variant="pills">
        <Nav.Link as={NavLink} to="/maquinaria" end>
          <i className="bi bi-list-ul me-2" />
          Inventario General
        </Nav.Link>
        <Nav.Link as={NavLink} to="/maquinaria/arriendos">
          <i className="bi bi-calendar-check me-2" />
          Arriendos
        </Nav.Link>
        <Nav.Link as={NavLink} to="/maquinaria/compras">
          <i className="bi bi-truck me-2" />
          Compras
        </Nav.Link>
        <Nav.Link as={NavLink} to="/maquinaria/ventas">
          <i className="bi bi-cash-coin me-2" />
          Ventas
        </Nav.Link>
        <Nav.Link as={NavLink} to="/maquinaria/clientes">
          <i className="bi bi-people me-2" />
          Clientes
        </Nav.Link>
      </Nav>
    </div>
  )
}

export default MaquinariaSidebar
