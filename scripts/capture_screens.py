"""Nimmt die Prototyp-Screens für den Pitch aus der Web-Version auf (Deutsch und Englisch).

Anders als die Originalaufnahmen in DL_11 (Figma-Site, mit Unsplash-Fotos) zeigen diese Screens
den öffentlichen Stand: Initialen statt Fotos, Lumio, Online-Challenge, kein Pausieren.

Voraussetzung: laufender Dev-Server (npx vite --port 5174), Playwright + Google Chrome.
Aufruf:  python3 scripts/capture_screens.py [--base http://localhost:5174/quain/]
Ergebnis: public/pitch/assets/screenshots-<lang>/b2c_*.png (390 × 844, Retina-Faktor 3)
"""
import argparse
import pathlib

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent

L = {
    'de': dict(signin='Anmelden', private='Privates Konto erstellen', google='Mit Google registrieren',
               cont='Weiter', finish='Setup abschließen', looking='Was suchst du', city='z. B. Berlin, Hamburg oder Köln',
               topics='3 bis 5 Themen', interests='3 bis 5 Interessen', needs='Was sollten wir beachten',
               review='Alles stimmt so', pro=['Product Strategy', 'OKRs & Metrics', 'User Research'],
               leisure=['Laufen', 'Specialty Coffee', 'Kochen'], needitems=['Vegetarische Ernährung', 'Keine langen Laufstrecken'],
               quain='QUAIN wählen', random='QUAIN zufällig finden', start='Season 1 starten', home='Home',
               one='1:1 wählen', onerandom='1:1 zufällig finden', ongoing='LAUFENDE SEASON'),
    'en': dict(signin='Sign in', private='Create a personal account', google='Sign up with Google',
               cont='Continue', finish='Complete setup', looking='What are you looking for', city='e.g. Berlin, Hamburg or Cologne',
               topics='Choose 3 to 5 topics', interests='Choose 3 to 5 interests', needs='What should we keep in mind',
               review='All correct', pro=['Product Strategy', 'OKRs & Metrics', 'User Research'],
               leisure=['Running', 'Specialty Coffee', 'Cooking'], needitems=['Vegetarian diet', 'No long walking distances'],
               quain='Choose QUAIN', random='Find a QUAIN at random', start='Start Season 1', home='Home',
               one='Choose 1:1', onerandom='Find a 1:1 at random', ongoing='ONGOING SEASON'),
}

# Screen „Season-Ende“ ist im Prototyp nicht verlinkt; Zustand wie in DL_11/capture_screens_b2c.py setzen.
TO_SEASON_END = r"""
() => {
  const el = document.getElementById('root');
  const key = Object.keys(el).find(k => k.startsWith('__reactContainer'));
  const stack = [el[key]]; let n = 0;
  while (stack.length) {
    const f = stack.pop(); if (!f) continue;
    let h = f.memoizedState;
    while (h && typeof h === 'object' && 'queue' in h) {
      if (h.memoizedState === 'dashboard' && h.queue && h.queue.dispatch) { h.queue.dispatch('season-end'); n++; }
      h = h.next;
    }
    if (f.child) stack.push(f.child); if (f.sibling) stack.push(f.sibling);
  }
  return n;
}
"""


def run(browser, base, lang):
    t = L[lang]
    out = ROOT / 'public' / 'pitch' / 'assets' / f'screenshots-{lang}'
    out.mkdir(parents=True, exist_ok=True)
    url = f'{base}app.html?lang={lang}&mode=frame'

    def shot(pg, name, wait=900):
        pg.wait_for_timeout(wait)
        pg.screenshot(path=str(out / f'b2c_{name}.png'))
        print(lang, 'ok', name)

    def onboard(pg, on_needs=None, on_review=None):
        click = lambda s: pg.get_by_text(s, exact=True).first.click()
        pg.goto(url, wait_until='networkidle'); pg.wait_for_timeout(1200)
        click(t['signin']); pg.wait_for_timeout(500)
        click(t['private']); pg.wait_for_timeout(500)
        click(t['google']); pg.wait_for_timeout(900)
        click(t['cont']); pg.wait_for_timeout(900)
        for _ in range(12):
            txt = pg.inner_text('body')
            if t['looking'] in txt:
                return
            ph = pg.get_by_placeholder(t['city'])
            if ph.count():
                ph.fill('Berlin')
            if t['topics'] in txt:
                for s in t['pro']: click(s)
            if t['interests'] in txt:
                for s in t['leisure']: click(s)
            if on_needs and t['needs'] in txt:
                on_needs(pg); on_needs = None
            if on_review and t['review'] in txt:
                on_review(pg); on_review = None
            for lab in (t['finish'], t['cont']):
                loc = pg.get_by_role('button', name=lab)
                if loc.count() and loc.first.is_enabled():
                    loc.first.click(); break
            pg.wait_for_timeout(900)

    def needs(pg):
        for s in t['needitems']:
            pg.get_by_text(s, exact=True).first.click()
        pg.mouse.click(5, 5)

    ctx = lambda: browser.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=3).new_page()

    pg = ctx()
    onboard(pg, on_needs=needs, on_review=lambda p: shot(p, '06_zusammenfassung'))
    shot(pg, '07_was-suchst-du')
    pg.get_by_text(t['quain']).first.click(); pg.wait_for_timeout(900)
    pg.get_by_text(t['random']).first.click()
    shot(pg, '09_match', wait=6000)
    pg.get_by_text(t['start']).first.click()
    pg.wait_for_timeout(1500)
    pg.get_by_text(t['ongoing']).first.click()
    shot(pg, '11_season', wait=1500)
    pg.get_by_text(t['home'], exact=True).first.click(); pg.wait_for_timeout(900)
    pg.evaluate(TO_SEASON_END)
    shot(pg, '14_wie-geht-es-weiter', wait=1500)
    pg.context.close()

    pg = ctx()
    onboard(pg)
    pg.get_by_text(t['one']).first.click(); pg.wait_for_timeout(900)
    pg.get_by_text(t['onerandom']).first.click()
    shot(pg, '13_1zu1-match', wait=6000)
    pg.context.close()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--base', default='http://localhost:5174/quain/')
    ap.add_argument('--lang', choices=['de', 'en', 'both'], default='both')
    a = ap.parse_args()
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='chrome', headless=True)
        for lang in (['de', 'en'] if a.lang == 'both' else [a.lang]):
            run(browser, a.base, lang)
        browser.close()


if __name__ == '__main__':
    main()
