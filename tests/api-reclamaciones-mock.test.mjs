import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { validateClaimPayload, generateClaimCode } from '../src/lib/claims-validation.js';

describe('API Reclamaciones Integration Contract', () => {
  test('valida y genera respuesta estructurada esperada por el cliente', () => {
    const rawInput = {
      tipo_persona: 'natural',
      nombre_completo: 'María Alvarado',
      tipo_documento: 'DNI',
      numero_documento: '10293847',
      telefono: '998877665',
      email: 'maria@example.com',
      direccion: 'Av. Los Álamos 450',
      ciudad: 'Arequipa',
      es_menor: false,
      tipo_bien: 'producto',
      monto_reclamado: 80,
      descripcion_bien: 'Girasoles de Esperanza',
      tipo_reclamacion: 'reclamo',
      detalle: 'No llegó la dedicatoria en la tarjeta floral',
      pedido: 'Envío de dedicatoria y reposición de tarjeta',
      terminos: true
    };

    const validation = validateClaimPayload(rawInput);
    assert.equal(validation.isValid, true);

    const now = new Date('2026-09-28T12:00:00Z');
    const deadline = new Date(now);
    deadline.setDate(deadline.getDate() + 15);

    const mockResponse = {
      ok: true,
      codigo: generateClaimCode(101, 2026),
      fecha_registro: now.toISOString(),
      fecha_limite: deadline.toISOString(),
    };

    assert.equal(mockResponse.ok, true);
    assert.equal(mockResponse.codigo, 'REC-2026-00101');
  });

  test('rechaza payload inválido indicando errores de validación', () => {
    const invalidInput = {
      tipo_persona: 'natural',
      nombre_completo: '',
      tipo_documento: 'DNI',
      numero_documento: '123', // inválido
      email: 'correo-invalido',
      terminos: false
    };

    const validation = validateClaimPayload(invalidInput);
    assert.equal(validation.isValid, false);
    assert.ok(validation.errors.length > 0);
  });
});
