import type { ClaimPayload } from '../types/claims';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function generateClaimCode(sequence: number, year: number = new Date().getFullYear()): string {
  const padded = String(sequence).padStart(5, '0');
  return `REC-${year}-${padded}`;
}

export function validateClaimPayload(data: Partial<ClaimPayload>): ValidationResult {
  const errors: string[] = [];

  if (!data.nombre_completo || data.nombre_completo.trim().length < 3) {
    errors.push('El nombre completo o razón social es requerido (mínimo 3 caracteres).');
  }

  if (!data.tipo_documento || !['DNI', 'CE', 'Pasaporte', 'RUC'].includes(data.tipo_documento)) {
    errors.push('El tipo de documento es requerido y debe ser válido.');
  }

  if (!data.numero_documento || data.numero_documento.trim().length < 5) {
    errors.push('El número de documento es requerido (mínimo 5 caracteres).');
  }

  if (!data.telefono || data.telefono.trim().length < 6) {
    errors.push('El teléfono de contacto es requerido.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push('Debe ingresar un correo electrónico válido para recibir la copia del reclamo.');
  }

  if (!data.direccion || data.direccion.trim().length < 5) {
    errors.push('La dirección de domicilio es requerida.');
  }

  if (!data.ciudad || data.ciudad.trim().length < 2) {
    errors.push('La ciudad o distrito es requerido.');
  }

  if (data.es_menor) {
    if (!data.apoderado_nombre || data.apoderado_nombre.trim().length < 3) {
      errors.push('Para menores de edad, el nombre del apoderado o tutor es obligatorio.');
    }
    if (!data.apoderado_documento || data.apoderado_documento.trim().length < 5) {
      errors.push('Para menores de edad, el documento del apoderado es obligatorio.');
    }
  }

  if (!data.tipo_bien || !['producto', 'servicio'].includes(data.tipo_bien)) {
    errors.push('Debe seleccionar el tipo de bien (producto o servicio).');
  }

  if (!data.descripcion_bien || data.descripcion_bien.trim().length < 5) {
    errors.push('La descripción del bien o servicio contratado es requerida.');
  }

  if (!data.tipo_reclamacion || !['reclamo', 'queja'].includes(data.tipo_reclamacion)) {
    errors.push('Debe seleccionar el tipo de reclamación (reclamo o queja).');
  }

  if (!data.detalle || data.detalle.trim().length < 10) {
    errors.push('El detalle de la reclamación es requerido (mínimo 10 caracteres).');
  }

  if (!data.pedido || data.pedido.trim().length < 5) {
    errors.push('El pedido concreto del consumidor es requerido.');
  }

  if (!data.terminos) {
    errors.push('Debe declarar la veracidad de los datos y aceptar la política de privacidad.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
