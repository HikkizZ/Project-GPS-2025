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
  onReload: () => void;
}

const MaintenanceRecordList: React.FC<Props> = ({ records, onEdit, onDelete, onSpareParts, onFinish, onReload }) => {

    const [editandoId, setEditandoId] = useState<number | null>(null);
    const [nuevoEstado, setNuevoEstado] = useState<string>('');
    const { update } = useUpdateMaintenanceRecord();
  
  return (

    

          <Table striped bordered hover responsive className="maintenance-table table-sm">
            <thead>
              <tr>
                <th className="text-center fw-bold">Grupo</th>
                <th className="text-center fw-bold">N° Chasis</th>
                <th className="text-center fw-bold">Patente</th>
                <th className="text-center fw-bold">Mecánico</th>
                <th className="text-center fw-bold">Tipo</th>
                <th className="text-center fw-bold">Descripción</th>
                <th className="text-center fw-bold">Entrada</th>
                <th className="text-center fw-bold">Estado</th>
                <th className="text-center fw-bold min-width-250">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {records.map((m) => (
                <tr key={m.id}>
                  <td className="text-center">{m.maquinaria.grupo}</td>
                  <td className="text-center">{m.maquinaria.numeroChasis}</td>
                  <td className="text-center">{m.maquinaria.patente}</td>
                  <td className="text-center">
                    {m.mecanicoAsignado?.trabajador
                      ? `${m.mecanicoAsignado.trabajador.nombres} ${m.mecanicoAsignado.trabajador.apellidoPaterno} ${m.mecanicoAsignado.trabajador.apellidoMaterno}`
                      : 'Sin datos'}
                  </td>
                  <td className="text-center">{m.razonMantencion}</td>
                  <td className="text-center">{m.descripcionEntrada}</td>
                  <td className="text-center">
                    {new Date(m.fechaEntrada).toLocaleDateString()}
                  </td>
                  <td className="text-center">
                    {editandoId === m.id ? (
                      <select
                        className="form-select form-select-sm"
                        value={nuevoEstado}
                        onChange={async (e) => {
                          const nuevo = e.target.value;
                          setNuevoEstado(nuevo);
                          if (Object.values(EstadoMantencion).includes(nuevo as EstadoMantencion)) {
                            await update(m.id, { estado: nuevo as EstadoMantencion });
                            onReload();
                          } else {
                            console.error('Estado no válido:', nuevo);
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
                        className="editable-status"
                      >
                        {m.estado}
                      </span>
                    )}
                  </td>
                  <td className="text-center">
                    <div className="btn-group-wrapper">
                      <Button variant="warning" size="sm" onClick={() => onEdit(m)}>Editar</Button>
                      <Button variant="danger" size="sm" onClick={() => onDelete(m.id)}>Eliminar</Button>
                      <Button variant="info" size="sm" onClick={() => onSpareParts(m)}>Repuestos</Button>
                      <Button variant="success" size="sm" onClick={() => onFinish(m)}>Finalizar</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        );

};

export default MaintenanceRecordList;
