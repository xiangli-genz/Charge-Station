import assert from 'node:assert/strict';
import test from 'node:test';
import { authenticate, requireCustomer } from '../../middlewares/client/auth.middleware';
import { AuthRequest } from '../../types/express';

const createMockResponse = () => {
  const response = {
    statusCode: 200,
    body: null as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };

  return response;
};

test('authenticate rejects missing bearer token', () => {
  const req = { headers: {} } as AuthRequest;
  const res = createMockResponse();
  let nextCalled = false;

  authenticate(req, res as any, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
});

test('requireCustomer rejects admin token payload', () => {
  const req = { user: { id: 'abc', role: 'admin' } } as AuthRequest;
  const res = createMockResponse();
  let nextCalled = false;

  requireCustomer(req, res as any, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
});
