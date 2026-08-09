import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ensureBookingCanBeCancelled,
  ensureValidBookingWindow,
} from '../../services/booking-core.service';

test('ensureValidBookingWindow accepts valid range', () => {
  assert.doesNotThrow(() => {
    ensureValidBookingWindow(
      new Date('2026-08-10T08:00:00.000Z'),
      new Date('2026-08-10T10:00:00.000Z')
    );
  });
});

test('ensureValidBookingWindow rejects inverted range', () => {
  assert.throws(() => {
    ensureValidBookingWindow(
      new Date('2026-08-10T10:00:00.000Z'),
      new Date('2026-08-10T08:00:00.000Z')
    );
  });
});

test('ensureBookingCanBeCancelled allows cancellation more than 30 minutes ahead', () => {
  assert.doesNotThrow(() => {
    ensureBookingCanBeCancelled(
      {
        status: 'confirmed',
        startTime: new Date('2026-08-10T10:00:00.000Z'),
      },
      new Date('2026-08-10T09:20:00.000Z')
    );
  });
});

test('ensureBookingCanBeCancelled rejects cancellation inside 30 minutes', () => {
  assert.throws(() => {
    ensureBookingCanBeCancelled(
      {
        status: 'confirmed',
        startTime: new Date('2026-08-10T10:00:00.000Z'),
      },
      new Date('2026-08-10T09:31:00.000Z')
    );
  });
});
