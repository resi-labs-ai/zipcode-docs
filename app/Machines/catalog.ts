import { MACHINE_DATA } from './catalog-data'

export type Workload = 'Training' | 'Inference' | 'Development'
export type FormFactor = 'rack' | 'tower' | 'unknown'
export type MachineSort = 'catalog' | 'name' | 'gpu-count' | 'memory'

/** Public configuration facts only. Never add sourcing, pricing or contact metadata. */
export interface MachineConfiguration {
  id: string
  name: string
  platform: string
  formFactor: FormFactor
  gpuModel: string
  /** Primary accelerator count; additional display GPUs belong in extraGpu. */
  gpuCount: number | null
  /** Per-primary-GPU memory, never inferred from aggregate system memory. */
  vramPerGpuGB: number | null
  memoryType: string | null
  cpu: string | null
  systemMemory: string | null
  storage: string | null
  networking: string | null
  power: string | null
  workloads: Workload[]
  gpuIncluded: 'Included' | 'Confirm configuration' | 'Unknown'
  availability: 'Confirm availability'
  /** Curated public configuration caveats; included in selection exports. */
  notes: string[]
  price: 'request-quote'
  gpuMemoryLabel?: string
  extraGpu?: string | null
  formLabel?: string
  reviewStatus?: 'Reviewed configuration' | 'Details pending' | 'Revision pending'
}

export const MACHINES: MachineConfiguration[] = MACHINE_DATA

export interface MachineFilters {
  search: string
  platform: string
  formFactor: FormFactor | ''
  minMemoryGB: number
  /** Exact primary-GPU count; 0 means any. Only counts present in the catalog are accepted. */
  gpuCount: number
  workload: Workload | ''
  sort: MachineSort
  selectedIds: string[]
}

/** Side-by-side comparison stays readable with a few systems. */
export const MAX_SELECTION = 4
export const MAX_SEARCH_LENGTH = 100
export const WORKLOADS: readonly Workload[] = ['Training', 'Inference', 'Development']
export const DEFAULT_FILTERS: MachineFilters = {
  search: '',
  platform: '',
  formFactor: '',
  minMemoryGB: 0,
  gpuCount: 0,
  workload: '',
  sort: 'catalog',
  selectedIds: [],
}

const FORMS: readonly FormFactor[] = ['rack', 'tower', 'unknown']
const SORTS: readonly MachineSort[] = ['catalog', 'name', 'gpu-count', 'memory']
const nameCollator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })

function singleLine(value: string, maxLength: number): string {
  return value
    .normalize('NFKC')
    .replace(/[\u0000-\u001f\u007f-\u009f\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

function allowedValue<T extends string>(value: string | null, values: readonly T[], fallback: T): T {
  return values.find((candidate) => candidate === value) ?? fallback
}

function selectedIds(value: string, items: readonly MachineConfiguration[]): string[] {
  const allowed = new Set(items.map((item) => item.id))
  return [...new Set(value.slice(0, 8192).split(',').filter((id) => allowed.has(id)))].slice(0, MAX_SELECTION)
}

/** Read only supported, bounded URL values. Unknown IDs and query keys are discarded. */
export function parseFilters(params: URLSearchParams, items: readonly MachineConfiguration[] = MACHINES): MachineFilters {
  const memoryValue = params.get('memory') ?? ''
  const memoryNumber = /^\d{1,5}$/.test(memoryValue) ? Number(memoryValue) : 0
  const platform = params.get('platform') ?? ''
  const gpusValue = params.get('gpus') ?? ''
  const gpuCount = /^\d{1,3}$/.test(gpusValue) && gpuCounts(items).includes(Number(gpusValue)) ? Number(gpusValue) : 0
  return {
    search: singleLine(params.get('q') ?? '', MAX_SEARCH_LENGTH),
    platform: items.some((item) => item.platform === platform) ? platform : '',
    formFactor: allowedValue(params.get('form'), [...FORMS, ''], ''),
    minMemoryGB: memoryNumber <= 16384 ? memoryNumber : 0,
    gpuCount,
    workload: allowedValue(params.get('workload'), [...WORKLOADS, ''], ''),
    sort: allowedValue(params.get('sort'), SORTS, 'catalog'),
    selectedIds: selectedIds(params.get('select') ?? '', items),
  }
}

/** Canonical URL parameters contain public filter values and public configuration IDs only. */
export function buildQuery(filters: MachineFilters, items: readonly MachineConfiguration[] = MACHINES): URLSearchParams {
  const candidate = new URLSearchParams({
    q: filters.search,
    platform: filters.platform,
    form: filters.formFactor,
    memory: String(filters.minMemoryGB),
    gpus: String(filters.gpuCount),
    workload: filters.workload,
    sort: filters.sort,
    select: filters.selectedIds.join(','),
  })
  const safe = parseFilters(candidate, items)
  const params = new URLSearchParams()
  if (safe.search) params.set('q', safe.search)
  if (safe.platform) params.set('platform', safe.platform)
  if (safe.formFactor) params.set('form', safe.formFactor)
  if (safe.minMemoryGB) params.set('memory', String(safe.minMemoryGB))
  if (safe.gpuCount) params.set('gpus', String(safe.gpuCount))
  if (safe.workload) params.set('workload', safe.workload)
  if (safe.sort !== 'catalog') params.set('sort', safe.sort)
  if (safe.selectedIds.length) params.set('select', safe.selectedIds.join(','))
  return params
}

/** Distinct confirmed primary-GPU counts, ascending — the GPU-count filter options. */
export function gpuCounts(items: readonly MachineConfiguration[] = MACHINES): number[] {
  return [...new Set(items.map((item) => item.gpuCount).filter((n): n is number => n !== null && Number.isInteger(n) && n > 0))].sort((a, b) => a - b)
}

const PLATFORM_CLASS: Record<string, string> = {
  HGX: 'NVIDIA HGX platform server',
  DGX: 'NVIDIA DGX system',
  PCIe: 'PCIe GPU server',
  'Grace Blackwell': 'Grace Blackwell workstation',
}

/** Product class for display. HGX servers, DGX systems and PCIe servers are different classes. */
export function platformClass(item: MachineConfiguration): string {
  return PLATFORM_CLASS[item.platform] ?? item.platform
}

export function findMachine(id: string, items: readonly MachineConfiguration[] = MACHINES): MachineConfiguration | undefined {
  return items.find((item) => item.id === id)
}

function compareKnownDescending(a: number | null, b: number | null): number {
  const knownA = a !== null && Number.isFinite(a) && a > 0
  const knownB = b !== null && Number.isFinite(b) && b > 0
  if (!knownA) return knownB ? 1 : 0
  if (!knownB) return -1
  return b! - a!
}

/** Searches reviewed public specs only; leaves the source array and stable ties untouched. */
export function filterMachines(items: readonly MachineConfiguration[], filters: MachineFilters): MachineConfiguration[] {
  const terms = singleLine(filters.search, MAX_SEARCH_LENGTH).toLocaleLowerCase('en').split(' ').filter(Boolean)
  return items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => {
      if (filters.platform && item.platform !== filters.platform) return false
      if (filters.formFactor && item.formFactor !== filters.formFactor) return false
      if (filters.workload && !item.workloads.includes(filters.workload)) return false
      if (filters.gpuCount > 0 && item.gpuCount !== filters.gpuCount) return false
      if (filters.minMemoryGB > 0 && (item.vramPerGpuGB === null || !Number.isFinite(item.vramPerGpuGB) || item.vramPerGpuGB < filters.minMemoryGB)) return false
      const searchable = [item.name, item.platform, item.formFactor, item.formLabel, item.gpuModel, item.extraGpu, item.memoryType, item.cpu, item.systemMemory, item.storage, item.networking, ...item.workloads].filter(Boolean).join(' ').normalize('NFKC').toLocaleLowerCase('en')
      return terms.every((term) => searchable.includes(term))
    })
    .sort((a, b) => {
      const comparison = filters.sort === 'gpu-count'
        ? compareKnownDescending(a.item.gpuCount, b.item.gpuCount)
        : filters.sort === 'memory'
          ? compareKnownDescending(a.item.vramPerGpuGB, b.item.vramPerGpuGB)
          : filters.sort === 'name'
            ? nameCollator.compare(a.item.name, b.item.name)
            : 0
      return comparison || a.index - b.index
    })
    .map(({ item }) => item)
}

/** Escape text even when the downloaded Markdown is later opened in an HTML renderer. */
function markdown(value: string | null | undefined): string {
  if (!value) return 'To be confirmed'
  return singleLine(value, 500)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/[\\`*_{}\[\]()#+.!|~-]/g, '\\$&')
}

function knownNumber(value: number | null): number | null {
  return value !== null && Number.isFinite(value) && value > 0 ? value : null
}

/** Explicit field allowlist: no raw object serialization, provenance, contacts, or private pricing. */
export function selectionSummary(items: readonly MachineConfiguration[]): string {
  const seen = new Set<string>()
  const selected = items.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  }).slice(0, MAX_SELECTION)
  const introduction = '# Zipcode machine selection\n\nConfiguration comparison for discussion. This selection is not an order or a commitment. Pricing, availability, shipping, tax and final specifications require confirmation.\n\n'
  if (!selected.length) return `${introduction}No configurations selected.\n`
  return introduction + selected.map((item) => {
    const count = knownNumber(item.gpuCount)
    const memory = knownNumber(item.vramPerGpuGB)
    return [
      `## ${markdown(item.name)}`,
      '',
      `- Platform: ${markdown(item.platform)}`,
      `- Form factor: ${markdown(item.formLabel || (item.formFactor === 'unknown' ? null : item.formFactor))}`,
      `- Primary GPUs: ${count === null ? 'Count to be confirmed' : `${count} ×`} ${markdown(item.gpuModel)}`,
      ...(item.extraGpu ? [`- Additional GPU: ${markdown(item.extraGpu)}`] : []),
      `- GPU memory: ${memory === null ? markdown(item.gpuMemoryLabel) : `${memory} GB per primary GPU${item.memoryType ? ` · ${markdown(item.memoryType)}` : ''}`}`,
      `- GPU inclusion: ${markdown(item.gpuIncluded)}`,
      `- CPU: ${markdown(item.cpu)}`,
      `- System memory: ${markdown(item.systemMemory)}`,
      `- Storage: ${markdown(item.storage)}`,
      `- Networking: ${markdown(item.networking)}`,
      `- Power: ${markdown(item.power)}`,
      `- Workloads to evaluate: ${markdown(item.workloads.filter((workload) => WORKLOADS.includes(workload)).join(', '))}`,
      '- Pricing: Request quote',
      '- Availability: Confirm availability',
      '- Shipping and tax: To be confirmed',
      ...(item.reviewStatus ? [`- Configuration review: ${markdown(item.reviewStatus)}`] : []),
      ...item.notes.filter((note) => note.trim()).map((note) => `- Note: ${markdown(note)}`),
    ].join('\n')
  }).join('\n\n') + '\n'
}
