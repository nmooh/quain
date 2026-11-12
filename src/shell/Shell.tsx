import { useEffect, useRef, useState } from 'react'
import { LINKEDIN_URL, TEXTS, type Lang } from './texts'

const BASE = import.meta.env.BASE_URL
const PHONE_W = 390
const PHONE_H = 844
const BEZEL = 14
const MOBILE_QUERY = '(max-width: 899px)'
// Anzahl der öffentlichen Folien (scripts/import_pitch.py, KEEP); Bilder unter pitch/<lang>/slides/
const PITCH_SLIDES = 12

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

function CaseStudy({ lang, onPitch, onPrototype }: { lang: Lang; onPitch: () => void; onPrototype?: () => void }) {
  const t = TEXTS[lang]
  return (
    <div className="case">
      <p className="kicker">{t.kicker}</p>
      <div className="facts">
        <ul>
          <li className="live">
            <i aria-hidden="true" />
            {t.live}
          </li>
          {t.facts.map(f => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </div>
      {onPrototype && (
        <>
          <button type="button" className="btn lime try" onClick={onPitch}>
            {t.pitch} <span aria-hidden="true">→</span>
          </button>
          <button type="button" className="btn try2" onClick={onPrototype}>
            {t.tryPrototype} <span aria-hidden="true">→</span>
          </button>
        </>
      )}
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
      {!onPrototype && (
        <div className="actions">
          <button type="button" className="btn lime" onClick={onPitch}>
            {t.pitch}
          </button>
        </div>
      )}
      <div className="author">
        <div className="who">
          <strong>{t.author}</strong>
          <span className="seeking">
            <i aria-hidden="true" />
            {t.seeking}
          </span>
        </div>
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
      <p className="interview">
        {t.interview}{' '}
        <a href={LINKEDIN_URL} target="_blank" rel="noopener">
          {t.interviewCta}
        </a>
      </p>
      <p className="note">{t.note}</p>
    </div>
  )
}

function PitchOverlay({ lang, mobile, onClose }: { lang: Lang; mobile: boolean; onClose: () => void }) {
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
      {mobile ? (
        // iOS-Safari passt iframes an die Inhaltsbreite an; auf dem Handy daher Folienbilder direkt
        <div className="pitch-imgs">
          {Array.from({ length: PITCH_SLIDES }, (_, i) => (
            <img
              key={i}
              src={`${BASE}pitch/${lang}/slides/slide-${String(i).padStart(2, '0')}.jpg`}
              alt={`${t.pitchTitle} ${i + 1}`}
              width={1600}
              height={900}
              loading={i < 2 ? 'eager' : 'lazy'}
            />
          ))}
        </div>
      ) : (
        <iframe className="pitch-frame" title={t.pitchTitle} src={`${BASE}pitch/${lang}/index.html`} />
      )}
    </div>
  )
}

export default function Shell() {
  const [lang, setLang] = useState<Lang>(initialLang)
  const [pitchOpen, setPitchOpen] = useState(false)
  // Handy: zuerst die Übersicht (Pitch, LinkedIn, Lebenslauf), der Prototyp per Button (Nicolas, 2026-11-12)
  const [mobileView, setMobileView] = useState<'case' | 'app'>(() =>
    new URLSearchParams(location.search).get('view') === 'app' ? 'app' : 'case')
  const [appOpened, setAppOpened] = useState(mobileView === 'app')
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
    const openApp = () => {
      setAppOpened(true)
      setMobileView('app')
    }
    return (
      <div className="m-root">
        <header className="m-bar">
          {mobileView === 'app' ? (
            <button type="button" className="btn small" onClick={() => setMobileView('case')}>
              <span aria-hidden="true">←</span> {t.overview}
            </button>
          ) : (
            <Brand />
          )}
          <div className="m-bar-right">
            <LangSwitch lang={lang} onChange={setLang} label={t.langLabel} />
            {mobileView === 'app' && (
              <button type="button" className="btn small" aria-label={t.restart} onClick={() => setAppKey(k => k + 1)}>
                ↺
              </button>
            )}
          </div>
        </header>
        {mobileView === 'case' && (
          <div className="m-case">
            <CaseStudy lang={lang} onPitch={() => setPitchOpen(true)} onPrototype={openApp} />
          </div>
        )}
        {appOpened && (
          <iframe
            key={`${appKey}-${lang}`}
            ref={frameRef}
            className="m-app"
            title="QUAIN"
            src={appSrc}
            style={{ display: mobileView === 'app' ? 'block' : 'none' }}
          />
        )}
        {pitchOpen && <PitchOverlay lang={lang} mobile={mobile} onClose={() => setPitchOpen(false)} />}
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
      {pitchOpen && <PitchOverlay lang={lang} mobile={mobile} onClose={() => setPitchOpen(false)} />}
    </div>
  )
}
