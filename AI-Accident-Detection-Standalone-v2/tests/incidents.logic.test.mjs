import assert from 'node:assert/strict';
const store = new Map();
globalThis.window = { localStorage: { getItem: k => store.has(k) ? store.get(k) : null, setItem: (k, v) => store.set(k, v), removeItem: k => store.delete(k) } };
const U = await import(new URL('../src/utils/incidentUtils.js', import.meta.url));
const S = await import(new URL('../src/services/incidentsService.js', import.meta.url));
const D = await import(new URL('../src/data/incidentsDemoData.js', import.meta.url));
let n = 0; const t = (name, fn) => Promise.resolve(fn()).then(() => { n++; console.log('ok  ', name); }, e => { console.log('FAIL', name, '\n    ', e.message); process.exitCode = 1; });
const NOW = Date.parse('2026-10-24T12:00:00Z');
const seed = D.createDemoIncidents(NOW).map(U.normalizeIncident);
const F = U.DEFAULT_FILTERS;
const locs = new Map([['LOC-001', { name: 'Demo Highway Zone 1' }], ['LOC-003', { name: 'Demo Bridge Zone' }]]);

await t('seed: unique IDs, all valid, all flagged demo, no invented evidence', () => {
  assert.equal(new Set(seed.map(i => i.id)).size, seed.length);
  seed.forEach(i => { assert.ok(U.isIncidentRecord(i), i.id); assert.equal(i.isDemo, true); assert.equal(i.evidenceImageUrl, null); assert.equal(i.evidenceVideoUrl, null); });
});
await t('seed: timeline is consistent with status, resolved incidents have a resolved time', () => {
  seed.forEach(i => {
    const last = [...i.activity].reverse().find(a => a.type === 'status_change');
    assert.equal(last ? last.to : 'pending_review', i.status, i.id);
    assert.equal(Boolean(U.getResolvedAt(i)), i.status === 'resolved', i.id);
  });
});
await t('seed: probability, confidence and severity are independent fields', () => {
  const a = seed.find(i => i.id === 'INC-0003'); const b = seed.find(i => i.id === 'INC-0011');
  assert.ok(a.detectionConfidence > a.accidentProbability && a.severity === 'medium');
  assert.ok(b.severity === 'critical' && b.accidentProbability < 0.6);
});
await t('workflow transitions', () => {
  assert.ok(U.canTransition('pending_review', 'acknowledged'));
  assert.ok(U.canTransition('under_review', 'resolved'));
  assert.ok(U.canTransition('resolved', 'under_review'));
  assert.ok(!U.canTransition('pending_review', 'resolved'));
  assert.ok(!U.canTransition('resolved', 'acknowledged'));
  assert.ok(!U.canTransition('acknowledged', 'pending_review'));
  assert.deepEqual(U.actionsFor('resolved').map(a => [a.to, a.confirm, a.noteRequired]), [['under_review', true, true]]);
  assert.ok(U.actionsFor('under_review').every(a => a.confirm));
  assert.ok(U.actionsFor('pending_review').every(a => !a.confirm));
});
await t('note validation', () => {
  assert.ok(U.validateNote('', { required: true }));
  assert.equal(U.validateNote('', {}), null);
  assert.ok(U.validateNote('x'.repeat(501), {}));
  assert.equal(U.validateNote('ok', { required: true }), null);
});
await t('stats are derived from data', () => {
  const s = U.computeIncidentStats(seed);
  assert.equal(s.total, 12);
  assert.equal(s.critical, seed.filter(i => i.severity === 'critical').length);
  assert.equal(s.high, seed.filter(i => i.severity === 'high').length);
  assert.equal(s.pendingReview, seed.filter(i => i.status === 'pending_review').length);
  assert.equal(s.unresolved + s.resolved, s.total);
  const fewer = U.computeIncidentStats(seed.slice(0, 3));
  assert.equal(fewer.total, 3);
  assert.equal(U.computeIncidentStats([]).total, 0);
});
await t('search by incident ID, location name and camera ID', () => {
  assert.equal(U.filterIncidents(seed, { ...F, query: 'inc-0004' }, locs, NOW).length, 1);
  assert.ok(U.filterIncidents(seed, { ...F, query: 'bridge' }, locs, NOW).every(i => i.locationId === 'LOC-003'));
  assert.ok(U.filterIncidents(seed, { ...F, query: 'cam-01' }, locs, NOW).every(i => i.cameraId === 'CAM-01'));
  assert.equal(U.filterIncidents(seed, { ...F, query: 'zzz' }, locs, NOW).length, 0);
});
await t('severity / status / combined filters', () => {
  assert.ok(U.filterIncidents(seed, { ...F, severity: 'critical' }, locs, NOW).every(i => i.severity === 'critical'));
  assert.ok(U.filterIncidents(seed, { ...F, status: 'resolved', severity: 'low' }, locs, NOW).every(i => i.status === 'resolved' && i.severity === 'low'));
});
await t('date filters: presets and custom range', () => {
  assert.equal(U.filterIncidents(seed, { ...F, dateRange: '24h' }, locs, NOW).length, seed.filter(i => NOW - Date.parse(i.timestamp) <= 864e5).length);
  const d7 = U.filterIncidents(seed, { ...F, dateRange: '7d' }, locs, NOW).length;
  const d30 = U.filterIncidents(seed, { ...F, dateRange: '30d' }, locs, NOW).length;
  assert.ok(d7 < d30 && d30 <= 12);
  assert.ok(U.filterIncidents(seed, { ...F, dateRange: 'custom', from: '2999-01-01' }, locs, NOW).length === 0);
  assert.ok(U.isInvalidDateRange({ ...F, dateRange: 'custom', from: '2026-10-10', to: '2026-10-01' }));
  assert.equal(U.filterIncidents(seed, { ...F, dateRange: 'custom', from: '2026-10-10', to: '2026-10-01' }, locs, NOW).length, 0);
});
await t('active filter chips and their clear patches', () => {
  assert.equal(U.activeFilterList(F, locs).length, 0);
  const chips = U.activeFilterList({ ...F, query: 'x', severity: 'high', locationId: 'LOC-001' }, locs);
  assert.deepEqual(chips.map(c => c.key), ['query', 'severity', 'locationId']);
  assert.match(chips[2].label, /Demo Highway Zone 1/);
});
await t('sorting: time, severity, status, probability, location; stable and non-mutating', () => {
  const copy = [...seed];
  const byTime = U.sortIncidents(seed, 'time', 'desc', locs);
  assert.equal(byTime[0].id, 'INC-0001'); assert.equal(byTime.at(-1).id, 'INC-0012');
  assert.equal(U.sortIncidents(seed, 'time', 'asc', locs)[0].id, 'INC-0012');
  assert.equal(U.sortIncidents(seed, 'severity', 'desc', locs)[0].severity, 'critical');
  assert.equal(U.sortIncidents(seed, 'severity', 'asc', locs)[0].severity, 'low');
  assert.equal(U.sortIncidents(seed, 'status', 'asc', locs)[0].status, 'pending_review');
  assert.equal(U.sortIncidents(seed, 'probability', 'desc', locs)[0].id, 'INC-0001');
  assert.deepEqual(seed.map(i => i.id), copy.map(i => i.id));
  U.sortIncidents(seed, 'location', 'asc', locs); // missing location names must not throw
});
await t('evidence URL safety', () => {
  assert.ok(U.isSafeEvidenceUrl('https://example.com/a.jpg'));
  ['', null, undefined, 'javascript:alert(1)', 'data:text/html,x', 'file:///etc/passwd', 'not a url', '/relative.jpg'].forEach(u => assert.ok(!U.isSafeEvidenceUrl(u), String(u)));
});
await t('coordinates only when both valid', () => {
  assert.ok(U.hasCoordinates({ latitude: 26.7, longitude: 83.4 }));
  assert.ok(!U.hasCoordinates({ latitude: null, longitude: null }));
  assert.ok(!U.hasCoordinates({ latitude: 91, longitude: 0 }));
  assert.ok(!U.hasCoordinates({ latitude: 10 }));
});
await t('corrupt / partial stored records are rejected or normalized', () => {
  assert.ok(!U.isIncidentRecord({ id: 'x' }));
  assert.ok(!U.isIncidentRecord({ ...seed[0], severity: 'extreme' }));
  assert.ok(!U.isIncidentRecord({ ...seed[0], accidentProbability: 1.5 }));
  assert.ok(!U.isIncidentRecord({ ...seed[0], timestamp: 'nope' }));
  const { activity, ...noActivity } = seed[0];
  assert.deepEqual(U.normalizeIncident(noActivity).activity, []);
});
await t('service: first load returns demo set, nothing persisted yet', async () => { assert.equal((await S.listIncidents()).length, 12); assert.equal(store.size, 0); });
await t('service: acknowledge -> review -> resolve -> reopen, with timeline and persistence', async () => {
  let i = await S.changeIncidentStatus('INC-0002', 'acknowledged');
  assert.equal(i.status, 'acknowledged'); assert.equal(i.activity.at(-1).from, 'pending_review');
  i = await S.changeIncidentStatus('INC-0002', 'under_review', 'looking');
  i = await S.changeIncidentStatus('INC-0002', 'resolved', 'done');
  assert.equal(i.status, 'resolved'); assert.ok(U.getResolvedAt(i));
  const stored = (await S.listIncidents()).find(x => x.id === 'INC-0002');
  assert.equal(stored.status, 'resolved'); assert.equal(stored.activity.length, 1 + 3);
  await assert.rejects(() => S.changeIncidentStatus('INC-0002', 'under_review', ''), /note is required/);
  i = await S.changeIncidentStatus('INC-0002', 'under_review', 'new information');
  assert.equal(i.status, 'under_review'); assert.equal(U.getResolvedAt(i), null);
  assert.equal(new Set(i.activity.map(a => a.id)).size, i.activity.length);
});
await t('service: invalid transitions and unknown IDs rejected', async () => {
  await assert.rejects(() => S.changeIncidentStatus('INC-0001', 'resolved'), /cannot move/);
  await assert.rejects(() => S.changeIncidentStatus('INC-9999', 'acknowledged'), /no longer exists/);
  await assert.rejects(() => S.addIncidentNote('INC-9999', 'x'), /no longer exists/);
});
await t('service: notes validated, trimmed, recorded', async () => {
  await assert.rejects(() => S.addIncidentNote('INC-0001', '   '), /required/);
  await assert.rejects(() => S.addIncidentNote('INC-0001', 'x'.repeat(501)), /500/);
  const i = await S.addIncidentNote('INC-0001', '  checked  ');
  assert.deepEqual([i.activity.at(-1).type, i.activity.at(-1).note, i.status], ['note', 'checked', 'pending_review']);
});
await t('service: HTML in notes stays plain text data', async () => {
  const i = await S.addIncidentNote('INC-0003', '<img src=x onerror=alert(1)>');
  assert.equal(i.activity.at(-1).note, '<img src=x onerror=alert(1)>');
});
await t('service: corrupted storage falls back; reset restores demo data', async () => {
  store.set('yoloAccidentAI.demo.incidents.v1', '{bad');
  assert.equal((await S.listIncidents()).length, 12);
  await S.changeIncidentStatus('INC-0001', 'acknowledged');
  const fresh = await S.resetDemoIncidents();
  assert.equal(fresh.find(i => i.id === 'INC-0001').status, 'pending_review');
});
console.log(`\n${n} passed`);
