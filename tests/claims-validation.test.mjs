import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { validateClaimPayload, generateClaimCode } from '../src/lib/claims-validation.js';

describe('Libro de Reclamaciones - Validaciones', () => {
  test('debe rechazar payload vacío o incompleto', () => {
    const result = validateClaimPayload({});
    assert.equal(result.isValid, false);
    assert.ok(result.errors.length > 0);
  });

  test('debe aceptar payload válido con todos los campos requeridos por INDECOPI', () => {
    const validPayload = {
      tipo_persona: 'natural',
      nombre_completo: 'Carlos Pérez Ramos',
      tipo_documento: 'DNI',
      numero_documento: '45678912',
      telefono: '987654321',
      email: 'carlos@example.com',
      direccion: 'Av. Larco 123',
      ciudad: 'Lima',
      es_menor: false,
      tipo_bien: 'producto',
      monto_reclamado: 120,
      descripcion_bien: 'Arreglo Lirios de Paz para San Pedro',
      tipo_reclamacion: 'reclamo',
      detalle: 'El arreglo no fue colocado en el horario coordinado',
      pedido: 'Reubicación y confirmación fotográfica del servicio',
      terminos: true
    };
    const result = validateClaimPayload(validPayload);
    assert.equal(result.isValid, true);
    assert.equal(result.errors.length, 0);
  });

  test('debe exigir datos de apoderado si es menor de edad', () => {
    const minorPayload = {
      tipo_persona: 'natural',
      nombre_completo: 'Juan Menor',
      tipo_documento: 'DNI',
      numero_documento: '78912345',
      telefono: '987654321',
      email: 'menor@example.com',
      direccion: 'Av. Primavera 456',
      ciudad: 'Trujillo',
      es_menor: true,
      apoderado_nombre: '',
      apoderado_documento: '',
      tipo_bien: 'servicio',
      descripcion_bien: 'Paquete Esencial',
      tipo_reclamacion: 'queja',
      detalle: 'Mala atención del soporte',
      pedido: 'Disculpas formales',
      terminos: true
    };
    const result = validateClaimPayload(minorPayload);
    assert.equal(result.isValid, false);
    assert.ok(result.errors.some(e => e.includes('apoderado')));
  });

  test('debe generar código correlativo con formato REC-YYYY-XXXXX', () => {
    const code = generateClaimCode(1, 2026);
    assert.equal(code, 'REC-2026-00001');
    const code2 = generateClaimCode(42, 2026);
    assert.equal(code2, 'REC-2026-00042');
  });
});
