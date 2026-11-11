/**
 * Sprachumschaltung für den Prototyp, ohne App.tsx umzubauen.
 *
 * App.tsx bleibt (fast) so, wie Figma Make sie exportiert hat – so lässt sich ein neuer
 * Export später leicht übernehmen. Die Übersetzung passiert auf der fertigen Seite: Ein
 * MutationObserver ersetzt sichtbare Texte und Attribute (placeholder, aria-label, title,
 * alt) anhand der Wörterbücher in ./en.ts (für Englisch) und ./de.ts (englische Reste des
 * Exports, die in der deutschen Fassung deutsch sein sollen).
 *
 * Neue Texte im Prototyp: `python3 scripts/extract_strings.py` zeigt alle Kandidaten.
 */
import { EN_EXACT, EN_PATTERNS } from './en'
import { DE_EXACT } from './de'

export type Lang = 'de' | 'en'
type Pattern = [RegExp, string | ((...m: string[]) => string)]

const ATTRS = ['placeholder', 'aria-label', 'title', 'alt']

let current: Lang = 'de'

function normalise(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

function lookup(text: string, exact: Record<string, string>, patterns: Pattern[]): string | null {
  const key = normalise(text)
  if (!key) return null
  const hit = exact[key]
  if (hit !== undefined) {
    if (hit === key) return null
    const lead = text.match(/^\s*/)![0]
    const trail = text.match(/\s*$/)![0]
    return lead + hit + trail
  }
  for (const [re, rep] of patterns) {
    if (re.test(key)) {
      const out = typeof rep === 'string' ? key.replace(re, rep) : key.replace(re, rep as (...m: string[]) => string)
      if (out !== key) {
        const lead = text.match(/^\s*/)![0]
        const trail = text.match(/\s*$/)![0]
        return lead + out + trail
      }
    }
  }
  return null
}

/** Übersetzt einen einzelnen String (für Stellen, die als Zustand in der App liegen). */
export function tr(text: string): string {
  if (current === 'en') return lookup(text, EN_EXACT, EN_PATTERNS) ?? text
  return lookup(text, DE_EXACT, []) ?? text
}

const written = new WeakMap<Node, string>()

function translateText(node: Text) {
  const value = node.nodeValue ?? ''
  if (written.get(node) === value) return
  const out = tr(value)
  if (out !== value) {
    written.set(node, out)
    node.nodeValue = out
  }
}

function translateAttrs(el: Element) {
  for (const attr of ATTRS) {
    const value = el.getAttribute(attr)
    if (!value) continue
    const out = tr(value)
    if (out !== value) el.setAttribute(attr, out)
  }
}

function walk(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) {
    translateText(root as Text)
    return
  }
  if (root.nodeType !== Node.ELEMENT_NODE) return
  const el = root as Element
  if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return
  translateAttrs(el)
  const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT)
  let n = tw.nextNode()
  while (n) {
    if (n.nodeType === Node.TEXT_NODE) translateText(n as Text)
    else translateAttrs(n as Element)
    n = tw.nextNode()
  }
}

export function startTranslation(lang: Lang, root: HTMLElement) {
  current = lang
  document.documentElement.lang = lang
  walk(root)
  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      if (m.type === 'characterData') translateText(m.target as Text)
      else if (m.type === 'attributes') translateAttrs(m.target as Element)
      else m.addedNodes.forEach(walk)
    }
  })
  observer.observe(root, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ATTRS,
  })
}

export function currentLang(): Lang {
  return current
}

export function setLang(lang: Lang) {
  current = lang
}
