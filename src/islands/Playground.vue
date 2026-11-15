<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue'
import { basicSetup, EditorView } from 'codemirror'
import { detect, EtassiaError, loadEngine, render, UnportedError } from '../lib/etassia-browser'

interface Preset {
  id: string
  name: string
  source: string
}

const presets: Preset[] = [
  {
    id: 'flowchart',
    name: 'Flowchart',
    source: `graph LR
  A[Hard] -->|Text| B(Round)
  B --> C{Decision}
  C -->|One| D[Result 1]
  C -->|Two| E[Result 2]`,
  },
  {
    id: 'sequence',
    name: 'Sequence diagram',
    source: `sequenceDiagram
  participant Alice
  actor Bob
  Alice ()->>() Bob: To actor
  Bob ()-->> Alice: Back to Bob`,
  },
  {
    id: 'pie',
    name: 'Pie chart',
    source: `pie title Pets adopted by volunteers
  "Dogs" : 386
  "Cats" : 85
  "Rats" : 15`,
  },
  {
    id: 'gantt',
    name: 'Gantt chart',
    source: `gantt
  dateFormat  YYYY-MM-DD
  axisFormat  %d/%m
  title Adding a Gantt diagram
  section A section
  Completed task :done, des1, 2014-01-06, 2014-01-08
  Active task    :active, des2, 2014-01-09, 3d
  Future task    :des3, after des2, 5d`,
  },
  {
    id: 'sankey',
    name: 'Sankey (Unported)',
    source: `sankey-beta

A,B
1,2`,
  },
]

const editorHost = ref<HTMLElement | null>(null)
const output = ref<string>('')
const typeName = ref<string>('')
const renderMs = ref<number | null>(null)
const errorText = ref<string>('')
const errorKind = ref<'none' | 'unported' | 'error'>('none')
const engineState = ref<'loading' | 'ready' | 'failed'>('loading')
const current = ref<Preset>(presets[0])
const view = shallowRef<EditorView | null>(null)
let timer: ReturnType<typeof setTimeout> | null = null

async function renderNow(source: string): Promise<void> {
  errorText.value = ''
  errorKind.value = 'none'
  const started = performance.now()
  try {
    output.value = render(source)
    typeName.value = detect(source)
    renderMs.value = Math.round(performance.now() - started)
  } catch (e) {
    output.value = ''
    typeName.value = ''
    renderMs.value = null
    if (e instanceof UnportedError) {
      errorKind.value = 'unported'
      errorText.value =
        'The engine has no native renderer for this diagram type. The runtime bindings translate this condition into a fallback call to the reference Ruby implementation, which the playground does not embed.'
    } else if (e instanceof EtassiaError) {
      errorKind.value = 'error'
      const at = e.line > 0 ? ` at line ${e.line}, column ${e.col}` : ''
      errorText.value = `${e.errorClass}${at}: ${e.message}`
    } else {
      errorKind.value = 'error'
      errorText.value = e instanceof Error ? e.message : String(e)
    }
  }
}

function onInput(source: string): void {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => void renderNow(source), 250)
}

async function selectPreset(preset: Preset): Promise<void> {
  current.value = preset
  const v = view.value
  if (v) {
    v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: preset.source } })
  }
  await renderNow(preset.source)
}

onMounted(async () => {
  try {
    await loadEngine()
    engineState.value = 'ready'
  } catch (e) {
    engineState.value = 'failed'
    errorKind.value = 'error'
    errorText.value = e instanceof Error ? e.message : String(e)
    return
  }
  if (editorHost.value) {
    const v = new EditorView({
      doc: current.value.source,
      extensions: [
        basicSetup,
        EditorView.lineWrapping,
        EditorView.theme({
          '&': { backgroundColor: 'transparent', fontSize: '0.8125rem' },
          '.cm-gutters': { backgroundColor: 'transparent', border: 'none', color: 'inherit', opacity: 0.55 },
          '.cm-activeLine': { backgroundColor: 'transparent' },
          '.cm-activeLineGutter': { backgroundColor: 'transparent' },
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) onInput(update.state.doc.toString())
        }),
      ],
      parent: editorHost.value,
    })
    v.dom.setAttribute('aria-label', 'Diagram source editor')
    view.value = v
  }
  await renderNow(current.value.source)
})
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center gap-2 mb-5" role="group" aria-label="Preset diagrams">
      <button
        v-for="preset in presets"
        :key="preset.id"
        type="button"
        class="btn text-sm px-3 py-1.5"
        :class="current.id === preset.id ? 'btn-primary' : 'btn-secondary'"
        :aria-pressed="current.id === preset.id"
        @click="selectPreset(preset)"
      >
        {{ preset.name }}
      </button>
    </div>

    <!-- The status line is announced to assistive technology as the engine works. -->
    <p class="sr-only" role="status" aria-live="polite">
      <span v-if="engineState === 'loading'">The engine is loading.</span>
      <span v-else-if="engineState === 'failed'">The engine failed to load.</span>
      <span v-else-if="typeName">The engine rendered the diagram. The detected type is {{ typeName }}.</span>
    </p>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <section class="plate min-w-0" aria-label="Diagram source">
        <div class="title-block !border-t-0 !border-b border-rule dark:border-rule-dark">
          <span class="field"><span class="block-label">Diagram source</span><span class="hash-label">Mermaid text</span></span>
          <span class="field ml-auto">
            <span v-if="engineState === 'loading'" class="hash-label">the engine is loading</span>
            <span v-else-if="engineState === 'ready' && typeName" class="hash-label">
              detected: <strong class="text-pen dark:text-pen-dark font-semibold">{{ typeName }}</strong>
            </span>
            <span v-else-if="engineState === 'failed'" class="hash-label text-ochre dark:text-ochre-dark">the engine failed to load</span>
          </span>
        </div>
        <div
          ref="editorHost"
          class="px-3 py-2 min-h-[22rem] bg-sheet dark:bg-sheet-dark text-ink dark:text-ink-dark"
        ></div>
        <p class="px-4 py-2 text-xs border-t border-rule dark:border-rule-dark text-graphite dark:text-graphite-dark">
          The output re-renders 250 ms after the last keystroke.
        </p>
      </section>

      <section class="min-w-0" aria-label="SVG output">
        <div v-if="output" class="plate" data-testid="playground-output">
          <div class="plate-canvas">
            <!-- The SVG string is produced entirely by the Rust engine over the wasm boundary. -->
            <div v-html="output"></div>
          </div>
          <div class="title-block">
            <span class="field"><span class="block-label">Type</span><span class="text-sm font-medium">{{ typeName }}</span></span>
            <span v-if="renderMs !== null" class="field"><span class="block-label">Render</span><span class="hash-label">{{ renderMs }} ms</span></span>
            <span class="field"><span class="stamp stamp-native">Native</span></span>
          </div>
        </div>

        <div v-else-if="errorText" class="plate" data-testid="playground-error">
          <div class="p-5 text-sm leading-relaxed border-l-2"
            :class="errorKind === 'unported' ? 'border-ochre dark:border-ochre-dark' : 'border-red-600 dark:border-red-400'">
            <span class="stamp" :class="errorKind === 'unported' ? 'stamp-fallback' : 'stamp-fallback'">
              {{ errorKind === 'unported' ? 'Unported' : 'Error' }}
            </span>
            <p class="mt-3">{{ errorText }}</p>
          </div>
        </div>

        <div v-else class="plate" data-testid="playground-empty">
          <div class="plate-canvas min-h-[22rem] flex items-center justify-center text-sm text-graphite dark:text-graphite-dark">
            The rendered diagram appears here.
          </div>
        </div>

        <p class="mt-2 text-xs text-graphite dark:text-graphite-dark">
          The output is drawn on a light canvas because the engine emits light-theme reference SVG.
        </p>
      </section>
    </div>
  </div>
</template>
