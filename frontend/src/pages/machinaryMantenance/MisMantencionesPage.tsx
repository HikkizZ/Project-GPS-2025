import React from 'react';
import { useAuth } from '@/context';
import { useMaintenanceRecords } from '@/hooks/MachinaryMaintenance/MaintenanceRecord/useMaintenanceRecords';
import MaintenanceSparePartForm from '@/components/MachineryMaintenance/MaintenanceSpareParts/MaintenanceSparePartForm

const MisMantencionesPage = () => {
  const { user } = useAuth(); // tu mecánico autenticado
  const { records, loading } = useMaintenanceRecords({ mecanicoId: user.id });

  return (
    <div>
      <h2>Mis Mantenciones Asignadas</h2>
      {loading && <p>Cargando...</p>}
      {!loading && records.map((r) => (
        <div key={r.id} className="card mb-3 p-3">
          <p><strong>Maquinaria:</strong> {r.maquinaria.patente}</p>
          <p><strong>Estado:</strong> {r.estado}</p>
          <MaintenanceSparePartForm mantencionId={r.id} />
        </div>
      ))}
    </div>
  );
};

export default MisMantencionesPage;
