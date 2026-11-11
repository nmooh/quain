"""Sammelt alle sichtbaren deutschen Texte aus src/App.tsx (JSX-Text und String-Literale).
Ausgabe: JSON-Liste, sortiert nach Vorkommen. Hilft, src/i18n/en.json vollständig zu halten."""
import json, re, sys, pathlib
src = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'src/App.tsx').read_text()
found = {}
def add(t):
    t = re.sub(r'\s+', ' ', t).strip()
    if len(t) < 2 or not re.search(r'[A-Za-zÄÖÜäöüß]{2}', t): return
    if re.fullmatch(r'[a-z][a-zA-Z0-9]*', t) and not re.search(r'[äöüß]', t): return  # identifiers
    if re.search(r'^(#|rgba?\(|var\(|linear-|radial-|https?:|\d+px|calc\()', t): return
    found[t] = found.get(t, 0) + 1
# JSX text
for m in re.finditer(r'>([^<>{}]*[A-Za-zÄÖÜäöüß][^<>{}]*)<', src):
    add(m.group(1))
for m in re.finditer(r'>([^<>{}]*[A-Za-zÄÖÜäöüß][^<>{}]*)\{', src):
    add(m.group(1))
for m in re.finditer(r'\}([^<>{}]*[A-Za-zÄÖÜäöüß][^<>{}]*)<', src):
    add(m.group(1))
# string literals
for m in re.finditer(r"'((?:[^'\\\n]|\\.)*)'|\"((?:[^\"\\\n]|\\.)*)\"", src):
    t = m.group(1) if m.group(1) is not None else m.group(2)
    if ' ' in t or re.search(r'[ÄÖÜäöüß]', t) or re.match(r'^[A-ZÄÖÜ][a-zäöüß]+', t):
        add(t)
for m in re.finditer(r'`([^`]*)`', src):
    for part in re.split(r'\$\{[^}]*\}', m.group(1)):
        add(part)
json.dump(sorted(found), sys.stdout, ensure_ascii=False, indent=0)
