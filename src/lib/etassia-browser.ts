// Browser loader for the vendored etassia WebAssembly engine (public/etassia.wasm).
//
// The module is the same unprocessed build the npm package ships: plain C-ABI
// exports over linear memory (etassia_alloc / etassia_render / etassia_detect /
// etassia_result_ptr / etassia_result_len), no wasm-bindgen glue. The host
// copies the UTF-8 source into linear memory, calls the export, and reads the
// result back. Status 0 means the result buffer holds SVG or a type name;
// status 1 means it holds a JSON error object whose class "Unported" signals
// that the caller should route to the reference Ruby implementation.

export class UnportedError extends Error {
  override name = 'UnportedError'
}

export class EtassiaError extends Error {
  constructor(
    message: string,
    readonly errorClass: string,
    readonly line: number,
    readonly col: number,
  ) {
    super(message)
    this.name = 'EtassiaError'
  }
}

interface Exports {
  memory: WebAssembly.Memory
  etassia_alloc(len: number): number
  etassia_dealloc(ptr: number, len: number): void
  etassia_render(ptr: number, len: number): number
  etassia_detect(ptr: number, len: number): number
  etassia_result_ptr(): number
  etassia_result_len(): number
}

let memory: WebAssembly.Memory | undefined

// The engine keeps wasm-bindgen import stubs inherited from its parsanol
// dependency (getrandom hash seeding). In this unprocessed module
// getRandomValues receives a plain (ptr, len) pair into linear memory, so it
// is filled here; every other stub is unreachable on the render path and
// throws if called.
const imports: WebAssembly.Imports = new Proxy(
  {},
  {
    get: (_t, mod: string) =>
      new Proxy(
        {},
        {
          get: (_u, name: string) => {
            if (name.startsWith('__wbg_getRandomValues_')) {
              return (ptr: number, len: number) => {
                globalThis.crypto.getRandomValues(new Uint8Array(memory!.buffer, ptr, len))
              }
            }
            return () => {
              throw new Error(`unexpected wasm import ${mod}.${name}`)
            }
          },
        },
      ),
  },
) as WebAssembly.Imports

let instance: Exports | undefined

export async function loadEngine(url = '/etassia.wasm'): Promise<void> {
  if (instance) return
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`cannot fetch the etassia engine at ${url}: HTTP ${response.status}`)
  }
  // Streaming compilation starts translating while the 8 MB module is still
  // in flight; the non-streaming path remains for servers without the
  // application/wasm content type.
  const { instance: instantiated } =
    response.headers.get('content-type')?.includes('application/wasm')
      ? await WebAssembly.instantiateStreaming(response, imports)
      : await WebAssembly.instantiate(await response.arrayBuffer(), imports)
  instance = instantiated.exports as unknown as Exports
  memory = instance.memory
}

function call(fn: 'etassia_render' | 'etassia_detect', source: string): string {
  if (!instance) throw new Error('the etassia engine is not loaded; call loadEngine() first')
  const w = instance
  const bytes = new TextEncoder().encode(source)
  const ptr = w.etassia_alloc(bytes.length)
  new Uint8Array(w.memory.buffer, ptr, bytes.length).set(bytes)
  let status: number
  try {
    status = w[fn](ptr, bytes.length)
  } finally {
    w.etassia_dealloc(ptr, bytes.length)
  }
  const out = new TextDecoder().decode(
    new Uint8Array(w.memory.buffer, w.etassia_result_ptr(), w.etassia_result_len()),
  )
  if (status === 0) return out
  const e = JSON.parse(out) as { class: string; message: string; line: number; col: number }
  if (e.class === 'Unported') throw new UnportedError(e.message)
  throw new EtassiaError(e.message, e.class, e.line, e.col)
}

/** Render a Mermaid diagram source to SVG through the Rust engine. */
export function render(source: string): string {
  return call('etassia_render', source)
}

/** Return the detected diagram type name of the source. */
export function detect(source: string): string {
  return call('etassia_detect', source)
}
