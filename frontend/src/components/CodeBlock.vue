<template>
  <div class="code-frame">
    <pre class="code-block hljs"><code ref="codeEl"></code></pre>
  </div>

</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import sql from 'highlight.js/lib/languages/sql'

// Register only the languages we need
hljs.registerLanguage('json', json)
hljs.registerLanguage('sql', sql)

// Dynamically load light/dark themes
import githubLightUrl from 'highlight.js/styles/github.css?url'
import githubDarkUrl from 'highlight.js/styles/github-dark.css?url'

const props = defineProps({
  code: { type: String, default: '' },
  language: { type: String, default: 'plaintext' },
})

const codeEl = ref(null)

let themeObserver

function ensureHljsThemeLink () {
  let link = document.getElementById('hljs-theme-link')
  if (!link) {
    link = document.createElement('link')
    link.id = 'hljs-theme-link'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }
  const dark = !!document.querySelector('.v-theme--dark')
  link.href = dark ? githubDarkUrl : githubLightUrl
}

const render = () => {
  if (!codeEl.value) return
  const text = props.code ?? ''
  let html = ''
  try {
    const lang = ['json', 'sql', 'plaintext'].includes(props.language)
      ? props.language
      : undefined

    if (lang && lang !== 'plaintext') {
      html = hljs.highlight(text, { language: lang, ignoreIllegals: true }).value
    } else {
      // Try to auto-detect between json and sql
      html = hljs.highlightAuto(text, ['json', 'sql']).value
    }
  } catch (e) {
    html = text
  }
  codeEl.value.innerHTML = html
}

onMounted(() => {
  ensureHljsThemeLink()
  // Watch for Vuetify theme toggles
  themeObserver = new MutationObserver(() => ensureHljsThemeLink())
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] })
  render()
})

onBeforeUnmount(() => {
  if (themeObserver) themeObserver.disconnect()
})
watch(() => [props.code, props.language], render)
</script>

<style>
.code-frame {
  border: 1px solid #d0d7de;
  border-radius: 8px;
  background: #ffffff;
  overflow: hidden;
}

.code-block {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.875rem;
  background: transparent;
  padding: 12px 14px;
  -webkit-font-smoothing: antialiased;
}
.code-block code { white-space: pre-wrap; }

/* Vuetify dark theme awareness */
.v-theme--dark .code-frame { background: #0d1117; border-color: #30363d; }
</style>
