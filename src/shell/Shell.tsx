import { useEffect, useRef, useState } from 'react'
import { LINKEDIN_URL, TEXTS, type Lang } from './texts'

const BASE = import.meta.env.BASE_URL
const PHONE_W = 390
const PHONE_H = 844
const BEZEL = 14
const MOBILE_QUERY = '(max-width: 899px)'

function initialLang(): Lang {
  const fromUrl = new URLSearchParams(location.search).get('lang')
  if (fromUrl === 'de' || fromUrl === 'en') return fromUrl
  try {
    const stored = localStorage.getItem('quain-lang')
    if (stored === 'de' || stored === 'en') return stored
  } catch {
    /* storage blocked – fall back to browser language */
  }
  return navigator.language?.toLowerCase().startsWith('de') ? 'de' : 'en'
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return matches
}

function usePhoneScale() {
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const fit = () => {
      const available = window.innerHeight - 112
      setScale(Math.min(1, Math.max(0.6, available / (PHONE_H + BEZEL * 2))))
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])
  return scale
}

function LangSwitch({ lang, onChange, label }: { lang: Lang; onChange: (l: Lang) => void; label: string }) {
  return (
    <div className="lang" role="group" aria-label={label}>
      {(['de', 'en'] as Lang[]).map(l => (
        <button key={l} type="button" aria-pressed={lang === l} className={lang === l ? 'on' : ''} onClick={() => onChange(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

function Brand() {
  return (
    <span className="pill">
      <i aria-hidden="true" />QUAIN
    </span>
  )
}

function CaseStudy({ lang, onPitch }: { lang: Lang; onPitch: () => void }) {
  const t = TEXTS[lang]
  return (
    <div className="case">
      <p className="kicker">{t.kicker}</p>
      <div className="facts">
        <ul>
          {t.facts.map(f => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </div>
      <dl className="psv">
        <div>
          <dt>{t.problemLabel}</dt>
          <dd>{t.problem}</dd>
        </div>
        <div>
          <dt>{t.solutionLabel}</dt>
          <dd>{t.solution}</dd>
        </div>
        <div className="vision">
          <dt>{t.visionLabel}</dt>
          <dd>{t.vision}</dd>
        </div>
      </dl>
      <div className="actions">
        <button type="button" className="btn primary" onClick={onPitch}>
          {t.pitch}
        </button>
      </div>
      <div className="author">
        <strong>{t.author}</strong>
        <div className="author-links">
          <a className="btn small" href={LINKEDIN_URL} target="_blank" rel="noopener">
            {t.linkedin}
            <span aria-hidden="true">↗</span>
          </a>
          <a className="btn small" href={`${BASE}cv/Nicolas-Moegelin-Lebenslauf.pdf`} target="_blank" rel="noopener">
            {t.cv}
            {t.cvNote && <small>{t.cvNote}</small>}
          </a>
        </div>
      </div>
      <p className="note">{t.note}</p>
    </div>
  )
}

function PitchOverlay({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const t = TEXTS[lang]
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label={t.pitchTitle}>
      <div className="overlay-bar">
        <Brand />
        <div className="overlay-actions">
          <a className="btn small" href={`${BASE}pitch/quain-pitch-${lang}.pdf`} target="_blank" rel="noopener">
            {t.pitchPdf}
          </a>
          <button type="button" className="btn small primary" onClick={onClose}>
            {t.close}
          </button>
        </div>
      </div>
      <iframe className="pitch-frame" title={t.pitchTitle} src={`${BASE}pitch/${lang}/index.html`} />
    </div>
  )
}

export default function Shell() {
  const [lang, setLang] = useState<Lang>(initialLang)
  const [pitchOpen, setPitchOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [appKey, setAppKey] = useState(0)
  const mobile = useMediaQuery(MOBILE_QUERY)
  const scale = usePhoneScale()
  const frameRef = useRef<HTMLIFrameElement>(null)
  const t = TEXTS[lang]

  useEffect(() => {
    document.documentElement.lang = lang
    try {
      localStorage.setItem('quain-lang', lang)
    } catch {
      /* ignore */
    }
  }, [lang])

  const appSrc = `${BASE}app.html?lang=${lang}&mode=${mobile ? 'device' : 'frame'}`

  if (mobile) {
    return (
      <div className="m-root">
        <header className="m-bar">
          <Brand />
          <div className="m-bar-right">
            <LangSwitch lang={lang} onChange={setLang} label={t.langLabel} />
            <button type="button" className="btn small" onClick={() => setSheetOpen(true)}>
              {t.caseStudy}
            </button>
          </div>
        </header>
        <iframe key={`${appKey}-${lang}`} ref={frameRef} className="m-app" title="QUAIN" src={appSrc} />
        {sheetOpen && (
          <div className="sheet-backdrop" onClick={() => setSheetOpen(false)}>
            <div className="sheet" onClick={e => e.stopPropagation()}>
              <button type="button" className="sheet-close" aria-label={t.close} onClick={() => setSheetOpen(false)}>
                ×
              </button>
              <CaseStudy
                lang={lang}
                onPitch={() => {
                  setSheetOpen(false)
                  setPitchOpen(true)
                }}
              />
              <button
                type="button"
                className="btn restart"
                onClick={() => {
                  setAppKey(k => k + 1)
                  setSheetOpen(false)
                }}
              >
                ↺ {t.restart}
              </button>
            </div>
          </div>
        )}
        {pitchOpen && <PitchOverlay lang={lang} onClose={() => setPitchOpen(false)} />}
      </div>
    )
  }

  const outerW = (PHONE_W + BEZEL * 2) * scale
  const outerH = (PHONE_H + BEZEL * 2) * scale

  return (
    <div className="d-root">
      <header className="d-bar">
        <Brand />
        <LangSwitch lang={lang} onChange={setLang} label={t.langLabel} />
      </header>
      <main className="d-main">
        <CaseStudy lang={lang} onPitch={() => setPitchOpen(true)} />
        <div className="stage">
          <div style={{ width: outerW, height: outerH }}>
            <div className="phone" style={{ transform: `scale(${scale})` }}>
              <div className="island" aria-hidden="true" />
              <iframe key={`${appKey}-${lang}`} ref={frameRef} title="QUAIN" src={appSrc} width={PHONE_W} height={PHONE_H} />
            </div>
          </div>
          <button type="button" className="restart-link" onClick={() => setAppKey(k => k + 1)}>
            ↺ {t.restart}
          </button>
        </div>
      </main>
      {pitchOpen && <PitchOverlay lang={lang} onClose={() => setPitchOpen(false)} />}
    </div>
  )
}
