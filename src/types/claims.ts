export type TipoPersona = 'natural' | 'juridica';
export type TipoDocumento = 'DNI' | 'CE' | 'Pasaporte' | 'RUC';
export type TipoBien = 'producto' | 'servicio';
export type TipoReclamacion = 'reclamo' | 'queja';
export type EstadoReclamacion = 'pendiente' | 'en_proceso' | 'atendido' | 'cerrado';

export interface ClaimPayload {
  tipo_persona: TipoPersona;
  nombre_completo: string;
  razon_social?: string;
  tipo_documento: TipoDocumento;
  numero_documento: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  es_menor: boolean;
  apoderado_nombre?: string;
  apoderado_documento?: string;
  tipo_bien: TipoBien;
  monto_reclamado?: number | string;
  descripcion_bien: string;
  tipo_reclamacion: TipoReclamacion;
  detalle: string;
  pedido: string;
  terminos: boolean;
}

export interface ClaimRecord extends ClaimPayload {
  id: string;
  codigo: string;
  fecha_registro: string;
  fecha_limite_respuesta: string;
  estado: EstadoReclamacion;
  observaciones_proveedor?: string;
}
