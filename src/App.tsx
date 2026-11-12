import { useState, useEffect, useRef } from 'react'
import { tr } from './i18n/runtime'

// ── Brand palette ──────────────────────────────────────────────
const C = {
  teal:     '#8AA399',
  lavender: '#7D84B2',
  wisteria: '#8FA6CB',
  lime:     '#DBF4A7',
  mint:     '#D5F9DE',
  bg:       '#FAFAF8',
  card:     '#FFFFFF',
  ink:      '#1A1F1C',
  muted:    '#6B7068',
  subtle:   '#F0F4F1',
  border:   '#E6EAE6',
}
const HIGHLIGHT = 'var(--highlight-color, #DBF4A7)'
const HIGHLIGHT_TEXT = 'var(--highlight-text-color, #42542F)'
const HIGHLIGHT_OUTLINE = 'var(--highlight-outline-color, #DBF4A7)'
const QUAIN_MIN_MEMBERS = 3
const QUAIN_MAX_MEMBERS = 5
const PROFILE_CITY_COORDINATES = [
  { city: 'Berlin', latitude: 52.52, longitude: 13.405 },
  { city: 'Hamburg', latitude: 53.5511, longitude: 9.9937 },
  { city: 'München', latitude: 48.1351, longitude: 11.582 },
  { city: 'Köln', latitude: 50.9375, longitude: 6.9603 },
  { city: 'Düsseldorf', latitude: 51.2277, longitude: 6.7735 },
  { city: 'Frankfurt', latitude: 50.1109, longitude: 8.6821 },
]

function nearestProfileCity(latitude: number, longitude: number) {
  return PROFILE_CITY_COORDINATES.reduce((nearest, candidate) => {
    const nearestDistance = (nearest.latitude - latitude) ** 2 + (nearest.longitude - longitude) ** 2
    const candidateDistance = (candidate.latitude - latitude) ** 2 + (candidate.longitude - longitude) ** 2
    return candidateDistance < nearestDistance ? candidate : nearest
  }).city
}

function locationLabelFromSetup(value: string) {
  if (value.startsWith('Genauer Standort:')) {
    const [latitude, longitude] = value
      .replace('Genauer Standort:', '')
      .split(',')
      .map(part => Number(part.trim()))
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      return nearestProfileCity(latitude, longitude)
    }
  }

  return PROFILE_CITY_COORDINATES.find(({ city }) =>
    value.toLocaleLowerCase('de').includes(city.toLocaleLowerCase('de'))
  )?.city ?? value.split(',')[0].trim()
}

// ── Static data ────────────────────────────────────────────────
const PRO_INTERESTS = [
  'Product Strategy', 'OKRs & Metrics', 'User Research', 'Roadmapping',
  'Stakeholder Management', 'Team Leadership', 'Agile / Scrum', 'Go-to-Market',
  'Data & Analytics', 'B2B Sales', 'Pricing', 'Hiring & Onboarding',
]

const LEISURE_INTERESTS = [
  'Laufen', 'Specialty Coffee', 'Reisen', 'Fotografie', 'Yoga',
  'Kochen', 'Musik', 'Radfahren', 'Klettern', 'Lesen',
  'Theater', 'Wein & Gastronomie', 'Wandern', 'Surfen',
]

const PROGRAM_NEEDS = [
  'Vegane Ernährung', 'Vegetarische Ernährung', 'Glutenfrei', 'Laktosefrei',
  'Allergien', 'Kein Alkohol', 'Mobilität eingeschränkt', 'Kein Kontaktsport',
  'Keine langen Laufstrecken',
]

interface Member {
  id: number; name: string; fullName: string; role: string
  team: string; initials: string; color: string; isMe?: boolean
}

const ME: Member = {
  id: 0, name: 'Max', fullName: 'Max Müller', role: 'Senior Product Manager',
  team: 'Customer Experience', initials: 'MM', color: HIGHLIGHT, isMe: true,
}

const COHORT: Member[] = [
  { id: 1, name: 'Laura', fullName: 'Laura Becker',  role: 'Product Lead',       team: 'Enterprise Cloud',    initials: 'LB', color: C.wisteria },
  { id: 2, name: 'Jonas', fullName: 'Jonas Weber',   role: 'Senior PM',          team: 'People Cloud',        initials: 'JW', color: C.lavender },
  { id: 3, name: 'Anna',  fullName: 'Anna Krause',   role: 'Group PM',           team: 'Analytics',           initials: 'AK', color: C.teal    },
  { id: 4, name: 'Felix', fullName: 'Felix Richter', role: 'Principal PM',       team: 'Business Technology', initials: 'FR', color: '#C8B8E8' },
]

// Season 1: 6 monthly Season Steps over 6 months
const PROGRAM_STEPS = [
  { step: 1, week: 1,  month: 'OKT', day: '03', date: 'Fr, 3. Oktober',     time: '18:30', location: 'The Barn Coffee, Mitte',         type: 'Kick-off',           desc: 'Event basierend auf gemeinsamen Interessen — persönliches Kennenlernen', emoji: '👋', done: true  },
  { step: 2, week: 5,  month: 'NOV', day: '07', date: 'Fr, 7. November',    time: '19:00', location: 'Online (Zoom)',                  type: 'Online-Challenge',   desc: 'Digitale Challenge mit einem gemeinsamen Spiel',                          emoji: '🎮', done: false },
  { step: 3, week: 9,  month: 'DEZ', day: '05', date: 'Fr, 5. Dezember',    time: '10:00', location: 'DMEXCO, Köln',                   type: 'Fachmesse',          desc: 'Gemeinsamer Besuch einer Fach- oder Branchenmesse',                      emoji: '🏛️', done: false },
  { step: 4, week: 13, month: 'JAN', day: '09', date: 'Fr, 9. Januar',      time: '12:30', location: 'Spaziergang & Telefonat',         type: 'Walk-Phone-Call',    desc: 'Lockeres Gespräch beim Gehen — kein Tisch, kein Agenda-Gefühl',         emoji: '🚶', done: false },
  { step: 5, week: 17, month: 'FEB', day: '06', date: 'Fr, 6. Februar',     time: '15:00', location: 'Lumio-Campus Sportanlage',        type: 'Shared Activity',    desc: 'Gemeinsame Aktivität: Sportevent, Galerie oder etwas anderes',           emoji: '⚽', done: false },
  { step: 6, week: 21, month: 'MÄR', day: '06', date: 'Fr, 6. März',        time: '19:30', location: 'Barra Bar, Prenzlauer Berg',      type: 'Season-Abschluss',   desc: 'Letztes persönliches Treffen — gemeinsame Reflexion & Abschied',        emoji: '🥂', done: false },
]

// ── Types ──────────────────────────────────────────────────────
type Screen = 'welcome' | 'account-choice' | 'private-signup-method' | 'private-email-registration' | 'registration-success' | 'profile' | 'profile-details' | 'location' | 'pro' | 'leisure' | 'needs' | 'review' | 'connection-format' | 'season-info' | 'discovery' | 'open-quains' | 'one-to-one' | 'one-to-one-random-match' | 'matching' | 'result' | 'dashboard' | 'meeting-rating' | 'season-end' | 'rating'
type Tab    = 'home' | 'kreis' | 'chat' | 'kalender' | 'profil'
type MeetingFeedback = { rating: number; note: string }
type ConnectionFormat = 'quain' | 'one-to-one'
type AccountType = 'company' | 'private'
type PrivateProfile = { firstName: string; lastName: string; email: string; role: string }
type ProfileDetails = { role: string; age: string; focus: string; intro: string }
type ChatMessage = {
  id: number
  author: string
  initials: string
  color: string
  text: string
  time: string
  isMe?: boolean
}

interface DiscoveryPerson {
  id: number
  name: string
  role: string
  team: string
  location: string
  photo: string
  photoAlt: string
  interests: string[]
  professionalInterests: string[]
  personalInterests: string[]
  sharedInterests: string[]
  intro: string
  availability: string
  format: string
  isNew?: boolean
}

// Öffentliche Web-Version: Initialen statt Fotos realer Personen (Entscheidung Nicolas, 2026-11-11)
const PERSON_COLORS = ['#8FA6CB', '#7D84B2', '#8AA399', '#B3A6DA', '#9DB7AE']
function PersonPhoto({ person, alt, style }: { person: { id: number; name: string }; src?: string; alt?: string; style?: React.CSSProperties }) {
  const initials = person.name.split(' ').map(part => part.charAt(0)).join('').slice(0, 2).toUpperCase()
  const width = typeof style?.width === 'number' ? style.width : null
  const color = PERSON_COLORS[person.id % PERSON_COLORS.length]
  return (
    <div
      role="img"
      aria-label={alt || person.name}
      style={{
        ...style,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: width ? color : `linear-gradient(155deg, ${color} 0%, #EEF1FF 160%)`,
        color: '#FFFFFF',
        fontFamily: width && width < 60 ? "'Outfit', sans-serif" : "'Instrument Serif', serif",
        fontWeight: width && width < 60 ? 700 : 400,
        fontSize: width ? Math.round(width * (width < 60 ? 0.34 : 0.4)) : 96,
        letterSpacing: width && width < 60 ? '0.02em' : '0.01em',
        lineHeight: 1,
        userSelect: 'none',
      }}
    >
      {initials}
    </div>
  )
}

const DISCOVERY_PEOPLE: DiscoveryPerson[] = [
  {
    id: 1,
    name: 'Anna Müller',
    role: 'Senior Product Manager',
    team: 'Digital Products',
    location: 'Berlin',
    photo: '',
    photoAlt: 'Anna Müller smiling in an office',
    interests: ['Product Strategy', 'AI', 'Running'],
    professionalInterests: ['Product Strategy', 'AI', 'User Research'],
    personalInterests: ['Running', 'Specialty Coffee', 'Podcasts'],
    sharedInterests: ['Product Strategy', 'AI', 'Running'],
    intro: 'I love turning complex customer problems into simple products. Outside work, you’ll usually find me running along the Spree or trying a new coffee place.',
    availability: 'Usually available Tuesday or Thursday afternoons',
    format: 'Coffee walk or lunch',
  },
  {
    id: 2,
    name: 'David Schneider',
    role: 'UX Designer',
    team: 'Experience Design',
    location: 'Köln',
    photo: '',
    photoAlt: 'David Schneider smiling',
    interests: ['Design Systems', 'Photography', 'Travel'],
    professionalInterests: ['Design Systems', 'Accessibility', 'Design Research'],
    personalInterests: ['Photography', 'Travel', 'Architecture'],
    sharedInterests: ['Photography', 'Travel'],
    intro: 'I design tools that help teams do their best work. I’m always curious about how other disciplines approach systems, craft and collaboration.',
    availability: 'Flexible on Wednesday mornings',
    format: 'Video call or coffee',
    isNew: true,
  },
  {
    id: 3,
    name: 'Laura Weber',
    role: 'Engineering Lead',
    team: 'Technology',
    location: 'Berlin',
    photo: '',
    photoAlt: 'Laura Weber in a light jacket',
    interests: ['AI', 'Cycling', 'Cooking'],
    professionalInterests: ['AI', 'Team Leadership', 'Platform Strategy'],
    personalInterests: ['Cycling', 'Cooking', 'Running'],
    sharedInterests: ['AI', 'Team Leadership', 'Cooking', 'Running'],
    intro: 'I lead an engineering team focused on dependable AI products. I enjoy exchanging honest notes on leadership, building teams and staying curious.',
    availability: 'Available most Friday afternoons',
    format: 'Lunch or a short walk',
  },
  {
    id: 4,
    name: 'Miriam Okafor',
    role: 'Director of Product',
    team: 'Growth Products',
    location: 'Berlin',
    photo: '',
    photoAlt: 'Miriam Okafor in a professional portrait',
    interests: ['Growth Strategy', 'Mentoring', 'Jazz'],
    professionalInterests: ['Growth Strategy', 'Team Leadership', 'Pricing'],
    personalInterests: ['Jazz', 'Reading', 'Travel'],
    sharedInterests: ['Team Leadership', 'Travel'],
    intro: 'I enjoy building product teams that combine customer empathy with clear commercial thinking. I’m always happy to exchange lessons on leadership and growth.',
    availability: 'Available Thursday mornings',
    format: 'Coffee or video call',
  },
  {
    id: 5,
    name: 'Nils Hartmann',
    role: 'Principal Product Manager',
    team: 'Data Platform',
    location: 'Köln',
    photo: '',
    photoAlt: 'Nils Hartmann in a professional portrait',
    interests: ['Data Products', 'B2B SaaS', 'Hiking'],
    professionalInterests: ['Data Products', 'Platform Strategy', 'B2B Sales'],
    personalInterests: ['Hiking', 'Cycling', 'Cooking'],
    sharedInterests: ['Platform Strategy', 'Cycling'],
    intro: 'I work on data platforms and love discussing how infrastructure becomes a product that teams genuinely want to use.',
    availability: 'Usually available Monday afternoons',
    format: 'Video call',
  },
  {
    id: 6,
    name: 'Sofia Almeida',
    role: 'Product Operations Lead',
    team: 'Product Excellence',
    location: 'Köln',
    photo: '',
    photoAlt: 'Sofia Almeida smiling in an office',
    interests: ['Product Ops', 'OKRs', 'Food'],
    professionalInterests: ['Product Operations', 'OKRs & Metrics', 'Org Design'],
    personalInterests: ['Cooking', 'Travel', 'Yoga'],
    sharedInterests: ['OKRs & Metrics', 'Cooking', 'Travel'],
    intro: 'I help product organizations create just enough structure to move faster without losing curiosity or autonomy.',
    availability: 'Flexible on Tuesday afternoons',
    format: 'Lunch or video call',
    isNew: true,
  },
  {
    id: 7,
    name: 'Aylin Demir',
    role: 'Senior Product Designer',
    team: 'Consumer Experience',
    location: 'Köln',
    photo: '',
    photoAlt: 'Aylin Demir in a professional portrait',
    interests: ['Design Strategy', 'Research', 'Museums'],
    professionalInterests: ['Design Strategy', 'User Research', 'Design Systems'],
    personalInterests: ['Museums', 'Photography', 'Travel'],
    sharedInterests: ['User Research', 'Photography'],
    intro: 'I connect research, design craft and product strategy to make complex services feel clear and human.',
    availability: 'Available Wednesday afternoons',
    format: 'Coffee walk',
  },
  {
    id: 8,
    name: 'Tobias Nguyen',
    role: 'AI Product Lead',
    team: 'Applied AI',
    location: 'Berlin',
    photo: '',
    photoAlt: 'Tobias Nguyen in a casual professional portrait',
    interests: ['AI', 'Responsible Tech', 'Running'],
    professionalInterests: ['AI', 'Responsible Tech', 'Product Strategy'],
    personalInterests: ['Running', 'Podcasts', 'Specialty Coffee'],
    sharedInterests: ['AI', 'Product Strategy', 'Running'],
    intro: 'I build AI products with a focus on responsible delivery and real customer value rather than technology for its own sake.',
    availability: 'Usually available Friday mornings',
    format: 'Walk or breakfast',
  },
  {
    id: 9,
    name: 'Carla Mendes',
    role: 'Group Product Manager',
    team: 'Commerce',
    location: 'Köln',
    photo: '',
    photoAlt: 'Carla Mendes in a professional portrait',
    interests: ['Commerce', 'Leadership', 'Architecture'],
    professionalInterests: ['Commerce', 'Team Leadership', 'Go-to-Market'],
    personalInterests: ['Architecture', 'Travel', 'Photography'],
    sharedInterests: ['Team Leadership', 'Travel', 'Photography'],
    intro: 'I lead product teams in commerce and enjoy honest conversations about scaling products, teams and decision-making.',
    availability: 'Available every second Thursday',
    format: 'Video call or lunch',
  },
  {
    id: 10,
    name: 'Jan Richter',
    role: 'Product Strategy Lead',
    team: 'New Ventures',
    location: 'Frankfurt',
    photo: '',
    photoAlt: 'Jan Richter in a professional portrait',
    interests: ['Venture Building', 'Strategy', 'Cycling'],
    professionalInterests: ['Product Strategy', 'Go-to-Market', 'Pricing'],
    personalInterests: ['Cycling', 'Reading', 'Coffee'],
    sharedInterests: ['Product Strategy', 'Cycling', 'Specialty Coffee'],
    intro: 'I work at the intersection of product strategy and venture building, turning early signals into focused product bets.',
    availability: 'Flexible on Monday or Wednesday',
    format: 'Video call',
    isNew: true,
  },
]

interface OpenQuain {
  id: number
  name: string | null
  location: string
  format: string
  members: { name: string; role: string; initials: string; color: string }[]
  topics: string[]
  privatePreferences: string[]
}

const OPEN_QUAINS: OpenQuain[] = [
  {
    id: 1,
    name: 'Product & AI Exchange',
    location: 'Berlin',
    format: 'Hybrid',
    members: [
      { name: 'Anna Becker', role: 'Product Lead', initials: 'AB', color: C.wisteria },
      { name: 'Lukas Klein', role: 'Senior PM', initials: 'LK', color: C.teal },
      { name: 'Mia Schulz', role: 'Group PM', initials: 'MS', color: C.lavender },
      { name: 'Jonas Neumann', role: 'Principal PM', initials: 'JN', color: '#C8B8E8' },
    ],
    topics: ['Product Strategy', 'AI', 'Specialty Coffee'],
    privatePreferences: ['Specialty Coffee', 'Running'],
  },
  {
    id: 2,
    name: 'Leadership Lunch Club',
    location: 'Berlin',
    format: 'In Person',
    members: [
      { name: 'Sofia Wagner', role: 'Team Lead', initials: 'SW', color: C.teal },
      { name: 'Felix Maier', role: 'Product Lead', initials: 'FM', color: C.wisteria },
      { name: 'Nina Koch', role: 'Engineering Lead', initials: 'NK', color: C.lavender },
    ],
    topics: ['Team Leadership', 'Org Design', 'Cooking'],
    privatePreferences: ['Cooking', 'Food Culture'],
  },
  {
    id: 3,
    name: null,
    location: 'Potsdam',
    format: 'In Person',
    members: [
      { name: 'Paul Richter', role: 'Senior PM', initials: 'PR', color: C.lavender },
      { name: 'Eva Hoffmann', role: 'Product Lead', initials: 'EH', color: C.teal },
    ],
    topics: ['Running', 'Wellbeing', 'New Work'],
    privatePreferences: ['Running', 'Outdoor Activities'],
  },
  {
    id: 4,
    name: null,
    location: 'Hamburg',
    format: 'Hybrid',
    members: [
      { name: 'David Schneider', role: 'UX Designer', initials: 'DS', color: C.wisteria },
      { name: 'Aylin Demir', role: 'Senior Product Designer', initials: 'AD', color: C.teal },
    ],
    topics: ['Design Systems', 'User Research', 'Photography'],
    privatePreferences: ['Photography', 'Museums'],
  },
  {
    id: 5,
    name: 'B2B Growth Circle',
    location: 'München',
    format: 'Hybrid',
    members: [
      { name: 'Nils Hartmann', role: 'Principal PM', initials: 'NH', color: C.lavender },
      { name: 'Sofia Almeida', role: 'Product Ops Lead', initials: 'SA', color: C.teal },
      { name: 'Jan Richter', role: 'Strategy Lead', initials: 'JR', color: C.wisteria },
    ],
    topics: ['B2B SaaS', 'Growth Strategy', 'Pricing'],
    privatePreferences: ['Hiking', 'Cycling'],
  },
  {
    id: 6,
    name: 'Responsible AI Forum',
    location: 'Berlin',
    format: 'In Person',
    members: [
      { name: 'Tobias Nguyen', role: 'AI Product Lead', initials: 'TN', color: C.teal },
      { name: 'Miriam Okafor', role: 'Director of Product', initials: 'MO', color: C.wisteria },
      { name: 'Laura Weber', role: 'Engineering Lead', initials: 'LW', color: C.lavender },
      { name: 'Anna Becker', role: 'Product Lead', initials: 'AB', color: '#C8B8E8' },
    ],
    topics: ['AI', 'Responsible Tech', 'Leadership'],
    privatePreferences: ['Podcasts', 'Specialty Coffee'],
  },
  {
    id: 7,
    name: 'Commerce Product Exchange',
    location: 'Düsseldorf',
    format: 'Hybrid',
    members: [
      { name: 'Carla Mendes', role: 'Group PM', initials: 'CM', color: C.wisteria },
      { name: 'Felix Maier', role: 'Product Lead', initials: 'FM', color: C.teal },
      { name: 'Mia Schulz', role: 'Group PM', initials: 'MS', color: C.lavender },
    ],
    topics: ['Commerce', 'Go-to-Market', 'Analytics'],
    privatePreferences: ['Architecture', 'Travel'],
  },
  {
    id: 8,
    name: 'Platform Leaders',
    location: 'Frankfurt',
    format: 'Online',
    members: [
      { name: 'Jan Richter', role: 'Strategy Lead', initials: 'JR', color: C.lavender },
      { name: 'Nils Hartmann', role: 'Principal PM', initials: 'NH', color: C.teal },
      { name: 'Jonas Neumann', role: 'Principal PM', initials: 'JN', color: C.wisteria },
    ],
    topics: ['Platform Strategy', 'Data Products', 'B2B Sales'],
    privatePreferences: ['Cycling', 'Reading'],
  },
  {
    id: 9,
    name: 'Product Operations Lab',
    location: 'Köln',
    format: 'In Person',
    members: [
      { name: 'Sofia Almeida', role: 'Product Ops Lead', initials: 'SA', color: C.teal },
      { name: 'Nina Koch', role: 'Engineering Lead', initials: 'NK', color: C.lavender },
      { name: 'Lea König', role: 'UX Research Lead', initials: 'LK', color: C.wisteria },
      { name: 'Lukas Klein', role: 'Senior PM', initials: 'LK2', color: '#C8B8E8' },
    ],
    topics: ['Product Operations', 'OKRs & Metrics', 'Org Design'],
    privatePreferences: ['Cooking', 'Yoga'],
  },
  {
    id: 10,
    name: 'Customer Experience Collective',
    location: 'Berlin',
    format: 'Hybrid',
    members: [
      { name: 'Miriam Okafor', role: 'Director of Product', initials: 'MO', color: C.wisteria },
      { name: 'Aylin Demir', role: 'Senior Product Designer', initials: 'AD', color: C.teal },
      { name: 'Paul Richter', role: 'Senior PM', initials: 'PR', color: C.lavender },
    ],
    topics: ['Customer Experience', 'User Research', 'Design Strategy'],
    privatePreferences: ['Photography', 'Travel'],
  },
]

function seasonTitleForQuain(quain: OpenQuain, memberCount: number) {
  if (quain.name) return quain.name
  if (memberCount >= QUAIN_MIN_MEMBERS) return `${quain.topics[0]} Exchange`
  return null
}

// ── Shared primitives ──────────────────────────────────────────

function Avatar({ initials, color, size = 40 }: { initials: string; color: string; size?: number }) {
  const lightColors = [C.lime, C.mint, '#DBF4A7', '#D5F9DE']
  const textColor = color === HIGHLIGHT ? HIGHLIGHT_TEXT : lightColors.includes(color) ? '#2A4A30' : '#fff'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: color,
      outline: color === HIGHLIGHT ? `1.5px solid ${HIGHLIGHT_OUTLINE}` : 'none', outlineOffset: -1.5,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.34, fontWeight: 700, color: textColor, flexShrink: 0,
      fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em',
    }} />
  )
}

// Avatar with text content (initials rendered as text child)
function AvatarLabel({ initials, color, size = 40 }: { initials: string; color: string; size?: number }) {
  const lightColors = [C.lime, C.mint, '#DBF4A7', '#D5F9DE']
  const textColor = color === HIGHLIGHT ? HIGHLIGHT_TEXT : lightColors.includes(color) ? '#2A4A30' : '#fff'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: color,
      outline: color === HIGHLIGHT ? `1.5px solid ${HIGHLIGHT_OUTLINE}` : 'none', outlineOffset: -1.5,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.34, fontWeight: 700, color: textColor, flexShrink: 0,
      fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em',
    }}>
      {initials}
    </div>
  )
}

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i + 1 === current ? 22 : 7, height: 7, borderRadius: 4,
          background: i + 1 <= current ? C.teal : C.border,
          transition: 'all 0.3s ease',
        }} />
      ))}
    </div>
  )
}

function BackButton({ onClick, label = 'Zurück' }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '7px 10px 7px 0', background: 'transparent', border: 'none',
      color: C.lavender, fontSize: 13, fontWeight: 600, cursor: 'pointer',
      fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap',
    }}>
      ← {label}
    </button>
  )
}

function BellIcon({ size = 20 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6.8 9.7a5.2 5.2 0 0 1 10.4 0c0 6.1 2.3 6.1 2.3 7.6H4.5c0-1.5 2.3-1.5 2.3-7.6Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.8 20h4.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function ChatIcon({ size = 20 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5 5.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8l-5 3v-3H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M7.5 11.5h.1m4.35 0h.1m4.35 0h.1" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

function BookmarkIcon({ filled = false, size = 20 }: { filled?: boolean; size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'}>
      <path d="M7 4.5h10a1.5 1.5 0 0 1 1.5 1.5v14l-6.5-4-6.5 4V6A1.5 1.5 0 0 1 7 4.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

function CameraIcon({ size = 18 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4.5 8.5A1.5 1.5 0 0 1 6 7h2l1.2-2h5.6L16 7h2a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 18 19H6a1.5 1.5 0 0 1-1.5-1.5v-9Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

function ProfilePhotoPicker({ photo, initials, onChange, size = 82 }: {
  photo: string | null
  initials: string
  onChange: (photo: string) => void
  size?: number
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <button
        onClick={() => inputRef.current?.click()}
        aria-label={photo ? 'Profilfoto ändern' : 'Profilfoto hinzufügen'}
        style={{
          width: size, height: size, padding: 0, borderRadius: '50%',
          border: `2px solid ${C.card}`, background: C.subtle, cursor: 'pointer',
          overflow: 'hidden', boxShadow: '0 4px 18px rgba(34,43,38,0.12)',
        }}
      >
        {photo ? (
          <img src={photo} alt="Dein Profilfoto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <AvatarLabel initials={initials} color={HIGHLIGHT} size={size} />
        )}
      </button>
      <span style={{
        position: 'absolute', right: -2, bottom: 1, width: 30, height: 30,
        borderRadius: '50%', background: C.lavender, color: '#fff',
        border: `3px solid ${C.card}`, pointerEvents: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <CameraIcon size={15} />
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        aria-label="Profilfoto auswählen"
        style={{ display: 'none' }}
        onChange={event => {
          const file = event.target.files?.[0]
          if (!file) return
          const reader = new FileReader()
          reader.onload = () => {
            if (typeof reader.result === 'string') onChange(reader.result)
          }
          reader.readAsDataURL(file)
          event.target.value = ''
        }}
      />
    </div>
  )
}

function NotificationBell({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Benachrichtigungen öffnen"
      style={{
        position: 'absolute', top: 8, right: 54, zIndex: 30,
        width: 34, height: 34, borderRadius: '50%', border: 'none',
        background: 'transparent', color: C.ink, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <BellIcon />
      <span style={{
        position: 'absolute', top: 4, right: 4, width: 7, height: 7,
        borderRadius: '50%', background: C.lavender, border: '1.5px solid #fff',
      }} />
    </button>
  )
}

function NotificationPanel({ onClose }: { onClose: () => void }) {
  const notifications = [
    { title: 'Nächstes Treffen', text: 'Eure Online-Challenge ist am Freitag um 19:00 Uhr.', time: 'Heute' },
    { title: 'Neue Nachricht', text: 'Laura hat im QUAIN-Chat geschrieben.', time: 'Vor 2 Std.' },
    { title: 'QUAIN Update', text: 'Für euren nächsten Season Step gibt es neue Details.', time: 'Gestern' },
  ]

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0, zIndex: 40, padding: '58px 18px 24px',
        background: 'rgba(26,31,28,0.22)', backdropFilter: 'blur(8px)',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="notifications-title"
        onClick={event => event.stopPropagation()}
        style={{
          background: C.card, borderRadius: 24, padding: '22px 20px',
          border: `1px solid ${C.border}`, boxShadow: '0 22px 60px rgba(34,43,38,0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h2 id="notifications-title" style={{ margin: 0, fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, color: C.ink }}>
            Benachrichtigungen
          </h2>
          <button onClick={onClose} aria-label="Benachrichtigungen schließen" style={{
            width: 32, height: 32, borderRadius: '50%', border: 'none',
            background: C.subtle, color: C.ink, cursor: 'pointer', fontSize: 18,
          }}>
            ×
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notifications.map(notification => (
            <div key={notification.title} style={{
              padding: '14px 15px', borderRadius: 16, background: C.subtle,
              border: `1px solid ${C.border}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{notification.title}</span>
                <span style={{ fontSize: 10, color: C.muted, whiteSpace: 'nowrap' }}>{notification.time}</span>
              </div>
              <p style={{ margin: 0, fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>{notification.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Btn({ onClick, children, disabled, variant = 'primary', small }: {
  onClick?: () => void; children: React.ReactNode; disabled?: boolean
  variant?: 'primary' | 'ghost'; small?: boolean
}) {
  const base: React.CSSProperties = {
    width: variant === 'ghost' ? 'auto' : '100%',
    padding: small ? '10px 20px' : '17px',
    border: 'none', borderRadius: 16,
    fontSize: small ? 14 : 16, fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: "'Outfit', sans-serif", transition: 'all 0.18s ease',
    letterSpacing: '-0.01em',
  }
  if (variant === 'ghost') {
    return (
      <button onClick={onClick} style={{ ...base, background: 'transparent', color: C.lavender }}>
        {children}
      </button>
    )
  }
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...base, background: disabled ? '#D4D8D3' : C.lavender, color: '#fff',
      boxShadow: disabled ? 'none' : '0 4px 20px rgba(125,132,178,0.35)',
    }}>
      {children}
    </button>
  )
}

function Chip({ label, selected, onToggle }: { label: string; selected: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} style={{
      padding: '9px 18px', borderRadius: 100, fontSize: 13.5, fontWeight: selected ? 600 : 400,
      cursor: 'pointer', fontFamily: "'Outfit', sans-serif", transition: 'all 0.15s ease',
      whiteSpace: 'nowrap', border: selected ? `1.5px solid ${HIGHLIGHT_OUTLINE}` : `1.5px solid ${C.border}`,
      background: selected ? HIGHLIGHT : C.subtle, color: selected ? HIGHLIGHT_TEXT : '#444',
    }}>
      {label}
    </button>
  )
}

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.card, borderRadius: 20, padding: '20px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)',
      border: `1px solid ${C.border}`, ...style,
    }}>
      {children}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11, color: '#999', fontWeight: 700,
      letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8,
    }}>
      {children}
    </div>
  )
}

function Tag({ children, variant = 'lavender' }: { children: React.ReactNode; variant?: 'lavender' | 'teal' }) {
  const styles = {
    lavender: { background: '#EEF1FF', color: '#4A529A' },
    teal:     { background: '#EBF5F0', color: '#2D6148' },
  }
  return (
    <span style={{
      padding: '6px 14px', borderRadius: 100, fontSize: 13, fontWeight: 500,
      fontFamily: "'Outfit', sans-serif", ...styles[variant],
    }}>
      {children}
    </span>
  )
}

// ── Screen: Welcome ─────────────────────────────────────────────
function WelcomeScreen({ onNext }: { onNext: () => void }) {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <div style={{ width: '100%', maxWidth: 390, height: '100dvh', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(155deg, #D5F9DE 0%, #EEF1FF 42%, #E4E7F8 100%)',
      }} />
      <div style={{ position: 'absolute', top: -110, right: -90, width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(143,166,203,0.38) 0%, transparent 68%)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: 60, left: -110, width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(219,244,167,0.45) 0%, transparent 68%)', zIndex: 0 }} />

      {/* Status bar */}
      <div className="fake-status" style={{ height: 52, display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#2A2F2C' }}>9:41</span>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <div style={{ width: 18, height: 11, border: '2px solid #333', borderRadius: 3, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: '2px 3px', background: '#333', borderRadius: 1 }} />
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 32px 0', position: 'relative', zIndex: 1 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', marginBottom: 28,
            background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(10px)',
            padding: '7px 14px', borderRadius: 100, width: 'fit-content',
            border: '1px solid rgba(255,255,255,0.8)',
          }}>
            <span style={{ fontSize: 11, letterSpacing: '0.14em', color: C.lavender, fontWeight: 700 }}>QUAIN</span>
          </div>

          <h1 style={{
            fontFamily: "'Instrument Serif', serif", fontSize: 54, lineHeight: 1.07,
            color: C.ink, margin: '0 0 28px', fontWeight: 400,
          }}>
            Eine kleine,<br />
            <em>vertraute</em><br />
            Runde.
          </h1>

          <p style={{ fontSize: 16, color: '#44504A', lineHeight: 1.65, margin: 0, maxWidth: 270 }}>
            Deine berufliche Basis aus vertrauensvollen Beziehungen zu anderen Product Professionals — aufgebaut in guten Zeiten, für die Momente, die zählen.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '0 32px 52px', position: 'relative', zIndex: 1 }}>
        <button onClick={onNext} style={{
          width: '100%', padding: '18px',
          background: C.lavender, color: '#fff', border: 'none', borderRadius: 16,
          fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
          boxShadow: '0 6px 24px rgba(125,132,178,0.42)', letterSpacing: '-0.01em',
        }}>
          Anmelden
        </button>
        <button onClick={() => setShowInfo(true)} style={{
          width: '100%', padding: '15px', background: 'transparent', color: C.lavender,
          border: 'none', fontSize: 14, fontWeight: 500, cursor: 'pointer',
          fontFamily: "'Outfit', sans-serif", marginTop: 4,
        }}>
          Was ist Quain? →
        </button>
      </div>

      {showInfo && (
        <div
          role="presentation"
          onClick={() => setShowInfo(false)}
          style={{
            position: 'absolute', inset: 0, zIndex: 10, padding: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(26,31,28,0.28)', backdropFilter: 'blur(10px)',
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="quain-info-title"
            onClick={event => event.stopPropagation()}
            style={{
              width: '100%', padding: '30px 26px 24px', borderRadius: 28,
              background: 'rgba(255,255,255,0.94)',
              border: '1px solid rgba(255,255,255,0.8)',
              boxShadow: '0 24px 70px rgba(42,47,44,0.24)',
            }}
          >
            <span style={{
              display: 'inline-block', padding: '6px 12px', borderRadius: 100,
              background: '#EEF1FF', color: C.lavender, fontSize: 10,
              fontWeight: 700, letterSpacing: '0.14em', marginBottom: 18,
            }}>
              QUAIN
            </span>
            <h2 id="quain-info-title" style={{
              margin: '0 0 14px', color: C.ink, fontFamily: "'Instrument Serif', serif",
              fontSize: 36, lineHeight: 1.1, fontWeight: 400,
            }}>
              Verbindungen, die bleiben.
            </h2>
            <p style={{ margin: '0 0 24px', color: C.muted, fontSize: 15, lineHeight: 1.65 }}>
              QUAIN verbindet dich gezielt mit passenden Product Professionals – in einer vertrauten Gruppe von drei bis fünf Personen oder im 1:1. So entstehen echte berufliche Beziehungen durch regelmäßigen, persönlichen Austausch.
            </p>
            <button onClick={() => setShowInfo(false)} style={{
              width: '100%', padding: '15px', border: 'none', borderRadius: 15,
              background: C.lavender, color: '#fff', cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 600,
            }}>
              Verstanden
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Screen: Account choice ──────────────────────────────────────
function CompanyAccountIcon() {
  return (
    <svg aria-hidden="true" width="25" height="25" viewBox="0 0 24 24" fill="none">
      <path d="M4.5 20V5.5A1.5 1.5 0 0 1 6 4h8a1.5 1.5 0 0 1 1.5 1.5V20M15.5 9H19a1 1 0 0 1 1 1v10M8 8h1.5M8 11.5h1.5M8 15h1.5M12 8h.5M12 11.5h.5M12 15h.5M3 20h18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PrivateAccountIcon() {
  return (
    <svg aria-hidden="true" width="25" height="25" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5.5 20c.6-4 2.8-6 6.5-6s5.9 2 6.5 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M19 5v4M17 7h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function AccountChoiceScreen({ onBack, onSelect }: {
  onBack: () => void
  onSelect: (accountType: AccountType) => void
}) {
  const choices = [
    {
      type: 'company' as const,
      icon: <CompanyAccountIcon />,
      title: 'Mit Firmenkonto anmelden',
      description: 'Nutze den sicheren Zugang deines Unternehmens.',
      accent: C.lavender,
      iconBackground: '#EEF1FF',
    },
    {
      type: 'private' as const,
      icon: <PrivateAccountIcon />,
      title: 'Privates Konto erstellen',
      description: 'Registriere dich unabhängig mit deiner privaten E-Mail-Adresse.',
      accent: C.teal,
      iconBackground: '#EBF5F0',
    },
  ]

  return (
    <div style={{
      height: '100%', overflow: 'hidden', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', position: 'relative',
      padding: '44px 20px 30px', background: C.bg,
    }}>
      <div style={{
        position: 'absolute', top: -130, right: -120, width: 320, height: 320,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(143,166,203,0.22) 0%, transparent 70%)',
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <BackButton onClick={onBack} />
      </div>

      <div style={{ height: 54 }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 22,
          background: '#EBF5F0', padding: '7px 13px', borderRadius: 100,
          border: '1px solid #C8E8D8',
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.teal }} />
          <span style={{ fontSize: 11, letterSpacing: '0.12em', color: C.teal, fontWeight: 700 }}>DEIN ZUGANG</span>
        </div>
        <h2 style={{
          fontFamily: "'Instrument Serif', serif", fontSize: 38, color: C.ink,
          margin: '0 0 12px', fontWeight: 400, lineHeight: 1.12,
        }}>
          Wie möchtest du<br />QUAIN nutzen?
        </h2>
        <p style={{ fontSize: 14.5, color: C.muted, margin: '0 0 32px', lineHeight: 1.6 }}>
          Wähle den Zugang, der zu dir passt. Du kannst deine Auswahl später ändern.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', zIndex: 1 }}>
        {choices.map(choice => (
          <button
            key={choice.type}
            onClick={() => onSelect(choice.type)}
            style={{
              width: '100%', padding: '18px', display: 'flex', alignItems: 'center', gap: 15,
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 20,
              cursor: 'pointer', textAlign: 'left', fontFamily: "'Outfit', sans-serif",
              boxShadow: '0 4px 18px rgba(34,43,38,0.055)',
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 15, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: choice.iconBackground, color: choice.accent,
            }}>
              {choice.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: C.ink, fontSize: 15, fontWeight: 700, marginBottom: 5 }}>
                {choice.title}
              </div>
              <div style={{ color: C.muted, fontSize: 12.5, lineHeight: 1.45 }}>
                {choice.description}
              </div>
            </div>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: choice.iconBackground, color: choice.accent, fontSize: 17, fontWeight: 600,
            }}>
              →
            </div>
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }} />
      <p style={{
        position: 'relative', zIndex: 1, color: '#8A908B', fontSize: 11.5,
        lineHeight: 1.55, textAlign: 'center', margin: '24px 12px 0',
      }}>
        Mit deiner Auswahl stimmst du unseren Datenschutz- und Nutzungsbedingungen zu.
      </p>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.5-.2-2.2H12v4.3h5.4a4.7 4.7 0 0 1-2 3v2.8h3.4c2-1.9 2.8-4.6 2.8-7.9Z" />
      <path fill="#34A853" d="M12 22c2.8 0 5.1-.9 6.8-2.5l-3.4-2.7c-.9.6-2.1 1-3.4 1a6 6 0 0 1-5.6-4.1H2.9v2.8A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.4 13.7A6 6 0 0 1 6.1 12c0-.6.1-1.2.3-1.7V7.5H2.9A10 10 0 0 0 2 12c0 1.6.4 3.1.9 4.5l3.5-2.8Z" />
      <path fill="#EA4335" d="M12 6.1c1.5 0 2.8.5 3.9 1.5l2.9-2.9A9.7 9.7 0 0 0 12 2a10 10 0 0 0-9.1 5.5l3.5 2.8A6 6 0 0 1 12 6.1Z" />
    </svg>
  )
}

function EmailOutlineIcon() {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="5" width="17" height="14" rx="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="m5 7 7 5.5L19 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PrivateSignupMethodScreen({ onBack, onGoogle }: {
  onBack: () => void
  onGoogle: () => void
  onEmail: () => void
}) {
  const options = [
    {
      title: 'Mit Google registrieren',
      description: 'Schnell und sicher mit deinem Google-Konto.',
      icon: <GoogleIcon />,
      onClick: onGoogle,
      iconBackground: '#F7F8F7',
      iconColor: C.ink,
    },
    // Web-Demonstrator: nur Google-Registrierung, kürzere Time to Value (Nicolas, 2026-11-12).
    // Die E-Mail-Registrierung (onEmail) bleibt im Code, wird hier aber nicht angeboten.
  ]

  return (
    <div style={{
      height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
      padding: '44px 20px 30px', background: C.bg, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -120, left: -150, width: 360, height: 360,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(219,244,167,0.32) 0%, transparent 70%)',
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}><BackButton onClick={onBack} /></div>
      <div style={{ height: 62 }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 22,
          background: '#EEF1FF', padding: '7px 13px', borderRadius: 100,
          border: '1px solid #D7DCF5',
        }}>
          <PrivateAccountIcon />
          <span style={{ fontSize: 11, letterSpacing: '0.12em', color: C.lavender, fontWeight: 700 }}>PRIVATES KONTO</span>
        </div>
        <h2 style={{
          fontFamily: "'Instrument Serif', serif", fontSize: 38, color: C.ink,
          margin: '0 0 12px', fontWeight: 400, lineHeight: 1.12,
        }}>
          Wie möchtest du<br />dich registrieren?
        </h2>
        <p style={{ fontSize: 14.5, color: C.muted, margin: '0 0 34px', lineHeight: 1.6 }}>
          Wähle eine Option, um dein privates QUAIN-Konto zu erstellen.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', zIndex: 1 }}>
        {options.map(option => (
          <button key={option.title} onClick={option.onClick} style={{
            width: '100%', padding: '18px', display: 'flex', alignItems: 'center', gap: 15,
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 20,
            cursor: 'pointer', textAlign: 'left', fontFamily: "'Outfit', sans-serif",
            boxShadow: '0 4px 18px rgba(34,43,38,0.055)',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 15, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: option.iconBackground, color: option.iconColor,
            }}>
              {option.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: C.ink, fontSize: 15, fontWeight: 700, marginBottom: 5 }}>{option.title}</div>
              <div style={{ color: C.muted, fontSize: 12.5, lineHeight: 1.45 }}>{option.description}</div>
            </div>
            <span style={{ color: C.lavender, fontSize: 19, fontWeight: 600 }}>→</span>
          </button>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <p style={{ color: '#8A908B', fontSize: 11.5, lineHeight: 1.55, textAlign: 'center', margin: '24px 14px 0' }}>
        Deine Daten werden verschlüsselt übertragen und nicht ohne deine Zustimmung geteilt.
      </p>
    </div>
  )
}

function PrivateEmailRegistrationScreen({ onBack, onSubmit }: {
  onBack: () => void
  onSubmit: (profile: PrivateProfile) => void
}) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    password: '',
  })
  const fields = [
    { key: 'firstName' as const, label: 'Vorname', placeholder: 'Max', type: 'text', autoComplete: 'given-name' },
    { key: 'lastName' as const, label: 'Nachname', placeholder: 'Müller', type: 'text', autoComplete: 'family-name' },
    { key: 'email' as const, label: 'Private E-Mail-Adresse', placeholder: 'max@beispiel.de', type: 'email', autoComplete: 'email' },
    { key: 'role' as const, label: 'Berufliche Position', placeholder: 'z. B. Product Manager', type: 'text', autoComplete: 'organization-title' },
    { key: 'password' as const, label: 'Passwort', placeholder: 'Mindestens 8 Zeichen', type: 'password', autoComplete: 'new-password' },
  ]
  const canSubmit = Boolean(
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.includes('@') &&
    form.role.trim() &&
    form.password.length >= 8
  )

  return (
    <div style={{
      height: '100%', overflowY: 'auto', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', padding: '44px 20px 28px', background: C.bg,
    }}>
      <BackButton onClick={onBack} />
      <div style={{ height: 34 }} />
      <h2 style={{
        fontFamily: "'Instrument Serif', serif", fontSize: 36, color: C.ink,
        margin: '0 0 10px', fontWeight: 400, lineHeight: 1.15,
      }}>
        Dein privates<br />Konto
      </h2>
      <p style={{ fontSize: 14.5, color: C.muted, margin: '0 0 28px', lineHeight: 1.6 }}>
        Verrate uns kurz, wer du bist. Diese Angaben bilden die Basis für dein Profil.
      </p>

      {fields.map(field => (
        <label key={field.key} style={{
          display: 'block', marginBottom: 15, color: '#777D78',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
        }}>
          {field.label}
          <input
            value={form[field.key]}
            onChange={event => setForm(current => ({ ...current, [field.key]: event.target.value }))}
            placeholder={field.placeholder}
            type={field.type}
            autoComplete={field.autoComplete}
            style={{
              width: '100%', boxSizing: 'border-box', marginTop: 8, padding: '14px 15px',
              background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 13,
              color: C.ink, fontFamily: "'Outfit', sans-serif", fontSize: 15,
              outlineColor: C.lavender,
            }}
          />
        </label>
      ))}

      <p style={{ fontSize: 11.5, color: '#8A908B', lineHeight: 1.5, margin: '2px 2px 20px' }}>
        Dein Passwort muss mindestens 8 Zeichen enthalten.
      </p>
      <Btn
        disabled={!canSubmit}
        onClick={() => onSubmit({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          role: form.role.trim(),
        })}
      >
        Konto erstellen
      </Btn>
    </div>
  )
}

function RegistrationSuccessScreen({ email, onNext }: { email: string; onNext: () => void }) {
  return (
    <div style={{
      height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '74px 28px 36px', background: C.bg,
      position: 'relative', overflow: 'hidden', textAlign: 'center',
    }}>
      <div style={{
        position: 'absolute', top: 70, width: 330, height: 330, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(213,249,222,0.85) 0%, rgba(238,241,255,0.55) 48%, transparent 72%)',
      }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{
          width: 88, height: 88, borderRadius: '50%', display: 'flex',
          alignItems: 'center', justifyContent: 'center', marginBottom: 30,
          background: HIGHLIGHT, color: HIGHLIGHT_TEXT, boxShadow: '0 12px 32px rgba(138,163,153,0.22)',
          outline: `1.5px solid ${HIGHLIGHT_OUTLINE}`, outlineOffset: -1.5,
        }}>
          <svg aria-hidden="true" width="42" height="42" viewBox="0 0 24 24" fill="none">
            <path d="m6.5 12.5 3.5 3.5 7.5-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 20,
          padding: '7px 13px', borderRadius: 100, background: '#EBF5F0', border: '1px solid #C8E8D8',
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.teal }} />
          <span style={{ fontSize: 11, letterSpacing: '0.12em', color: C.teal, fontWeight: 700 }}>ERFOLGREICH REGISTRIERT</span>
        </div>
        <h2 style={{
          fontFamily: "'Instrument Serif', serif", fontSize: 42, color: C.ink,
          margin: '0 0 14px', fontWeight: 400, lineHeight: 1.08,
        }}>
          Schön, dass du<br />dabei bist.
        </h2>
        <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.6, margin: '0 0 24px', maxWidth: 285 }}>
          Dein privates QUAIN-Konto wurde erfolgreich erstellt.
        </p>
        <div style={{
          padding: '11px 16px', borderRadius: 100, background: C.card,
          border: `1px solid ${C.border}`, color: C.ink, fontSize: 13, fontWeight: 600,
        }}>
          {email}
        </div>
      </div>
      <div style={{ width: '100%', position: 'relative', zIndex: 1 }}>
        <Btn onClick={onNext}>Weiter</Btn>
      </div>
    </div>
  )
}

// ── Screen: Profile ─────────────────────────────────────────────
function ProfileScreen({ accountType, privateProfile, onBack, onNext }: {
  accountType: AccountType
  privateProfile: PrivateProfile
  onBack: () => void
  onNext: () => void
}) {
  const profileFields = accountType === 'company'
    ? [
        { label: 'Name', value: 'Max Müller' },
        { label: 'Alter', value: '34 Jahre' },
        { label: 'Position', value: 'Senior Product Manager' },
      ]
    : [
        { label: 'Name', value: `${privateProfile.firstName} ${privateProfile.lastName}` },
        { label: 'E-Mail', value: privateProfile.email },
        { label: 'Position', value: privateProfile.role },
      ]

  return (
    <div style={{
      height: '100%', overflowY: 'auto', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column',
      padding: '44px 20px 28px', background: C.bg,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <BackButton onClick={onBack} />
        <StepDots current={2} total={8} />
      </div>
      <div style={{ height: 40 }} />
      <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 36, color: C.ink, margin: '0 0 12px', fontWeight: 400, lineHeight: 1.15 }}>
        Profil<br />bestätigen
      </h2>
      <p style={{ fontSize: 15, color: C.muted, margin: '0 0 36px', lineHeight: 1.6 }}>
        Hilft bei der Zusammenstellung deines QUAINs.
      </p>

      {/* Account badge */}
      <div style={{
        padding: '14px 16px', background: accountType === 'company' ? '#EBF5F0' : '#EEF1FF', borderRadius: 14,
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
        border: `1px solid ${accountType === 'company' ? '#C8E8D8' : '#D7DCF5'}`,
      }}>
        <div style={{
          width: 40, height: 40, background: '#fff', borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accountType === 'company' ? C.teal : C.lavender, flexShrink: 0,
        }}>
          {accountType === 'company' ? <CompanyAccountIcon /> : <PrivateAccountIcon />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: accountType === 'company' ? C.teal : C.lavender, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>
            {accountType === 'company' ? 'Unternehmen' : 'Konto'}
          </div>
          <div style={{ fontWeight: 700, color: C.ink, fontSize: 15 }}>
            {accountType === 'company' ? 'Lumio SE' : 'Privates Konto'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: accountType === 'company' ? C.teal : C.lavender }} />
          <span style={{ fontSize: 11, color: accountType === 'company' ? C.teal : C.lavender, fontWeight: 700 }}>
            {accountType === 'company' ? 'Verifiziert' : 'Registriert'}
          </span>
        </div>
      </div>

      {profileFields.map(({ label, value }) => (
        <div key={label} style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, color: '#999', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            {label}
          </label>
          <div style={{
            padding: '14px 16px', background: C.card, border: `1.5px solid ${C.border}`,
            borderRadius: 13, fontSize: 15, color: C.ink, fontFamily: "'Outfit', sans-serif",
          }}>
            {value}
          </div>
        </div>
      ))}

      <div style={{ flex: 1 }} />
      <Btn onClick={onNext}>Weiter</Btn>
    </div>
  )
}

// ── Screen: Profile details ─────────────────────────────────────
function ProfileDetailsScreen({ accountType, value, onChange, onBack, onNext }: {
  accountType: AccountType
  value: ProfileDetails
  onChange: (value: ProfileDetails) => void
  onBack: () => void
  onNext: () => void
}) {
  const age = Number(value.age)
  const canContinue =
    value.role.trim().length >= 2 &&
    Number.isInteger(age) && age >= 18 && age <= 99 &&
    value.focus.trim().length >= 2 &&
    value.intro.trim().length >= 20
  const update = (field: keyof ProfileDetails, fieldValue: string) =>
    onChange({ ...value, [field]: fieldValue })
  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '13px 14px',
    borderRadius: 13, border: `1.5px solid ${C.border}`, outlineColor: C.lavender,
    background: C.card, color: C.ink, fontFamily: "'Outfit', sans-serif", fontSize: 14,
  }

  return (
    <div style={{
      height: '100%', overflowY: 'auto', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column',
      padding: '44px 20px 28px', background: C.bg,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <BackButton onClick={onBack} />
        <StepDots current={3} total={8} />
      </div>
      <div style={{ height: 30 }} />
      <h2 style={{
        fontFamily: "'Instrument Serif', serif", fontSize: 36, color: C.ink,
        margin: '0 0 10px', fontWeight: 400, lineHeight: 1.12,
      }}>
        Erzähl uns etwas<br />über dich.
      </h2>
      <p style={{ fontSize: 14, color: C.muted, margin: '0 0 26px', lineHeight: 1.55 }}>
        Diese Angaben erscheinen in deinem QUAIN-Profil und helfen anderen, dich besser kennenzulernen.
      </p>

      {accountType === 'company' && (
        <div style={{
          padding: '14px 16px', background: '#EBF5F0', borderRadius: 14,
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
          border: '1px solid #C8E8D8',
        }}>
          <div style={{
            width: 40, height: 40, background: '#fff', borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.teal, flexShrink: 0,
          }}>
            <CompanyAccountIcon />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: C.teal, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>
              Unternehmen
            </div>
            <div style={{ fontWeight: 700, color: C.ink, fontSize: 15 }}>Lumio SE</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.teal }} />
            <span style={{ fontSize: 11, color: C.teal, fontWeight: 700 }}>Verifiziert</span>
          </div>
        </div>
      )}

      <label style={{ display: 'block', marginBottom: 16 }}>
        <span style={{ display: 'block', fontSize: 11, color: C.muted, fontWeight: 700, marginBottom: 7, letterSpacing: '0.06em' }}>
          ROLLE ODER POSITION
        </span>
        <input
          value={value.role}
          onChange={event => update('role', event.target.value)}
          placeholder="z. B. Senior Product Manager"
          style={inputStyle}
        />
      </label>

      <label style={{ display: 'block', marginBottom: 16 }}>
        <span style={{ display: 'block', fontSize: 11, color: C.muted, fontWeight: 700, marginBottom: 7, letterSpacing: '0.06em' }}>
          ALTER
        </span>
        <input
          type="number"
          min={18}
          max={99}
          inputMode="numeric"
          value={value.age}
          onChange={event => update('age', event.target.value)}
          placeholder="z. B. 34"
          style={inputStyle}
        />
      </label>

      <label style={{ display: 'block', marginBottom: 16 }}>
        <span style={{ display: 'block', fontSize: 11, color: C.muted, fontWeight: 700, marginBottom: 7, letterSpacing: '0.06em' }}>
          {accountType === 'company' ? 'BEREICH ODER TEAM' : 'BERUFLICHER SCHWERPUNKT'}
        </span>
        <input
          value={value.focus}
          onChange={event => update('focus', event.target.value)}
          placeholder={accountType === 'company' ? 'z. B. Customer Experience' : 'z. B. B2B SaaS & Growth'}
          style={inputStyle}
        />
      </label>

      <label style={{ display: 'block', marginBottom: 8 }}>
        <span style={{ display: 'block', fontSize: 11, color: C.muted, fontWeight: 700, marginBottom: 7, letterSpacing: '0.06em' }}>
          KURZVORSTELLUNG
        </span>
        <textarea
          value={value.intro}
          onChange={event => update('intro', event.target.value)}
          placeholder="Was treibt dich beruflich an und worüber möchtest du dich austauschen?"
          rows={4}
          maxLength={280}
          style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }}
        />
        <span style={{ display: 'block', marginTop: 5, textAlign: 'right', fontSize: 10.5, color: C.muted }}>
          {value.intro.length}/280
        </span>
      </label>

      <div style={{ flex: 1, minHeight: 20 }} />
      <Btn onClick={onNext} disabled={!canContinue}>Weiter</Btn>
    </div>
  )
}

// ── Screen: Location ────────────────────────────────────────────
function LocationScreen({ value, onChange, onBack, onNext }: {
  value: string
  onChange: (value: string) => void
  onBack: () => void
  onNext: () => void
}) {
  const [mode, setMode] = useState<'manual' | 'precise'>(value.startsWith('Genauer Standort:') ? 'precise' : 'manual')
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    value.startsWith('Genauer Standort:') ? 'success' : 'idle'
  )

  const requestLocation = () => {
    setMode('precise')
    setGeoStatus('loading')
    if (!navigator.geolocation) {
      setGeoStatus('error')
      return
    }
    navigator.geolocation.getCurrentPosition(
      position => {
        onChange(`Genauer Standort: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`)
        setGeoStatus('success')
      },
      () => setGeoStatus('error'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const canContinue = mode === 'precise' ? geoStatus === 'success' : value.trim().length >= 2

  return (
    <div style={{
      height: '100%', overflowY: 'auto', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column',
      padding: '44px 20px 28px', background: C.bg,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <BackButton onClick={onBack} />
        <StepDots current={4} total={8} />
      </div>
      <div style={{ height: 38 }} />
      <div style={{
        width: 58, height: 58, borderRadius: 18, marginBottom: 22,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#EEF1FF', color: C.lavender,
      }}>
        <LocationIcon />
      </div>
      <h2 style={{
        fontFamily: "'Instrument Serif', serif", fontSize: 36, color: C.ink,
        margin: '0 0 12px', fontWeight: 400, lineHeight: 1.12,
      }}>
        Wo möchtest du<br />Menschen treffen?
      </h2>
      <p style={{ fontSize: 14.5, color: C.muted, margin: '0 0 28px', lineHeight: 1.6 }}>
        Deine Location hilft uns, passende Product Professionals, 1:1s und QUAINs in deiner Nähe zu finden.
      </p>

      <button onClick={requestLocation} style={{
        width: '100%', padding: '17px', borderRadius: 18, cursor: 'pointer',
        border: `1.5px solid ${mode === 'precise' ? C.lavender : C.border}`,
        background: mode === 'precise' ? '#EEF1FF' : C.card,
        fontFamily: "'Outfit', sans-serif", textAlign: 'left', marginBottom: 12,
        display: 'flex', alignItems: 'center', gap: 13,
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: 13, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: mode === 'precise' ? C.lavender : C.subtle,
          color: mode === 'precise' ? '#fff' : C.ink,
        }}>
          <LocationIcon />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: C.ink, fontSize: 14, fontWeight: 700, marginBottom: 3 }}>
            Genauen Standort verwenden
          </div>
          <div style={{ color: C.muted, fontSize: 11.5, lineHeight: 1.4 }}>
            {geoStatus === 'loading' && 'Standort wird ermittelt …'}
            {geoStatus === 'success' && 'Standort erfolgreich erkannt'}
            {geoStatus === 'error' && 'Freigabe nicht möglich – bitte Ort eingeben'}
            {geoStatus === 'idle' && 'Einmalig über deinen Browser freigeben'}
          </div>
        </div>
        {geoStatus === 'success' && <span style={{ color: C.teal, fontWeight: 800 }}>✓</span>}
      </button>

      <div style={{
        padding: '14px 15px', borderRadius: 16, background: C.card,
        border: `1.5px solid ${mode === 'manual' ? C.lavender : C.border}`,
      }}>
        <label style={{ display: 'block', fontSize: 11, color: C.muted, fontWeight: 700, marginBottom: 8 }}>
          ODER LOCATION EINGEBEN
        </label>
        <input
          value={mode === 'manual' ? value : ''}
          onFocus={() => {
            setMode('manual')
            if (value.startsWith('Genauer Standort:')) onChange('')
          }}
          onChange={event => {
            setMode('manual')
            onChange(event.target.value)
          }}
          placeholder="z. B. Berlin, Hamburg oder Köln"
          style={{
            width: '100%', boxSizing: 'border-box', padding: '12px 13px',
            borderRadius: 12, border: `1px solid ${C.border}`, outline: 'none',
            background: C.bg, color: C.ink, fontFamily: "'Outfit', sans-serif", fontSize: 14,
          }}
        />
      </div>

      <div style={{
        marginTop: 16, padding: '12px 14px', borderRadius: 14,
        background: '#F0F4F1', color: C.muted, fontSize: 11.5, lineHeight: 1.5,
      }}>
        QUAIN nutzt deinen Standort nur für passende Matchings – deine Ortungsdaten verlassen nie unser System.
      </div>

      <div style={{ flex: 1, minHeight: 24 }} />
      <Btn onClick={onNext} disabled={!canContinue}>Weiter</Btn>
    </div>
  )
}

// ── Screen: Interests ───────────────────────────────────────────
function InterestsScreen({ step, title, subtitle, items, selected, onToggle, onBack, onNext }: {
  step: number; title: string; subtitle: string
  items: string[]; selected: string[]; onToggle: (i: string) => void
  onBack: () => void; onNext: () => void
}) {
  const enough = selected.length >= 3
  const [addingCustom, setAddingCustom] = useState(false)
  const [customItem, setCustomItem] = useState('')
  const visibleItems = [
    ...items,
    ...selected.filter(item => !items.includes(item)),
  ]

  const addCustomItem = () => {
    const value = customItem.trim()
    if (!value) return
    const existingItem = visibleItems.find(item => item.toLowerCase() === value.toLowerCase())
    if (!existingItem || !selected.includes(existingItem)) onToggle(existingItem ?? value)
    setCustomItem('')
    setAddingCustom(false)
  }

  return (
    <div style={{
      height: '100%', overflowY: 'auto', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column',
      padding: '44px 20px 28px', background: C.bg,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <BackButton onClick={onBack} />
        <StepDots current={step} total={8} />
      </div>
      <div style={{ height: 40 }} />
      <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 34, color: C.ink, margin: '0 0 10px', fontWeight: 400, lineHeight: 1.2 }}>
        {title}
      </h2>
      <p style={{ fontSize: 14, color: C.muted, margin: '0 0 28px', lineHeight: 1.55 }}>
        {subtitle} ·{' '}
        <span style={{ fontWeight: 700, color: selected.length >= 3 ? C.teal : C.lavender }}>
          {selected.length}/5 gewählt
        </span>
      </p>

      <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 10, alignContent: 'flex-start', overflow: 'auto' }}>
        {visibleItems.map(item => (
          <Chip key={item} label={item} selected={selected.includes(item)} onToggle={() => onToggle(item)} />
        ))}
        {!addingCustom && selected.length < 5 && (
          <button onClick={() => setAddingCustom(true)} style={{
            padding: '9px 18px', borderRadius: 100, fontSize: 13.5, fontWeight: 600,
            cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
            border: `1.5px dashed ${C.lavender}`, background: C.card, color: C.lavender,
          }}>
            + Eigene Präferenz
          </button>
        )}
        {addingCustom && (
          <div style={{
            width: '100%', display: 'flex', gap: 8, marginTop: 4,
            padding: '12px', background: '#EEF1FF', borderRadius: 14,
          }}>
            <input
              autoFocus
              value={customItem}
              onChange={event => setCustomItem(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') addCustomItem()
                if (event.key === 'Escape') setAddingCustom(false)
              }}
              placeholder="Eigene Präferenz eingeben"
              maxLength={40}
              style={{
                flex: 1, minWidth: 0, padding: '10px 12px', borderRadius: 10,
                border: `1px solid ${C.border}`, background: C.card, color: C.ink,
                fontFamily: "'Outfit', sans-serif", fontSize: 13, outlineColor: C.lavender,
              }}
            />
            <button onClick={addCustomItem} disabled={!customItem.trim()} style={{
              padding: '10px 13px', border: 'none', borderRadius: 10,
              background: customItem.trim() ? C.lavender : '#D4D8D3', color: '#fff',
              cursor: customItem.trim() ? 'pointer' : 'not-allowed',
              fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700,
            }}>
              Hinzufügen
            </button>
          </div>
        )}
      </div>

      <div style={{ height: 28 }} />
      <Btn onClick={onNext} disabled={!enough}>
        {enough ? 'Weiter' : `Noch ${3 - selected.length} wählen`}
      </Btn>
      {!enough && (
        <button onClick={onNext} style={{
          marginTop: 12, alignSelf: 'center', padding: '8px 14px', border: 'none', background: 'none',
          color: C.lavender, fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>
          Später hinzufügen
        </button>
      )}
    </div>
  )
}

// ── Screen: Program needs ───────────────────────────────────────
function ProgramNeedsScreen({ selected, onToggle, note, onNoteChange, onBack, onNext }: {
  selected: string[]
  onToggle: (item: string) => void
  note: string
  onNoteChange: (value: string) => void
  onBack: () => void
  onNext: () => void
}) {
  return (
    <div style={{
      height: '100%', overflowY: 'auto', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column',
      padding: '44px 20px 28px', background: C.bg,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <BackButton onClick={onBack} />
        <StepDots current={7} total={8} />
      </div>
      <div style={{ height: 40 }} />
      <h2 style={{
        fontFamily: "'Instrument Serif', serif", fontSize: 34, color: C.ink,
        margin: '0 0 10px', fontWeight: 400, lineHeight: 1.2,
      }}>
        Was sollten wir beachten?
      </h2>
      <p style={{ fontSize: 14, color: C.muted, margin: '0 0 26px', lineHeight: 1.55 }}>
        Damit alle Aktivitäten zu dir passen. Die Angabe ist freiwillig und wird vertraulich behandelt.
      </p>

      <Label>Häufige Angaben</Label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginBottom: 28 }}>
        {PROGRAM_NEEDS.map(item => (
          <Chip
            key={item}
            label={item}
            selected={selected.includes(item)}
            onToggle={() => onToggle(item)}
          />
        ))}
      </div>

      <label htmlFor="program-notes" style={{
        fontSize: 13, color: C.ink, fontWeight: 700, display: 'block', marginBottom: 8,
      }}>
        Etwas anderes? <span style={{ color: C.muted, fontWeight: 400 }}>(optional)</span>
      </label>
      <textarea
        id="program-notes"
        value={note}
        onChange={event => onNoteChange(event.target.value)}
        placeholder="Zum Beispiel eine Verletzung, Erkrankung oder eine bestimmte Aktivität, die für dich nicht möglich ist."
        rows={4}
        maxLength={500}
        style={{
          width: '100%', resize: 'none', boxSizing: 'border-box',
          padding: '14px 16px', background: C.card,
          border: `1.5px solid ${C.border}`, borderRadius: 13,
          fontSize: 14, color: C.ink, lineHeight: 1.55,
          fontFamily: "'Outfit', sans-serif", outlineColor: C.lavender,
        }}
      />
      <div style={{ fontSize: 11, color: '#999', textAlign: 'right', marginTop: 7 }}>
        {note.length}/500
      </div>

      <div style={{ flex: 1, minHeight: 28 }} />
      <Btn onClick={onNext}>Weiter</Btn>
      <button onClick={onNext} style={{
        marginTop: 12, alignSelf: 'center', padding: '8px 14px', border: 'none', background: 'none',
        color: C.lavender, fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, cursor: 'pointer',
      }}>
        Später hinzufügen
      </button>
    </div>
  )
}

// ── Screen: Review ──────────────────────────────────────────────
function ReviewScreen({ accountType, privateProfile, profileDetails, proInterests, leisureInterests, programNeeds, programNotes, profileLocation, onBack, onNext }: {
  accountType: AccountType
  privateProfile: PrivateProfile
  profileDetails: ProfileDetails
  proInterests: string[]
  leisureInterests: string[]
  programNeeds: string[]
  programNotes: string
  profileLocation: string
  onBack: () => void
  onNext: () => void
}) {
  const pro     = proInterests.length     ? proInterests     : ['Product Strategy', 'OKRs & Metrics', 'User Research']
  const leisure = leisureInterests.length ? leisureInterests : ['Laufen', 'Specialty Coffee', 'Fotografie']
  const fullName = accountType === 'company' ? 'Max Müller' : `${privateProfile.firstName} ${privateProfile.lastName}`
  const initials = fullName.split(' ').map(part => part.charAt(0)).join('').slice(0, 2).toUpperCase()
  return (
    <div style={{
      height: '100%', overflowY: 'auto', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column',
      padding: '44px 20px 28px', background: C.bg,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <BackButton onClick={onBack} />
        <StepDots current={8} total={8} />
      </div>
      <div style={{ height: 24 }} />
      <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 34, color: C.ink, margin: '0 0 8px', fontWeight: 400, lineHeight: 1.15 }}>
        Alles stimmt so?
      </h2>
      <p style={{ fontSize: 14, color: C.muted, margin: '0 0 20px', lineHeight: 1.55 }}>
        Dein Profil bestimmt, mit wem du gematcht wirst.
      </p>

      {/* Identity card */}
      <Card style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10, padding: '14px 16px' }}>
        <AvatarLabel initials={initials} color={HIGHLIGHT} size={46} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: C.ink, marginBottom: 2 }}>{fullName}</div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 5 }}>
            {profileDetails.role} · {profileDetails.focus} · {profileDetails.age}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.teal, fontWeight: 600 }}>
            <LocationIcon /> {locationLabelFromSetup(profileLocation) || 'Location nicht angegeben'}
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: 10, padding: '16px' }}>
        <Label>Über mich</Label>
        <p style={{ margin: 0, color: C.muted, fontSize: 13.5, lineHeight: 1.6 }}>
          {profileDetails.intro}
        </p>
      </Card>

      {/* Pro interests */}
      <Card style={{ marginBottom: 10, padding: '16px' }}>
        <Label>Berufliche Interessen</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {pro.map(i => <Tag key={i} variant="lavender">{i}</Tag>)}
        </div>
      </Card>

      {/* Leisure */}
      <Card style={{ marginBottom: 10, padding: '16px' }}>
        <Label>Freizeit</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {leisure.map(i => <Tag key={i} variant="teal">{i}</Tag>)}
        </div>
      </Card>

      {(programNeeds.length > 0 || programNotes.trim()) && (
        <Card style={{ marginBottom: 12, padding: '16px', background: '#F8FBEE', border: '1px solid #E4EEC4' }}>
          <Label>Hinweise für deine Season</Label>
          {programNeeds.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: programNotes.trim() ? 12 : 0 }}>
              {programNeeds.map(item => <Tag key={item} variant="teal">{item}</Tag>)}
            </div>
          )}
          {programNotes.trim() && (
            <div style={{ fontSize: 14, color: '#444', lineHeight: 1.65 }}>
              {programNotes.trim()}
            </div>
          )}
        </Card>
      )}

      <div style={{ flex: 1, minHeight: 16 }} />
      <div style={{
        position: 'sticky', bottom: -28, padding: '12px 0 16px',
        background: C.bg,
      }}>
        <Btn onClick={onNext}>Setup abschließen</Btn>
      </div>
    </div>
  )
}

// ── Screen: Discovery ───────────────────────────────────────────
function GroupOutlineIcon() {
  return (
    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 18c.5-3.2 2.4-4.8 5.5-4.8s5 1.6 5.5 4.8M14.2 13.8c2.9-.8 5.2.6 5.8 3.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function DiceOutlineIcon() {
  return (
    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="9" cy="9" r="1.1" fill="currentColor" />
      <circle cx="15" cy="9" r="1.1" fill="currentColor" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" />
      <circle cx="9" cy="15" r="1.1" fill="currentColor" />
      <circle cx="15" cy="15" r="1.1" fill="currentColor" />
    </svg>
  )
}

function PersonSearchIcon() {
  return (
    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 18c.5-3.2 2.4-4.8 5.5-4.8 1.6 0 2.9.4 3.8 1.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="17" cy="16" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="m19.3 18.3 2 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function ConnectionActionCard({ icon, title, description, action, onClick, accent }: {
  icon: React.ReactNode
  title: string
  description: string
  action: string
  onClick: () => void
  accent: 'lavender' | 'teal'
}) {
  const accentColor = accent === 'lavender' ? C.lavender : C.teal
  const iconBackground = accent === 'lavender' ? '#EEF1FF' : '#EBF5F0'

  return (
    <button onClick={onClick} style={{
      width: '100%', minHeight: 126, padding: '16px',
      display: 'flex', alignItems: 'flex-start', gap: 13,
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 18,
      cursor: 'pointer', textAlign: 'left', fontFamily: "'Outfit', sans-serif",
      boxShadow: '0 2px 10px rgba(34,43,38,0.035)',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 13, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: iconBackground, color: accentColor,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          color: C.ink, fontSize: 15, fontWeight: 700,
          letterSpacing: '-0.015em', marginBottom: 5,
        }}>
          {title}
        </div>
        <div style={{ color: C.muted, fontSize: 12.5, lineHeight: 1.5, marginBottom: 9 }}>
          {description}
        </div>
        <span style={{
          display: 'inline-flex', padding: '5px 9px', borderRadius: 100,
          background: HIGHLIGHT, color: HIGHLIGHT_TEXT, fontSize: 12, fontWeight: 700,
          outline: `1.5px solid ${HIGHLIGHT_OUTLINE}`, outlineOffset: -1.5,
        }}>
          {action}
        </span>
      </div>
    </button>
  )
}

function SeasonExplainer({ onLearnMore }: { onLearnMore: () => void }) {
  const [open, setOpen] = useState(false)

  return (
    <span
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      style={{ position: 'relative', display: 'inline-block', zIndex: 4 }}
    >
      <button
        onClick={() => setOpen(current => !current)}
        aria-expanded={open}
        style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '1px 6px', borderRadius: 6,
          background: '#F8FBEE', border: '1px solid #E4EEC4',
          color: '#5A713D', cursor: 'pointer',
          fontFamily: "'Outfit', sans-serif", fontSize: 'inherit', fontWeight: 700,
          lineHeight: 1.35,
        }}
      >
        Season
      </button>

      {open && (
        <span style={{
          position: 'absolute', top: '100%', left: -36,
          width: 292, paddingTop: 8, display: 'block',
        }}>
          <span style={{
            display: 'block', padding: '14px', borderRadius: 16,
            background: C.card, border: `1px solid ${C.border}`,
            boxShadow: '0 10px 30px rgba(34,43,38,0.14)',
          }}>
            <span style={{
              display: 'block', marginBottom: 10,
              color: C.ink, fontSize: 12.5, lineHeight: 1.55,
            }}>
              Die erste Season dauert 6 Monate. Einmal pro Monat findet ein gemeinsames Treffen statt.
            </span>
            <button onClick={onLearnMore} style={{
              padding: 0, border: 'none', background: 'transparent',
              color: C.lavender, cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 700,
              textDecoration: 'underline', textUnderlineOffset: 3,
            }}>
              Und wie geht es nach den sechs Monaten weiter? →
            </button>
          </span>
        </span>
      )}
    </span>
  )
}

function SeasonInfoScreen({ onBack }: { onBack: () => void }) {
  const extensionInfoRef = useRef<HTMLDivElement>(null)
  const sections = [
    {
      title: 'QUAIN Season',
      subtitle: 'Gemeinsam als Gruppe',
      accent: C.lavender,
      background: '#EEF1FF',
      steps: [
        'Jede Season: 6 Monate mit insgesamt 6 Programmschritten',
        'Ein gemeinsames Treffen pro Monat',
        'Am Ende: verlängern, aussteigen oder neues QUAIN wählen',
      ],
    },
    {
      title: '1:1 Season',
      subtitle: 'Persönlich zu zweit',
      accent: C.teal,
      background: '#EBF5F0',
      steps: [
        'Season 1: 6 Monate mit einem Treffen pro Monat',
        'Ab Season 2 legt ihr euren Rhythmus gemeinsam fest',
        'Am Ende: Rhythmus anpassen, weitermachen oder die Season beenden',
      ],
    },
  ]

  return (
    <div style={{
      height: '100%', overflowY: 'auto', boxSizing: 'border-box',
      padding: '40px 20px 30px', background: C.bg,
    }}>
      <BackButton onClick={onBack} label="Zurück zur Auswahl" />
      <div style={{ marginTop: 22, marginBottom: 18 }}>
      </div>
      <h2 style={{
        fontFamily: "'Instrument Serif', serif", fontSize: 35,
        color: C.ink, fontWeight: 400, lineHeight: 1.1, margin: '0 0 10px',
      }}>
        So funktionieren Seasons.
      </h2>
      <p style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.6, margin: '0 0 22px' }}>
        Eine Season gibt eurer neuen Verbindung einen klaren Anfang, einen guten Rhythmus und einen bewussten Abschluss.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        {sections.map(section => (
          <div key={section.title} style={{
            padding: '17px', borderRadius: 20,
            background: C.card, border: `1px solid ${C.border}`,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: section.background, color: section.accent,
              fontSize: 12, fontWeight: 800, marginBottom: 12,
            }}>
              {section.title.startsWith('1:1') ? '1:1' : 'Q'}
            </div>
            <div style={{
              fontFamily: "'Instrument Serif', serif", fontSize: 25,
              color: C.ink, marginBottom: 2,
            }}>
              {section.title}
            </div>
            <div style={{ color: C.muted, fontSize: 11.5, marginBottom: 13 }}>{section.subtitle}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {section.steps.map((step, index) => (
                <div key={step} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: index === 2 ? HIGHLIGHT : section.background,
                    outline: index === 2 ? `1.5px solid ${HIGHLIGHT_OUTLINE}` : 'none', outlineOffset: -1.5,
                    color: index === 2 ? HIGHLIGHT_TEXT : section.accent,
                    fontSize: 9, fontWeight: 800,
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ color: C.ink, fontSize: 12, lineHeight: 1.45 }}>
                    {step.includes('verlängern') ? (
                      <>
                        Am Ende:{' '}
                        <button onClick={() => extensionInfoRef.current?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'center',
                        })} style={{
                          padding: 0, border: 'none', background: 'transparent',
                          color: C.lavender, cursor: 'pointer',
                          fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 700,
                          textDecoration: 'underline', textUnderlineOffset: 3,
                        }}>
                          verlängern
                        </button>
                        , aussteigen oder neues QUAIN wählen
                      </>
                    ) : step.includes('weitermachen') ? (
                      <>
                        Am Ende:{' '}
                        <button onClick={() => extensionInfoRef.current?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'center',
                        })} style={{
                          padding: 0, border: 'none', background: 'transparent',
                          color: C.lavender, cursor: 'pointer',
                          fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 700,
                          textDecoration: 'underline', textUnderlineOffset: 3,
                        }}>
                          weitermachen
                        </button>
                        , Rhythmus anpassen oder die Season beenden
                      </>
                    ) : step}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div ref={extensionInfoRef} style={{
          padding: '15px 16px', borderRadius: 18,
          background: '#F8FBEE', border: '1px solid #E4EEC4',
          scrollMargin: 18,
        }}>
          <div style={{
            display: 'inline-flex', padding: '4px 8px', borderRadius: 100,
            background: HIGHLIGHT, color: HIGHLIGHT_TEXT,
            outline: `1.5px solid ${HIGHLIGHT_OUTLINE}`, outlineOffset: -1.5,
            fontSize: 9, fontWeight: 800, letterSpacing: '0.06em', marginBottom: 8,
          }}>
            AB SEASON 2
          </div>
          <div style={{
            fontFamily: "'Instrument Serif', serif", fontSize: 22,
            color: C.ink, marginBottom: 4,
          }}>
            1:1-Rhythmus gemeinsam festlegen.
          </div>
          <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.5 }}>
            Jede weitere 1:1-Season dauert 6 Monate. Ihr könnt zum Beispiel monatliche Treffen, alle 6 Wochen oder einmal in 3 Monaten vereinbaren. QUAIN-Seasons bleiben immer monatlich.
          </div>
        </div>
      </div>
    </div>
  )
}

function ConnectionFormatScreen({ accountType, onBack, onSelect, onSeasonInfo }: {
  accountType: AccountType
  onBack: () => void
  onSelect: (format: ConnectionFormat) => void
  onSeasonInfo: () => void
}) {
  return (
    <div style={{
      height: '100%', overflowY: 'auto', boxSizing: 'border-box',
      padding: '44px 20px 34px', background: C.bg,
    }}>
      <BackButton onClick={onBack} />
      <h2 style={{
        fontFamily: "'Instrument Serif', serif", fontSize: 36, color: C.ink,
        margin: '22px 0 10px', fontWeight: 400, lineHeight: 1.1,
      }}>
        Was suchst du?
      </h2>
      <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, margin: '0 0 26px' }}>
        Eine <SeasonExplainer onLearnMore={onSeasonInfo} /> gibt deiner neuen Verbindung einen klaren Rahmen. Wähle, ob du {accountType === 'company' ? 'mehrere Kolleg:innen' : 'mehrere Product Professionals'} oder eine einzelne Person kennenlernen möchtest.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <button onClick={() => onSelect('quain')} style={{
          width: '100%', padding: '20px', borderRadius: 22,
          background: C.card, border: '1px solid #D8DCEE',
          cursor: 'pointer', textAlign: 'left', fontFamily: "'Outfit', sans-serif",
          boxShadow: '0 3px 16px rgba(125,132,178,0.08)',
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14, marginBottom: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#EEF1FF', color: C.lavender,
          }}>
            <GroupOutlineIcon />
          </div>
          <div style={{
            fontFamily: "'Instrument Serif', serif", fontSize: 29,
            color: C.ink, marginBottom: 7,
          }}>
            QUAIN
          </div>
          <p style={{ margin: '0 0 14px', color: C.muted, fontSize: 13, lineHeight: 1.55 }}>
            Ein QUAIN bringt dich mit zwei bis vier {accountType === 'company' ? 'Kolleg:innen' : 'Product Professionals'} zusammen. Ihr erlebt über eine Season hinweg gemeinsame soziale und berufliche Aktivitäten.
          </p>
          <span style={{
            display: 'inline-flex', padding: '6px 10px', borderRadius: 100,
            background: HIGHLIGHT, color: HIGHLIGHT_TEXT, fontSize: 13, fontWeight: 700,
            outline: `1.5px solid ${HIGHLIGHT_OUTLINE}`, outlineOffset: -1.5,
          }}>
            QUAIN wählen →
          </span>
        </button>

        <button onClick={() => onSelect('one-to-one')} style={{
          width: '100%', padding: '20px', borderRadius: 22,
          background: C.card, border: '1px solid #C8E8D8',
          cursor: 'pointer', textAlign: 'left', fontFamily: "'Outfit', sans-serif",
          boxShadow: '0 3px 16px rgba(138,163,153,0.08)',
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14, marginBottom: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#EBF5F0', color: C.teal,
          }}>
            <PersonSearchIcon />
          </div>
          <div style={{
            fontFamily: "'Instrument Serif', serif", fontSize: 29,
            color: C.ink, marginBottom: 7,
          }}>
            1:1
          </div>
          <p style={{ margin: '0 0 14px', color: C.muted, fontSize: 13, lineHeight: 1.55 }}>
            {accountType === 'company'
              ? 'Im 1:1 lernst du eine einzelne Person aus deinem Unternehmen persönlich kennen und ihr baut eure Verbindung direkt auf.'
              : 'Im 1:1 lernst du einen Product Professional aus dem QUAIN-Netzwerk persönlich kennen und ihr baut eure Verbindung direkt auf.'}
          </p>
          <span style={{
            display: 'inline-flex', padding: '6px 10px', borderRadius: 100,
            background: HIGHLIGHT, color: HIGHLIGHT_TEXT, fontSize: 13, fontWeight: 700,
            outline: `1.5px solid ${HIGHLIGHT_OUTLINE}`, outlineOffset: -1.5,
          }}>
            1:1 wählen →
          </span>
        </button>
      </div>
    </div>
  )
}

function DiscoveryScreen({ accountType, format, onBack, onBrowseQuains, onRandomize, onOneToOne, onRandomOneToOne }: {
  accountType: AccountType
  format: ConnectionFormat
  onBack: () => void
  onBrowseQuains: () => void
  onRandomize: () => void
  onOneToOne: () => void
  onRandomOneToOne: () => void
}) {
  const isQuain = format === 'quain'

  return (
    <div style={{
      height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column',
      padding: '44px 20px 40px', background: C.bg, boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <BackButton onClick={onBack} />
      </div>

      <h2 style={{
        fontFamily: "'Instrument Serif', serif", fontSize: 36, color: C.ink,
        margin: '0 0 10px', fontWeight: 400, lineHeight: 1.1,
      }}>
        {isQuain ? 'Wie möchtest du dein QUAIN finden?' : 'Wie möchtest du dich verbinden?'}
      </h2>
      <p style={{ fontSize: 14, color: C.muted, margin: '0 0 26px', lineHeight: 1.6 }}>
        {isQuain
          ? 'Trete einem bestehenden QUAIN bei oder lass dich passend zuordnen.'
          : 'Wähle selbst eine Person aus oder lass dich für ein 1:1 passend verbinden.'}
      </p>

      <section style={{
        padding: '18px 14px 14px', borderRadius: 22,
        background: isQuain ? '#EEF1FF' : '#EBF5F0',
        border: isQuain ? '1px solid #D8DCEE' : '1px solid #C8E8D8',
      }}>
        <div style={{ padding: '0 4px', marginBottom: 14 }}>
          <div style={{
            fontFamily: "'Instrument Serif', serif", fontSize: 27,
            color: C.ink, marginBottom: 4,
          }}>
            {isQuain ? 'QUAIN' : '1:1'}
          </div>
          <p style={{ margin: 0, color: C.muted, fontSize: 12.5, lineHeight: 1.5 }}>
            {isQuain
              ? `Gemeinsam mit ${accountType === 'company' ? 'Kolleg:innen' : 'Product Professionals'} neue Perspektiven entdecken und Beziehungen aufbauen.`
              : 'Lernt euch persönlich kennen und baut eine Verbindung auf.'}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {isQuain ? (
            <>
              <ConnectionActionCard
                icon={<GroupOutlineIcon />}
                title="Einem QUAIN beitreten"
                description="Entdecke bestehende QUAINs und tritt einem freien Platz direkt bei."
                action="QUAINs entdecken →"
                accent="lavender"
                onClick={onBrowseQuains}
              />
              <ConnectionActionCard
                icon={<DiceOutlineIcon />}
                title="QUAIN zufällig finden"
                description={`Lass dich mit passenden ${accountType === 'company' ? 'Kolleg:innen' : 'Product Professionals'} einem QUAIN zuordnen.`}
                action="Zufall starten →"
                accent="lavender"
                onClick={onRandomize}
              />
            </>
          ) : (
            <>
              <ConnectionActionCard
                icon={<PersonSearchIcon />}
                title={accountType === 'company' ? 'Kolleg:in entdecken' : 'Product Professional entdecken'}
                description={accountType === 'company'
                  ? 'Durchsuche Kolleg:innen aus deinem Unternehmen und wähle eine Person aus.'
                  : 'Entdecke Product Professionals aus dem QUAIN-Netzwerk und wähle eine Person aus.'}
                action="People entdecken →"
                accent="teal"
                onClick={onOneToOne}
              />
              <ConnectionActionCard
                icon={<DiceOutlineIcon />}
                title="1:1 zufällig finden"
                description={accountType === 'company'
                  ? 'Lass dich mit einer passenden Person aus deinem Unternehmen verbinden.'
                  : 'Lass dich mit einem passenden Product Professional aus dem Netzwerk verbinden.'}
                action="Zufall starten →"
                accent="teal"
                onClick={onRandomOneToOne}
              />
            </>
          )}
        </div>
      </section>

    </div>
  )
}

interface ColleagueProfileData {
  name: string
  role: string
  team?: string
  location?: string
  initials: string
  color: string
  professionalInterests?: string[]
  personalInterests?: string[]
}

function ColleagueProfileScreen({ accountType, colleague, onBack }: {
  accountType: AccountType
  colleague: ColleagueProfileData
  onBack: () => void
}) {
  const professionalInterests = colleague.professionalInterests ?? ['Product Strategy', 'Innovation', 'Team Leadership']
  const personalInterests = colleague.personalInterests ?? ['Coffee', 'Travel', 'Running']

  return (
    <div style={{
      height: '100%', overflowY: 'auto', boxSizing: 'border-box',
      padding: '40px 20px 30px', background: C.bg,
    }}>
      <BackButton onClick={onBack} />
      <div style={{ textAlign: 'center', marginTop: 28, marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <AvatarLabel initials={colleague.initials} color={colleague.color} size={88} />
        </div>
        <h2 style={{
          fontFamily: "'Instrument Serif', serif", fontSize: 34,
          color: C.ink, fontWeight: 400, margin: '0 0 6px',
        }}>
          {colleague.name}
        </h2>
        <div style={{ fontSize: 14, color: C.ink, fontWeight: 600, marginBottom: 4 }}>
          {colleague.role}
        </div>
        <div style={{ fontSize: 12, color: C.muted }}>
          {accountType === 'company'
            ? `${colleague.team ?? 'Lumio SE'}${colleague.location ? ` · ${colleague.location}` : ''}`
            : `Product Professional${colleague.location ? ` · ${colleague.location}` : ''}`}
        </div>
      </div>

      <div style={{
        padding: '16px', borderRadius: 18, background: '#F8FBEE',
        border: '1px solid #E4EEC4', marginBottom: 14,
      }}>
        <Label>Über mich</Label>
        <p style={{ margin: 0, fontSize: 13, color: '#49514C', lineHeight: 1.65 }}>
          {accountType === 'company'
            ? 'Ich freue mich auf neue Perspektiven, ehrlichen Erfahrungsaustausch und Verbindungen über Teamgrenzen hinweg.'
            : 'Ich freue mich auf neue Perspektiven, ehrlichen Erfahrungsaustausch und Verbindungen mit anderen Product Professionals.'}
        </p>
      </div>

      <div style={{
        padding: '16px', borderRadius: 18, background: C.card,
        border: `1px solid ${C.border}`, marginBottom: 12,
      }}>
        <Label>Berufliche Interessen</Label>
        <InterestPills items={professionalInterests} variant="professional" />
      </div>
      <div style={{
        padding: '16px', borderRadius: 18, background: C.card,
        border: `1px solid ${C.border}`,
      }}>
        <Label>Freizeitinteressen</Label>
        <InterestPills items={personalInterests} variant="personal" />
      </div>
    </div>
  )
}

function OpenQuainOverview({ accountType, quain, isJoined, joiningBlocked, onJoin, onLeave, onBack }: {
  accountType: AccountType
  quain: OpenQuain
  isJoined: boolean
  joiningBlocked: boolean
  onJoin: () => void
  onLeave: () => void
  onBack: () => void
}) {
  const memberCount = quain.members.length + (isJoined ? 1 : 0)
  const isAtCapacity = memberCount >= QUAIN_MAX_MEMBERS
  const seasonTitle = seasonTitleForQuain(quain, memberCount)
  const seasonCreated = memberCount >= QUAIN_MIN_MEMBERS
  const [selectedMember, setSelectedMember] = useState<ColleagueProfileData | null>(null)
  const [seasonStartRequested, setSeasonStartRequested] = useState(false)
  const [wantsToWait, setWantsToWait] = useState(false)

  if (selectedMember) {
    return <ColleagueProfileScreen accountType={accountType} colleague={selectedMember} onBack={() => setSelectedMember(null)} />
  }

  return (
    <div style={{
      height: '100%', overflowY: 'auto', boxSizing: 'border-box',
      padding: '40px 18px 28px', background: C.bg,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 22,
      }}>
        <BackButton onClick={onBack} label="Zur QUAIN-Übersicht" />
      </div>

      <h2 style={{
        fontFamily: "'Instrument Serif', serif", fontSize: 32,
        color: C.ink, fontWeight: 400, lineHeight: 1.08, margin: '0 0 7px',
      }}>
        {seasonTitle ?? 'Season noch nicht erstellt'}
      </h2>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>
        {quain.location} · {quain.format} · {memberCount} von {QUAIN_MAX_MEMBERS} Plätzen
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        <div>
          <div style={{ fontSize: 10, color: C.muted, fontWeight: 800, letterSpacing: '0.07em', marginBottom: 6 }}>WORK</div>
          <InterestPills items={quain.topics} variant="professional" />
        </div>
        <div>
          <div style={{ fontSize: 10, color: C.muted, fontWeight: 800, letterSpacing: '0.07em', marginBottom: 6 }}>PRIVAT</div>
          <InterestPills items={quain.privatePreferences} variant="personal" />
        </div>
      </div>

      <div style={{ marginTop: 22, marginBottom: 18 }}>
        <Label>Teilnehmer:innen</Label>
        <div style={{
          borderRadius: 18, overflow: 'hidden', background: C.card,
          border: `1px solid ${C.border}`,
        }}>
          {quain.members.map((member, index) => (
            <div key={member.initials} style={{
              display: 'flex', alignItems: 'center', gap: 11,
              padding: '11px 13px',
              borderBottom: index < quain.members.length - 1 || isJoined ? `1px solid ${C.border}` : 'none',
            }}>
              <AvatarLabel initials={member.initials} color={member.color} size={34} />
              <div>
                <button onClick={() => setSelectedMember({
                  ...member,
                  team: accountType === 'company' ? 'Lumio SE' : undefined,
                  location: quain.location,
                  professionalInterests: quain.topics,
                })} style={{
                  padding: 0, border: 'none', background: 'transparent',
                  fontFamily: "'Outfit', sans-serif", fontSize: 13,
                  color: C.ink, fontWeight: 700, cursor: 'pointer',
                }}>
                  {member.name}
                </button>
                <div style={{ fontSize: 11, color: C.muted }}>{member.role}</div>
              </div>
            </div>
          ))}
          {isJoined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px' }}>
              <AvatarLabel initials={ME.initials} color={ME.color} size={34} />
              <div style={{ flex: 1 }}>
                <button onClick={() => setSelectedMember({
                  name: ME.fullName,
                  role: ME.role,
                  team: ME.team,
                  initials: ME.initials,
                  color: ME.color,
                  location: quain.location,
                })} style={{
                  padding: 0, border: 'none', background: 'transparent',
                  fontFamily: "'Outfit', sans-serif", fontSize: 13,
                  color: C.ink, fontWeight: 700, cursor: 'pointer',
                }}>
                  {ME.fullName} (du)
                </button>
                <div style={{ fontSize: 11, color: C.muted }}>{ME.role}</div>
              </div>
              <span style={{
                padding: '4px 8px', borderRadius: 100,
                background: HIGHLIGHT, color: HIGHLIGHT_TEXT, fontSize: 9, fontWeight: 800,
                outline: `1px solid ${HIGHLIGHT_OUTLINE}`, outlineOffset: -1,
              }}>
                BEIGETRETEN
              </span>
            </div>
          )}
        </div>
      </div>

      {!seasonCreated && (
        <div style={{
          padding: '15px 16px', borderRadius: 16, marginBottom: 16,
          background: C.subtle, border: `1px solid ${C.border}`,
        }}>
          <div style={{ fontSize: 13, color: C.ink, fontWeight: 700, marginBottom: 4 }}>
            Noch keine Season
          </div>
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
            Sobald eine dritte Person beitritt, werden der Season-Titel und die sechs gemeinsamen Programmschritte erstellt.
          </div>
        </div>
      )}

      {seasonCreated && (
        <div style={{ marginBottom: 16 }}>
          <ProgramPreview format="quain" />
        </div>
      )}

      {seasonCreated && isJoined && (
        <div style={{
          padding: '16px', borderRadius: 18, marginBottom: 16,
          background: seasonStartRequested ? '#EBF5F0' : '#EEF1FF',
          border: `1px solid ${seasonStartRequested ? '#C8E8D8' : '#D8DCEE'}`,
        }}>
          <div style={{ fontSize: 11, color: seasonStartRequested ? C.teal : C.lavender, fontWeight: 800, letterSpacing: '0.08em', marginBottom: 5 }}>
            SEASON-START
          </div>
          <div style={{ fontSize: 14, color: C.ink, fontWeight: 700, marginBottom: 5 }}>
            {seasonStartRequested ? 'Startanfrage wurde gesendet' : 'Die Season kann starten'}
          </div>
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.55, marginBottom: 13 }}>
            {seasonStartRequested
              ? wantsToWait
                ? 'Du hast angegeben, dass du noch auf weitere Kandidat:innen warten möchtest.'
                : 'Alle Mitglieder wurden informiert. Eine Zustimmung aller Personen ist für den Start nicht erforderlich.'
              : 'Jedes Mitglied kann den Start anfragen. Andere können mitteilen, dass sie lieber auf weitere Kandidat:innen warten möchten.'}
          </div>
          {!seasonStartRequested ? (
            <Btn small onClick={() => setSeasonStartRequested(true)}>Season-Start anfragen</Btn>
          ) : (
            <button onClick={() => setWantsToWait(current => !current)} style={{
              width: '100%', padding: '11px 14px', borderRadius: 13,
              border: `1px solid ${C.teal}`, background: wantsToWait ? C.teal : C.card,
              color: wantsToWait ? '#fff' : C.teal, cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif", fontSize: 12.5, fontWeight: 700,
            }}>
              {wantsToWait ? 'Wartewunsch zurücknehmen' : 'Noch auf weitere Kandidat:innen warten'}
            </button>
          )}
        </div>
      )}

      <button
        onClick={isJoined ? onLeave : onJoin}
        disabled={(joiningBlocked || isAtCapacity) && !isJoined}
        style={{
          width: '100%', minHeight: 48, borderRadius: 14,
          border: isJoined ? `1px solid ${C.teal}` : 'none',
          background: isJoined ? C.card : joiningBlocked || isAtCapacity ? C.subtle : C.lavender,
          color: isJoined ? C.teal : joiningBlocked || isAtCapacity ? '#999' : '#fff',
          cursor: (joiningBlocked || isAtCapacity) && !isJoined ? 'default' : 'pointer',
          fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700,
        }}
      >
        {isJoined ? 'Aus QUAIN austreten' : isAtCapacity ? 'QUAIN ist voll' : joiningBlocked ? 'Bereits in einem anderen QUAIN' : 'QUAIN beitreten'}
      </button>
    </div>
  )
}

function OpenQuainsScreen({ accountType, joinedQuainId, onJoin, onLeave, onBack }: {
  accountType: AccountType
  joinedQuainId: number | null
  onJoin: (id: number) => void
  onLeave: () => void
  onBack: () => void
}) {
  const [selectedQuainId, setSelectedQuainId] = useState<number | null>(null)
  const selectedQuain = OPEN_QUAINS.find(quain => quain.id === selectedQuainId)

  if (selectedQuain) {
    return (
      <OpenQuainOverview
        accountType={accountType}
        quain={selectedQuain}
        isJoined={joinedQuainId === selectedQuain.id}
        joiningBlocked={joinedQuainId !== null}
        onJoin={() => onJoin(selectedQuain.id)}
        onLeave={onLeave}
        onBack={() => setSelectedQuainId(null)}
      />
    )
  }

  return (
    <div style={{
      height: '100%', overflowY: 'auto', boxSizing: 'border-box',
      padding: '40px 18px 28px', background: C.bg,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 22,
      }}>
        <BackButton onClick={onBack} />
      </div>

      <h2 style={{
        fontFamily: "'Instrument Serif', serif", fontSize: 34,
        color: C.ink, fontWeight: 400, lineHeight: 1.1, margin: '0 0 8px',
      }}>
        QUAIN wählen
      </h2>
      <p style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.55, margin: '0 0 16px' }}>
        Finde ein QUAIN, das zu deinen Interessen passt, und sichere dir einen freien Platz.
      </p>

      {joinedQuainId !== null && (
        <div style={{
          padding: '10px 12px', borderRadius: 14, marginBottom: 14,
          background: '#EBF5F0', border: '1px solid #C8E8D8',
        }}>
          <div style={{ fontSize: 11.5, color: C.teal, fontWeight: 700, lineHeight: 1.45 }}>
            Du bist einem QUAIN beigetreten. Ein weiterer Beitritt ist aktuell nicht möglich.
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {OPEN_QUAINS.map(quain => {
          const isJoined = joinedQuainId === quain.id
          const memberCount = quain.members.length + (isJoined ? 1 : 0)
          const isFull = memberCount === QUAIN_MAX_MEMBERS
          const isReady = memberCount >= QUAIN_MIN_MEMBERS
          const seasonTitle = seasonTitleForQuain(quain, memberCount)
          const joiningDisabled = joinedQuainId !== null || isFull

          return (
            <div
              key={quain.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedQuainId(quain.id)}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') setSelectedQuainId(quain.id)
              }}
              style={{
              padding: '13px 14px', borderRadius: 18, background: C.card,
              border: isJoined ? `1.5px solid ${C.teal}` : `1px solid ${C.border}`,
              boxShadow: '0 3px 15px rgba(34,43,38,0.05)', cursor: 'pointer',
            }}>
              <div style={{
                display: 'flex', alignItems: 'flex-start',
                justifyContent: 'space-between', gap: 10, marginBottom: 5,
              }}>
                <div style={{
                  fontFamily: "'Instrument Serif', serif", fontSize: 20,
                  color: C.ink, lineHeight: 1.1,
                }}>
                  {seasonTitle ?? 'Season noch nicht erstellt'}
                </div>
                {isJoined && (
                  <span style={{
                    padding: '4px 8px', borderRadius: 100,
                    background: HIGHLIGHT, color: HIGHLIGHT_TEXT,
                    outline: `1px solid ${HIGHLIGHT_OUTLINE}`, outlineOffset: -1,
                    fontSize: 9, fontWeight: 800, whiteSpace: 'nowrap',
                  }}>
                    DEIN QUAIN
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 9 }}>
                {quain.location} · {quain.format}
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginTop: 10, marginBottom: 7,
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {quain.members.map((member, index) => (
                    <div key={member.initials} style={{ marginLeft: index === 0 ? 0 : -8 }}>
                      <AvatarLabel initials={member.initials} color={member.color} size={26} />
                    </div>
                  ))}
                  {isJoined && (
                    <div style={{ marginLeft: -8 }}>
                      <AvatarLabel initials={ME.initials} color={ME.color} size={26} />
                    </div>
                  )}
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: isReady ? C.teal : C.lavender,
                }}>
                  {isFull
                    ? 'Voll · Season bereit'
                    : isReady
                      ? `Season bereit · ${memberCount} von ${QUAIN_MAX_MEMBERS}`
                      : `${memberCount} von ${QUAIN_MAX_MEMBERS} · noch keine Season`}
                </span>
              </div>

              <div style={{
                height: 5, borderRadius: 100, background: C.subtle, overflow: 'hidden',
                marginBottom: 10,
              }}>
                <div style={{
                  width: `${memberCount / QUAIN_MAX_MEMBERS * 100}%`, height: '100%',
                  borderRadius: 100, background: isReady ? HIGHLIGHT : C.lavender,
                  outline: isReady ? `1px solid ${HIGHLIGHT_OUTLINE}` : 'none', outlineOffset: -1,
                }} />
              </div>

              <button
                onClick={event => {
                  event.stopPropagation()
                  if (isJoined) onLeave()
                  else onJoin(quain.id)
                }}
                disabled={joiningDisabled && !isJoined}
                style={{
                  width: '100%', minHeight: 38, borderRadius: 12,
                  border: isJoined ? `1px solid ${C.teal}` : 'none',
                  background: isJoined ? C.card : joiningDisabled ? C.subtle : C.lavender,
                  color: isJoined ? C.teal : joiningDisabled ? '#999' : '#fff',
                  cursor: joiningDisabled && !isJoined ? 'default' : 'pointer',
                  fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700,
                }}
              >
                {isJoined ? 'Aus QUAIN austreten' : isFull ? 'QUAIN ist voll' : joinedQuainId !== null ? 'Nicht verfügbar' : 'QUAIN beitreten'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Screen: Matching ────────────────────────────────────────────
function MatchingScreen({ progress, onBack }: { progress: number; onBack: () => void }) {
  const phase =
    progress < 25 ? 'Suche passende Peers...'
    : progress < 55 ? 'Prüfe Kompatibilität...'
    : progress < 85 ? 'Stelle QUAIN zusammen...'
    : 'Fast fertig...'

  const r = 68
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - progress / 100)

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '40px 32px',
      background: `linear-gradient(160deg, #EEF1FF 0%, #EBF8F2 100%)`, position: 'relative',
    }}>
      <div style={{ position: 'absolute', top: 44, left: 20 }}>
        <BackButton onClick={onBack} />
      </div>
      <div style={{ position: 'relative', marginBottom: 52 }}>
        <svg width={168} height={168} viewBox="0 0 168 168" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={84} cy={84} r={r} fill="none" stroke={C.border} strokeWidth={6} />
          <circle cx={84} cy={84} r={r} fill="none" stroke={C.lavender} strokeWidth={6}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.3s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontSize: 30, marginBottom: 6 }}>🔮</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.lavender, fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
            {Math.round(progress)}%
          </div>
        </div>
      </div>

      <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, color: C.ink, textAlign: 'center', margin: '0 0 14px', fontWeight: 400 }}>
        Wir finden<br />dein QUAIN
      </h2>
      <p style={{ fontSize: 15, color: C.muted, textAlign: 'center', margin: 0, lineHeight: 1.65 }}>
        {phase}
      </p>
    </div>
  )
}

function ProgramPreview({ format }: { format: ConnectionFormat }) {
  const [open, setOpen] = useState(false)
  const oneToOneSteps = [
    { title: 'Kennenlern-Coffee', detail: 'Persönlicher Start und gemeinsame Erwartungen' },
    { title: 'Topic Exchange', detail: 'Austausch zu einem gemeinsamen beruflichen Interesse' },
    { title: 'Walk & Talk', detail: 'Informelles Gespräch außerhalb des Arbeitsalltags' },
    { title: 'Perspective Swap', detail: 'Einblick in den Arbeitsalltag und die Sichtweise der anderen Person' },
    { title: 'Shared Activity', detail: 'Eine gemeinsame Aktivität passend zu euren Interessen' },
    { title: 'Season Reflection', detail: 'Gemeinsamer Rückblick und Entscheidung, wie es weitergeht' },
  ]
  const steps = format === 'quain'
    ? PROGRAM_STEPS.map(step => ({ title: step.type, detail: step.desc }))
    : oneToOneSteps

  return (
    <div style={{
      borderRadius: 18, background: C.card,
      border: `1px solid ${C.border}`, overflow: 'hidden',
    }}>
      <button onClick={() => setOpen(current => !current)} style={{
        width: '100%', minHeight: 54, padding: '12px 15px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        border: 'none', background: C.card, cursor: 'pointer',
        color: C.ink, fontFamily: "'Outfit', sans-serif", textAlign: 'left',
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>
            {format === 'quain' ? 'Season' : '1:1 Season'}
          </div>
          <div style={{ fontSize: 11, color: C.muted }}>
            {steps.length} gemeinsame Programmschritte
          </div>
        </div>
        <span style={{
          padding: '5px 9px', borderRadius: 100,
          background: HIGHLIGHT, color: HIGHLIGHT_TEXT, fontSize: 11, fontWeight: 700,
          outline: `1px solid ${HIGHLIGHT_OUTLINE}`, outlineOffset: -1,
        }}>
          {open ? 'Schließen ↑' : 'Ansehen ↓'}
        </span>
      </button>

      {open && (
        <div style={{
          padding: '2px 15px 14px',
          borderTop: `1px solid ${C.border}`,
        }}>
          {steps.map((step, index) => (
            <div key={step.title} style={{
              display: 'flex', gap: 10, padding: '11px 0',
              borderBottom: index < steps.length - 1 ? `1px solid ${C.border}` : 'none',
            }}>
              <div style={{
                width: 25, height: 25, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: index === 0 ? HIGHLIGHT : '#EEF1FF',
                outline: index === 0 ? `1px solid ${HIGHLIGHT_OUTLINE}` : 'none', outlineOffset: -1,
                color: index === 0 ? HIGHLIGHT_TEXT : C.lavender,
                fontSize: 10, fontWeight: 800,
              }}>
                {index + 1}
              </div>
              <div>
                <div style={{ fontSize: 12.5, color: C.ink, fontWeight: 700, marginBottom: 2 }}>
                  {step.title}
                </div>
                <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>
                  {step.detail}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Screen: Match Result ────────────────────────────────────────
function MatchResultScreen({ accountType, onBack, onStart }: {
  accountType: AccountType
  onBack: () => void
  onStart: () => void
}) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)

  if (selectedMember) {
    return (
      <ColleagueProfileScreen
        accountType={accountType}
        colleague={{
          name: selectedMember.fullName,
          role: selectedMember.role,
          team: selectedMember.team,
          initials: selectedMember.initials,
          color: selectedMember.color,
          location: 'Berlin',
          professionalInterests: ['Product Strategy', 'AI', 'Team Leadership'],
          personalInterests: ['Coffee', 'Travel', 'Running'],
        }}
        onBack={() => setSelectedMember(null)}
      />
    )
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '44px 24px 44px', background: C.bg }}>
      <BackButton onClick={onBack} label="Zur Auswahl" />
      <div style={{ height: 26 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.teal }} />
        <span style={{ fontSize: 14, color: C.teal, fontWeight: 700 }}>Match gefunden</span>
      </div>

      <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 40, color: C.ink, margin: '0 0 10px', fontWeight: 400, lineHeight: 1.1 }}>
        Dein QUAIN<br />ist komplett.
      </h2>
      <p style={{ fontSize: 15, color: C.muted, margin: '0 0 32px', lineHeight: 1.6 }}>
        {accountType === 'company'
          ? '3–5 Lumio-Kolleg:innen · gleiche Rolle · verschiedene Bereiche'
          : '5 Product Professionals · gemeinsame Themen · verschiedene Perspektiven'}
      </p>

      {/* Members */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {[ME, ...COHORT].map(m => (
          <Card key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
            <AvatarLabel initials={m.initials} color={m.color} size={46} />
            <div style={{ flex: 1 }}>
              <button onClick={() => setSelectedMember(m)} style={{
                padding: 0, border: 'none', background: 'transparent',
                fontFamily: "'Outfit', sans-serif", cursor: 'pointer',
                fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 1,
              }}>
                {m.fullName}{m.isMe ? ' (du)' : ''}
              </button>
              <div style={{ fontSize: 13, color: C.muted }}>
                {m.role} · {accountType === 'company' ? m.team : 'Berlin'}
              </div>
            </div>
            {m.isMe && (
              <div style={{ fontSize: 11, color: C.teal, fontWeight: 700, background: '#EBF5F0', padding: '3px 10px', borderRadius: 100 }}>
                ich
              </div>
            )}
          </Card>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <ProgramPreview format="quain" />
      </div>

      {/* Season teaser */}
      <div style={{ padding: '18px', background: '#EEF1FF', borderRadius: 16, marginBottom: 32, border: `1px solid #D8DCEE` }}>
        <div style={{ fontSize: 13, color: C.lavender, fontWeight: 700, marginBottom: 6 }}>Season 1 · 6 Monate · 6 Programmschritte</div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>
          {accountType === 'company'
            ? 'Ein Treffen pro Monat — Kick-off, Online-Challenge, Fachmesse, Walk-Call, Aktivität, Abschluss. Kolleg:innen aus anderen Bereichen, die du sonst nie kennengelernt hättest.'
            : 'Ein Treffen pro Monat — Kick-off, Online-Challenge, Fachmesse, Walk-Call, Aktivität, Abschluss. Product Professionals mit vielfältigen Hintergründen, die du sonst nie kennengelernt hättest.'}
        </div>
      </div>

      <div style={{ flex: 1 }} />
      <Btn onClick={onStart}>Season 1 starten →</Btn>
    </div>
  )
}

// ── Screen: Season End ──────────────────────────────────────────
function SeasonEndScreen({ onChoice }: { onChoice: (c: 'stop' | 'new' | 'continue') => void }) {
  const [hovering, setHovering] = useState<string | null>(null)

  const options = [
    {
      id: 'continue' as const,
      emoji: '🔄',
      title: 'Weiter mit deinem QUAIN',
      subtitle: 'Season 2 starten — 6 Monate, monatlicher Rhythmus',
      bg: `linear-gradient(135deg, ${C.lavender} 0%, ${C.wisteria} 100%)`,
      text: '#fff', badge: 'Empfohlen',
    },
    {
      id: 'new' as const,
      emoji: '🆕',
      title: 'Neues QUAIN',
      subtitle: 'Mit einer anderen Gruppe neu starten — Season 1, 6 Monate',
      bg: C.card,
      text: C.ink, badge: null,
    },
    {
      id: 'stop' as const,
      emoji: '👋',
      title: 'Ausstieg',
      subtitle: 'Ohne unangenehme Absage — Wiedereinstieg über ein neues QUAIN',
      bg: C.card,
      text: C.ink, badge: null,
    },
  ]

  return (
    <div style={{ height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '56px 24px 44px', background: C.bg }}>
      <div style={{ height: 20 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.teal }} />
        <span style={{ fontSize: 14, color: C.teal, fontWeight: 700 }}>Season 1 abgeschlossen 🎉</span>
      </div>

      <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 38, color: C.ink, margin: '0 0 12px', fontWeight: 400, lineHeight: 1.1 }}>
        Wie geht es<br />weiter?
      </h2>
      <p style={{ fontSize: 15, color: C.muted, margin: '0 0 36px', lineHeight: 1.6 }}>
        6 Monate mit deinem QUAIN. Du entscheidest, was als nächstes kommt.
      </p>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {options.map(opt => (
          <button
            key={opt.id}
            onClick={() => onChoice(opt.id)}
            onMouseEnter={() => setHovering(opt.id)}
            onMouseLeave={() => setHovering(null)}
            style={{
              width: '100%', padding: '22px 20px', borderRadius: 20, cursor: 'pointer',
              textAlign: 'left', fontFamily: "'Outfit', sans-serif",
              background: opt.bg, border: `1.5px solid ${opt.id === 'continue' ? 'transparent' : C.border}`,
              transform: hovering === opt.id ? 'translateY(-2px)' : 'none',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              boxShadow: hovering === opt.id ? '0 8px 28px rgba(0,0,0,0.12)' : opt.id === 'continue' ? '0 4px 20px rgba(125,132,178,0.3)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1 }}>
                <span style={{ fontSize: 28 }}>{opt.emoji}</span>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: opt.text, marginBottom: 5, letterSpacing: '-0.02em' }}>
                    {opt.title}
                  </div>
                  <div style={{ fontSize: 13, color: opt.id === 'continue' ? 'rgba(255,255,255,0.78)' : C.muted, lineHeight: 1.5 }}>
                    {opt.subtitle}
                  </div>
                </div>
              </div>
              {opt.badge && (
                <div style={{ fontSize: 10, fontWeight: 800, color: HIGHLIGHT, background: 'rgba(255,255,255,0.18)', padding: '3px 10px', borderRadius: 100, whiteSpace: 'nowrap', marginLeft: 8, flexShrink: 0 }}>
                  {opt.badge}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Note */}
      <div style={{ marginTop: 24, padding: '14px 16px', background: '#EEF1FF', borderRadius: 14, border: `1px solid #D8DCEE` }}>
        <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>
          <span style={{ fontWeight: 700, color: C.lavender }}>Hinweis:</span> Vor jeder Verlängerung kannst du deine Erfahrung mit der Season bewerten.
        </div>
      </div>
    </div>
  )
}

// ── Screen: Rating ──────────────────────────────────────────────
function RatingScreen({ onDone }: { onDone: () => void }) {
  const [rating, setRating] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    setSubmitted(true)
    setTimeout(onDone, 1600)
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '56px 24px 44px', background: C.bg, alignItems: 'center', justifyContent: 'center' }}>
      {!submitted ? (
        <>
          <div style={{ fontSize: 48, marginBottom: 24 }}>⭐</div>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 34, color: C.ink, margin: '0 0 12px', fontWeight: 400, textAlign: 'center', lineHeight: 1.2 }}>
            Wie war deine<br />Experience?
          </h2>
          <p style={{ fontSize: 15, color: C.muted, textAlign: 'center', margin: '0 0 40px', lineHeight: 1.6, maxWidth: 280 }}>
            Dein Feedback hilft uns, die Qualität der QUAINs kontinuierlich zu verbessern.
          </p>

          {/* Rating scale */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setRating(n)} style={{
                width: 52, height: 52, borderRadius: 14, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                fontSize: 22, fontWeight: 700,
                background: rating !== null && n <= rating ? C.lavender : C.subtle,
                color: rating !== null && n <= rating ? '#fff' : '#999',
                border: rating === n ? `2px solid ${C.lavender}` : `2px solid transparent`,
                transform: rating === n ? 'scale(1.12)' : 'scale(1)',
                transition: 'all 0.15s ease',
              }}>
                {['😕', '😐', '🙂', '😊', '🤩'][n - 1]}
              </button>
            ))}
          </div>

          <div style={{ fontSize: 13, color: C.muted, marginBottom: 40, height: 20 }}>
            {rating === 1 && 'Da ist noch Luft nach oben'}
            {rating === 2 && 'Okay, aber ausbaubar'}
            {rating === 3 && 'Solide Season'}
            {rating === 4 && 'Hat sich gelohnt'}
            {rating === 5 && 'Genau so soll es sein!'}
          </div>

          <div style={{ width: '100%', maxWidth: 320 }}>
            <Btn onClick={handleSubmit} disabled={rating === null}>
              Abschicken & weitermachen
            </Btn>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>🎯</div>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 30, color: C.ink, fontWeight: 400 }}>
            Danke!
          </h2>
          <p style={{ fontSize: 15, color: C.muted, marginTop: 10 }}>Dein neues QUAIN wird gestartet.</p>
        </div>
      )}
    </div>
  )
}

// ── Screen: Meeting Feedback ────────────────────────────────────
function MeetingFeedbackScreen({ step, onSubmit, onBack }: {
  step: (typeof PROGRAM_STEPS)[number]
  onSubmit: (feedback: MeetingFeedback) => void
  onBack: () => void
}) {
  const [rating, setRating] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const ratingLabels = [
    'Nicht gut',
    'Eher durchwachsen',
    'Ganz okay',
    'Richtig gut',
    'Großartig',
  ]
  const ratingEmojis = ['😕', '😐', '🙂', '😊', '🤩']

  const handleSubmit = () => {
    if (rating === null) return
    onSubmit({ rating, note: note.trim() })
    setSubmitted(true)
  }

  return (
    <div style={{
      height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column',
      padding: '56px 24px 44px', background: C.bg,
    }}>
      {!submitted ? (
        <>
          <button onClick={onBack} style={{
            alignSelf: 'flex-start', background: 'transparent', border: 'none',
            color: C.lavender, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            fontFamily: "'Outfit', sans-serif", padding: '0 0 28px',
          }}>
            ← Zurück
          </button>

          <div style={{
            width: 54, height: 54, borderRadius: 17, background: '#EEF1FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, marginBottom: 24,
          }}>
            {step.emoji}
          </div>
          <div style={{
            fontSize: 11, color: C.teal, fontWeight: 800,
            letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10,
          }}>
            Schritt {step.step} · {step.type}
          </div>
          <h2 style={{
            fontFamily: "'Instrument Serif', serif", fontSize: 38,
            color: C.ink, margin: '0 0 12px', fontWeight: 400, lineHeight: 1.12,
          }}>
            Wie war das Treffen für dich?
          </h2>
          <p style={{ fontSize: 14, color: C.muted, margin: '0 0 34px', lineHeight: 1.6 }}>
            Dein persönliches Feedback bleibt vertraulich und hilft uns, die nächsten Treffen zu verbessern.
          </p>

          <div role="group" aria-label="Bewertung von 1 bis 5" style={{
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8,
            marginBottom: 12,
          }}>
            {[1, 2, 3, 4, 5].map(n => {
              const selected = rating === n
              return (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  aria-label={`${n} von 5 – ${ratingLabels[n - 1]}`}
                  aria-pressed={selected}
                  style={{
                    height: 58, borderRadius: 15, cursor: 'pointer',
                    fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700,
                    background: selected ? C.lavender : C.card,
                    color: selected ? '#fff' : C.muted,
                    border: selected ? `2px solid ${C.lavender}` : `1.5px solid ${C.border}`,
                    boxShadow: selected ? '0 5px 18px rgba(125,132,178,0.28)' : 'none',
                    transform: selected ? 'translateY(-2px)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {ratingEmojis[n - 1]}
                </button>
              )
            })}
          </div>
          <div style={{
            minHeight: 22, fontSize: 13, color: rating ? C.lavender : C.muted,
            fontWeight: rating ? 600 : 400, marginBottom: 26, textAlign: 'center',
          }}>
            {rating ? ratingLabels[rating - 1] : '1 = nicht gut · 5 = großartig'}
          </div>

          <label htmlFor="meeting-note" style={{
            fontSize: 12, color: C.ink, fontWeight: 700, display: 'block', marginBottom: 9,
          }}>
            Möchtest du noch etwas ergänzen? <span style={{ color: C.muted, fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            id="meeting-note"
            value={note}
            onChange={event => setNote(event.target.value)}
            placeholder="Was war gut? Was können wir besser machen?"
            rows={4}
            maxLength={500}
            style={{
              width: '100%', resize: 'none', boxSizing: 'border-box',
              padding: '15px 16px', borderRadius: 15, background: C.card,
              border: `1.5px solid ${C.border}`, color: C.ink, fontSize: 14,
              lineHeight: 1.55, fontFamily: "'Outfit', sans-serif", outlineColor: C.lavender,
              marginBottom: 8,
            }}
          />
          <div style={{ fontSize: 11, color: '#999', textAlign: 'right', marginBottom: 28 }}>
            {note.length}/500
          </div>

          <div style={{ flex: 1 }} />
          <Btn onClick={handleSubmit} disabled={rating === null}>Feedback absenden</Btn>
        </>
      ) : (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', background: HIGHLIGHT,
            outline: `1.5px solid ${HIGHLIGHT_OUTLINE}`, outlineOffset: -1.5,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#2A4A30', fontSize: 32, marginBottom: 24,
          }}>
            ✓
          </div>
          <h2 style={{
            fontFamily: "'Instrument Serif', serif", fontSize: 36,
            color: C.ink, margin: '0 0 12px', fontWeight: 400,
          }}>
            Danke für dein Feedback.
          </h2>
          <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.6, margin: '0 0 36px' }}>
            Deine Bewertung wurde vertraulich gespeichert.
          </p>
          <div style={{ width: '100%' }}>
            <Btn onClick={onBack}>Zurück zur Season</Btn>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 1:1 people discovery ────────────────────────────────────────
type PeopleFilter = 'All' | 'Favorites' | 'My interests' | 'Same topics' | 'New'

function SearchIcon() {
  return (
    <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function FilterIcon() {
  return (
    <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="16" cy="7" r="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="8" cy="17" r="2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="10" r="2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function InterestPills({ items, variant = 'neutral' }: {
  items: string[]
  variant?: 'neutral' | 'professional' | 'personal' | 'shared'
}) {
  const styles = {
    neutral: { background: C.subtle, color: '#555D58' },
    professional: { background: '#EEF1FF', color: '#565F9F' },
    personal: { background: '#EBF5F0', color: '#2D6148' },
    shared: {
      background: HIGHLIGHT, color: HIGHLIGHT_TEXT,
      outline: `1px solid ${HIGHLIGHT_OUTLINE}`, outlineOffset: -1,
    },
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {items.map(item => (
        <span key={item} style={{
          padding: '5px 10px', borderRadius: 100,
          ...styles[variant],
          fontSize: 11, fontWeight: 600,
        }}>
          {item}
        </span>
      ))}
    </div>
  )
}

function PersonCard({ accountType, person, isFavorite, onOpen, onToggleFavorite }: {
  accountType: AccountType
  person: DiscoveryPerson
  isFavorite: boolean
  onOpen: () => void
  onToggleFavorite: () => void
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') onOpen()
      }}
      style={{
      width: '100%', padding: 18, border: 'none', borderRadius: 22,
      background: C.card, textAlign: 'left', cursor: 'pointer',
      fontFamily: "'Outfit', sans-serif",
      boxShadow: '0 3px 18px rgba(34,43,38,0.06)', boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
        <PersonPhoto person={person}
          src={person.photo}
          alt={person.photoAlt}
          style={{
            width: 66, height: 66, borderRadius: '50%', objectFit: 'cover',
            background: C.subtle, flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            fontSize: 17, fontWeight: 700, color: C.ink, marginBottom: 3,
            letterSpacing: '-0.02em',
          }}>
            {person.name}
            {person.isNew && (
              <span style={{
                padding: '2px 7px', borderRadius: 100, background: HIGHLIGHT,
                outline: `1px solid ${HIGHLIGHT_OUTLINE}`, outlineOffset: -1,
                color: HIGHLIGHT_TEXT, fontSize: 9, fontWeight: 800, letterSpacing: '0.05em',
              }}>
                NEW
              </span>
            )}
          </div>
          <div style={{ fontSize: 13, color: C.ink, fontWeight: 500, marginBottom: 3 }}>{person.role}</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 5 }}>
            {accountType === 'company' ? person.team : 'Product Professional'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.muted }}>
            <LocationIcon /> {person.location}
          </div>
        </div>
        <button
          onClick={event => {
            event.stopPropagation()
            onToggleFavorite()
          }}
          aria-label={isFavorite ? `${person.name} aus Favoriten entfernen` : `${person.name} als Favorit merken`}
          style={{
            width: 38, height: 38, borderRadius: 13, flexShrink: 0,
            border: `1px solid ${isFavorite ? '#D8DCEE' : C.border}`,
            background: isFavorite ? '#EEF1FF' : C.subtle,
            color: isFavorite ? C.lavender : C.muted, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <BookmarkIcon filled={isFavorite} size={18} />
        </button>
      </div>

      <InterestPills items={person.interests} />

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, marginTop: 15, paddingTop: 14, borderTop: `1px solid ${C.border}`,
      }}>
        <span style={{ fontSize: 12, color: C.teal, fontWeight: 700 }}>
          {person.sharedInterests.length} interests in common
        </span>
        <span style={{
          padding: '9px 13px', borderRadius: 12, background: C.lavender,
          color: '#fff', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
        }}>
          Connect 1:1
        </span>
      </div>
    </div>
  )
}

function PeopleListView({ accountType, setupLocation, favoriteIds, onBack, onOpen, onToggleFavorite }: {
  accountType: AccountType
  setupLocation: string
  favoriteIds: number[]
  onBack: () => void
  onOpen: (person: DiscoveryPerson) => void
  onToggleFavorite: (personId: number) => void
}) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<PeopleFilter>('All')
  const [locationFilterEnabled, setLocationFilterEnabled] = useState(true)
  const [activeLocation, setActiveLocation] = useState(() => locationLabelFromSetup(setupLocation))
  const [locationStatus, setLocationStatus] = useState<'ready' | 'updating' | 'unavailable'>('ready')
  const usesLiveLocation = setupLocation.startsWith('Genauer Standort:')
  const filters: PeopleFilter[] = ['All', 'My interests', 'Same topics', 'New']

  useEffect(() => {
    if (!usesLiveLocation || !navigator.geolocation) return

    setLocationStatus('updating')
    const watchId = navigator.geolocation.watchPosition(
      position => {
        setActiveLocation(nearestProfileCity(position.coords.latitude, position.coords.longitude))
        setLocationStatus('ready')
      },
      () => setLocationStatus('unavailable'),
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [usesLiveLocation])

  const people = DISCOVERY_PEOPLE.filter(person => {
    const searchable = [
      person.name, person.role, person.team, person.location,
      ...person.interests,
    ].join(' ').toLowerCase()
    const matchesSearch = searchable.includes(query.trim().toLowerCase())
    const matchesLocation = !locationFilterEnabled || !activeLocation || person.location === activeLocation
    const matchesFilter =
      filter === 'All' ||
      (filter === 'My interests' && person.sharedInterests.length >= 3) ||
      (filter === 'Same topics' && person.professionalInterests.some(item => ['Product Strategy', 'AI', 'Team Leadership'].includes(item))) ||
      (filter === 'New' && person.isNew) ||
      (filter === 'Favorites' && favoriteIds.includes(person.id))
    return matchesSearch && matchesLocation && matchesFilter
  })

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg }}>
      <div style={{ background: C.bg, padding: '42px 20px 14px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button onClick={onBack} aria-label="Back to home" style={{
            width: 42, height: 42, borderRadius: '50%', border: 'none',
            background: C.card, color: C.ink, fontSize: 20, cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(34,43,38,0.06)',
          }}>
            ←
          </button>
          <div style={{
            fontFamily: "'Instrument Serif', serif", fontSize: 31,
            color: C.ink, lineHeight: 1,
          }}>
            1:1
          </div>
          <button aria-label="Open filters" onClick={() => setFilter('All')} style={{
            width: 42, height: 42, borderRadius: '50%', border: 'none',
            background: C.card, color: C.ink, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(34,43,38,0.06)',
          }}>
            <FilterIcon />
          </button>
        </div>
        <p style={{
          margin: '0 0 18px', textAlign: 'center', color: C.muted,
          fontSize: 14, lineHeight: 1.5,
        }}>
          Find someone you’d like to get to know.
        </p>

        <button onClick={() => setLocationFilterEnabled(current => !current)} style={{
          width: '100%', marginBottom: 12, padding: '12px 14px', borderRadius: 16,
          border: `1px solid ${locationFilterEnabled ? '#C8E8D8' : C.border}`,
          background: locationFilterEnabled ? '#EBF5F0' : C.card,
          display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer',
          fontFamily: "'Outfit', sans-serif", textAlign: 'left',
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 11, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: locationFilterEnabled ? C.teal : C.subtle,
            color: locationFilterEnabled ? '#fff' : C.muted,
          }}>
            <LocationIcon />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: C.ink, fontSize: 12.5, fontWeight: 700, marginBottom: 2 }}>
              {locationFilterEnabled ? `Profile in ${activeLocation || 'deiner Nähe'}` : 'Alle Standorte anzeigen'}
            </div>
            <div style={{ color: C.muted, fontSize: 10.5, lineHeight: 1.35 }}>
              {locationFilterEnabled && usesLiveLocation && locationStatus === 'updating' && 'Aktueller Standort wird ermittelt …'}
              {locationFilterEnabled && usesLiveLocation && locationStatus === 'ready' && 'Wird automatisch mit deinem aktuellen Standort aktualisiert'}
              {locationFilterEnabled && usesLiveLocation && locationStatus === 'unavailable' && 'Aktualisierung nicht möglich · Setup-Standort aktiv'}
              {locationFilterEnabled && !usesLiveLocation && 'Standort aus deinem Setup'}
              {!locationFilterEnabled && 'Standortfilter ist ausgeschaltet'}
            </div>
          </div>
          <div style={{
            width: 38, height: 22, padding: 2, boxSizing: 'border-box',
            borderRadius: 100, background: locationFilterEnabled ? C.teal : '#C9CECA',
            display: 'flex', justifyContent: locationFilterEnabled ? 'flex-end' : 'flex-start',
          }}>
            <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.16)' }} />
          </div>
        </button>

        <label style={{
          display: 'flex', alignItems: 'center', gap: 10,
          minHeight: 50, padding: '0 15px', borderRadius: 16,
          background: C.card, color: C.muted,
          boxShadow: '0 2px 12px rgba(34,43,38,0.05)',
        }}>
          <SearchIcon />
          <input
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder={accountType === 'company' ? 'Search colleagues' : 'Search Product Professionals'}
            style={{
              flex: 1, minWidth: 0, border: 'none', outline: 'none',
              background: 'transparent', color: C.ink, fontSize: 14,
              fontFamily: "'Outfit', sans-serif",
            }}
          />
        </label>

        <button onClick={() => setFilter('Favorites')} style={{
          width: '100%', marginTop: 12, padding: '12px 14px', borderRadius: 15,
          border: `1px solid ${filter === 'Favorites' ? '#D8DCEE' : C.border}`,
          background: filter === 'Favorites' ? '#EEF1FF' : C.card,
          color: filter === 'Favorites' ? C.lavender : C.ink,
          display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
          fontFamily: "'Outfit', sans-serif", textAlign: 'left',
        }}>
          <BookmarkIcon filled={filter === 'Favorites'} size={18} />
          <span style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>Favoriten</span>
          <span style={{ fontSize: 11, color: C.muted }}>{favoriteIds.length} Profile</span>
        </button>
        <p style={{ margin: '7px 2px 0', fontSize: 10.5, color: C.muted, lineHeight: 1.4 }}>
          Nur Profile innerhalb von QUAIN – ohne externe Telefonnummern oder Kontaktdaten.
        </p>
      </div>

      <div style={{
        display: 'flex', gap: 8, overflowX: 'auto', flexShrink: 0,
        padding: '4px 20px 15px', background: C.bg,
      }}>
        {filters.map(item => {
          const selected = item === filter
          return (
            <button key={item} onClick={() => setFilter(item)} style={{
              padding: '9px 14px', borderRadius: 100, whiteSpace: 'nowrap',
              border: selected ? 'none' : `1px solid ${C.border}`,
              background: selected ? C.lavender : C.card,
              color: selected ? '#fff' : C.muted,
              fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600,
              cursor: 'pointer',
            }}>
              {item}
            </button>
          )
        })}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 22px' }}>
        {people.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {people.map(person => (
              <PersonCard
                accountType={accountType}
                key={person.id}
                person={person}
                isFavorite={favoriteIds.includes(person.id)}
                onOpen={() => onOpen(person)}
                onToggleFavorite={() => onToggleFavorite(person.id)}
              />
            ))}
          </div>
        ) : (
          <div style={{ padding: '52px 24px', textAlign: 'center' }}>
            <div style={{
              fontFamily: "'Instrument Serif', serif", fontSize: 25,
              color: C.ink, marginBottom: 8,
            }}>
              {locationFilterEnabled
                ? `Keine Profile in ${activeLocation || 'deiner Nähe'}`
                : filter === 'Favorites'
                ? 'Noch keine Favoriten'
                : accountType === 'company' ? 'No colleagues found' : 'No Product Professionals found'}
            </div>
            <p style={{ margin: 0, color: C.muted, fontSize: 13, lineHeight: 1.6 }}>
              {locationFilterEnabled
                ? 'Schalte den Standortfilter aus, um alle QUAIN-Profile zu sehen.'
                : filter === 'Favorites'
                ? 'Merke Profile, die du später für ein 1:1 oder ein gemeinsames QUAIN anfragen möchtest.'
                : 'Try another name, topic or filter.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function PersonProfileView({ accountType, person, isFavorite, onBack, onInvite, onToggleFavorite }: {
  accountType: AccountType
  person: DiscoveryPerson
  isFavorite: boolean
  onBack: () => void
  onInvite: () => void
  onToggleFavorite: () => void
}) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bg }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{
          position: 'relative', height: 252, overflow: 'hidden',
          background: C.subtle,
        }}>
          <PersonPhoto person={person}
            src={person.photo}
            alt={person.photoAlt}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(20,28,24,0.12) 0%, rgba(20,28,24,0) 42%, rgba(20,28,24,0.32) 100%)',
          }} />
          <button onClick={onBack} aria-label="Back to people" style={{
            position: 'absolute', top: 42, left: 20, width: 42, height: 42,
            borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.9)',
            color: C.ink, fontSize: 20, cursor: 'pointer',
            backdropFilter: 'blur(10px)',
          }}>
            ←
          </button>
          <button
            onClick={onToggleFavorite}
            aria-label={isFavorite ? `${person.name} aus Favoriten entfernen` : `${person.name} als Favorit merken`}
            style={{
              position: 'absolute', top: 42, right: 20, width: 42, height: 42,
              borderRadius: '50%', border: 'none',
              background: isFavorite ? C.lavender : 'rgba(255,255,255,0.9)',
              color: isFavorite ? '#fff' : C.ink, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(10px)',
            }}
          >
            <BookmarkIcon filled={isFavorite} />
          </button>
        </div>

        <div style={{ padding: '24px 22px 30px' }}>
          <h2 style={{
            fontFamily: "'Instrument Serif', serif", fontSize: 36,
            fontWeight: 400, color: C.ink, lineHeight: 1.05, margin: '0 0 8px',
          }}>
            {person.name}
          </h2>
          <div style={{ fontSize: 15, color: C.ink, fontWeight: 600, marginBottom: 4 }}>{person.role}</div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 7 }}>
            {accountType === 'company' ? person.team : 'Product Professional'}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 12, color: C.muted, marginBottom: 22,
          }}>
            <LocationIcon /> {person.location}
          </div>

          <p style={{
            fontSize: 14, color: '#49514C', lineHeight: 1.7,
            margin: '0 0 28px',
          }}>
            {person.intro}
          </p>

          <div style={{ marginBottom: 23 }}>
            <Label>Euer 1:1</Label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', borderRadius: 16,
              background: C.card, border: `1px solid ${C.border}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <AvatarLabel initials={ME.initials} color={ME.color} size={38} />
                <div style={{ marginLeft: -8 }}>
                  <PersonPhoto person={person}
                    src={person.photo}
                    alt=""
                    style={{
                      width: 38, height: 38, borderRadius: '50%',
                      objectFit: 'cover', border: `2px solid ${C.card}`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: C.ink, fontWeight: 700 }}>
                  Du & {person.name.split(' ')[0]}
                </div>
                <div style={{ fontSize: 11, color: C.muted }}>Eure persönliche Verbindung</div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 23 }}>
            <Label>Shared with you</Label>
            <InterestPills items={person.sharedInterests} variant="shared" />
          </div>
          <div style={{ marginBottom: 23 }}>
            <Label>Professional interests</Label>
            <InterestPills items={person.professionalInterests} variant="professional" />
          </div>
          <div style={{ marginBottom: 26 }}>
            <Label>Personal interests</Label>
            <InterestPills items={person.personalInterests} variant="personal" />
          </div>

          <div style={{ marginBottom: 18 }}>
            <ProgramPreview format="one-to-one" />
          </div>

          <div style={{
            padding: 17, borderRadius: 17, background: '#F0F4F1',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <div>
              <div style={{ fontSize: 10, color: C.teal, fontWeight: 800, letterSpacing: '0.08em', marginBottom: 3 }}>
                AVAILABILITY
              </div>
              <div style={{ fontSize: 13, color: C.ink }}>{person.availability}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: C.teal, fontWeight: 800, letterSpacing: '0.08em', marginBottom: 3 }}>
                PREFERRED FORMAT
              </div>
              <div style={{ fontSize: 13, color: C.ink }}>{person.format}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        flexShrink: 0, padding: '14px 20px 18px', background: 'rgba(250,250,248,0.96)',
        borderTop: `1px solid ${C.border}`, backdropFilter: 'blur(12px)',
      }}>
        <Btn onClick={onInvite}>Invite to 1:1</Btn>
      </div>
    </div>
  )
}

function InviteSentView({ person, onBack, onHome }: {
  person: DiscoveryPerson
  onBack: () => void
  onHome: () => void
}) {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '34px 28px', background: C.bg, textAlign: 'center', position: 'relative',
    }}>
      <div style={{ position: 'absolute', top: 44, left: 24 }}>
        <BackButton onClick={onBack} />
      </div>
      <div style={{ position: 'relative', marginBottom: 28 }}>
        <div style={{
          width: 108, height: 108, borderRadius: '50%',
          padding: 5, background: '#EEF1FF',
        }}>
          <PersonPhoto person={person}
            src={person.photo}
            alt={person.photoAlt}
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
          />
        </div>
        <div style={{
          position: 'absolute', right: -2, bottom: 2,
          width: 34, height: 34, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: HIGHLIGHT, color: HIGHLIGHT_TEXT, fontSize: 18,
          outline: `1.5px solid ${HIGHLIGHT_OUTLINE}`, outlineOffset: -1.5,
          border: `4px solid ${C.bg}`,
        }}>
          ✓
        </div>
      </div>
      <h2 style={{
        fontFamily: "'Instrument Serif', serif", fontSize: 38,
        fontWeight: 400, color: C.ink, margin: '0 0 12px',
      }}>
        Anfrage gesendet
      </h2>
      <p style={{
        color: C.muted, fontSize: 15, lineHeight: 1.65,
        margin: '0 0 30px', maxWidth: 280,
      }}>
        {person.name.split(' ')[0]} wurde kontaktiert. QUAIN meldet sich bei dir, sobald es ein Update zu eurer Verbindung gibt.
      </p>
      <div style={{ width: '100%', maxWidth: 320 }}>
        <Btn onClick={onHome}>Zum Home</Btn>
      </div>
    </div>
  )
}

function OneToOneExperience({ accountType, setupLocation, onBack, onHome }: {
  accountType: AccountType
  setupLocation: string
  onBack: () => void
  onHome: () => void
}) {
  const [selectedPerson, setSelectedPerson] = useState<DiscoveryPerson | null>(null)
  const [inviteSent, setInviteSent] = useState(false)
  const [favoriteIds, setFavoriteIds] = useState<number[]>([])
  const toggleFavorite = (personId: number) => {
    setFavoriteIds(current =>
      current.includes(personId) ? current.filter(id => id !== personId) : [...current, personId]
    )
  }

  if (selectedPerson && inviteSent) {
    return (
      <InviteSentView
        person={selectedPerson}
        onBack={() => {
          setInviteSent(false)
        }}
        onHome={onHome}
      />
    )
  }

  if (selectedPerson) {
    return (
      <PersonProfileView
        accountType={accountType}
        person={selectedPerson}
        isFavorite={favoriteIds.includes(selectedPerson.id)}
        onBack={() => setSelectedPerson(null)}
        onInvite={() => setInviteSent(true)}
        onToggleFavorite={() => toggleFavorite(selectedPerson.id)}
      />
    )
  }

  return (
    <PeopleListView
      accountType={accountType}
      setupLocation={setupLocation}
      favoriteIds={favoriteIds}
      onBack={onBack}
      onOpen={setSelectedPerson}
      onToggleFavorite={toggleFavorite}
    />
  )
}

function RandomOneToOneMatchScreen({ accountType, person, matchedProfessional, matchedPersonal, onBack, onHome }: {
  accountType: AccountType
  person: DiscoveryPerson
  matchedProfessional: string[]
  matchedPersonal: string[]
  onBack: () => void
  onHome: () => void
}) {
  const [started, setStarted] = useState(false)

  if (started) {
    return (
      <div style={{
        height: '100%', boxSizing: 'border-box', padding: '44px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', background: C.bg, textAlign: 'center', position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 44, left: 24 }}>
          <BackButton onClick={() => setStarted(false)} />
        </div>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', background: HIGHLIGHT,
          outline: `1.5px solid ${HIGHLIGHT_OUTLINE}`, outlineOffset: -1.5,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: HIGHLIGHT_TEXT, fontSize: 30, marginBottom: 24,
        }}>
          ✓
        </div>
        <h2 style={{
          fontFamily: "'Instrument Serif', serif", fontSize: 36,
          color: C.ink, fontWeight: 400, lineHeight: 1.1, margin: '0 0 12px',
        }}>
          Person kontaktiert.
        </h2>
        <p style={{
          color: C.muted, fontSize: 14, lineHeight: 1.65,
          margin: '0 0 30px', maxWidth: 290,
        }}>
          {person.name.split(' ')[0]} wurde über deine Anfrage informiert. QUAIN meldet sich bei dir, sobald es ein Update gibt.
        </p>
        <div style={{ width: '100%', maxWidth: 320 }}>
          <Btn onClick={onHome}>Zum Home</Btn>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      height: '100%', overflowY: 'auto', boxSizing: 'border-box',
      padding: '36px 18px 22px', background: C.bg,
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 18,
      }}>
        <BackButton onClick={onBack} />
        <div style={{
          padding: '6px 10px', borderRadius: 100,
          background: HIGHLIGHT, color: HIGHLIGHT_TEXT,
          outline: `1px solid ${HIGHLIGHT_OUTLINE}`, outlineOffset: -1,
          fontSize: 10, fontWeight: 800, letterSpacing: '0.06em',
        }}>
          PASSENDES 1:1 MATCH
        </div>
      </div>
      <h2 style={{
        fontFamily: "'Instrument Serif', serif", fontSize: 31,
        color: C.ink, fontWeight: 400, lineHeight: 1.1, margin: '0 0 7px',
      }}>
        Wir haben jemanden für dich gefunden.
      </h2>
      <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.5, margin: '0 0 16px' }}>
        Rolle, Interessen und persönliche Präferenzen passen besonders gut zusammen.
      </p>

      <div style={{
        overflow: 'hidden', borderRadius: 24, background: C.card,
        border: `1px solid ${C.border}`,
        boxShadow: '0 5px 22px rgba(34,43,38,0.07)', marginBottom: 14,
      }}>
        <div style={{
          padding: '16px', display: 'flex', alignItems: 'center', gap: 14,
          borderBottom: `1px solid ${C.border}`,
        }}>
          <PersonPhoto person={person}
            src={person.photo}
            alt={person.photoAlt}
            style={{
              width: 82, height: 82, borderRadius: 20,
              objectFit: 'cover', background: C.subtle, flexShrink: 0,
            }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontFamily: "'Instrument Serif', serif", fontSize: 25,
              color: C.ink, marginBottom: 3,
            }}>
              {person.name}
            </div>
            <div style={{ fontSize: 13, color: C.ink, fontWeight: 600, marginBottom: 2 }}>
              {person.role}
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>
              {accountType === 'company' ? person.team : 'Product Professional'}
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 11, color: C.muted,
            }}>
              <LocationIcon /> {person.location}
            </div>
          </div>
        </div>

        <div style={{ padding: '14px 16px 16px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 10, fontSize: 11.5, color: C.ink, fontWeight: 700,
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <AvatarLabel initials={ME.initials} color={ME.color} size={26} />
              <div style={{ marginLeft: -6 }}>
                <PersonPhoto person={person}
                  src={person.photo}
                  alt=""
                  style={{
                    width: 26, height: 26, borderRadius: '50%',
                    objectFit: 'cover', border: `2px solid ${C.card}`,
                  }}
                />
              </div>
            </div>
            Max & {person.name.split(' ')[0]}
          </div>

          <div style={{
            padding: '11px 12px', borderRadius: 13,
            background: '#EBF5F0', marginBottom: 11,
          }}>
            <div style={{ fontSize: 10, color: C.teal, fontWeight: 800, marginBottom: 3 }}>
              WARUM IHR GUT PASST
            </div>
            <div style={{ fontSize: 12, color: C.ink, lineHeight: 1.45 }}>
              Ähnliche Rolle · gemeinsame Themen · passende 1:1 Präferenzen
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <div style={{
                fontSize: 9, color: C.lavender, fontWeight: 800,
                letterSpacing: '0.07em', marginBottom: 5,
              }}>
                BERUFLICH
              </div>
              <InterestPills items={matchedProfessional.slice(0, 2)} variant="professional" />
            </div>
            <div>
              <div style={{
                fontSize: 9, color: '#5F8174', fontWeight: 800,
                letterSpacing: '0.07em', marginBottom: 5,
              }}>
                FREIZEIT
              </div>
              <InterestPills items={matchedPersonal.slice(0, 2)} variant="personal" />
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <ProgramPreview format="one-to-one" />
      </div>

      <div style={{ marginTop: 'auto' }}>
        <Btn onClick={() => setStarted(true)}>Start 1:1 Season</Btn>
      </div>
    </div>
  )
}

// ── Dashboard ───────────────────────────────────────────────────
function HomeTab({ accountType, onOpenSeason, onOpenQuain, onOpenOneToOne }: {
  accountType: AccountType
  onOpenSeason: () => void
  onOpenQuain: () => void
  onOpenOneToOne: (person: DiscoveryPerson) => void
}) {
  const nextStep = PROGRAM_STEPS.find(s => !s.done) ?? PROGRAM_STEPS[PROGRAM_STEPS.length - 1]
  const doneCount = PROGRAM_STEPS.filter(s => s.done).length
  const progress = Math.round((doneCount / PROGRAM_STEPS.length) * 100)

  return (
    <div>
      <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, color: C.ink, margin: '0 0 6px', fontWeight: 400 }}>
        Deine Verbindungen
      </h2>
      <p style={{ fontSize: 14, color: C.muted, margin: '0 0 24px', lineHeight: 1.55 }}>
        Alle Beziehungen, Gruppen und gemeinsamen Seasons an einem Ort.
      </p>

      <button onClick={onOpenSeason} style={{
        width: '100%', padding: 0, border: 'none', borderRadius: 22,
        background: `linear-gradient(138deg, ${C.lavender} 0%, ${C.wisteria} 100%)`,
        boxShadow: '0 6px 24px rgba(125,132,178,0.26)', cursor: 'pointer',
        textAlign: 'left', fontFamily: "'Outfit', sans-serif", marginBottom: 28,
        overflow: 'hidden',
      }}>
        <div style={{ padding: '21px 22px 18px', position: 'relative' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.72)', fontWeight: 800, letterSpacing: '0.11em', marginBottom: 7 }}>
            LAUFENDE SEASON
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            <div>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: '#fff', marginBottom: 4 }}>Season 1</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
                Schritt {doneCount + 1} von 6 · Nächstes Treffen {nextStep.day}. {nextStep.month}
              </div>
            </div>
            <span style={{ color: '#fff', fontSize: 20 }}>→</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.22)', borderRadius: 100, height: 6, marginTop: 18 }}>
            <div style={{ width: `${progress}%`, height: '100%', borderRadius: 100, background: HIGHLIGHT }} />
          </div>
        </div>
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>Deine QUAINs</div>
        <span style={{ fontSize: 11, color: C.muted }}>1 aktiv</span>
      </div>
      <button onClick={onOpenQuain} style={{
        width: '100%', padding: '17px', borderRadius: 19, marginBottom: 28,
        background: C.card, border: `1px solid ${C.border}`, cursor: 'pointer',
        textAlign: 'left', fontFamily: "'Outfit', sans-serif",
        boxShadow: '0 3px 14px rgba(34,43,38,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', minWidth: 70 }}>
            {[ME, ...COHORT].slice(0, 3).map((member, index) => (
              <div key={member.id} style={{ marginLeft: index === 0 ? 0 : -10 }}>
                <AvatarLabel initials={member.initials} color={member.color} size={34} />
              </div>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, color: C.ink, fontWeight: 700, marginBottom: 3 }}>Product & AI Exchange</div>
            <div style={{ fontSize: 12, color: C.muted }}>
              5 {accountType === 'company' ? 'Kolleg:innen' : 'Product Professionals'} · Berlin
            </div>
          </div>
          <span style={{ color: C.lavender, fontSize: 18 }}>→</span>
        </div>
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>Deine 1:1s</div>
        <span style={{ fontSize: 11, color: C.muted }}>1 aktiv · 1 angefragt</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {DISCOVERY_PEOPLE.slice(0, 2).map((person, index) => (
          <button key={person.id} onClick={() => onOpenOneToOne(person)} style={{
            width: '100%', padding: '14px 15px', borderRadius: 18,
            background: C.card, border: `1px solid ${C.border}`, cursor: 'pointer',
            textAlign: 'left', fontFamily: "'Outfit', sans-serif",
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <PersonPhoto person={person} src={person.photo} alt={person.photoAlt} style={{ width: 48, height: 48, borderRadius: 15, objectFit: 'cover' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, color: C.ink, fontWeight: 700, marginBottom: 3 }}>{person.name}</div>
              <div style={{ fontSize: 11.5, color: C.muted }}>{person.role} · {person.location}</div>
              <div style={{ fontSize: 10.5, color: index === 0 ? C.teal : C.lavender, fontWeight: 700, marginTop: 4 }}>
                {index === 0 ? 'Laufendes 1:1' : 'Anfrage gesendet'}
              </div>
            </div>
            <span style={{ color: C.lavender, fontSize: 18 }}>→</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function OneToOneDashboardDetail({ person, onBack, onMessage }: {
  person: DiscoveryPerson
  onBack: () => void
  onMessage: () => void
}) {
  const isPending = person.id === DISCOVERY_PEOPLE[1].id
  const [renewalOpen, setRenewalOpen] = useState(false)
  const [cadence, setCadence] = useState('Alle 6 Wochen')
  const [savedCadence, setSavedCadence] = useState<string | null>(null)
  const cadenceOptions = ['1x pro Monat', 'Alle 6 Wochen', 'Alle 2 Monate', '1x in 3 Monaten']

  return (
    <div>
      <BackButton onClick={onBack} label="Zur Übersicht" />
      <div style={{ height: 18 }} />
      <Card style={{ textAlign: 'center', padding: '26px 20px', marginBottom: 16 }}>
        <PersonPhoto person={person} src={person.photo} alt={person.photoAlt} style={{
          width: 84, height: 84, borderRadius: 24, objectFit: 'cover', marginBottom: 15,
        }} />
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 30, color: C.ink, margin: '0 0 5px', fontWeight: 400 }}>
          {person.name}
        </h2>
        <p style={{ margin: '0 0 15px', color: C.muted, fontSize: 13 }}>{person.role} · {person.location}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 7 }}>
          {person.sharedInterests.map(interest => <Tag key={interest} variant="teal">{interest}</Tag>)}
        </div>
      </Card>
      {isPending ? (
        <Card style={{ marginBottom: 16, background: '#EEF1FF', border: '1px solid #D8DCEE' }}>
          <Label>1:1-Anfrage</Label>
          <div style={{ fontSize: 15, color: C.ink, fontWeight: 700, marginBottom: 5 }}>Antwort ausstehend</div>
          <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.55 }}>
            QUAIN meldet sich bei dir, sobald {person.name.split(' ')[0]} auf deine Anfrage geantwortet hat.
          </div>
        </Card>
      ) : (
        <>
          <Card style={{ marginBottom: 16 }}>
            <Label>Aktuelle Season</Label>
            <div style={{ fontSize: 15, color: C.ink, fontWeight: 700, marginBottom: 5 }}>Season 1 · 6 Monate</div>
            <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.55 }}>
              Ein Treffen pro Monat. Bei der ersten Verlängerung legt ihr den Rhythmus für Season 2 gemeinsam fest.
            </div>
          </Card>

          <Card style={{ marginBottom: 16, background: '#F8FBEE', border: '1px solid #E4EEC4' }}>
            <Label>Verlängerung nach 6 Monaten</Label>
            {savedCadence ? (
              <>
                <div style={{ fontSize: 15, color: C.ink, fontWeight: 700, marginBottom: 5 }}>Season 2 · {savedCadence}</div>
                <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5, marginBottom: 12 }}>
                  Der vorgeschlagene Rhythmus wurde für eure nächste 6-monatige Season gespeichert.
                </div>
                <button onClick={() => setRenewalOpen(true)} style={{
                  padding: 0, border: 'none', background: 'transparent',
                  color: C.lavender, fontFamily: "'Outfit', sans-serif",
                  fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                }}>
                  Rhythmus ändern
                </button>
              </>
            ) : !renewalOpen ? (
              <button onClick={() => setRenewalOpen(true)} style={{
                width: '100%', padding: '12px 14px', borderRadius: 13,
                border: 'none', background: C.lavender, color: '#fff',
                fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>
                Rhythmus für Season 2 festlegen
              </button>
            ) : null}

            {renewalOpen && (
              <div style={{ marginTop: savedCadence ? 14 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                  {cadenceOptions.map(option => (
                    <button key={option} onClick={() => setCadence(option)} style={{
                      width: '100%', padding: '10px 12px', borderRadius: 12, textAlign: 'left',
                      border: `1px solid ${cadence === option ? C.lavender : C.border}`,
                      background: cadence === option ? '#EEF1FF' : C.card,
                      color: cadence === option ? C.lavender : C.ink,
                      fontFamily: "'Outfit', sans-serif", fontSize: 12.5,
                      fontWeight: cadence === option ? 700 : 500, cursor: 'pointer',
                    }}>
                      {option}
                    </button>
                  ))}
                </div>
                <Btn small onClick={() => {
                  setSavedCadence(cadence)
                  setRenewalOpen(false)
                }}>
                  Rhythmus speichern
                </Btn>
              </div>
            )}
          </Card>
        </>
      )}
      <Card style={{ marginBottom: 16 }}>
        <Label>Euer nächster Schritt</Label>
        <div style={{ fontSize: 15, color: C.ink, fontWeight: 700, marginBottom: 5 }}>Kennenlern-Call abstimmen</div>
        <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.55 }}>{person.availability} · {person.format}</div>
      </Card>
      {!isPending && <Btn onClick={onMessage}>Nachricht schreiben</Btn>}
    </div>
  )
}

function KreisTab({ accountType, onMessage }: { accountType: AccountType; onMessage: () => void }) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)

  if (selectedMember) {
    return (
      <ColleagueProfileScreen
        accountType={accountType}
        colleague={{
          name: selectedMember.fullName,
          role: selectedMember.role,
          team: selectedMember.team,
          initials: selectedMember.initials,
          color: selectedMember.color,
          location: 'Berlin',
          professionalInterests: ['Product Strategy', 'AI', 'Team Leadership'],
          personalInterests: ['Coffee', 'Travel', 'Running'],
        }}
        onBack={() => setSelectedMember(null)}
      />
    )
  }

  return (
    <div>
      <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 30, color: C.ink, margin: '0 0 8px', fontWeight: 400 }}>Dein QUAIN</h2>
      <p style={{ fontSize: 14, color: C.muted, margin: '0 0 28px' }}>Season 1 · 5 Personen</p>

      {[ME, ...COHORT].map(m => (
        <Card key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, padding: '18px' }}>
          <AvatarLabel initials={m.initials} color={m.color} size={50} />
          <div style={{ flex: 1 }}>
            <button onClick={() => setSelectedMember(m)} style={{
              padding: 0, border: 'none', background: 'transparent',
              fontFamily: "'Outfit', sans-serif", cursor: 'pointer',
              fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 2,
            }}>
              {m.fullName}{m.isMe ? ' (du)' : ''}
            </button>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: m.isMe ? 0 : 8 }}>
              {m.role} · {accountType === 'company' ? m.team : 'Berlin'}
            </div>
            {!m.isMe && (
              <button onClick={onMessage} style={{
                padding: 0, border: 'none', background: 'transparent',
                fontFamily: "'Outfit', sans-serif", fontSize: 12,
                color: C.lavender, fontWeight: 600, cursor: 'pointer',
              }}>
                Nachricht →
              </button>
            )}
          </div>
          {!m.isMe && (
            <button onClick={onMessage} aria-label={`Nachricht an ${m.name}`} style={{
              width: 38, height: 38, borderRadius: '50%', background: '#EEF1FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              color: C.lavender, border: 'none',
            }}>
              <ChatIcon size={18} />
            </button>
          )}
        </Card>
      ))}
    </div>
  )
}

function ChatOverview({ onOpenQuain, onOpenOneToOne }: {
  onOpenQuain: () => void
  onOpenOneToOne: () => void
}) {
  const anna = DISCOVERY_PEOPLE[0]

  return (
    <div>
      <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, color: C.ink, margin: '0 0 6px', fontWeight: 400 }}>
        Nachrichten
      </h2>
      <p style={{ fontSize: 13.5, color: C.muted, margin: '0 0 24px', lineHeight: 1.5 }}>
        Deine aktiven Gespräche aus QUAINs und 1:1-Verbindungen.
      </p>

      <div style={{ fontSize: 11, color: C.muted, fontWeight: 800, letterSpacing: '0.08em', marginBottom: 10 }}>
        AKTIVE CHATS
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={onOpenQuain} style={{
          width: '100%', padding: '15px', borderRadius: 19,
          background: C.card, border: `1px solid ${C.border}`, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 13, textAlign: 'left',
          fontFamily: "'Outfit', sans-serif",
        }}>
          <div style={{ width: 54, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {COHORT.slice(0, 3).map((member, index) => (
              <div key={member.id} style={{ marginLeft: index === 0 ? 0 : -15 }}>
                <AvatarLabel initials={member.initials} color={member.color} size={36} />
              </div>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, color: C.ink, fontWeight: 700, marginBottom: 4 }}>Product & AI Exchange</div>
            <div style={{ fontSize: 11.5, color: C.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Laura: Sollen wir vorab schon Themen sammeln?
            </div>
          </div>
          <span style={{
            minWidth: 22, height: 22, padding: '0 6px', boxSizing: 'border-box',
            borderRadius: 100, background: C.lavender, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 800,
          }}>
            2
          </span>
        </button>

        <button onClick={onOpenOneToOne} style={{
          width: '100%', padding: '15px', borderRadius: 19,
          background: C.card, border: `1px solid ${C.border}`, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 13, textAlign: 'left',
          fontFamily: "'Outfit', sans-serif",
        }}>
          <img src={anna.photo} alt={anna.photoAlt} style={{ width: 48, height: 48, borderRadius: 15, objectFit: 'cover', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
              <span style={{ fontSize: 14, color: C.ink, fontWeight: 700 }}>{anna.name}</span>
              <span style={{ fontSize: 9, color: C.teal, fontWeight: 800, background: '#EBF5F0', padding: '2px 6px', borderRadius: 100 }}>
                1:1
              </span>
            </div>
            <div style={{ fontSize: 11.5, color: C.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Wie sieht es bei dir nächste Woche aus?
            </div>
          </div>
          <span style={{ color: C.lavender, fontSize: 18 }}>→</span>
        </button>
      </div>

      <div style={{
        marginTop: 24, padding: '13px 14px', borderRadius: 15,
        background: C.subtle, color: C.muted, fontSize: 11.5, lineHeight: 1.5,
      }}>
        Eine angefragte 1:1-Verbindung erscheint hier, sobald die andere Person zugesagt hat.
      </div>
    </div>
  )
}

function ChatTab({ title, subtitle, placeholder, messages, onBack, onSend }: {
  title: string
  subtitle: string
  placeholder: string
  messages: ChatMessage[]
  onBack: () => void
  onSend: (text: string) => void
}) {
  const [draft, setDraft] = useState('')

  const sendMessage = () => {
    const text = draft.trim()
    if (!text) return
    onSend(text)
    setDraft('')
  }

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <BackButton onClick={onBack} label="Zu den Nachrichten" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 30, color: C.ink, margin: '0 0 4px', fontWeight: 400 }}>
            {title}
          </h2>
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>{subtitle}</p>
        </div>
      </div>

      <div style={{
        margin: '22px 0 16px', padding: '16px 14px', borderRadius: 20,
        background: C.card, border: `1px solid ${C.border}`,
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <div style={{ textAlign: 'center', fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: '0.08em' }}>
          HEUTE
        </div>
        {messages.map(message => (
          <div key={message.id} style={{
            display: 'flex', gap: 9, alignItems: 'flex-end',
            flexDirection: message.isMe ? 'row-reverse' : 'row',
          }}>
            {!message.isMe && <AvatarLabel initials={message.initials} color={message.color} size={30} />}
            <div style={{ maxWidth: '76%', textAlign: message.isMe ? 'right' : 'left' }}>
              {!message.isMe && (
                <div style={{ fontSize: 10.5, color: C.muted, margin: '0 0 4px 4px', fontWeight: 600 }}>
                  {message.author}
                </div>
              )}
              <div style={{
                padding: '10px 12px', borderRadius: message.isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: message.isMe ? C.lavender : C.subtle,
                color: message.isMe ? '#fff' : C.ink,
                fontSize: 13, lineHeight: 1.5, textAlign: 'left',
              }}>
                {message.text}
              </div>
              <div style={{ fontSize: 9.5, color: C.muted, marginTop: 3 }}>{message.time}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '7px 7px 7px 14px',
        borderRadius: 18, background: C.card, border: `1px solid ${C.border}`,
      }}>
        <input
          value={draft}
          onChange={event => setDraft(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter') sendMessage()
          }}
          aria-label="Nachricht schreiben"
          placeholder={placeholder}
          style={{
            flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: "'Outfit', sans-serif", fontSize: 13, color: C.ink,
          }}
        />
        <button onClick={sendMessage} disabled={!draft.trim()} aria-label="Nachricht senden" style={{
          width: 38, height: 38, borderRadius: 13, border: 'none',
          background: draft.trim() ? C.lavender : C.subtle,
          color: draft.trim() ? '#fff' : '#AAB0AA',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: draft.trim() ? 'pointer' : 'default', fontSize: 18,
        }}>
          ↑
        </button>
      </div>
    </div>
  )
}

function KalenderTab({ accountType, onRateMeeting, meetingFeedback }: {
  accountType: AccountType
  onRateMeeting: (step: number) => void
  meetingFeedback: Record<number, MeetingFeedback>
}) {
  const nextIdx = PROGRAM_STEPS.findIndex(s => !s.done)

  return (
    <div>
      <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 30, color: C.ink, margin: '0 0 4px', fontWeight: 400 }}>Season</h2>
      <p style={{ fontSize: 14, color: C.muted, margin: '0 0 24px' }}>Season 1 · 6 Schritte · Oktober – März</p>

      {/* Format legend */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[['🤝', 'In-person'], ['💻', 'Online'], ['🚶', 'Walk-Call']].map(([icon, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: C.subtle, borderRadius: 100, fontSize: 12, color: C.muted, fontWeight: 500 }}>
            <span>{icon}</span><span>{label}</span>
          </div>
        ))}
      </div>

      {/* Steps */}
      <div style={{ position: 'relative' }}>
        {/* Vertical connector line */}
        <div style={{
          position: 'absolute', left: 27, top: 28, bottom: 28,
          width: 2, background: C.border, zIndex: 0,
        }} />

        {PROGRAM_STEPS.map((s, i) => {
          const isNext = i === nextIdx
          const isPast = s.done

          return (
            <div key={s.step} style={{ display: 'flex', gap: 16, marginBottom: 16, position: 'relative', zIndex: 1 }}>
              {/* Step circle */}
              <div style={{
                width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                background: isPast ? C.teal : isNext ? C.lavender : C.card,
                border: isPast ? 'none' : isNext ? 'none' : `2px solid ${C.border}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                boxShadow: isNext ? '0 4px 16px rgba(125,132,178,0.35)' : 'none',
              }}>
                {isPast ? (
                  <span style={{ fontSize: 22, color: '#fff' }}>✓</span>
                ) : (
                  <>
                    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', color: isNext ? 'rgba(255,255,255,0.8)' : '#999' }}>W{s.week}</div>
                    <div style={{ fontSize: 18, lineHeight: 1 }}>{s.emoji}</div>
                  </>
                )}
              </div>

              {/* Content */}
              <div style={{
                flex: 1, background: isPast ? '#F8FBEE' : isNext ? C.card : C.subtle,
                borderRadius: 16, padding: '14px 16px',
                border: isPast ? `1px solid #E4EEC4` : isNext ? `1px solid ${C.border}` : 'none',
                opacity: !isPast && !isNext ? 0.65 : 1,
                boxShadow: isNext ? '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)' : 'none',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, letterSpacing: '-0.01em' }}>
                    Schritt {s.step} · {s.type}
                  </div>
                  {isNext && (
                    <div style={{ fontSize: 10, color: C.lavender, fontWeight: 800, background: '#EEF1FF', padding: '3px 8px', borderRadius: 100, whiteSpace: 'nowrap', marginLeft: 8 }}>
                      Nächstes
                    </div>
                  )}
                  {isPast && (
                    <div style={{ fontSize: 10, color: C.teal, fontWeight: 800, background: '#EBF5F0', padding: '3px 8px', borderRadius: 100, whiteSpace: 'nowrap', marginLeft: 8 }}>
                      Erledigt
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: isPast || isNext ? 6 : 0 }}>
                  {s.date} · {s.time} Uhr
                </div>
                {(isPast || isNext) && (
                  <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>
                    📍 {accountType === 'private' && s.location === 'Lumio-Campus Sportanlage' ? 'Tempelhofer Feld' : s.location}
                  </div>
                )}
                {isPast && (
                  meetingFeedback[s.step] ? (
                    <div style={{
                      marginTop: 10, fontSize: 12, color: C.teal, fontWeight: 700,
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                      ✓ Mit {meetingFeedback[s.step].rating}/5 bewertet
                    </div>
                  ) : (
                    <button onClick={() => onRateMeeting(s.step)} style={{
                      marginTop: 10, padding: '7px 12px', borderRadius: 10,
                      background: '#EEF1FF', color: C.lavender,
                      border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                      fontFamily: "'Outfit', sans-serif",
                    }}>
                      Treffen bewerten
                    </button>
                  )
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Season-End note */}
      <div style={{ padding: '16px 18px', background: '#EEF1FF', borderRadius: 14, border: `1px solid #D8DCEE`, marginTop: 8 }}>
        <div style={{ fontSize: 12, color: C.lavender, fontWeight: 700, marginBottom: 4 }}>Nach Schritt 6 · Monat 6</div>
        <div style={{ fontSize: 13, color: '#555', lineHeight: 1.65 }}>
          Season 1 endet automatisch am 31. März. Du entscheidest dann, ob du weitermachst — mit deinem QUAIN oder in einem neuen.
        </div>
      </div>
    </div>
  )
}

function ProfilTab({
  privateProfile, profileDetails, profileLocation, profilePhoto, proInterests, leisureInterests,
  onProfileChange, onDetailsChange, onLocationChange, onProChange, onLeisureChange,
  onPhotoChange,
}: {
  accountType: AccountType
  privateProfile: PrivateProfile
  profileDetails: ProfileDetails
  profileLocation: string
  profilePhoto: string | null
  proInterests: string[]
  leisureInterests: string[]
  onProfileChange: (profile: PrivateProfile) => void
  onDetailsChange: (details: ProfileDetails) => void
  onLocationChange: (location: string) => void
  onProChange: (interests: string[]) => void
  onLeisureChange: (interests: string[]) => void
  onPhotoChange: (photo: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftProfile, setDraftProfile] = useState(privateProfile)
  const [draftDetails, setDraftDetails] = useState(profileDetails)
  const [draftLocation, setDraftLocation] = useState(profileLocation)
  const [draftPro, setDraftPro] = useState(proInterests)
  const [draftLeisure, setDraftLeisure] = useState(leisureInterests)
  const fullName = `${privateProfile.firstName} ${privateProfile.lastName}`
  const initials = `${privateProfile.firstName.charAt(0)}${privateProfile.lastName.charAt(0)}`.toUpperCase()
  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '12px 14px',
    borderRadius: 13, border: `1px solid ${C.border}`, outlineColor: C.lavender,
    background: C.bg, color: C.ink, fontFamily: "'Outfit', sans-serif", fontSize: 13,
  }
  const startEditing = () => {
    setDraftProfile(privateProfile)
    setDraftDetails(profileDetails)
    setDraftLocation(locationLabelFromSetup(profileLocation))
    setDraftPro(proInterests)
    setDraftLeisure(leisureInterests)
    setIsEditing(true)
  }
  const toggleDraftInterest = (
    item: string,
    selected: string[],
    setter: (value: string[]) => void
  ) => {
    setter(selected.includes(item)
      ? selected.filter(value => value !== item)
      : selected.length < 5 ? [...selected, item] : selected)
  }
  const canSave =
    draftProfile.firstName.trim() && draftProfile.lastName.trim() && draftProfile.email.trim() &&
    draftDetails.role.trim() && draftDetails.age.trim() && draftDetails.focus.trim() &&
    draftDetails.intro.trim().length >= 20 && draftLocation.trim() &&
    draftPro.length >= 3 && draftLeisure.length >= 3
  const saveProfile = () => {
    if (!canSave) return
    onProfileChange({ ...draftProfile, role: draftDetails.role })
    onDetailsChange(draftDetails)
    onLocationChange(draftLocation)
    onProChange(draftPro)
    onLeisureChange(draftLeisure)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 30, color: C.ink, margin: 0, fontWeight: 400 }}>
            Profil bearbeiten
          </h2>
          <button onClick={() => setIsEditing(false)} style={{
            border: 'none', background: 'transparent', color: C.lavender,
            fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>
            Abbrechen
          </button>
        </div>

        <Card style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
          <ProfilePhotoPicker photo={profilePhoto} initials={initials} onChange={onPhotoChange} size={68} />
          <div>
            <div style={{ color: C.ink, fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Profilfoto</div>
            <div style={{ color: C.muted, fontSize: 11.5, lineHeight: 1.45 }}>
              Tippe auf das Bild, um ein Foto hinzuzufügen oder zu ändern.
            </div>
          </div>
        </Card>

        <Card style={{ marginBottom: 12 }}>
          <Label>Persönliche Angaben</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 9 }}>
            <input value={draftProfile.firstName} onChange={event => setDraftProfile(current => ({ ...current, firstName: event.target.value }))} aria-label="Vorname" placeholder="Vorname" style={inputStyle} />
            <input value={draftProfile.lastName} onChange={event => setDraftProfile(current => ({ ...current, lastName: event.target.value }))} aria-label="Nachname" placeholder="Nachname" style={inputStyle} />
          </div>
          <input value={draftProfile.email} onChange={event => setDraftProfile(current => ({ ...current, email: event.target.value }))} type="email" aria-label="E-Mail" placeholder="E-Mail" style={{ ...inputStyle, marginBottom: 9 }} />
          <input value={draftDetails.age} onChange={event => setDraftDetails(current => ({ ...current, age: event.target.value }))} type="number" min={18} max={99} aria-label="Alter" placeholder="Alter" style={inputStyle} />
        </Card>

        <Card style={{ marginBottom: 12 }}>
          <Label>Berufliches Profil</Label>
          <input value={draftDetails.role} onChange={event => setDraftDetails(current => ({ ...current, role: event.target.value }))} aria-label="Berufstitel" placeholder="Berufstitel" style={{ ...inputStyle, marginBottom: 9 }} />
          <input value={draftDetails.focus} onChange={event => setDraftDetails(current => ({ ...current, focus: event.target.value }))} aria-label="Beruflicher Schwerpunkt" placeholder="Beruflicher Schwerpunkt" style={inputStyle} />
        </Card>

        <Card style={{ marginBottom: 12 }}>
          <Label>Über mich</Label>
          <textarea
            value={draftDetails.intro}
            onChange={event => setDraftDetails(current => ({ ...current, intro: event.target.value }))}
            rows={4}
            maxLength={280}
            aria-label="Kurzvorstellung"
            placeholder="Kurzvorstellung"
            style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }}
          />
          <div style={{ marginTop: 5, textAlign: 'right', fontSize: 10.5, color: C.muted }}>{draftDetails.intro.length}/280</div>
        </Card>

        <Card style={{ marginBottom: 12 }}>
          <Label>Standort</Label>
          <input value={draftLocation} onChange={event => setDraftLocation(event.target.value)} aria-label="Standort" placeholder="Standort" style={inputStyle} />
        </Card>

        <Card style={{ marginBottom: 12 }}>
          <Label>Berufliche Präferenzen · {draftPro.length}/5</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {[...PRO_INTERESTS, ...draftPro.filter(item => !PRO_INTERESTS.includes(item))].map(item => (
              <Chip key={item} label={item} selected={draftPro.includes(item)} onToggle={() => toggleDraftInterest(item, draftPro, setDraftPro)} />
            ))}
          </div>
        </Card>

        <Card style={{ marginBottom: 18 }}>
          <Label>Private Präferenzen · {draftLeisure.length}/5</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {[...LEISURE_INTERESTS, ...draftLeisure.filter(item => !LEISURE_INTERESTS.includes(item))].map(item => (
              <Chip key={item} label={item} selected={draftLeisure.includes(item)} onToggle={() => toggleDraftInterest(item, draftLeisure, setDraftLeisure)} />
            ))}
          </div>
        </Card>

        <Btn onClick={saveProfile} disabled={!canSave}>Änderungen speichern</Btn>
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 30, color: C.ink, margin: '0 0 28px', fontWeight: 400 }}>Mein Profil</h2>

      <Card style={{ textAlign: 'center', marginBottom: 16, padding: '36px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          <ProfilePhotoPicker photo={profilePhoto} initials={initials} onChange={onPhotoChange} size={82} />
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.ink, marginBottom: 4, letterSpacing: '-0.02em' }}>{fullName}</div>
        <div style={{ fontSize: 14, color: C.muted, marginBottom: 4 }}>
          {profileDetails.role}
        </div>
        <div style={{ fontSize: 13, color: C.teal, fontWeight: 700 }}>
          {profileDetails.focus} · {profileDetails.age} Jahre
        </div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 5 }}>
          {locationLabelFromSetup(profileLocation)} · {privateProfile.email}
        </div>
      </Card>

      <Card style={{ marginBottom: 12 }}>
        <Label>Über mich</Label>
        <p style={{ margin: 0, color: C.muted, fontSize: 13.5, lineHeight: 1.65 }}>
          {profileDetails.intro}
        </p>
      </Card>

      <Card style={{ marginBottom: 12 }}>
        <Label>Berufliche Interessen</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {proInterests.map(i => (
            <Tag key={i} variant="lavender">{i}</Tag>
          ))}
        </div>
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <Label>Freizeit</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {leisureInterests.map(i => (
            <Tag key={i} variant="teal">{i}</Tag>
          ))}
        </div>
      </Card>

      <button onClick={startEditing} style={{
        width: '100%', padding: '15px', background: 'transparent',
        color: '#999', border: `1.5px solid ${C.border}`, borderRadius: 14,
        fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
      }}>
        Profil bearbeiten
      </button>
    </div>
  )
}

function MainBottomNav({ activeTab, onTabChange }: {
  activeTab: Tab | null
  onTabChange: (tab: Tab) => void
}) {
  const tabs: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: 'home', icon: '⌂', label: 'Home' },
    { id: 'chat', icon: <ChatIcon />, label: 'Chat' },
    { id: 'kalender', icon: '◷', label: 'Kalender' },
    { id: 'profil', icon: '◉', label: 'Profil' },
  ]

  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, height: 86, zIndex: 35,
      padding: '7px 12px 11px', boxSizing: 'border-box',
      background: 'linear-gradient(180deg, rgba(243,245,242,0) 0%, rgba(243,245,242,0.96) 28%)',
    }}>
      <nav aria-label="Hauptnavigation" style={{
        height: '100%', display: 'flex', alignItems: 'center',
        padding: '7px 6px', boxSizing: 'border-box',
        borderRadius: 23, background: 'rgba(255,255,255,0.96)',
        border: `1px solid ${C.border}`, boxShadow: '0 9px 30px rgba(34,43,38,0.14)',
        backdropFilter: 'blur(16px)',
      }}>
        {tabs.map(tab => {
          const selected = activeTab === tab.id
          return (
            <button key={tab.id} onClick={() => onTabChange(tab.id)} style={{
              flex: 1, height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 3,
              background: selected ? '#EEF1FF' : 'transparent',
              border: 'none', borderRadius: 16, cursor: 'pointer',
              color: selected ? C.lavender : '#909790',
              fontFamily: "'Outfit', sans-serif", transition: 'all 0.16s ease',
            }}>
              <span style={{ height: 21, display: 'flex', alignItems: 'center', fontSize: 20, lineHeight: 1 }}>
                {tab.icon}
              </span>
              <span style={{ fontSize: 9.5, fontWeight: selected ? 800 : 600, letterSpacing: '0.03em' }}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

function DashboardScreen({
  accountType, privateProfile, profileDetails, profileLocation, proInterests, leisureInterests,
  activeTab, chatOverviewVersion, onTabChange, onBack, onSeasonEnd, onRateMeeting, meetingFeedback,
  onProfileChange, onDetailsChange, onLocationChange, onProChange, onLeisureChange,
  profilePhoto, onPhotoChange,
}: {
  accountType: AccountType
  privateProfile: PrivateProfile
  profileDetails: ProfileDetails
  profileLocation: string
  profilePhoto: string | null
  proInterests: string[]
  leisureInterests: string[]
  activeTab: Tab
  chatOverviewVersion: number
  onTabChange: (t: Tab) => void
  onBack: () => void
  onSeasonEnd: () => void
  onRateMeeting: (step: number) => void
  meetingFeedback: Record<number, MeetingFeedback>
  onProfileChange: (profile: PrivateProfile) => void
  onDetailsChange: (details: ProfileDetails) => void
  onLocationChange: (location: string) => void
  onProChange: (interests: string[]) => void
  onLeisureChange: (interests: string[]) => void
  onPhotoChange: (photo: string) => void
}) {
  const [selectedOneToOne, setSelectedOneToOne] = useState<DiscoveryPerson | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<'quain' | 'one-to-one' | null>(null)
  const [quainMessages, setQuainMessages] = useState<ChatMessage[]>([
    { id: 1, author: 'Laura', initials: 'LB', color: C.wisteria, text: 'Freue mich auf Freitag. Sollen wir vorab schon Themen sammeln?', time: '18:12' },
    { id: 2, author: 'Jonas', initials: 'JW', color: C.lavender, text: 'Gerne. Mich würde interessieren, wie ihr AI aktuell in euren Produkten einsetzt.', time: '18:18' },
    { id: 3, author: 'Du', initials: 'MM', color: HIGHLIGHT, text: 'Gute Idee. Ich bringe ein Beispiel aus unserem letzten Produktprojekt mit.', time: '18:24', isMe: true },
  ])
  const [oneToOneMessages, setOneToOneMessages] = useState<ChatMessage[]>([
    { id: 1, author: 'Anna', initials: 'AM', color: C.teal, text: 'Hi Max, ich freue mich auf unseren Austausch. Wie sieht es bei dir nächste Woche aus?', time: '17:42' },
    { id: 2, author: 'Du', initials: 'MM', color: HIGHLIGHT, text: 'Dienstag oder Donnerstag am Nachmittag würde bei mir gut passen.', time: '17:55', isMe: true },
  ])
  const firstName = accountType === 'company' ? 'Max' : privateProfile.firstName
  const initials = accountType === 'company'
    ? 'MM'
    : `${privateProfile.firstName.charAt(0)}${privateProfile.lastName.charAt(0)}`.toUpperCase()
  const openTab = (tab: Tab) => {
    setSelectedOneToOne(null)
    if (tab === 'chat') setSelectedConversation(null)
    onTabChange(tab)
  }
  const openConversation = (conversation: 'quain' | 'one-to-one') => {
    setSelectedOneToOne(null)
    setSelectedConversation(conversation)
    onTabChange('chat')
  }

  useEffect(() => {
    if (activeTab !== 'chat') setSelectedConversation(null)
  }, [activeTab])

  useEffect(() => {
    setSelectedConversation(null)
  }, [chatOverviewVersion])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F3F5F2' }}>
      {/* Header */}
      <div style={{ background: C.card, padding: '44px 72px 18px 24px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ marginBottom: 6 }}>
          <BackButton onClick={onBack} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', color: C.teal, fontWeight: 800, marginBottom: 2 }}>QUAIN</div>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, color: C.ink, fontWeight: 400 }}>
              Guten Abend, {firstName}.
            </div>
          </div>
          {profilePhoto ? (
            <img src={profilePhoto} alt="Dein Profilfoto" style={{
              width: 42, height: 42, borderRadius: '50%', objectFit: 'cover',
              border: `2px solid ${C.card}`, boxShadow: '0 2px 8px rgba(34,43,38,0.12)',
            }} />
          ) : (
            <AvatarLabel initials={initials} color={HIGHLIGHT} size={42} />
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 12px' }}>
        {selectedOneToOne ? (
          <OneToOneDashboardDetail
            person={selectedOneToOne}
            onBack={() => setSelectedOneToOne(null)}
            onMessage={() => openConversation('one-to-one')}
          />
        ) : activeTab === 'home' ? (
          <HomeTab
            accountType={accountType}
            onOpenSeason={() => openTab('kalender')}
            onOpenQuain={() => openTab('kreis')}
            onOpenOneToOne={setSelectedOneToOne}
          />
        ) : null}
        {!selectedOneToOne && activeTab === 'kreis' && <KreisTab accountType={accountType} onMessage={() => openConversation('quain')} />}
        {!selectedOneToOne && activeTab === 'chat' && (
          selectedConversation === null ? (
            <ChatOverview
              onOpenQuain={() => setSelectedConversation('quain')}
              onOpenOneToOne={() => setSelectedConversation('one-to-one')}
            />
          ) : selectedConversation === 'quain' ? (
            <ChatTab
              title="Product & AI Exchange"
              subtitle="5 Teilnehmer:innen · Season 1"
              placeholder="Nachricht an dein QUAIN"
              messages={quainMessages}
              onBack={() => setSelectedConversation(null)}
              onSend={text => setQuainMessages(current => [
                ...current,
                { id: Date.now(), author: 'Du', initials, color: HIGHLIGHT, text, time: 'Jetzt', isMe: true },
              ])}
            />
          ) : (
            <ChatTab
              title="Anna Müller"
              subtitle="Laufendes 1:1 · Berlin"
              placeholder="Nachricht an Anna"
              messages={oneToOneMessages}
              onBack={() => setSelectedConversation(null)}
              onSend={text => setOneToOneMessages(current => [
                ...current,
                { id: Date.now(), author: 'Du', initials, color: HIGHLIGHT, text, time: 'Jetzt', isMe: true },
              ])}
            />
          )
        )}
        {!selectedOneToOne && activeTab === 'kalender' && <KalenderTab accountType={accountType} onRateMeeting={onRateMeeting} meetingFeedback={meetingFeedback} />}
        {!selectedOneToOne && activeTab === 'profil' && (
          <ProfilTab
            accountType={accountType}
            privateProfile={privateProfile}
            profileDetails={profileDetails}
            profileLocation={profileLocation}
            profilePhoto={profilePhoto}
            proInterests={proInterests}
            leisureInterests={leisureInterests}
            onProfileChange={onProfileChange}
            onDetailsChange={onDetailsChange}
            onLocationChange={onLocationChange}
            onProChange={onProChange}
            onLeisureChange={onLeisureChange}
            onPhotoChange={onPhotoChange}
          />
        )}
      </div>

    </div>
  )
}

// ── Root ────────────────────────────────────────────────────────
export default function App() {
  const [screen,         setScreen        ] = useState<Screen>('welcome')
  const [accountType,    setAccountType   ] = useState<AccountType>('company')
  const [privateProfile, setPrivateProfile] = useState<PrivateProfile>({
    firstName: 'Max',
    lastName: 'Müller',
    email: 'max.mueller@gmail.com',
    role: 'Senior Product Manager',
  })
  const [profileDetails, setProfileDetails] = useState<ProfileDetails>({
    role: 'Senior Product Manager',
    age: '34',
    focus: 'Customer Experience',
    intro: tr('Ich entwickle Produkte aus echten Kundenproblemen und freue mich auf ehrlichen Austausch zu Strategie, Research und guter Zusammenarbeit.'),
  })
  const [proInterests,   setProInterests  ] = useState<string[]>([])
  const [leisureInterests, setLeisureInterests] = useState<string[]>([])
  const [programNeeds, setProgramNeeds] = useState<string[]>([])
  const [programNotes, setProgramNotes] = useState('')
  const [profileLocation, setProfileLocation] = useState('Köln') // Demonstrator: Stadt vorbelegt (Nicolas, 2026-11-12)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [connectionFormat, setConnectionFormat] = useState<ConnectionFormat | null>(null)
  const [seasonInfoReturnScreen, setSeasonInfoReturnScreen] = useState<Screen>('connection-format')
  const [matchProgress,  setMatchProgress ] = useState(0)
  const [activeTab,      setActiveTab     ] = useState<Tab>('home')
  const [chatOverviewVersion, setChatOverviewVersion] = useState(0)
  const [joinedQuainId, setJoinedQuainId] = useState<number | null>(null)
  const [activeMeetingStep, setActiveMeetingStep] = useState<number | null>(null)
  const [meetingFeedback, setMeetingFeedback] = useState<Record<number, MeetingFeedback>>({})
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  useEffect(() => {
    if (screen !== 'matching') return
    setMatchProgress(0)
    const iv = setInterval(() => {
      setMatchProgress(p => {
        if (p >= 100) {
          clearInterval(iv)
          setTimeout(() => setScreen('result'), 600)
          return 100
        }
        return p + 1.4
      })
    }, 30)
    return () => clearInterval(iv)
  }, [screen])

  const togglePro = (item: string) =>
    setProInterests(p => p.includes(item) ? p.filter(x => x !== item) : p.length < 5 ? [...p, item] : p)

  const toggleLeisure = (item: string) =>
    setLeisureInterests(p => p.includes(item) ? p.filter(x => x !== item) : p.length < 5 ? [...p, item] : p)

  const toggleProgramNeed = (item: string) =>
    setProgramNeeds(current =>
      current.includes(item) ? current.filter(value => value !== item) : [...current, item]
    )

  const openMeetingFeedback = (step: number) => {
    setActiveMeetingStep(step)
    setScreen('meeting-rating')
  }

  const randomOneToOnePerson = DISCOVERY_PEOPLE[0]
  const matchedProfessionalPreferences = [
    ...proInterests.filter(item => randomOneToOnePerson.professionalInterests.includes(item)),
    ...randomOneToOnePerson.professionalInterests,
  ].filter((item, index, items) => items.indexOf(item) === index)
  const matchedPersonalPreferences = [
    ...leisureInterests.filter(item => randomOneToOnePerson.personalInterests.includes(item)),
    ...randomOneToOnePerson.personalInterests,
  ].filter((item, index, items) => items.indexOf(item) === index)
  const mainNavVisible = [
    'dashboard',
    'discovery',
    'open-quains',
    'one-to-one',
    'one-to-one-random-match',
  ].includes(screen)

  return (
    <div style={{
      background: '#DCDFE0', height: '100dvh',
      display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '0',
    }}>
      <div className="phone-shell" style={{
        width: '100%', maxWidth: 390,
        background: C.bg, position: 'relative',
        fontFamily: "'Outfit', sans-serif", overflow: 'hidden',
        height: '100%', maxHeight: 844,
        boxShadow: '0 0 60px rgba(0,0,0,0.15)',
        '--highlight-color': accountType === 'company' ? 'rgba(157, 63, 231, 0.8)' : C.lime,
        '--highlight-text-color': accountType === 'company' ? '#FFFFFF' : '#42542F',
        '--highlight-outline-color': accountType === 'company' ? 'transparent' : C.lime,
      } as React.CSSProperties}>
        <div style={{ height: mainNavVisible ? 'calc(100% - 86px)' : '100%' }}>
        {screen === 'welcome'  && <WelcomeScreen onNext={() => setScreen('account-choice')} />}
        {screen === 'account-choice' && (
          <AccountChoiceScreen
            onBack={() => setScreen('welcome')}
            onSelect={type => {
              setAccountType(type)
              setScreen(type === 'company' ? 'profile-details' : 'private-signup-method') // Demonstrator: ein Profilscreen (Nicolas, 2026-11-12)
            }}
          />
        )}
        {screen === 'private-signup-method' && (
          <PrivateSignupMethodScreen
            onBack={() => setScreen('account-choice')}
            onGoogle={() => {
              setPrivateProfile({
                firstName: 'Max',
                lastName: 'Müller',
                email: 'max.mueller@gmail.com',
                role: 'Senior Product Manager',
              })
              setProfileDetails(current => ({ ...current, role: 'Senior Product Manager' }))
              setScreen('registration-success')
            }}
            onEmail={() => setScreen('private-email-registration')}
          />
        )}
        {screen === 'private-email-registration' && (
          <PrivateEmailRegistrationScreen
            onBack={() => setScreen('private-signup-method')}
            onSubmit={profile => {
              setPrivateProfile(profile)
              setProfileDetails(current => ({ ...current, role: profile.role }))
              setScreen('registration-success')
            }}
          />
        )}
        {screen === 'registration-success' && (
          <RegistrationSuccessScreen
            email={privateProfile.email}
            onNext={() => setScreen('profile-details')}
          />
        )}
        {screen === 'profile'  && (
          <ProfileScreen
            accountType={accountType}
            privateProfile={privateProfile}
            onBack={() => setScreen(accountType === 'company' ? 'account-choice' : 'registration-success')}
            onNext={() => setScreen('profile-details')}
          />
        )}
        {screen === 'profile-details' && (
          <ProfileDetailsScreen
            accountType={accountType}
            value={profileDetails}
            onChange={setProfileDetails}
            onBack={() => setScreen(accountType === 'company' ? 'account-choice' : 'registration-success')}
            onNext={() => setScreen('location')}
          />
        )}
        {screen === 'location' && (
          <LocationScreen
            value={profileLocation}
            onChange={setProfileLocation}
            onBack={() => setScreen('profile-details')}
            onNext={() => setScreen('pro')}
          />
        )}
        {screen === 'pro'      && (
          <InterestsScreen
            step={5} title="Was bewegt dich beruflich?" subtitle="Wähle 3 bis 5 Themen"
            items={PRO_INTERESTS} selected={proInterests}
            onToggle={togglePro}
            onBack={() => setScreen('location')}
            onNext={() => setScreen('leisure')}
          />
        )}
        {screen === 'leisure'  && (
          <InterestsScreen
            step={6} title="Was machst du nach Feierabend?" subtitle="Wähle 3 bis 5 Interessen"
            items={LEISURE_INTERESTS} selected={leisureInterests}
            onToggle={toggleLeisure}
            onBack={() => setScreen('pro')}
            onNext={() => setScreen('needs')}
          />
        )}
        {screen === 'needs' && (
          <ProgramNeedsScreen
            selected={programNeeds}
            onToggle={toggleProgramNeed}
            note={programNotes}
            onNoteChange={setProgramNotes}
            onBack={() => setScreen('leisure')}
            onNext={() => setScreen('review')}
          />
        )}
        {screen === 'review'   && (
          <ReviewScreen
            accountType={accountType}
            privateProfile={privateProfile}
            profileDetails={profileDetails}
            proInterests={proInterests} leisureInterests={leisureInterests}
            programNeeds={programNeeds}
            programNotes={programNotes}
            profileLocation={profileLocation}
            onBack={() => setScreen('needs')}
            onNext={() => setScreen('connection-format')}
          />
        )}
        {screen === 'connection-format' && (
          <ConnectionFormatScreen
            accountType={accountType}
            onBack={() => setScreen('review')}
            onSeasonInfo={() => {
              setSeasonInfoReturnScreen('connection-format')
              setScreen('season-info')
            }}
            onSelect={format => {
              setConnectionFormat(format)
              setScreen('discovery')
            }}
          />
        )}
        {screen === 'season-info' && (
          <SeasonInfoScreen onBack={() => setScreen(seasonInfoReturnScreen)} />
        )}
        {screen === 'discovery' && connectionFormat && (
          <DiscoveryScreen
            accountType={accountType}
            format={connectionFormat}
            onBack={() => setScreen('connection-format')}
            onBrowseQuains={() => setScreen('open-quains')}
            onRandomize={() => setScreen('matching')}
            onOneToOne={() => setScreen('one-to-one')}
            onRandomOneToOne={() => setScreen('one-to-one-random-match')}
          />
        )}
        {screen === 'open-quains' && (
          <OpenQuainsScreen
            accountType={accountType}
            joinedQuainId={joinedQuainId}
            onJoin={setJoinedQuainId}
            onLeave={() => setJoinedQuainId(null)}
            onBack={() => setScreen('discovery')}
          />
        )}
        {screen === 'one-to-one' && (
          <OneToOneExperience
            accountType={accountType}
            setupLocation={profileLocation}
            onBack={() => setScreen('discovery')}
            onHome={() => {
              setActiveTab('home')
              setScreen('dashboard')
            }}
          />
        )}
        {screen === 'one-to-one-random-match' && (
          <RandomOneToOneMatchScreen
            accountType={accountType}
            person={randomOneToOnePerson}
            matchedProfessional={matchedProfessionalPreferences}
            matchedPersonal={matchedPersonalPreferences}
            onBack={() => setScreen('discovery')}
            onHome={() => {
              setActiveTab('home')
              setScreen('dashboard')
            }}
          />
        )}
        {screen === 'matching' && (
          <MatchingScreen progress={matchProgress} onBack={() => setScreen('discovery')} />
        )}
        {screen === 'result'   && (
          <MatchResultScreen
            accountType={accountType}
            onBack={() => setScreen('discovery')}
            onStart={() => setScreen('dashboard')}
          />
        )}
        {screen === 'dashboard'&& (
          <DashboardScreen
            accountType={accountType}
            privateProfile={privateProfile}
            profileDetails={profileDetails}
            profileLocation={profileLocation}
            profilePhoto={profilePhoto}
            proInterests={proInterests}
            leisureInterests={leisureInterests}
            activeTab={activeTab}
            chatOverviewVersion={chatOverviewVersion}
            onTabChange={setActiveTab}
            onBack={() => setScreen(connectionFormat === 'quain' ? 'result' : 'discovery')}
            onSeasonEnd={() => setScreen('season-end')}
            onRateMeeting={openMeetingFeedback}
            meetingFeedback={meetingFeedback}
            onProfileChange={setPrivateProfile}
            onDetailsChange={setProfileDetails}
            onLocationChange={setProfileLocation}
            onProChange={setProInterests}
            onLeisureChange={setLeisureInterests}
            onPhotoChange={setProfilePhoto}
          />
        )}
        {screen === 'meeting-rating' && activeMeetingStep !== null && (
          <MeetingFeedbackScreen
            key={activeMeetingStep}
            step={PROGRAM_STEPS[activeMeetingStep - 1]}
            onSubmit={feedback => setMeetingFeedback(current => ({
              ...current,
              [activeMeetingStep]: feedback,
            }))}
            onBack={() => setScreen('dashboard')}
          />
        )}
        {screen === 'season-end' && (
          <SeasonEndScreen onChoice={(c) => {
            if (c === 'stop') setScreen('dashboard')
            else setScreen('rating')
          }} />
        )}
        {screen === 'rating' && <RatingScreen onDone={() => setScreen('dashboard')} />}
        </div>
        {mainNavVisible && (
          <MainBottomNav
            activeTab={screen === 'dashboard' ? activeTab : null}
            onTabChange={tab => {
              setNotificationsOpen(false)
              if (tab === 'chat') setChatOverviewVersion(version => version + 1)
              setActiveTab(tab)
              setScreen('dashboard')
            }}
          />
        )}
        {(screen === 'registration-success' || screen === 'season-end' || screen === 'rating') && (
          <div style={{ position: 'absolute', top: 48, left: 20, zIndex: 30 }}>
            <BackButton onClick={() => {
              if (screen === 'registration-success') setScreen('private-signup-method')
              if (screen === 'season-end') setScreen('dashboard')
              if (screen === 'rating') setScreen('season-end')
            }} />
          </div>
        )}
        <NotificationBell onClick={() => setNotificationsOpen(true)} />
        {notificationsOpen && <NotificationPanel onClose={() => setNotificationsOpen(false)} />}
      </div>
    </div>
  )
}
