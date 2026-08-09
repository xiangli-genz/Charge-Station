import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildChargingPointFilter,
  buildStationFilter,
  StationSearchParams,
} from '../../services/station.service';

test('buildStationFilter maps keyword and status', () => {
  const filter = buildStationFilter({
    keyword: 'vinfast',
    status: 'active',
    page: 1,
    limit: 10,
  } as StationSearchParams);

  assert.equal(filter.status, 'active');
  assert.ok(Array.isArray(filter.$or));
  assert.equal(filter.$or?.length, 3);
});

test('buildChargingPointFilter maps connector, power and availability', () => {
  const filter = buildChargingPointFilter({
    connectorType: 'CCS2',
    minPowerKw: 30,
    maxPowerKw: 90,
    availableOnly: true,
    page: 1,
    limit: 10,
  });

  assert.equal(filter.connectorType, 'CCS2');
  assert.equal(filter.powerKw?.$gte, 30);
  assert.equal(filter.powerKw?.$lte, 90);
  assert.equal(filter.status, 'available');
});
