// The sample corpus: golden-corpus pairs copied verbatim from etassia-rs/golden.
// Each .mmd source pairs with the SVG the reference Ruby implementation produced;
// the Rust runtime renders the same bytes, which the golden-corpus test asserts.
export interface Sample {
  /** Card identifier, also the public file stem under /diagrams/. */
  id: string
  /** Human diagram-type name shown as the card heading. */
  name: string
  /** The Mermaid keyword or keyword family a writer types. */
  keywords: string
  /** True when the Rust runtime renders the type natively. */
  native: boolean
  /** One-sentence statement of what the type draws. */
  purpose: string
  /** Raw diagram source, imported from src/assets/diagrams. */
  source: string
  /** Public path of the reference SVG. */
  svg: string
  /** Rendering group on the syntax page. */
  group: 'structure' | 'time' | 'data' | 'systems'
}

import flowchart from '../assets/diagrams/flowchart.mmd?raw'
import sequence from '../assets/diagrams/sequence.mmd?raw'
import klass from '../assets/diagrams/class.mmd?raw'
import state from '../assets/diagrams/state.mmd?raw'
import er from '../assets/diagrams/er.mmd?raw'
import mindmap from '../assets/diagrams/mindmap.mmd?raw'
import kanban from '../assets/diagrams/kanban.mmd?raw'
import block from '../assets/diagrams/block.mmd?raw'
import architecture from '../assets/diagrams/architecture.mmd?raw'
import gantt from '../assets/diagrams/gantt.mmd?raw'
import timeline from '../assets/diagrams/timeline.mmd?raw'
import journey from '../assets/diagrams/journey.mmd?raw'
import gitgraph from '../assets/diagrams/gitgraph.mmd?raw'
import pie from '../assets/diagrams/pie.mmd?raw'
import quadrant from '../assets/diagrams/quadrant.mmd?raw'
import xychart from '../assets/diagrams/xychart.mmd?raw'
import radar from '../assets/diagrams/radar.mmd?raw'
import treemap from '../assets/diagrams/treemap.mmd?raw'
import packet from '../assets/diagrams/packet.mmd?raw'
import requirement from '../assets/diagrams/requirement.mmd?raw'
import c4 from '../assets/diagrams/c4.mmd?raw'
import info from '../assets/diagrams/info.mmd?raw'

const svg = (id: string) => `/diagrams/${id}.svg`

export const samples: Sample[] = [
  {
    id: 'flowchart',
    name: 'Flowchart',
    keywords: 'flowchart · graph · flowchart-elk',
    native: true,
    purpose:
      'Draws nodes, edges, subgraphs, classes and interaction attributes for process and decision diagrams.',
    source: flowchart,
    svg: svg('flowchart'),
    group: 'structure',
  },
  {
    id: 'sequence',
    name: 'Sequence diagram',
    keywords: 'sequenceDiagram',
    native: true,
    purpose:
      'Draws participants, actors, typed participants, activations and messages between lifelines.',
    source: sequence,
    svg: svg('sequence'),
    group: 'structure',
  },
  {
    id: 'class',
    name: 'Class diagram',
    keywords: 'classDiagram',
    native: true,
    purpose: 'Draws classes and the association, aggregation, composition and inheritance relations between them.',
    source: klass,
    svg: svg('class'),
    group: 'structure',
  },
  {
    id: 'state',
    name: 'State diagram',
    keywords: 'stateDiagram · stateDiagram-v2',
    native: true,
    purpose: 'Draws states, transitions and composite states with notes.',
    source: state,
    svg: svg('state'),
    group: 'structure',
  },
  {
    id: 'er',
    name: 'Entity relationship diagram',
    keywords: 'erDiagram',
    native: true,
    purpose: 'Draws entities, their attributes and the cardinality of their relationships.',
    source: er,
    svg: svg('er'),
    group: 'structure',
  },
  {
    id: 'mindmap',
    name: 'Mindmap',
    keywords: 'mindmap',
    native: true,
    purpose: 'Draws a radial tree of ideas around a root node.',
    source: mindmap,
    svg: svg('mindmap'),
    group: 'structure',
  },
  {
    id: 'kanban',
    name: 'Kanban board',
    keywords: 'kanban',
    native: true,
    purpose: 'Draws columns and cards with declared priorities.',
    source: kanban,
    svg: svg('kanban'),
    group: 'structure',
  },
  {
    id: 'block',
    name: 'Block diagram',
    keywords: 'block-beta',
    native: true,
    purpose: 'Draws labelled blocks in a column grid with block arrows and connectors.',
    source: block,
    svg: svg('block'),
    group: 'structure',
  },
  {
    id: 'architecture',
    name: 'Architecture diagram',
    keywords: 'architecture-beta',
    native: true,
    purpose: 'Draws services, groups and the edges between them for system-landscape views.',
    source: architecture,
    svg: svg('architecture'),
    group: 'structure',
  },
  {
    id: 'gantt',
    name: 'Gantt chart',
    keywords: 'gantt',
    native: true,
    purpose: 'Draws scheduled tasks, sections, dependencies and completion states over a date axis.',
    source: gantt,
    svg: svg('gantt'),
    group: 'time',
  },
  {
    id: 'timeline',
    name: 'Timeline',
    keywords: 'timeline',
    native: true,
    purpose: 'Draws periods, sections and the events attached to them.',
    source: timeline,
    svg: svg('timeline'),
    group: 'time',
  },
  {
    id: 'journey',
    name: 'User journey',
    keywords: 'journey',
    native: true,
    purpose: 'Draws the tasks of an actor through sections with satisfaction scores.',
    source: journey,
    svg: svg('journey'),
    group: 'time',
  },
  {
    id: 'gitgraph',
    name: 'Git graph',
    keywords: 'gitGraph',
    native: true,
    purpose: 'Draws commits, branches and merges as a version-control history.',
    source: gitgraph,
    svg: svg('gitgraph'),
    group: 'time',
  },
  {
    id: 'pie',
    name: 'Pie chart',
    keywords: 'pie',
    native: true,
    purpose: 'Draws labelled slices from key-value data with a legend.',
    source: pie,
    svg: svg('pie'),
    group: 'data',
  },
  {
    id: 'quadrant',
    name: 'Quadrant chart',
    keywords: 'quadrantChart',
    native: true,
    purpose: 'Draws points on two axes divided into four labelled quadrants.',
    source: quadrant,
    svg: svg('quadrant'),
    group: 'data',
  },
  {
    id: 'xychart',
    name: 'XY chart',
    keywords: 'xychart-beta',
    native: true,
    purpose: 'Draws bar and line series against cartesian axes.',
    source: xychart,
    svg: svg('xychart'),
    group: 'data',
  },
  {
    id: 'radar',
    name: 'Radar chart',
    keywords: 'radar-beta',
    native: true,
    purpose: 'Draws multiple curves over named axes with configurable graticule and legend.',
    source: radar,
    svg: svg('radar'),
    group: 'data',
  },
  {
    id: 'treemap',
    name: 'Treemap',
    keywords: 'treemap · treemap-beta',
    native: true,
    purpose: 'Draws nested rectangles proportional to declared weights.',
    source: treemap,
    svg: svg('treemap'),
    group: 'data',
  },
  {
    id: 'packet',
    name: 'Packet diagram',
    keywords: 'packet-beta',
    native: true,
    purpose: 'Draws byte-range fields of a protocol packet header.',
    source: packet,
    svg: svg('packet'),
    group: 'data',
  },
  {
    id: 'sankey',
    name: 'Sankey diagram',
    keywords: 'sankey-beta',
    native: false,
    purpose:
      'Draws flows between nodes. This type has no Rust renderer in the current release.',
    source: 'sankey-beta\n\nA,B\n1,2',
    svg: '',
    group: 'data',
  },
  {
    id: 'requirement',
    name: 'Requirement diagram',
    keywords: 'requirementDiagram',
    native: true,
    purpose: 'Draws requirements, elements and the tracing relations between them.',
    source: requirement,
    svg: svg('requirement'),
    group: 'systems',
  },
  {
    id: 'c4',
    name: 'C4 diagrams',
    keywords: 'C4Context · C4Container · C4Component · C4Dynamic · C4Deployment',
    native: true,
    purpose: 'Draws persons, systems, containers and their relationships for the C4 model levels.',
    source: c4,
    svg: svg('c4'),
    group: 'systems',
  },
  {
    id: 'info',
    name: 'Info box',
    keywords: 'info',
    native: true,
    purpose: 'Draws a display box that carries a version or notice string.',
    source: info,
    svg: svg('info'),
    group: 'systems',
  },
  {
    id: 'error',
    name: 'Error box',
    keywords: 'error',
    native: false,
    purpose:
      'Draws the error display box. This type has no Rust renderer in the current release.',
    source: 'error',
    svg: '',
    group: 'systems',
  },
]

export const groups: { key: Sample['group']; heading: string; blurb: string }[] = [
  {
    key: 'structure',
    heading: 'Flow and structure',
    blurb:
      'These types draw the structural views that technical documentation carries most often: processes, interactions, classifications and system shapes.',
  },
  {
    key: 'time',
    heading: 'Schedules and histories',
    blurb:
      'These types draw plans, periods, journeys and version-control histories against a time or sequence axis.',
  },
  {
    key: 'data',
    heading: 'Data and charts',
    blurb:
      'These types draw quantitative and proportional views of tabular or key-value data.',
  },
  {
    key: 'systems',
    heading: 'Systems and requirements',
    blurb:
      'These types draw the C4 model levels, requirement traces and the small display boxes.',
  },
]

/** The native render dispatch of the Rust runtime covers these 22 types. */
export const NATIVE_COUNT = samples.filter((s) => s.native).length

/** Detector keywords, including the family keywords graph, flowchart-elk and the five C4 kinds. */
export const DETECTED_KEYWORD_COUNT = 31

export const GOLDEN_CASE_COUNT = 1206

import { createHash } from 'node:crypto'

/**
 * The first eight characters of the SHA-256 digest of a diagram source, in
 * the same spirit as the golden corpus's hashed case files: identical
 * sources carry identical digests, so a plate's hash is a statement that
 * this exact text produced this exact SVG.
 */
export function sourceHash(sample: Sample): string {
  return createHash('sha256').update(sample.source.trim()).digest('hex').slice(0, 8)
}
