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
const errorText = ref<string>('')
const errorKind = ref<'none' | 'unported' | 'error'>('none')
const engineState = ref<'loading' | 'ready' | 'failed'>('loading')
const current = ref<Preset>(presets[0])
const view = shallowRef<EditorView | null>(null)
let timer: ReturnType<typeof setTimeout> | null = null

async function renderNow(source: string): Promise<void> {
  errorText.value = ''
  errorKind.value = 'none'
  try {
    output.value = render(source)
    typeName.value = detect(source)
  } catch (e) {
    output.value = ''
    typeName.value = ''
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
        EditorView.updateListener.of((update) => {
          if (update.docChanged) onInput(update.state.doc.toString())
        }),
      ],
      parent: editorHost.value,
    })
    view.value = v
  }
  await renderNow(current.value.source)
})
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center gap-2 mb-4" role="group" aria-label="Preset diagrams">
      <button
        v-for="preset in presets"
        :key="preset.id"
        type="button"
        class="btn text-sm px-3 py-1.5"
        :class="current.id === preset.id ? 'btn-primary' : 'btn-secondary'"
        @click="selectPreset(preset)"
      >
        {{ preset.name }}
      </button>
      <span class="ml-auto text-sm text-gray-500 dark:text-gray-400">
        <span v-if="engineState === 'loading'">The engine is loading.</span>
        <span v-else-if="engineState === 'ready'">
          The engine is ready.<span v-if="typeName"> The detected type is <code class="px-1 rounded bg-gray-100 dark:bg-gray-800">{{ typeName }}</code>.</span>
        </span>
        <span v-else class="text-red-600 dark:text-red-400">The engine failed to load.</span>
      </span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="min-w-0">
        <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Diagram source</p>
        <div
          ref="editorHost"
          class="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900 text-sm"
        ></div>
        <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
          The output re-renders 250 ms after the last keystroke.
        </p>
      </div>

      <div class="min-w-0">
        <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">SVG output</p>
        <div
          v-if="output"
          class="diagram-canvas"
          data-testid="playground-output"
        >
          <!-- The SVG string is produced entirely by the Rust engine over the wasm boundary. -->
          <div v-html="output"></div>
        </div>
        <div
          v-else-if="errorText"
          class="rounded-lg border p-4 text-sm"
          :class="
            errorKind === 'unported'
              ? 'border-yellow-300 bg-yellow-50 text-yellow-900 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-200'
              : 'border-red-300 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-900/20 dark:text-red-200'
          "
          data-testid="playground-error"
        >
          {{ errorText }}
        </div>
        <div v-else class="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center text-sm text-gray-500 dark:text-gray-400">
          The rendered diagram appears here.
        </div>
        <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
          The output is drawn on a white canvas because the engine emits light-theme reference SVG.
        </p>
      </div>
    </div>
  </div>
</template>
