import assert from 'node:assert/strict';
const store = new Map();
globalThis.window = { localStorage: { getItem: k => store.has(k) ? store.get(k) : null, setItem: (k, v) => store.set(k, v), removeItem: k => store.delete(k) } };
const U = await import(new URL('../src/utils/locationUtils.js', import.meta.url));
const S = await import(new URL('../src/services/locationsService.js', import.meta.url));
const D = await import(new URL('../src/data/locationsDemoData.js', import.meta.url));
let n = 0; const t = (name, fn) => Promise.resolve(fn()).then(() => { n++; console.log('ok  ', name); }, e => { console.log('FAIL', name, '\n    ', e.message); process.exitCode = 1; });

const good = { id: 'LOC-050', name: 'Test', type: 'Highway', latitude: '26.76', longitude: '83.37', cameraId: 'CAM-50', cameraStatus: 'online', description: '' };

await t('seed has unique IDs and camera IDs', () => {
  assert.equal(new Set(D.DEMO_LOCATIONS.map(l => l.id)).size, D.DEMO_LOCATIONS.length);
  assert.equal(new Set(D.DEMO_LOCATIONS.map(l => l.cameraId)).size, D.DEMO_LOCATIONS.length);
  D.DEMO_LOCATIONS.forEach(l => assert.ok(U.validateLocation(l, [], null).ok, l.id));
});
await t('valid input passes and coords become numbers', () => { const r = U.validateLocation(good, D.DEMO_LOCATIONS); assert.ok(r.ok); assert.equal(r.clean.latitude, 26.76); });
await t('required fields', () => { const r = U.validateLocation({}, []); assert.ok(!r.ok); ['id','name','type','cameraId','cameraStatus','latitude','longitude'].forEach(k => assert.ok(r.errors[k], k)); });
await t('blank latitude is not treated as 0', () => assert.ok(U.validateLocation({ ...good, latitude: '  ' }, []).errors.latitude));
await t('coordinate ranges', () => {
  assert.ok(U.validateLocation({ ...good, latitude: '91' }, []).errors.latitude);
  assert.ok(U.validateLocation({ ...good, latitude: '-90.1' }, []).errors.latitude);
  assert.ok(U.validateLocation({ ...good, longitude: '180.5' }, []).errors.longitude);
  assert.ok(U.validateLocation({ ...good, longitude: 'abc' }, []).errors.longitude);
  assert.ok(U.validateLocation({ ...good, latitude: 'Infinity' }, []).errors.latitude);
  assert.ok(U.validateLocation({ ...good, latitude: '90', longitude: '-180' }, []).ok);
});
await t('duplicate ID (case-insensitive) and camera rejected; edit may keep own', () => {
  assert.ok(U.validateLocation({ ...good, id: 'loc-001' }, D.DEMO_LOCATIONS).errors.id);
  assert.ok(U.validateLocation({ ...good, cameraId: 'cam-01' }, D.DEMO_LOCATIONS).errors.cameraId);
  assert.ok(U.validateLocation({ ...D.DEMO_LOCATIONS[0] }, D.DEMO_LOCATIONS, 'LOC-001').ok);
});
await t('invalid ID pattern, long name/description, bad enums', () => {
  assert.ok(U.validateLocation({ ...good, id: 'a b' }, []).errors.id);
  assert.ok(U.validateLocation({ ...good, name: 'x'.repeat(81) }, []).errors.name);
  assert.ok(U.validateLocation({ ...good, description: 'x'.repeat(201) }, []).errors.description);
  assert.ok(U.validateLocation({ ...good, type: 'Moon' }, []).errors.type);
  assert.ok(U.validateLocation({ ...good, cameraStatus: 'maybe' }, []).errors.cameraStatus);
});
await t('nextLocationId skips used and handles empty', () => {
  assert.equal(U.nextLocationId([]), 'LOC-001');
  assert.equal(U.nextLocationId(D.DEMO_LOCATIONS), 'LOC-007');
  assert.equal(U.nextLocationId([{ id: 'LOC-009' }]), 'LOC-010');
});
await t('search by name / ID, status and type filters combine', () => {
  const L = D.DEMO_LOCATIONS;
  assert.equal(U.filterLocations(L, { query: 'bridge' }).length, 1);
  assert.equal(U.filterLocations(L, { query: 'loc-004' })[0].id, 'LOC-004');
  assert.equal(U.filterLocations(L, { status: 'offline' }).length, 2);
  assert.equal(U.filterLocations(L, { type: 'Highway' }).length, 2);
  assert.equal(U.filterLocations(L, { type: 'Highway', status: 'offline' }).length, 1);
  assert.equal(U.filterLocations(L, { query: 'zzz' }).length, 0);
});
await t('stats and demo incident count', () => {
  const links = [{ incidentId: 'X', locationId: 'LOC-003', status: 'active' }, { incidentId: 'Y', locationId: 'LOC-001', status: 'resolved' }];
  const ids = U.getActiveIncidentLocationIds(D.DEMO_LOCATIONS, links);
  assert.deepEqual(U.computeStats(D.DEMO_LOCATIONS, ids), { total: 6, online: 4, offline: 2, withActiveIncidents: 1 });
  assert.equal(U.getActiveIncidentLocationIds(D.DEMO_LOCATIONS.filter(l => l.id !== 'LOC-003'), links).size, 0);
});
await t('service: first list returns seed (not persisted until write)', async () => { assert.equal((await S.listLocations()).length, 6); assert.equal(store.size, 0); });
await t('service: create / persist / reload', async () => {
  const c = await S.createLocation(good); assert.equal(c.isDemo, false);
  assert.equal((await S.listLocations()).length, 7); assert.equal(JSON.parse([...store.values()][0]).length, 7);
});
await t('service: duplicate create throws ValidationError with fieldErrors', async () => {
  await assert.rejects(() => S.createLocation(good), e => e instanceof S.ValidationError && Boolean(e.fieldErrors.id));
});
await t('service: update keeps ID and isDemo, rejects bad coords', async () => {
  const u = await S.updateLocation('LOC-001', { ...D.DEMO_LOCATIONS[0], id: 'HACK', name: 'Renamed' });
  assert.equal(u.id, 'LOC-001'); assert.equal(u.name, 'Renamed'); assert.equal(u.isDemo, true);
  await assert.rejects(() => S.updateLocation('LOC-001', { ...D.DEMO_LOCATIONS[0], latitude: 200 }), S.ValidationError);
  await assert.rejects(() => S.updateLocation('NOPE', good));
});
await t('service: delete all persists an empty list (does not re-seed)', async () => {
  for (const l of await S.listLocations()) await S.deleteLocation(l.id);
  assert.equal((await S.listLocations()).length, 0);
});
await t('service: reset restores demo set', async () => { assert.equal((await S.resetDemoLocations()).length, 6); assert.equal((await S.listLocations()).length, 6); });
await t('service: corrupted JSON falls back safely; invalid records dropped', async () => {
  store.set('yoloAccidentAI.demo.locations.v1', '{bad');
  assert.ok((await S.listLocations()).length >= 0);
  store.set('yoloAccidentAI.demo.locations.v1', JSON.stringify([{ id: 1 }, null, D.DEMO_LOCATIONS[0]]));
  assert.equal((await S.listLocations()).length, 1);
});
console.log(`\n${n} passed`);
