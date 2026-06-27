import assert from 'node:assert/strict';
import test from 'node:test';
import { assertPassword, assertRating, validateUserInput } from '../src/validation.js';

test('accepts valid signup fields', () => {
  assert.doesNotThrow(() =>
    validateUserInput({
      name: 'Nisha Everyday Shopping User',
      email: 'nisha@example.com',
      password: 'User@123',
      address: '7 Residency Lane, Bengaluru',
      role: 'USER'
    })
  );
});

test('rejects short names', () => {
  assert.throws(
    () =>
      validateUserInput({
        name: 'Short Name',
        email: 'nisha@example.com',
        password: 'User@123',
        address: '7 Residency Lane, Bengaluru',
        role: 'USER'
      }),
    /Name must be between/
  );
});

test('enforces password complexity', () => {
  assert.throws(() => assertPassword('password'), /Password must be/);
  assert.doesNotThrow(() => assertPassword('Valid@123'));
});

test('only allows ratings from 1 to 5', () => {
  assert.equal(assertRating(5), 5);
  assert.throws(() => assertRating(6), /Rating must be/);
});
