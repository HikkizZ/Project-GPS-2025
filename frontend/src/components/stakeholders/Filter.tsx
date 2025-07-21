import { useState } from "react";

interface Props {
  onFilter: (filters: { name?: string; rut?: string; email?: string }) => void;
}

export const SupplierFilter: React.FC<Props> = ({ onFilter }) => {
  const [filters, setFilters] = useState({ name: '', rut: '', email: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filters);
  };

  const handleReset = () => {
    setFilters({ name: '', rut: '', email: '' });
    onFilter({});
  };

  return (
    <form onSubmit={handleSubmit} className="d-flex gap-3 mb-3">
      <input type="text" name="name" value={filters.name} onChange={handleChange} placeholder="Nombre" className="form-control" />
      <input type="text" name="rut" value={filters.rut} onChange={handleChange} placeholder="RUT" className="form-control" />
      <input type="text" name="email" value={filters.email} onChange={handleChange} placeholder="Correo" className="form-control" />
      <button type="submit" className="btn btn-primary">Buscar</button>
      <button type="button" className="btn btn-secondary" onClick={handleReset}>Limpiar</button>
    </form>
  );
};
