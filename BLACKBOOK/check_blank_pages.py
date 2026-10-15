import subprocess
import json
import os

DOCX_PATH = r"BLACKBOOK\CodeMentor_AI_Final_Blackbook.docx"
WORDCRAFT = r"C:\Program Files\WordCraft\wordcraft-cli.exe"

# Get info
res = subprocess.run([WORDCRAFT, "info", DOCX_PATH], capture_output=True, text=True)
info = json.loads(res.stdout)
total_pages = info["pages"]
print(f"Total pages: {total_pages}")

# Let's inspect where pages have very little text or blank content
# We can render pages around 40-55 and check image size / blankness
os.makedirs("BLACKBOOK/test_pages", exist_ok=True)
for p in range(1, total_pages + 1):
    out_img = f"BLACKBOOK/test_pages/page_{p:02d}.png"
    subprocess.run([WORDCRAFT, "render", DOCX_PATH, out_img, "--page", str(p), "--scale", "0.5"], capture_output=True)
    size = os.path.getsize(out_img)
    # A blank page with only header/footer and double border has a very specific size, usually ~30-50 KB
    print(f"Page {p:02d}: {size} bytes")
