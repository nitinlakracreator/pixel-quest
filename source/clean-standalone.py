"""Post-process the Vite build output into a clean, GitHub Pages-ready bundle."""
import re
import os

BASE = "/home/ubuntu/pixel-quest-standalone"
PATHS = {
    "title-art_e1422e3c.png": "/manus-storage/title-art_e1422e3c.png",
    "logo-mark_a388d943.png": "/manus-storage/logo-mark_a388d943.png",
    "gameover-art_b177573e.png": "/manus-storage/gameover-art_b177573e.png",
    "bg-parallax-far_4e92de9b.png": "/manus-storage/bg-parallax-far_4e92de9b.png",
    "bg-parallax-mid_965e67a2.png": "/manus-storage/bg-parallax-mid_965e67a2.png",
}

def clean_html(path: str) -> str:
    html = open(path, encoding="utf-8").read()

    # Rewrite asset URLs from manus-storage to /assets/
    for name, old in PATHS.items():
        html = html.replace(old, f"/assets/{name}")

    # Remove manus debug collector script tag
    html = html.replace('    <script src="/__manus__/debug-collector.js" defer></script>\n', "")
    html = re.sub(r'<script src="/__manus__/debug-collector\.js" defer></script>', "", html)

    # Remove analytics umami script (contains %VITE_ANALYTICS_... resolved strings)
    html = re.sub(r'<script[^>]*data-website-id="[^"]*"[^>]*></script>\s*', "", html)
    html = re.sub(r'<script[^>]*umami[^>]*></script>\s*', "", html)

    # Add favicon fallback (logo) if it still points to manus-storage (already rewritten above)
    # Ensure favicon uses relative assets path for GitHub Pages subpath safety
    html = html.replace('href="/assets/logo-mark_a388d943.png"', 'href="./assets/logo-mark_a388d943.png"')

    # Make asset script/css refs relative for GitHub Pages subpath compatibility
    html = html.replace('src="/assets/', 'src="./assets/').replace('href="/assets/', 'href="./assets/')

    # Change title to short game name
    html = html.replace("<title>Pixel Quest: The Ember Tunnels</title>",
                        "<title>Pixel Quest</title>")

    return html

# Clean index.html
out = clean_html(f"{BASE}/index.html")
open(f"{BASE}/index.html", "w", encoding="utf-8").write(out)

# Rewrite manus-storage refs inside the JS bundle to /assets/ (relative-safe path)
js_path = f"{BASE}/assets/index-B5raeSQ2.js"
js = open(js_path, encoding="utf-8").read()
for name, old in PATHS.items():
    js = js.replace(old, f"/assets/{name}")
open(js_path, "w", encoding="utf-8").write(js)

# Verify no manus references remain in game-facing files
remaining = 0
for root, _, files in os.walk(BASE):
    for f in files:
        if f.endswith((".html", ".js", ".css")):
            content = open(os.path.join(root, f), encoding="utf-8", errors="ignore").read()
            for m in re.finditer(r"(?i)manus", content):
                # allow only the vite runtime metadata string names? reject all
                ctx = content[max(0, m.start()-40):m.end()+40]
                print(f"REMAIN in {f}: ...{ctx}...")
                remaining += 1
print("TOTAL remaining:", remaining)
