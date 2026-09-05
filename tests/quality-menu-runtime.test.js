const assert = require("node:assert/strict");
const path = require("node:path");
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.route("https://www.youtube.com/watch*", (route) => route.fulfill({
    contentType: "text/html",
    body: `<!doctype html><html><body>
      <div id="movie_player">
        <video class="html5-main-video"></video>
        <button class="ytp-settings-button" aria-expanded="false"></button>
        <div class="ytp-settings-menu"></div>
      </div>
    </body></html>`
  }));
  await page.goto("https://www.youtube.com/watch?v=quality-menu-test");

  await page.evaluate(() => {
    const player = document.querySelector("#movie_player");
    const button = player.querySelector(".ytp-settings-button");
    const menu = player.querySelector(".ytp-settings-menu");
    window.__qualitySelection = "";

    const renderMainMenu = () => {
      menu.replaceChildren();
      const speed = document.createElement("div");
      speed.className = "ytp-menuitem";
      speed.textContent = "Playback speed";
      const quality = document.createElement("div");
      quality.className = "ytp-menuitem";
      quality.textContent = "Quality";
      quality.addEventListener("click", () => {
        setTimeout(() => {
          menu.replaceChildren();
          for (const label of ["1080p HD", "720p", "480p"]) {
            const row = document.createElement("div");
            row.className = "ytp-menuitem";
            row.textContent = label;
            row.addEventListener("click", () => {
              window.__qualitySelection = label;
              setTimeout(() => button.setAttribute("aria-expanded", "false"), 160);
            });
            menu.append(row);
          }
        }, 160);
      });
      menu.append(speed, quality);
    };

    button.addEventListener("click", () => {
      if (button.getAttribute("aria-expanded") === "true") {
        setTimeout(() => button.setAttribute("aria-expanded", "false"), 160);
      } else {
        setTimeout(() => {
          button.setAttribute("aria-expanded", "true");
          renderMainMenu();
        }, 160);
      }
    });
    player.getAvailableQualityLevels = () => [];
  });

  await page.addScriptTag({ path: path.resolve(__dirname, "..", "page-bridge.js") });
  await page.evaluate(() => window.postMessage({
    source: "yt-quick-setting-extension",
    type: "APPLY_SETTINGS",
    settings: { speed: 1, quality: "hd1080", premiumQualityEnabled: false }
  }, location.origin));

  await page.waitForFunction(() => window.__qualitySelection === "1080p HD", null, { timeout: 4000 });
  await page.waitForFunction(() => document.querySelector(".ytp-settings-button").getAttribute("aria-expanded") === "false", null, { timeout: 2000 });
  await page.waitForFunction(() => !document.querySelector("#movie_player").classList.contains("ytqs-quality-menu-transaction"), null, { timeout: 2000 });

  const result = await page.evaluate(() => ({
    selected: window.__qualitySelection,
    expanded: document.querySelector(".ytp-settings-button").getAttribute("aria-expanded"),
    transactionActive: document.querySelector("#movie_player").classList.contains("ytqs-quality-menu-transaction")
  }));
  assert.deepEqual(result, { selected: "1080p HD", expanded: "false", transactionActive: false });

  // Entering PiP before the delayed quality transaction must leave YouTube's
  // settings menu untouched.
  await page.evaluate(() => {
    window.__qualitySelection = "";
    Object.defineProperty(document, "pictureInPictureElement", { configurable: true, value: document.querySelector("video") });
    window.postMessage({
      source: "yt-quick-setting-extension",
      type: "APPLY_SETTINGS",
      settings: { speed: 1.25, quality: "hd720", premiumQualityEnabled: false }
    }, location.origin);
  });
  await page.waitForTimeout(1400);
  const pipResult = await page.evaluate(() => ({
    selected: window.__qualitySelection,
    expanded: document.querySelector(".ytp-settings-button").getAttribute("aria-expanded"),
    transactionActive: document.querySelector("#movie_player").classList.contains("ytqs-quality-menu-transaction")
  }));
  assert.deepEqual(pipResult, { selected: "", expanded: "false", transactionActive: false });

  await page.evaluate(() => {
    Object.defineProperty(document, "pictureInPictureElement", { configurable: true, value: null });
    document.querySelector("video").dispatchEvent(new Event("leavepictureinpicture"));
  });
  await page.waitForFunction(() => window.__qualitySelection === "720p", null, { timeout: 4000 });
  await page.waitForFunction(() => document.querySelector(".ytp-settings-button").getAttribute("aria-expanded") === "false", null, { timeout: 2000 });

  await browser.close();
  console.log("QUALITY_MENU_RUNTIME_TESTS_OK");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
