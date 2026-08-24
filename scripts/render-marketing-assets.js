const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "docs", "images");

const locales = {
  zh: {
    language: "zh-Hant",
    systemLanguage: "zh-TW",
    contentType: "regular",
    title: "每支影片，都用你習慣的速度與畫質",
    subtitle: "自動套用全域、Shorts 與頻道專屬設定",
    chips: ["頻道優先", "Shorts 獨立", "1080p Premium", "＋／－ 調速", "＊ 回復 1×"],
    eyebrow: "YOUTUBE QUICK SETTING"
  },
  en: {
    language: "en",
    systemLanguage: "en-US",
    contentType: "shorts",
    title: "Every video, at your speed and quality",
    subtitle: "Automatic defaults for videos, Shorts, and individual channels",
    chips: ["Channel overrides", "Separate Shorts", "1080p Premium", "+ / − speed", "* resets to 1×"],
    eyebrow: "YOUTUBE QUICK SETTING"
  },
  ja: {
    language: "ja",
    systemLanguage: "ja-JP",
    contentType: "regular",
    title: "いつもの速度と画質を、すべての動画に",
    subtitle: "通常動画・ショート・チャンネル別設定を自動適用",
    chips: ["チャンネル優先", "ショート個別設定", "1080p Premium", "＋／－ で速度変更", "＊ で 1×"],
    eyebrow: "YOUTUBE QUICK SETTING"
  }
};

function dataUrl(file) {
  const extension = path.extname(file).slice(1);
  return `data:image/${extension === "jpg" ? "jpeg" : extension};base64,${fs.readFileSync(file).toString("base64")}`;
}

async function renderPopup(browser, localeKey, locale) {
  const page = await browser.newPage({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 2 });
  await page.addInitScript(({ language, systemLanguage, contentType }) => {
    globalThis.chrome = {
      i18n: { getUILanguage: () => systemLanguage },
      storage: {
        sync: {
          get: async () => ({
            ytQuickSettings: {
              language,
              global: { speed: 1.25, quality: "hd1080" },
              shorts: { speed: 2, quality: "highest" },
              channels: {
                "/@creator": {
                  name: "Creator Studio",
                  regular: { speed: 1.25, quality: "hd1080" },
                  shorts: { speed: 2, quality: "highest" }
                }
              }
            }
          }),
          set: async () => {}
        }
      },
      tabs: {
        query: async () => [{ id: 1, url: contentType === "shorts" ? "https://www.youtube.com/shorts/demo" : "https://www.youtube.com/watch?v=demo" }],
        sendMessage: async () => ({ isVideo: true, contentType, channelId: "/@creator", channelName: "Creator Studio" })
      }
    };
  }, locale);
  await page.goto(pathToFileURL(path.join(root, "popup.html")).href);
  await page.waitForSelector("#globalSpeed .option-button");
  await page.emulateMedia({ reducedMotion: "reduce" });
  const panelBox = await page.locator(".panel").boundingBox();
  const height = Math.ceil(panelBox?.height || 720);
  const output = path.join(outputDir, `popup-${localeKey}.png`);
  await page.screenshot({ path: output, clip: { x: 0, y: 0, width: 390, height }, animations: "disabled" });
  await page.close();
  return output;
}

async function renderHero(browser, localeKey, locale, popupPath) {
  const page = await browser.newPage({ viewport: { width: 3840, height: 2160 }, deviceScaleFactor: 1 });
  const background = dataUrl(path.join(outputDir, "promo-background.png"));
  const popup = dataUrl(popupPath);
  const icon = dataUrl(path.join(root, "assets", "icon-master.png"));
  const chips = locale.chips.map((chip) => `<span>${chip}</span>`).join("");
  await page.setContent(`<!doctype html>
    <html lang="${locale.language}"><head><meta charset="utf-8"><style>
      *{box-sizing:border-box}html,body{margin:0;width:3840px;height:2160px;overflow:hidden}
      body{position:relative;background:#0e0f11 url('${background}') center/cover no-repeat;color:#fff;font-family:Inter,"Noto Sans TC","Yu Gothic UI","Microsoft JhengHei UI",system-ui,sans-serif}
      body:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(10,11,13,.96) 0%,rgba(10,11,13,.86) 47%,rgba(10,11,13,.18) 100%);z-index:0}
      .noise{position:absolute;inset:0;z-index:1;opacity:.16;background-image:radial-gradient(rgba(255,255,255,.2) .7px,transparent .7px);background-size:6px 6px;mix-blend-mode:soft-light}
      main{position:relative;z-index:2;display:grid;grid-template-columns:1.2fr .8fr;gap:180px;align-items:center;width:100%;height:100%;padding:190px 260px 160px 280px}
      .brand{display:flex;align-items:center;gap:34px;margin-bottom:130px}.brand img{width:112px;height:112px;border-radius:28px;box-shadow:0 24px 70px rgba(255,59,48,.35)}
      .brand strong{font-size:46px;letter-spacing:.01em}.eyebrow{margin:0 0 38px;color:#ff5d54;font-size:26px;font-weight:800;letter-spacing:.22em}
      h1{max-width:2050px;margin:0;font-size:142px;line-height:1.08;letter-spacing:-.055em;text-wrap:balance}
      .subtitle{max-width:1750px;margin:52px 0 66px;color:#c7c9ce;font-size:50px;line-height:1.45}
      .chips{display:flex;flex-wrap:wrap;gap:20px}.chips span{padding:18px 28px;border:1px solid rgba(255,255,255,.2);border-radius:999px;background:rgba(31,33,37,.7);box-shadow:inset 0 1px rgba(255,255,255,.08);font-size:28px;font-weight:700;backdrop-filter:blur(18px)}
      .shot{position:relative;justify-self:end;transform:rotate(2deg)}.shot:before{content:"";position:absolute;inset:10% -13%;border-radius:50%;background:#ff3b30;filter:blur(150px);opacity:.27}
      .shot img{position:relative;width:800px;border:2px solid rgba(255,255,255,.18);border-radius:34px;box-shadow:0 90px 180px rgba(0,0,0,.66),0 0 0 18px rgba(255,255,255,.025)}
      footer{position:absolute;z-index:3;left:282px;right:260px;bottom:86px;display:flex;justify-content:space-between;color:#8d9097;font-size:24px;letter-spacing:.06em}
    </style></head><body><div class="noise"></div><main><section><div class="brand"><img src="${icon}"><strong>YouTube Quick Setting</strong></div><p class="eyebrow">${locale.eyebrow}</p><h1>${locale.title}</h1><p class="subtitle">${locale.subtitle}</p><div class="chips">${chips}</div></section><div class="shot"><img src="${popup}"></div></main><footer><span>CHROME EXTENSION · v1.1.0</span><span>繁體中文 · ENGLISH · 日本語</span></footer></body></html>`);
  await page.screenshot({ path: path.join(outputDir, `promo-${localeKey}-4k.png`), animations: "disabled" });
  await page.close();
}

(async () => {
  fs.mkdirSync(outputDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  for (const [key, locale] of Object.entries(locales)) {
    const popup = await renderPopup(browser, key, locale);
    await renderHero(browser, key, locale, popup);
  }
  await browser.close();
  console.log("MARKETING_ASSETS_RENDERED");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
