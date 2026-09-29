import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { COOKIE_CONSENT_KEY } from '../src/types/cookies.js';

describe('Cookies Consent Contract', () => {
  test('la clave de almacenamiento es consistente', () => {
    assert.equal(COOKIE_CONSENT_KEY, 'flores_cookie_consent_v1');
  });
});
