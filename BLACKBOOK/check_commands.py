import json

with open(r"C:\Users\Suhail\.gemini\antigravity-ide\brain\f6fcba01-6e03-4be4-a4ab-a0de33f9a5cd\.system_generated\steps\3829\output.txt", "r", encoding="utf-8") as f:
    cmds = json.load(f)

targets = [
    "layout.margins", "layout.size", "layout.orientation",
    "format.align", "para.align", "format.lineSpacing", "para.lineSpacing",
    "para.style", "text.font", "text.fontSize", "format.font", "format.fontSize",
    "text.pageBreak", "insert.pageBreak",
    "insert.table", "table.style", "table.cellShading",
    "insert.picture", "picture.size", "design.pageBorders"
]

for c in cmds:
    cid = c.get("id", "")
    for t in targets:
        if t == cid or cid.startswith(t):
            print(f"{cid:30} | {c.get('params')}")
