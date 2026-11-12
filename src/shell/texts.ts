export type Lang = 'de' | 'en'

export const LINKEDIN_URL = 'https://www.linkedin.com/in/nicolas-moegelin/'

/**
 * Inhalte der Startseite. Keine eigenen Formulierungen: Problem, Lösung und Vision stammen aus
 * Pitch-Deck und Product Vision Board (DL_11), Überschrift und Eckdaten des Cases von Nicolas
 * (2026-11-11). Englisch ist die Übersetzung derselben Texte.
 */
type Texts = {
  kicker: string
  facts: string[]
  live: string
  problemLabel: string
  problem: string
  solutionLabel: string
  solution: string
  visionLabel: string
  vision: string
  pitch: string
  tryPrototype: string
  overview: string
  author: string
  seeking: string
  interview: string
  interviewCta: string
  cv: string
  cvNote?: string
  linkedin: string
  restart: string
  note: string
  caseStudy: string
  close: string
  pitchTitle: string
  pitchPdf: string
  langLabel: string
}

export const TEXTS: Record<Lang, Texts> = {
  de: {
    kicker: 'End-to-End Product Case Study',
    live: 'Test-Season läuft',
    facts: [
      '3 Monate',
      '3 Tiefeninterviews',
      '2 Prototyping Sessions',
      'Retrieval-Augmented Generation (RAG)',
      'Agentic Workflow Design',
      'Roadmap',
      'Release Planning',
      'Go-to-Market',
      'KPIs',
    ],
    problemLabel: 'Problem',
    problem: 'Wertvolle Kontakte gehen verloren, sobald gemeinsame Arbeit oder Anlässe enden und fehlen später.',
    solutionLabel: 'Lösung',
    solution:
      'Kuratierte Seasons für vertraute Beziehungen: 1:1 oder 3–5 Personen, 6 Monate, 6 Aktivitäten ohne Meeting-Vibe und ein eindeutiges Ende, das den Ausstieg einfach macht.',
    visionLabel: 'Vision',
    vision:
      'Eine berufliche Basis aus vertrauten Beziehungen, die wir in guten Zeiten bauen, um uns im Bedarfsfall darauf zu stützen.',
    pitch: 'Pitch ansehen',
    tryPrototype: 'Prototyp ausprobieren',
    overview: 'Übersicht',
    author: 'Nicolas Moegelin',
    seeking: 'Aktuell auf der Suche nach einer neuen Herausforderung',
    interview: 'Hast du 20 Minuten für ein Interview zu QUAIN?',
    interviewCta: 'Kontaktiere mich über LinkedIn.',
    cv: 'Lebenslauf (PDF)',
    linkedin: 'LinkedIn',
    restart: 'Prototyp neu starten',
    note: 'Klickbarer Prototyp mit fiktiven Personen und Beispieldaten. Es werden keine Daten gespeichert.',
    caseStudy: 'Case Study',
    close: 'Schließen',
    pitchTitle: 'Pitch',
    pitchPdf: 'PDF herunterladen',
    langLabel: 'Sprache',
  },
  en: {
    kicker: 'End-to-End Product Case Study',
    live: 'Test Season running',
    facts: [
      '3 months',
      '3 in-depth interviews',
      '2 prototyping sessions',
      'Retrieval-Augmented Generation (RAG)',
      'Agentic Workflow Design',
      'Roadmap',
      'Release Planning',
      'Go-to-Market',
      'KPIs',
    ],
    problemLabel: 'Problem',
    problem: 'Valuable contacts get lost once shared work or occasions end and are missing later.',
    solutionLabel: 'Solution',
    solution:
      'Curated Seasons for trusted relationships: a 1:1 or 3–5 people, 6 months, 6 activities without a meeting vibe and a clear ending that makes leaving easy.',
    visionLabel: 'Vision',
    vision:
      'A professional foundation of trusted relationships that we build in good times, so we can rely on it when we need it.',
    pitch: 'View pitch',
    tryPrototype: 'Try the prototype',
    overview: 'Overview',
    author: 'Nicolas Moegelin',
    seeking: 'Currently looking for a new challenge',
    interview: 'Got 20 minutes for an interview about QUAIN?',
    interviewCta: 'Contact me on LinkedIn.',
    cv: 'CV (PDF)',
    cvNote: 'German',
    linkedin: 'LinkedIn',
    restart: 'Restart prototype',
    note: 'Clickable prototype with fictional people and sample data. Nothing you enter is stored.',
    caseStudy: 'Case study',
    close: 'Close',
    pitchTitle: 'Pitch',
    pitchPdf: 'Download PDF',
    langLabel: 'Language',
  },
}
