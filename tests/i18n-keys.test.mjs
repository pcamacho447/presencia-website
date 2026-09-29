import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

describe('i18n Keys Integrity', () => {
  const es = JSON.parse(fs.readFileSync(new URL('../src/i18n/es.json', import.meta.url)));
  const en = JSON.parse(fs.readFileSync(new URL('../src/i18n/en.json', import.meta.url)));

  test('es.json y en.json contienen sección claims y cookies', () => {
    assert.ok(es.claims, 'es.json debe tener sección claims');
    assert.ok(en.claims, 'en.json debe tener sección claims');
    assert.ok(es.cookies, 'es.cookies debe tener sección cookies');
    assert.ok(en.cookies, 'en.cookies debe tener sección cookies');
    assert.ok(es.footer.claims, 'es.footer debe tener enlace claims');
    assert.ok(en.footer.claims, 'en.footer debe tener enlace claims');
    assert.ok(es.footer.cookies, 'es.footer debe tener enlace cookies');
    assert.ok(en.footer.cookies, 'en.footer debe tener enlace cookies');
  });

  test('es.json y en.json contienen claves completas para cookie banner', () => {
    const requiredKeys = ['banner_title', 'banner_text', 'accept', 'reject', 'policy_link'];
    for (const key of requiredKeys) {
      assert.ok(es.cookies[key], `es.cookies debe tener clave ${key}`);
      assert.ok(en.cookies[key], `en.cookies debe tener clave ${key}`);
    }
  });
});
