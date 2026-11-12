"""Übernimmt das Pitch-Deck aus dem Projekt-Repo DL_11 in die Web-Version.

Quelle der Wahrheit bleibt DL_11/pitch-deck/src/deck.html (bzw. deck.en.html). Dieses Skript
- behält nur die öffentlichen Folien (Cover bis „Zwei Zukünfte“ und den Quellen-Anhang),
- ersetzt das Präsentations-Skript durch einen Viewer (Blättern am Desktop, Scrollen am Handy),
- kopiert die benötigten Schriften und Screenshots nach public/pitch/assets/,
- erzeugt das PDF public/pitch/quain-pitch-<lang>.pdf (braucht Playwright + Google Chrome).

Aufruf:
  python3 scripts/import_pitch.py --deck ../DL_11/pitch-deck/src/deck.html --lang de
  python3 scripts/import_pitch.py --deck ../DL_11/pitch-deck/src/deck.en.html --lang en
"""
import argparse
import pathlib
import re
import shutil

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'pitch'

# Öffentliche Folien (ids aus deck.html); weggelassen: Danke, fiktive Interviews, Backups, Selbsttest
KEEP = ['s0', 's1', 's2', 'why', 's3', 's4', 's6', 's8', 's5', 'rel', 'risks', 'refs']

VIEWER = r"""
<style>
@media screen{
  html,body{height:100%}
  body{margin:0;padding:0;gap:0;height:100%;overflow:hidden;background:#1b1d22;scroll-snap-type:none;
       display:flex;align-items:center;justify-content:center}
  .slide{display:none;zoom:var(--z,.5);box-shadow:0 20px 60px rgba(0,0,0,.35);flex:none}
  .slide.on{display:block}
  .pnav{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);display:flex;align-items:center;gap:6px;
        padding:5px;border-radius:999px;background:rgba(255,255,255,.1);backdrop-filter:blur(8px);z-index:5}
  .pnav button{width:38px;height:38px;border:0;border-radius:50%;background:rgba(255,255,255,.14);color:#fff;
        font:400 20px/1 "Outfit",sans-serif;cursor:pointer}
  .pnav button:hover{background:rgba(255,255,255,.26)}
  .pnav button:disabled{opacity:.35;cursor:default}
  .pnav span{min-width:64px;text-align:center;color:rgba(255,255,255,.85);font:400 14px/1 "Outfit",sans-serif;letter-spacing:.06em}
  html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
  .imgs{display:none}
  body.stack{display:block;overflow-y:auto;padding:10px 10px 24px;scroll-snap-type:none}
  body.stack .slide{display:none !important}
  body.stack .imgs{display:block}
  .imgs img{display:block;width:100%;height:auto;margin:0 0 10px;border-radius:4px;box-shadow:0 6px 20px rgba(0,0,0,.3);background:#fff}
  body.stack .pnav{display:none}
}
@media print{.pnav,.imgs{display:none !important}}
</style>
<div class="pnav" aria-label="Navigation">
  <button type="button" data-d="-1" aria-label="Zurück">‹</button>
  <span aria-live="polite"></span>
  <button type="button" data-d="1" aria-label="Weiter">›</button>
</div>
<script>
(function(){
  const slides=[...document.querySelectorAll('.slide')];
  const nav=document.querySelector('.pnav'), label=nav.querySelector('span');
  const [prev,next]=nav.querySelectorAll('button');
  let i=0;
  const show=n=>{i=Math.max(0,Math.min(slides.length-1,n));slides.forEach((s,k)=>s.classList.toggle('on',k===i));
    label.textContent=(i+1)+' / '+slides.length;prev.disabled=i===0;next.disabled=i===slides.length-1;};
  const fit=()=>{const W=innerWidth,H=innerHeight;
    const stack=W<760||H>W*1.05;document.body.classList.toggle('stack',stack);
    document.documentElement.style.setProperty('--z',Math.min((W-48)/1920,(H-84)/1080));
    document.documentElement.style.setProperty('--zs',(W-20)/1920);};
  fit();addEventListener('resize',fit);show(0);
  nav.addEventListener('click',e=>{const b=e.target.closest('button');if(b)show(i+Number(b.dataset.d));});
  addEventListener('keydown',e=>{
    if(['ArrowRight','ArrowDown','PageDown',' '].includes(e.key)){e.preventDefault();show(i+1)}
    if(['ArrowLeft','ArrowUp','PageUp'].includes(e.key)){e.preventDefault();show(i-1)}
    if(e.key==='Home')show(0); if(e.key==='End')show(slides.length-1);
  });
  document.body.addEventListener('click',e=>{if(document.body.classList.contains('stack')||e.target.closest('.pnav,a'))return;
    show(i+(e.clientX>innerWidth/3?1:-1));});
  let x0=null;addEventListener('touchstart',e=>{x0=e.touches[0].clientX},{passive:true});
  addEventListener('touchend',e=>{if(x0===null||document.body.classList.contains('stack'))return;const dx=e.changedTouches[0].clientX-x0;
    if(Math.abs(dx)>40)show(i+(dx<0?1:-1));x0=null});
})();
</script>
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--deck', required=True)
    ap.add_argument('--lang', choices=['de', 'en'], required=True)
    ap.add_argument('--no-pdf', action='store_true')
    a = ap.parse_args()

    deck = pathlib.Path(a.deck).resolve()
    html = deck.read_text()

    # Folien filtern
    sections = list(re.finditer(r'<section class="slide[^"]*" id="([^"]+)".*?</section>\s*', html, re.S))
    ids = [m.group(1) for m in sections]
    missing = [k for k in KEEP if k not in ids]
    if missing:
        raise SystemExit(f'Folien fehlen im Deck: {missing}')
    first, last = sections[0].start(), sections[-1].end()
    by_id = {m.group(1): m.group(0) for m in sections}
    body = ''.join(by_id[k] for k in KEEP)
    html = html[:first] + body + html[last:]

    # Kommentare und altes Präsentations-Skript entfernen, Viewer einsetzen
    html = re.sub(r'<!--.*?-->', '', html, flags=re.S)
    html = re.sub(r'<script>.*?</script>', '', html, flags=re.S)
    imgs = '<div class="imgs">' + ''.join(
        f'<img src="slides/slide-{i:02d}.jpg" alt="Folie {i + 1}" loading="{"eager" if i < 2 else "lazy"}" width="1600" height="900">'
        for i in range(len(KEEP))) + '</div>'
    html = html.replace('</body>', imgs + VIEWER + '\n</body>')
    html = html.replace('<meta charset="utf-8">',
                        '<meta charset="utf-8">\n<meta name="robots" content="noindex, nofollow">', 1)

    # Screenshots aus der Web-Version (scripts/capture_screens.py): Initialen statt Fotos, Sprache passend
    html = html.replace('../assets/screenshots/', f'../assets/screenshots-{a.lang}/')
    shots = sorted(set(re.findall(r'\.\./assets/screenshots-[a-z]+/([^)"\'\s]+)', html)))
    missing_shots = [f for f in shots if not (OUT / 'assets' / f'screenshots-{a.lang}' / f).exists()]
    if missing_shots:
        raise SystemExit(f'Erst scripts/capture_screens.py ausführen, es fehlen: {missing_shots}')

    # Assets kopieren (Pfade bleiben ../assets/… relativ zu public/pitch/<lang>/)
    src_assets = deck.parent.parent / 'assets'
    used = sorted(set(r for r in re.findall(r'\.\./assets/([^)"\'\s]+)', html) if not r.startswith('screenshots-')))
    for rel in used:
        target = OUT / 'assets' / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src_assets / rel, target)
    for lic in ('OFL-InstrumentSerif.txt', 'OFL-Outfit.txt'):
        if (src_assets / 'fonts' / lic).exists():
            shutil.copy2(src_assets / 'fonts' / lic, OUT / 'assets' / 'fonts' / lic)

    out_dir = OUT / a.lang
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / 'index.html').write_text(html)
    print(f'{a.lang}: {len(KEEP)} Folien, {len(used)} Assets -> {out_dir / "index.html"}')

    if not a.no_pdf:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            browser = p.chromium.launch(channel='chrome', headless=True)
            page = browser.new_page(viewport={'width': 1920, 'height': 1080})
            page.goto((out_dir / 'index.html').as_uri(), wait_until='networkidle')
            page.evaluate('document.fonts.ready')
            page.wait_for_timeout(400)
            # Folienbilder für Handys (ein Bild je Folie, 1600 × 900, JPEG)
            sdir = out_dir / 'slides'
            sdir.mkdir(exist_ok=True)
            shot = browser.new_page(viewport={'width': 1920, 'height': 1080}, device_scale_factor=1600 / 1920)
            shot.goto((out_dir / 'index.html').as_uri(), wait_until='networkidle')
            shot.evaluate('document.fonts.ready')
            shot.add_style_tag(content='body{display:block!important;overflow:visible!important;height:auto!important}'
                               '.slide{display:block!important;zoom:1!important;box-shadow:none!important}.pnav,.imgs{display:none!important}')
            shot.wait_for_timeout(300)
            for i, el in enumerate(shot.query_selector_all('.slide')):
                el.screenshot(path=str(sdir / f'slide-{i:02d}.jpg'), type='jpeg', quality=84)
            shot.close()
            page.emulate_media(media='print')
            pdf = OUT / f'quain-pitch-{a.lang}.pdf'
            page.pdf(path=str(pdf), prefer_css_page_size=True, print_background=True)
            browser.close()
        print('PDF:', pdf)


if __name__ == '__main__':
    main()
