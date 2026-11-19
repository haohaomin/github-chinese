import { defineComponent, h, type PropType, type VNode } from 'vue'
import type { NoteBlock, NoteInline } from '../shared/release-notes'

/** 发行说明（见 shared/release-notes）：逐个创建元素，不插入 HTML；链接在新标签页打开 */

function renderInline(nodes: readonly NoteInline[]): (VNode | string)[] {
  return nodes.map(node => {
    switch (node.type) {
      case 'text':
        return node.text
      case 'break':
        return h('br')
      case 'code':
        return h('code', node.text)
      case 'strong':
        return h('strong', renderInline(node.children))
      case 'em':
        return h('em', renderInline(node.children))
      case 'link':
        return h('a', { href: node.href, target: '_blank', rel: 'noopener noreferrer' }, renderInline(node.children))
    }
  })
}

function renderBlocks(blocks: readonly NoteBlock[]): VNode[] {
  return blocks.map(block => {
    switch (block.type) {
      case 'heading':
        return h('h3', renderInline(block.children))
      case 'paragraph':
        return h('p', renderInline(block.children))
      case 'list':
        return h(
          block.ordered ? 'ol' : 'ul',
          block.items.map(item => h('li', renderBlocks(item)))
        )
      case 'quote':
        return h('blockquote', renderBlocks(block.children))
      case 'code':
        return h('pre', [h('code', block.text)])
    }
  })
}

export default defineComponent({
  name: 'ReleaseNoteView',
  props: {
    blocks: { type: Array as PropType<readonly NoteBlock[]>, required: true }
  },
  setup(props) {
    return () => h('div', { class: 'release-note' }, renderBlocks(props.blocks))
  }
})
