import traceback

try:
    from PIL import Image

    src = r'D:\PolicyBrain\src\assets\membership\bg.png'
    im = Image.open(src).convert('RGBA')
    w, h = im.size
    # 底部 25% 区域，缩放到适合查看的尺寸
    crop = im.crop((0, int(h * 0.72), w, h)).resize((1200, int(1200 * (h * 0.28) / w)), Image.LANCZOS)
    crop.save(r'D:\PolicyBrain\.tmp-bg-bottom.png')

    # 逐行统计 alpha，确认渐隐区间
    for pct in range(70, 101, 2):
        y = min(h - 1, int(h * pct / 100))
        alphas = [im.getpixel((x, y))[3] for x in range(0, w, max(1, w // 40))]
        avg = sum(alphas) // len(alphas)
        print(f"y={pct}%: avg alpha={avg}")
    print('saved crop')
except Exception:
    traceback.print_exc()
