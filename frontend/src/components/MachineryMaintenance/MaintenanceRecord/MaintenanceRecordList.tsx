import React, {useState} from 'react';
import { Table, Button } from 'react-bootstrap';
import { EstadoMantencion, MaintenanceRecord } from '@/types/machinaryMaintenance/maintenanceRecord.types';
import { useUpdateMaintenanceRecord } from '@/hooks/MachinaryMaintenance/MaintenanceRecord/useUpdateMaintenanceRecord';

interface Props {
  records: MaintenanceRecord[];
  onEdit: (record: MaintenanceRecord) => void;
  onDelete: (id: number) => void;
  onFinish: (record: MaintenanceRecord) => void;
  onSpareParts: (record: MaintenanceRecord) => void
}

const MaintenanceRecordList: React.FC<Props> = ({ records, onEdit, onDelete, onSpareParts, onFinish }) => {

    const [editandoId, setEditandoId] = useState<number | null>(null);
    const [nuevoEstado, setNuevoEstado] = useState<string>('');
    const { update } = useUpdateMaintenanceRecord();
  
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th style={{ fontWeight: 700, textAlign: 'center' }}>Grupo</th>
          <th style={{ fontWeight: 700, textAlign: 'center'  }}>Número de Chasis</th>
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
          <td style={{ textAlign: 'center'  }}>{m.maquinaria.numeroChasis}</td>
          <td style={{ textAlign: 'center'  }}>{m.maquinaria?.patente}</td>
          <td style={{ textAlign: 'center'  }}>
            {m.mecanicoAsignado?.trabajador
              ? `${m.mecanicoAsignado.trabajador.nombres} ${m.mecanicoAsignado.trabajador.apellidoPaterno} ${m.mecanicoAsignado.trabajador.apellidoMaterno}`
              : "Sin datos"}
          </td>
          <td style={{ textAlign: 'center'  }}>{m.razonMantencion}</td>
          <td style={{ textAlign: 'center'  }}>{m.descripcionEntrada}</td>
          <td style={{ textAlign: 'center'  }}>{new Date(m.fechaEntrada).toLocaleDateString()}</td>
          <td style={{ textAlign: 'center' }}>
            {editandoId === m.id ? (
              <select
                  value={nuevoEstado}
                 onChange={async (e) => {
                  const nuevo = e.target.value;
                  setNuevoEstado(nuevo);
                  if (Object.values(EstadoMantencion).includes(nuevo as EstadoMantencion)) {
                    await update(m.id, { estado: nuevo as EstadoMantencion });
                    
                  } else {
                    console.error("Estado no válido:", nuevo);
                  }
                  setEditandoId(null);
                }}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en_proceso">En proceso</option>
                  <option value="completada">Completada</option>
                  <option value="irrecuperable">Irrecuperable</option>
            </select>
          ) : (
            <span
              onClick={() => {
                setEditandoId(m.id);
                setNuevoEstado(m.estado);
              }}
              style={{ cursor: 'pointer' }}
            >
              {m.estado}
            </span>
          )}
        </td>


          <td style={{ textAlign: 'center'  }}>
            <Button variant="warning" size="sm" onClick={() => onEdit(m)}>Editar</Button>{' '}
            <Button variant="danger" size="sm" onClick={() => onDelete(m.id)}>Eliminar</Button>
            {/*<Button variant="success" size="sm" className="me-2"onClick={() => onFinish(m)}>Finalizar</Button>*/}
            <Button variant="info" size="sm" onClick={() => onSpareParts(m)}>Asignar Repuestos</Button>
          </td>
        </tr>
      ))}
</tbody>

    </Table>
  );
};

export default MaintenanceRecordList;
