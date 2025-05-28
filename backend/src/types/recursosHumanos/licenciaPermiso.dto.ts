import { EstadoSolicitud, TipoSolicitud } from "../../entity/recursosHumanos/licenciaPermiso.entity.js";
import { User } from "../../entity/user.entity.js";

export type CreateLicenciaPermisoDTO = {
  trabajadorId: number;
  tipo: TipoSolicitud;
  fechaInicio: string; // formato YYYY-MM-DD
  fechaFin: string;    // formato YYYY-MM-DD
  motivoSolicitud: string;
  archivoAdjuntoURL?: string;
};

export type UpdateLicenciaPermisoDTO = {
  estadoSolicitud: EstadoSolicitud;
  respuestaEncargado?: string;
  revisadoPor?: User;
};