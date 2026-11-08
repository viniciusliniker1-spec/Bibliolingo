"""Gera public/privacidade.html a partir de legal/politica-de-privacidade.md.

Uso: python3 scripts/build-privacy-page.py
Edite sempre o .md e rode de novo; não edite o .html à mão.
"""
import html, pathlib, re
import markdown

root = pathlib.Path(__file__).resolve().parent.parent
source = (root / "legal" / "politica-de-privacidade.md").read_text(encoding="utf-8")
body = markdown.markdown(source, extensions=["tables"])
# Destaca os campos que ainda precisam ser preenchidos.
body = re.sub(r"\[([A-ZÀ-Ý][A-ZÀ-Ý0-9 /-]+)\]", r'<mark>[\1]</mark>', body)

page = f"""<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Política de Privacidade — Bibliolingo</title>
<meta name="description" content="Como o Bibliolingo trata os seus dados: sem anúncios, sem rastreadores e com controle total para você.">
<link rel="icon" href="icon.svg" type="image/svg+xml">
<style>
  :root {{ --bg:#f5f7fa; --card:#ffffff; --text:#10243e; --muted:#55667a; --line:#d9e3ec; --accent:#0b7f75; --soft:#e3f1ee; --mark:#fff3b0; }}
  @media (prefers-color-scheme: dark) {{ :root {{ --bg:#0f2238; --card:#16304d; --text:#eef4fb; --muted:#a9bdd6; --line:#24476b; --accent:#5fe0c6; --soft:#1b3b5a; --mark:#5b4b00; }} }}
  * {{ box-sizing: border-box; }}
  body {{ margin:0; background:var(--bg); color:var(--text); font:17px/1.65 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; }}
  main {{ max-width:780px; margin:0 auto; padding:24px 16px 64px; }}
  header.brand {{ display:flex; align-items:center; gap:10px; padding:16px; max-width:780px; margin:0 auto; font-weight:800; color:var(--accent); }}
  header.brand img {{ width:36px; height:36px; border-radius:10px; }}
  article {{ background:var(--card); border:1px solid var(--line); border-radius:20px; padding:24px 22px; }}
  h1 {{ font-size:28px; line-height:1.2; margin:0 0 8px; }}
  h2 {{ font-size:21px; margin:34px 0 8px; padding-top:6px; border-top:1px solid var(--line); }}
  h2:first-of-type {{ border-top:0; }}
  h3 {{ font-size:17px; margin:22px 0 6px; color:var(--accent); }}
  p, li {{ color:var(--text); }}
  ul {{ padding-left:22px; }}
  li {{ margin:4px 0; }}
  strong {{ font-weight:700; }}
  mark {{ background:var(--mark); color:inherit; padding:1px 4px; border-radius:4px; }}
  .table-wrap {{ overflow-x:auto; margin:12px 0; }}
  table {{ border-collapse:collapse; width:100%; font-size:15px; min-width:520px; }}
  th, td {{ text-align:left; vertical-align:top; padding:9px 10px; border:1px solid var(--line); }}
  th {{ background:var(--soft); }}
  footer {{ text-align:center; color:var(--muted); font-size:14px; margin-top:20px; }}
</style>
</head>
<body>
<header class="brand"><img src="icon.svg" alt=""> Bibliolingo</header>
<main>
<article>
{body}
</article>
<footer>Bibliolingo · Política de Privacidade</footer>
</main>
</body>
</html>
"""
# Tabelas rolam na horizontal no celular, em vez de estourar a página.
page = page.replace("<table>", '<div class="table-wrap"><table>').replace("</table>", "</table></div>")
out = root / "public" / "privacidade.html"
out.write_text(page, encoding="utf-8")
print(f"{out.relative_to(root)}: {len(page)} bytes")
