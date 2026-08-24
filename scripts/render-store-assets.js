const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const storeDir = path.join(root, "docs", "chrome-web-store", "assets");
const sourceDir = path.join(root, "docs", "images");

function dataUrl(file) {
  const extension = path.extname(file).slice(1);
  const mime = extension === "jpg" ? "jpeg" : extension;
  return `data:image/${mime};base64,${fs.readFileSync(file).toString("base64")}`;
}

const scenes = [
  {
    file: "screenshot-01-auto-settings.png",
    kicker: "打開影片，自動套用",
    title: "每支影片都用你習慣的速度與畫質",
    subtitle: "一般影片、Shorts 與頻道專屬設定，各自記住、立即生效。",
    popup: "popup-zh.png",
    badge: "1.25× · 1080p Premium"
  },
  {
    file: "screenshot-02-shorts.png",
    kicker: "SHORTS 獨立設定",
    title: "短影片，也有自己的播放節奏",
    subtitle: "Shorts 不再共用一般影片設定；畫質不存在時，自動選擇最合適的可用選項。",
    popup: "popup-en.png",
    badge: "Shorts · 2× · 自動最高"
  },
  {
    file: "screenshot-03-channel-shortcuts.png",
    kicker: "頻道優先 + 快速鍵",
    title: "喜愛的頻道，開場就是指定設定",
    subtitle: "Shorts 用 ←／→ 前後 5 秒、0 回片頭；＋／－ 即時調速，＊ 恢復 1×。",
    popup: "popup-ja.png",
    badge: "← 5 秒 · → 5 秒 · 0 回片頭"
  }
];

function baseCss(width, height) {
  return `
    *{box-sizing:border-box}html,body{margin:0;width:${width}px;height:${height}px;overflow:hidden}
    body{position:relative;background:#0b0d10;color:#fff;font-family:Inter,"Noto Sans TC","Microsoft JhengHei UI",system-ui,sans-serif}
    .bg{position:absolute;inset:0;background:url('${dataUrl(path.join(storeDir, "store-background.png"))}') center/cover no-repeat}
    .shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(7,9,12,.98),rgba(7,9,12,.83) 52%,rgba(7,9,12,.22))}
    .grain{position:absolute;inset:0;opacity:.12;background-image:radial-gradient(rgba(255,255,255,.35) .55px,transparent .55px);background-size:5px 5px}
    .icon{width:72px;height:72px;border-radius:18px;box-shadow:0 16px 50px rgba(255,62,48,.3)}
  `;
}

async function renderScreenshot(browser, scene) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const popup = dataUrl(path.join(sourceDir, scene.popup));
  const icon = dataUrl(path.join(root, "assets", "icon-master.png"));
  await page.setContent(`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><style>
    ${baseCss(1280, 800)}
    main{position:relative;z-index:2;display:grid;grid-template-columns:1.15fr .85fr;align-items:center;width:100%;height:100%;padding:76px 80px 66px 88px}
    .brand{display:flex;align-items:center;gap:18px;margin-bottom:62px}.brand strong{font-size:25px;line-height:1.25;max-width:380px}
    .kicker{margin:0 0 18px;color:#ff5b50;font-size:18px;font-weight:850;letter-spacing:.13em}
    h1{margin:0;max-width:680px;font-size:56px;line-height:1.13;letter-spacing:-.045em}
    .subtitle{max-width:650px;margin:26px 0 34px;color:#c6cad1;font-size:22px;line-height:1.55}
    .badge{display:inline-flex;padding:14px 20px;border:1px solid rgba(255,255,255,.18);border-radius:999px;background:rgba(28,31,36,.75);font-size:18px;font-weight:750;box-shadow:inset 0 1px rgba(255,255,255,.08)}
    .shot{position:relative;justify-self:end}.shot:before{content:"";position:absolute;inset:15% -10%;border-radius:50%;background:#ff3b30;filter:blur(90px);opacity:.22}
    .shot img{position:relative;width:365px;max-height:680px;object-fit:cover;object-position:top;border:1px solid rgba(255,255,255,.2);border-radius:22px;box-shadow:0 42px 90px rgba(0,0,0,.65)}
  </style></head><body><div class="bg"></div><div class="shade"></div><div class="grain"></div><main><section><div class="brand"><img class="icon" src="${icon}"><strong>YouTube 快速設定速度 / 畫質</strong></div><p class="kicker">${scene.kicker}</p><h1>${scene.title}</h1><p class="subtitle">${scene.subtitle}</p><div class="badge">${scene.badge}</div></section><div class="shot"><img src="${popup}"></div></main></body></html>`);
  await page.screenshot({ path: path.join(storeDir, scene.file), animations: "disabled" });
  await page.close();
}

async function renderPromo(browser, width, height, file, compact) {
  const page = await browser.newPage({ viewport: { width, height } });
  const icon = dataUrl(path.join(root, "assets", "icon-master.png"));
  const iconSize = compact ? 70 : 118;
  await page.setContent(`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><style>
    ${baseCss(width, height)}
    .shade{background:linear-gradient(90deg,rgba(7,9,12,.96),rgba(7,9,12,.68),rgba(7,9,12,.24))}
    main{position:relative;z-index:2;display:flex;align-items:center;gap:${compact ? 22 : 44}px;width:100%;height:100%;padding:${compact ? "34px 32px" : "80px 105px"}}
    .icon{width:${iconSize}px;height:${iconSize}px;border-radius:${compact ? 18 : 28}px;flex:none}
    .kicker{margin:0 0 ${compact ? 8 : 16}px;color:#ff6056;font-size:${compact ? 11 : 19}px;font-weight:850;letter-spacing:.13em}
    h1{margin:0;font-size:${compact ? 30 : 62}px;line-height:1.1;letter-spacing:-.045em;max-width:${compact ? 290 : 780}px}
    p{margin:${compact ? 10 : 20}px 0 0;color:#d3d6dc;font-size:${compact ? 13 : 25}px;font-weight:650}
  </style></head><body><div class="bg"></div><div class="shade"></div><div class="grain"></div><main><img class="icon" src="${icon}"><section><div class="kicker">YOUTUBE QUICK SETTING</div><h1>快速設定速度 / 畫質</h1><p>影片 · Shorts · 頻道專屬 · 快速鍵</p></section></main></body></html>`);
  await page.screenshot({ path: path.join(storeDir, file), animations: "disabled" });
  await page.close();
}

(async () => {
  fs.mkdirSync(storeDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  for (const scene of scenes) await renderScreenshot(browser, scene);
  await renderPromo(browser, 440, 280, "promo-small-440x280.png", true);
  await renderPromo(browser, 1400, 560, "promo-marquee-1400x560.png", false);
  fs.copyFileSync(path.join(root, "assets", "icons", "icon-128.png"), path.join(storeDir, "store-icon-128.png"));
  await browser.close();
  console.log("STORE_ASSETS_RENDERED");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
