import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { startTranslation, type Lang } from './i18n/runtime'
import './index.css'

// Parameter aus der Case-Study-Seite: ?lang=de|en&mode=frame|device
const params = new URLSearchParams(location.search)
const lang: Lang = params.get('lang') === 'en' ? 'en' : 'de'
if (params.get('mode') === 'device') document.documentElement.classList.add('device')

const root = document.getElementById('root')!
startTranslation(lang, root)

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
