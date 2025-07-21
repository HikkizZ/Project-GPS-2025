import React, { useEffect, useState } from 'react';
import { Table, Form, Row, Col } from 'react-bootstrap';
import { format } from 'date-fns';

interface InventoryHistoryItem {
  id: number;
  date: string;
  type: 'Entrada' | 'Salida';
  item: string;
  quantity: number;
  entity: string;
  price: number;
}

const mockData: InventoryHistoryItem[] = [
  {
    id: 1,
    date: '2025-07-19',
    type: 'Entrada',
    item: 'Tornillos',
    quantity: 100,
    entity: 'Proveedor A',
    price: 50,
  },
  {
    id: 2,
    date: '2025-07-18',
    type: 'Salida',
    item: 'Clavos',
    quantity: 60,
    entity: 'Cliente B',
    price: 30,
  },
  // Más registros...
];

const InventoryHistoryTable: React.FC = () => {
  const [typeFilter, setTypeFilter] = useState<'Todos' | 'Entrada' | 'Salida'>('Todos');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [filteredData, setFilteredData] = useState<InventoryHistoryItem[]>([]);

  useEffect(() => {
    let filtered = [...mockData];

    if (typeFilter !== 'Todos') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }

    if (fromDate) {
      filtered = filtered.filter(item => item.date >= fromDate);
    }

    if (toDate) {
      filtered = filtered.filter(item => item.date <= toDate);
    }

    setFilteredData(filtered);
  }, [typeFilter, fromDate, toDate]);

  return (
    <div>
      <h4 className="mb-3">Historial de Inventario</h4>

      <Row className="mb-3">
        <Col md={3}>
          <Form.Label>Tipo de movimiento</Form.Label>
          <Form.Select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)}>
            <option value="Todos">Todos</option>
            <option value="Entrada">Entradas</option>
            <option value="Salida">Salidas</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Label>Desde</Form.Label>
          <Form.Control
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Label>Hasta</Form.Label>
          <Form.Control
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
          />
        </Col>
      </Row>

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Material</th>
              <th>Cantidad</th>
              <th>Entidad</th>
              <th>Precio total</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center">
                  No se encontraron registros.
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id}>
                  <td>{format(new Date(item.date), 'dd/MM/yyyy')}</td>
                  <td>{item.type}</td>
                  <td>{item.item}</td>
                  <td>{item.quantity}</td>
                  <td>{item.entity}</td>
                  <td>${item.price.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default InventoryHistoryTable;
