import { useAuth } from '@/context/useAuth';
import { UserRole } from '@/types/auth.types';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role as UserRole) : false;
  };

  // Permisos para Recursos Humanos
  const canAccessRRHH = hasRole(["SuperAdministrador", "Administrador", "RecursosHumanos"]);
  
  // Permisos para Inventario
  const canAccessInventory = hasRole(["Administrador", "SuperAdministrador", "Ventas", "Gerencia", "Finanzas"]);
  
  // Permisos para Maquinaria
  const canAccessMaquinaria = hasRole(["SuperAdministrador", "Arriendo", "Mecánico", "Mantenciones de Maquinaria"]);

  // Permisos para Mantención de Maquinaria
  const canAccessMaintenance = hasRole(["Administrador", "SuperAdministrador", "Mecánico", "Mantenciones de Maquinaria"]);

  // Permisos para gestión de usuarios
  const canManageUsers = hasRole(["SuperAdministrador", "Administrador", "RecursosHumanos"]);

  // Permisos para módulos personales (no SuperAdministrador)
  const canAccessPersonalModules = user && user.role !== "SuperAdministrador";

  // Permisos para mis licencias y permisos (todos los roles excepto SuperAdministrador)
  const canAccessMyLicenses = user && user.role !== "SuperAdministrador";

  // Permisos para bonos (SuperAdministrador y Administrador)
  const canAccessBonos = hasRole(["SuperAdministrador", "Administrador"]);

  return {
    hasRole,
    canAccessRRHH,
    canAccessInventory,
    canAccessMaquinaria,
    canAccessMaintenance,
    canManageUsers,
    canAccessPersonalModules,
    canAccessMyLicenses,
    canAccessBonos,
    userRole: user?.role
  };
}; 