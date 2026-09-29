import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { POST } from '../src/pages/api/reclamaciones.ts';
import { validateClaimPayload, generateClaimCode } from '../src/lib/claims-validation.js';

function createMockContext({ body, locals = {} } = {}) {
  const request = new Request('https://floresenpaz.com/api/reclamaciones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
  });

  return {
    request,
    locals,
  };
}

describe('API Reclamaciones Route Handler - POST /api/reclamaciones', () => {
  const validPayload = {
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
    terminos: true,
  };

  test('retorna 400 cuando el cuerpo de la petición no es JSON válido', async () => {
    const context = {
      request: new Request('https://floresenpaz.com/api/reclamaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid-json{{{',
      }),
      locals: {},
    };

    const response = await POST(context);
    assert.equal(response.status, 400);

    const data = await response.json();
    assert.equal(data.error, 'Cuerpo de petición inválido');
  });

  test('retorna 422 cuando el payload tiene campos incompletos o inválidos', async () => {
    const invalidContext = createMockContext({
      body: {
        tipo_persona: 'natural',
        nombre_completo: 'Ma', // Muy corto
        tipo_documento: 'DNI',
        numero_documento: '',
        email: 'correo-invalido',
        terminos: false,
      },
    });

    const response = await POST(invalidContext);
    assert.equal(response.status, 422);

    const data = await response.json();
    assert.equal(data.error, 'Datos incompletos o inválidos');
    assert.ok(Array.isArray(data.details));
    assert.ok(data.details.length >= 3);
  });

  test('retorna 500 cuando el servidor carece de credenciales de Supabase', async () => {
    const context = createMockContext({
      body: validPayload,
      locals: {}, // sin supabase y sin runtime env
    });

    // Asegurar que process.env no interfiera temporalmente si estuviera mockeado
    const prevUrl = process.env.SUPABASE_URL;
    const prevKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    try {
      const response = await POST(context);
      assert.equal(response.status, 500);

      const data = await response.json();
      assert.equal(data.error, 'Configuración incompleta del servidor');
    } finally {
      if (prevUrl) process.env.SUPABASE_URL = prevUrl;
      if (prevKey) process.env.SUPABASE_SERVICE_ROLE_KEY = prevKey;
    }
  });

  test('procesa exitosamente el registro retornando 201 y código correlativo vía RPC atómico', async () => {
    let rpcCalled = false;
    let insertCalledWith = null;

    const mockSupabase = {
      rpc: async (fnName) => {
        if (fnName === 'get_next_reclamacion_code') {
          rpcCalled = true;
          return { data: 'REC-2026-00042', error: null };
        }
        return { data: null, error: new Error('Unknown RPC') };
      },
      from: (table) => {
        assert.equal(table, 'reclamaciones');
        return {
          insert: async (row) => {
            insertCalledWith = row;
            return { error: null };
          },
        };
      },
    };

    const context = createMockContext({
      body: validPayload,
      locals: {
        supabase: mockSupabase,
      },
    });

    const response = await POST(context);
    assert.equal(response.status, 201);

    const data = await response.json();
    assert.equal(data.ok, true);
    assert.equal(data.codigo, 'REC-2026-00042');
    assert.ok(data.fecha_registro);
    assert.ok(data.fecha_limite);

    // Verificar que fecha_limite es 15 días posterior a fecha_registro
    const registro = new Date(data.fecha_registro).getTime();
    const limite = new Date(data.fecha_limite).getTime();
    const diffDays = Math.round((limite - registro) / (1000 * 60 * 60 * 24));
    assert.equal(diffDays, 15);

    // Verificar que se invocó el RPC y la inserción con los datos correspondientes
    assert.equal(rpcCalled, true);
    assert.ok(insertCalledWith);
    assert.equal(insertCalledWith.codigo, 'REC-2026-00042');
    assert.equal(insertCalledWith.nombre_completo, 'María Alvarado');
    assert.equal(insertCalledWith.monto_reclamado, 80);
    assert.equal(insertCalledWith.estado, 'pendiente');
  });

  test('ejecuta fallback seguro de generación de código si RPC falla', async () => {
    let countQueryCalled = false;
    let insertedRow = null;

    const mockSupabase = {
      rpc: async () => ({
        data: null,
        error: new Error('RPC unavailable'),
      }),
      from: (table) => ({
        select: async (_cols, opts) => {
          if (opts?.count === 'exact') {
            countQueryCalled = true;
            return { count: 15, error: null };
          }
          return { count: 0, error: null };
        },
        insert: async (row) => {
          insertedRow = row;
          return { error: null };
        },
      }),
    };

    const context = createMockContext({
      body: validPayload,
      locals: {
        supabase: mockSupabase,
      },
    });

    const response = await POST(context);
    assert.equal(response.status, 201);

    const data = await response.json();
    assert.equal(data.ok, true);
    assert.equal(countQueryCalled, true);
    const expectedCode = generateClaimCode(16);
    assert.equal(data.codigo, expectedCode);
    assert.equal(insertedRow.codigo, expectedCode);
  });

  test('retorna 500 si la inserción en la base de datos falla', async () => {
    const mockSupabase = {
      rpc: async () => ({ data: 'REC-2026-00099', error: null }),
      from: () => ({
        insert: async () => ({ error: new Error('Database connection lost') }),
      }),
    };

    const context = createMockContext({
      body: validPayload,
      locals: {
        supabase: mockSupabase,
      },
    });

    const response = await POST(context);
    assert.equal(response.status, 500);

    const data = await response.json();
    assert.equal(data.error, 'Error al registrar la reclamación en el sistema');
  });
});
