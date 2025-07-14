import React, { useState } from 'react';
import { useSpareParts } from '@/hooks/machinaryMaintenance/useSpareParts';
import { SparePart } from '@/types/machinaryMaintenance/sparePart.types';
import ListaSpareParts from '@/components/machinaryMaintenance/ListaSpareParts';
import RegisterSparePartForm from '@/components/machinaryMaintenance/RegisterSparePartForm';
import EditarSparePartModal from '@/components/machinaryMaintenance/EditarSparePartModal';
import { Toast } from '@/components/common/Toast';

const SparePartsPage = () => {
  const { spareParts, loading, error, reload } = useSpareParts();
  const [selectedSparePart, setSelectedSparePart] = useState<SparePart | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const handleEdit = (repuesto: SparePart) => {
    setSelectedSparePart(repuesto);
  };

  const handleCloseModal = () => {
    setSelectedSparePart(null);
  };

  const handleSuccess = (message: string) => {
    setToast({ show: true, message, type: 'success' });
    reload();
    handleCloseModal();
  };

  return (
    <div className="container mt-4">
      <h2>Gestión de Repuestos</h2>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="my-4">
        <RegisterSparePartForm onSuccess={(msg) => handleSuccess(msg)} />
      </div>

      {loading ? (
        <p>Cargando repuestos...</p>
      ) : (
        <ListaSpareParts data={spareParts} onEdit={handleEdit} onReload={reload} />
      )}

      {selectedSparePart && (
        <EditarSparePartModal
          repuesto={selectedSparePart}
          onClose={handleCloseModal}
          onSuccess={(msg) => handleSuccess(msg)}
        />
      )}
    </div>
  );
};

export default SparePartsPage;
