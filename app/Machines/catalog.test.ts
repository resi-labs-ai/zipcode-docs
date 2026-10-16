import assert from 'node:assert/strict'
import test from 'node:test'
import {
  DEFAULT_FILTERS,
  MACHINES,
  MAX_SEARCH_LENGTH,
  MAX_SELECTION,
  buildQuery,
  filterMachines,
  findMachine,
  gpuCounts,
  parseFilters,
  platformClass,
  selectionSummary,
  type MachineConfiguration,
  type MachineFilters,
} from './catalog'

// Synthetic fixtures exercise behavior; these are never part of the public catalog.
function fixture(id: string, fields: Partial<MachineConfiguration> = {}): MachineConfiguration {
  return {
    id,
    name: id,
    platform: 'Platform A',
    formFactor: 'rack',
    gpuModel: 'Test accelerator',
    gpuCount: 8,
    vramPerGpuGB: 80,
    memoryType: 'Test memory',
    cpu: null,
    systemMemory: null,
    storage: null,
    networking: null,
    power: null,
    workloads: ['Training'],
    gpuIncluded: 'Confirm configuration',
    availability: 'Confirm availability',
    notes: [],
    price: 'request-quote',
    ...fields,
  }
}

function filters(fields: Partial<MachineFilters> = {}): MachineFilters {
  return { ...DEFAULT_FILTERS, selectedIds: [], ...fields }
}

test('empty and adversarial query values normalize to safe defaults', () => {
  assert.deepEqual(parseFilters(new URLSearchParams(), []), filters())
  const params = new URLSearchParams({
    platform: '<script>alert(1)</script>',
    form: 'javascript:alert(1)',
    memory: 'Infinity',
    workload: '__proto__',
    sort: 'constructor',
    select: '../../secret,not-a-configuration',
    private: 'discard-me',
  })
  assert.deepEqual(parseFilters(params, []), filters())
  for (const value of ['-1', '1e3', '2.5', '0x80', 'NaN', '16385', '999999999', ' 80 ', '']) {
    assert.equal(parseFilters(new URLSearchParams({ memory: value })).minMemoryGB, 0, value)
  }
})

test('search is bounded, single-line, and never interpreted as HTML', () => {
  const parsed = parseFilters(new URLSearchParams({ q: `  \u0000Alpha\n\u202e Beta ${'x'.repeat(200)}` }))
  assert.equal(parsed.search.length, MAX_SEARCH_LENGTH)
  assert.ok(parsed.search.startsWith('Alpha Beta '))
  assert.doesNotMatch(parsed.search, /[\n\u0000\u202e]/)
  const attack = '<img src=x onerror=alert(1)>'
  const safeQuery = buildQuery(filters({ search: attack })).toString()
  assert.ok(safeQuery.includes('%3Cimg'))
  assert.ok(!safeQuery.includes('<img'))
  assert.deepEqual(filterMachines([fixture('a')], filters({ search: attack })), [])
})

test('selection accepts only real IDs, deduplicates, and stays bounded', () => {
  const items = Array.from({ length: MAX_SELECTION + 4 }, (_, index) => fixture(`item-${index}`))
  const parsed = parseFilters(new URLSearchParams({ select: `unknown,${items.map((item) => item.id).join(',')},item-0` }), items)
  assert.equal(parsed.selectedIds.length, MAX_SELECTION)
  assert.deepEqual(parsed.selectedIds, items.slice(0, MAX_SELECTION).map((item) => item.id))
  assert.deepEqual(parseFilters(new URLSearchParams('select=item-0&select=item-1'), items).selectedIds, ['item-0'])
  assert.deepEqual(parseFilters(new URLSearchParams({ select: 'item-0' }), []).selectedIds, [])
})

test('canonical URLs round trip supported filters and drop defaults and unknown metadata', () => {
  const items = [fixture('alpha'), fixture('beta', { platform: 'Platform B' })]
  const expected = filters({ search: 'Test accelerator', platform: 'Platform B', formFactor: 'rack', minMemoryGB: 80, workload: 'Training', sort: 'memory', selectedIds: ['beta', 'alpha'] })
  assert.deepEqual(parseFilters(buildQuery(expected, items), items), expected)
  assert.equal(buildQuery(filters(), items).toString(), '')
  assert.equal(parseFilters(new URLSearchParams('sort=catalog'), items).sort, 'catalog')
  assert.equal(buildQuery(filters({ sort: 'name' }), items).get('sort'), 'name')
  const contaminated = { ...expected, privateOrigin: 'not-exported', selectedIds: ['beta', 'bad', 'beta'] }
  const query = buildQuery(contaminated, items)
  assert.equal(query.get('select'), 'beta')
  assert.equal(query.has('privateOrigin'), false)
  assert.equal(query.has('price'), false)
})

test('all active filters combine and unknown per-GPU memory never meets a threshold', () => {
  const items = [
    fixture('alpha', { cpu: 'Example CPU', vramPerGpuGB: 192 }),
    fixture('beta', { formFactor: 'tower', workloads: ['Development'] }),
    fixture('gamma', { vramPerGpuGB: null, gpuMemoryLabel: 'Large aggregate memory' }),
  ]
  assert.deepEqual(filterMachines(items, filters({ search: 'EXAMPLE accelerator', platform: 'Platform A', formFactor: 'rack', workload: 'Training', minMemoryGB: 100 })).map((item) => item.id), ['alpha'])
  assert.equal(filterMachines(items, filters({ search: 'no matching configuration' })).length, 0)
  assert.equal(filterMachines(items, filters()).length, 3)
})

test('catalog order preserves source ordering before and after filtering', () => {
  const items = [fixture('zulu'), fixture('alpha', { formFactor: 'tower' }), fixture('middle')]
  assert.deepEqual(filterMachines(items, filters()).map((item) => item.id), ['zulu', 'alpha', 'middle'])
  assert.deepEqual(filterMachines(items, filters({ formFactor: 'rack' })).map((item) => item.id), ['zulu', 'middle'])
  assert.deepEqual(filterMachines(MACHINES, filters()).map((item) => item.id), MACHINES.map((item) => item.id))
})

test('sorting is descending for GPU count and per-GPU memory, unknown last, and stable on ties', () => {
  const items = [
    fixture('unknown-a', { gpuCount: null, vramPerGpuGB: null }),
    fixture('known-a', { gpuCount: 4, vramPerGpuGB: 80 }),
    fixture('unknown-b', { gpuCount: null, vramPerGpuGB: null }),
    fixture('known-b', { gpuCount: 4, vramPerGpuGB: 80 }),
    fixture('largest', { gpuCount: 8, vramPerGpuGB: 192 }),
  ]
  const originalIds = items.map((item) => item.id)
  for (const sort of ['gpu-count', 'memory'] as const) {
    assert.deepEqual(filterMachines(items, filters({ sort })).map((item) => item.id), ['largest', 'known-a', 'known-b', 'unknown-a', 'unknown-b'])
  }
  assert.deepEqual(items.map((item) => item.id), originalIds)
  const names = [fixture('second', { name: 'Machine 10' }), fixture('first', { name: 'Machine 2' }), fixture('same', { name: 'machine 2' })]
  assert.deepEqual(filterMachines(names, filters({ sort: 'name' })).map((item) => item.id), ['first', 'same', 'second'])
})

test('non-finite or non-positive numeric facts do not outrank known specifications', () => {
  const items = [fixture('nan', { gpuCount: NaN, vramPerGpuGB: Infinity }), fixture('zero', { gpuCount: 0, vramPerGpuGB: 0 }), fixture('known')]
  for (const sort of ['gpu-count', 'memory'] as const) {
    assert.deepEqual(filterMachines(items, filters({ sort })).map((item) => item.id), ['known', 'nan', 'zero'])
  }
  assert.deepEqual(filterMachines(items, filters({ minMemoryGB: 1 })).map((item) => item.id), ['known'])
})

test('selection summary includes public caveats and never serializes private metadata', () => {
  const item = Object.assign(fixture('internal-id-not-for-export', {
    name: 'Reviewed configuration',
    notes: ['Final configuration revision is pending.', 'Installed capacity requires confirmation.'],
    gpuCount: 1,
    vramPerGpuGB: null,
    gpuMemoryLabel: 'Aggregate memory only',
    extraGpu: 'Separate display GPU',
    reviewStatus: 'Revision pending',
  }), {
    source: 'PRIVATE-ORIGIN-MARKER',
    contact: 'PRIVATE-CONTACT-MARKER',
    wholesalePrice: 'PRIVATE-PRICE-MARKER',
    bankDetails: 'PRIVATE-BANK-MARKER',
    privateNotes: ['PRIVATE-NOTE-MARKER'],
  })
  const summary = selectionSummary([item])
  assert.ok(summary.startsWith('# Zipcode machine selection'))
  assert.ok(summary.includes('1 × Test accelerator'))
  assert.ok(summary.includes('Aggregate memory only'))
  assert.ok(summary.includes('Separate display GPU'))
  assert.ok(summary.includes('Revision pending'))
  assert.ok(summary.includes('Pricing: Request quote'))
  assert.ok(summary.includes('Availability: Confirm availability'))
  assert.ok(summary.includes('Note: Final configuration revision is pending\\.'))
  assert.ok(summary.includes('Note: Installed capacity requires confirmation\\.'))
  assert.doesNotMatch(summary, /PRIVATE-|internal-id-not-for-export|undefined|NaN/)
})

test('exported Markdown escapes HTML, links, formatting, and line injection', () => {
  const summary = selectionSummary([fixture('escaped', {
    name: '<img src=x onerror=alert(1)>\n# forged heading',
    cpu: '[click](javascript:alert(1))',
    storage: '`raw` & <script>bad</script>',
    notes: ['<script>note()</script>\n# forged note', '[note link](javascript:alert(1))'],
  })])
  assert.ok(summary.includes('&lt;img'))
  assert.ok(summary.includes('\\[click\\]\\(javascript:alert\\(1\\)\\)'))
  assert.ok(summary.includes('\\`raw\\` &amp; &lt;script&gt;'))
  assert.ok(!summary.includes('<script>'))
  assert.ok(!summary.includes('\n# forged heading'))
  assert.ok(summary.includes('Note: &lt;script&gt;note\\(\\)&lt;/script&gt; \\# forged note'))
  assert.ok(summary.includes('Note: \\[note link\\]\\(javascript:alert\\(1\\)\\)'))
  assert.ok(!summary.includes('\n# forged note'))
})

test('empty and oversized export selections remain explicit, deduplicated and bounded', () => {
  assert.ok(selectionSummary([]).includes('No configurations selected.'))
  const items = Array.from({ length: MAX_SELECTION + 5 }, (_, index) => fixture(`item-${index}`))
  const summary = selectionSummary([items[0], items[0], ...items])
  assert.equal(summary.match(/^## /gm)?.length, MAX_SELECTION)
  assert.equal(summary.match(/^## item\\-0$/gm)?.length, 1)
})

test('reviewed catalog IDs are unique and pricing/availability remain non-binding', () => {
  assert.equal(new Set(MACHINES.map((item) => item.id)).size, MACHINES.length)
  for (const item of MACHINES) {
    assert.match(item.id, /^[a-z0-9][a-z0-9-]{0,63}$/)
    assert.equal(item.price, 'request-quote')
    assert.equal(item.availability, 'Confirm availability')
    assert.ok(item.gpuCount === null || (Number.isInteger(item.gpuCount) && item.gpuCount > 0))
    assert.ok(item.vramPerGpuGB === null || (Number.isFinite(item.vramPerGpuGB) && item.vramPerGpuGB > 0))
  }
})

test('GPU-count filter accepts only counts present in the catalog and round trips', () => {
  const items = [fixture('one', { gpuCount: 1 }), fixture('eight', { gpuCount: 8 }), fixture('unknown', { gpuCount: null })]
  assert.deepEqual(gpuCounts(items), [1, 8])
  assert.equal(parseFilters(new URLSearchParams('gpus=8'), items).gpuCount, 8)
  for (const bad of ['3', '-8', '8.0', 'eight', '99999', '']) assert.equal(parseFilters(new URLSearchParams({ gpus: bad }), items).gpuCount, 0)
  const filters: MachineFilters = { ...DEFAULT_FILTERS, gpuCount: 8 }
  assert.deepEqual(filterMachines(items, filters).map((item) => item.id), ['eight'])
  assert.equal(buildQuery(filters, items).toString(), 'gpus=8')
  assert.equal(buildQuery(DEFAULT_FILTERS, items).toString(), '')
})

test('product classes keep HGX, DGX and PCIe distinct and never brand hardware as Zipcode', () => {
  const classes = MACHINES.map(platformClass)
  for (const item of MACHINES) {
    assert.match(item.name, /^NVIDIA /)
    assert.doesNotMatch(platformClass(item), /zipcode/i)
    if (item.platform === 'HGX') assert.equal(platformClass(item), 'NVIDIA HGX platform server')
    if (item.platform === 'DGX') assert.match(item.name, /DGX/)
    if (item.platform !== 'DGX') assert.doesNotMatch(item.name, /DGX/)
  }
  assert.ok(classes.includes('NVIDIA DGX system'))
})

test('detail lookup resolves only reviewed IDs and the comparison stays small', () => {
  assert.equal(findMachine('hgx-b300')?.name, 'NVIDIA HGX B300')
  for (const bad of ['', 'HGX-B300', '../hgx-b300', 'hgx-b300 ', 'constructor', '__proto__']) assert.equal(findMachine(bad), undefined)
  assert.equal(MAX_SELECTION, 4)
  assert.equal(parseFilters(new URLSearchParams({ select: MACHINES.map((item) => item.id).join(',') })).selectedIds.length, 4)
})
