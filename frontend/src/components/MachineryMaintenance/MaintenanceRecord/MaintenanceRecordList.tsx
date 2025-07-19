import React from 'react';
import { Table, Button } from 'react-bootstrap';
import { MaintenanceRecord } from '@/types/machinaryMaintenance/maintenanceRecord.types';

interface Props {
  records: MaintenanceRecord[];
  onEdit: (record: MaintenanceRecord) => void;
  onDelete: (id: number) => void;
  onFinish: (record: MaintenanceRecord) => void;
}

const MaintenanceRecordList: React.FC<Props> = ({ records, onEdit, onDelete }) => {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th style={{ fontWeight: 700, textAlign: 'center' }}>Grupo</th>
          <th style={{ fontWeight: 700, textAlign: 'center'  }}>Modelo</th>
          <th style={{ fontWeight: 700, textAlign: 'center'  }}>Patente Máquina</th>
          <th style={{ fontWeight: 700, textAlign: 'center'  }}>Mecánico</th>
          <th style={{ fontWeight: 700, textAlign: 'center'  }}>Tipo de Mantención</th>
          <th style={{ fontWeight: 700, textAlign: 'center'  }}>Descripción</th>
          <th style={{ fontWeight: 700, textAlign: 'center'  }}>Fecha Entrada</th>
          <th style={{ fontWeight: 700, textAlign: 'center'  }}>Estado</th>
          <th style={{ minWidth: '250px', fontWeight: 700, textAlign: 'center'  }}>Acciones</th>
        </tr>
      </thead>
      <tbody>
      {records.map((m) => (
        <tr key={m.id}>
          <td style={{ textAlign: 'center'  }}>{m.maquinaria.grupo}</td>
          <td style={{ textAlign: 'center'  }}>{m.maquinaria?.modelo}</td>
          <td style={{ textAlign: 'center'  }}>{m.maquinaria?.patente}</td>
          <td style={{ textAlign: 'center'  }}>
            {m.mecanicoAsignado?.trabajador
              ? `${m.mecanicoAsignado.trabajador.nombres} ${m.mecanicoAsignado.trabajador.apellidoPaterno} ${m.mecanicoAsignado.trabajador.apellidoMaterno}`
              : "Sin datos"}
          </td>
          <td style={{ textAlign: 'center'  }}>{m.razonMantencion}</td>
          <td style={{ textAlign: 'center'  }}>{m.descripcionEntrada}</td>
          <td style={{ textAlign: 'center'  }}>{new Date(m.fechaEntrada).toLocaleDateString()}</td>
          <td style={{ textAlign: 'center'  }}>{m.estado}</td>
          <td style={{ textAlign: 'center'  }}>
            <Button variant="warning" size="sm" onClick={() => onEdit(m)}>Editar</Button>{' '}
            <Button variant="danger" size="sm" onClick={() => onDelete(m.id)}>Eliminar</Button>
            <Button variant="success" size="sm" className="me-2"onClick={() => onFinish(record)}>Finalizar</Button>
          </td>
        </tr>
      ))}
</tbody>

    </Table>
  );
};

export default MaintenanceRecordList;
