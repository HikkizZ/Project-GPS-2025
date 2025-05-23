import { EstadoSolicitud } from "../../entity/recursosHumanos/licenciaPermiso.entity.js";

export type CreateLicenciaPermisoDTO = {
  trabajadorId: number;
  tipo: "Licencia médica" | "Permiso administrativo";
  fechaInicio: string; // formato YYYY-MM-DD
  fechaFin: string;    // formato YYYY-MM-DD
  motivo: string;
  archivoAdjuntoURL?: string;
};

export type UpdateLicenciaPermisoDTO = {
  estadoSolicitud: EstadoSolicitud;
  respuestaEncargado?: string;
};