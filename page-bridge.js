(() => {
  if (window.__ytQuickSettingBridgeInstalled) return;
  window.__ytQuickSettingBridgeInstalled = true;

  const QUALITY_HEIGHTS = {
    highres: 4320,
    hd4320: 4320,
    hd2880: 2880,
    hd2160: 2160,
    hd1440: 1440,
    hd1080: 1080,
    hd720: 720,
    large: 480,
    medium: 360,
    small: 240,
    tiny: 144
  };
  let currentSettings = null;
  let applyToken = 0;
  let qualityMenuBusy = false;
  let theaterVideoKey = "";
  let theaterHandledForVideo = false;
  let lastApplySignature = "";

  function getActiveShortVideo() {
    const videos = [...document.querySelectorAll("ytd-reel-video-renderer video, ytd-shorts video")];
    return videos.find((video) => {
      const rect = video.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && !video.paused;
    }) || videos.find((video) => {
      const rect = video.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
  }

  function getPlayer() {
    if (/^\/shorts\/[^/]+/.test(location.pathname)) {
      const video = getActiveShortVideo();
      return video?.closest("ytd-reel-video-renderer")?.querySelector("#shorts-player, #movie_player") || video?.parentElement;
    }
    return document.querySelector("#movie_player");
  }

  function applyPlaybackRate(player, video, speed) {
    // YouTube keeps its own playback-rate state for the native settings panel.
    // Calling the player API first keeps that state and the actual <video> in sync.
    try {
      if (player && typeof player.setPlaybackRate === "function") {
        player.setPlaybackRate(speed);
      }
    } catch {
      // The native media element below remains the compatibility fallback.
    }

    if (video) {
      video.defaultPlaybackRate = speed;
      video.playbackRate = speed;
    }
  }

  function applyTheaterMode(player, desired) {
    if (typeof desired !== "boolean" || /^\/shorts\/[^/]+/.test(location.pathname)) return false;
    if (!player || player.classList?.contains("ytp-fullscreen")) return false;
    const flexy = document.querySelector("ytd-watch-flexy");
    const isTheater = Boolean(flexy?.hasAttribute("theater")) || player.classList?.contains("ytp-big-mode") === true;
    if (isTheater === desired) return true;
    const sizeButton = player.querySelector?.(".ytp-size-button");
    if (!sizeButton) return false;
    sizeButton.click();
    return true;
  }

  function currentTheaterVideoKey() {
    if (location.pathname === "/watch") {
      return new URLSearchParams(location.search).get("v") || location.href;
    }
    return location.pathname;
  }

  function applyTheaterModeOnce(player, desired) {
    const videoKey = currentTheaterVideoKey();
    if (videoKey !== theaterVideoKey) {
      theaterVideoKey = videoKey;
      theaterHandledForVideo = false;
    }
    if (theaterHandledForVideo || typeof desired !== "boolean") return false;
    const handled = applyTheaterMode(player, desired);
    if (handled) theaterHandledForVideo = true;
    return handled;
  }

  function bestQuality(available, preference) {
    if (!available.length) return null;
    const known = available
      .map((quality) => ({ quality, height: QUALITY_HEIGHTS[quality] }))
      .filter((item) => Number.isFinite(item.height));
    if (!known.length) return available[0];
    const descending = [...known].sort((a, b) => b.height - a.height);
    if (preference === "highest") return descending[0].quality;
    if (available.includes(preference)) return preference;
    const targetHeight = QUALITY_HEIGHTS[preference];
    if (!Number.isFinite(targetHeight)) return descending[0].quality;

    // Prefer the highest available resolution that does not exceed the user's
    // selection. If every available option is higher, use the nearest one.
    const atOrBelow = descending.find((item) => item.height <= targetHeight);
    if (atOrBelow) return atOrBelow.quality;
    return [...known].sort((a, b) => a.height - b.height)[0].quality;
  }

  function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  function chooseMenuQuality(rows, preference, allowPremium = false) {
    const options = rows.map((element) => {
      const text = element.textContent?.replace(/\s+/g, " ").trim() || "";
      const match = text.match(/(\d{3,4})\s*p/i);
      return {
        element,
        height: match ? Number(match[1]) : null,
        premium: Boolean(element.querySelector(".ytp-premium-label")) || /premium/i.test(text),
        selected: element.getAttribute("aria-checked") === "true"
          || element.classList.contains("ytp-menuitem-checked")
      };
    }).filter((item) => Number.isFinite(item.height));

    const safeOptions = allowPremium ? options : options.filter((item) => !item.premium);
    if (!safeOptions.length) return null;
    const targetHeight = preference === "highest"
      ? Number.POSITIVE_INFINITY
      : QUALITY_HEIGHTS[preference];
    const descending = [...safeOptions].sort((a, b) => {
      if (a.height !== b.height) return b.height - a.height;
      return Number(b.premium) - Number(a.premium);
    });
    const atOrBelow = descending.find((item) => item.height <= targetHeight);
    if (atOrBelow) return atOrBelow;

    // This uncommon case means YouTube only exposed qualities above the target.
    // Choose the closest one rather than jumping to the absolute maximum.
    return [...safeOptions].sort((a, b) => {
      if (a.height !== b.height) return a.height - b.height;
      return Number(b.premium) - Number(a.premium);
    })[0];
  }

  async function applyQualityViaMenu(token, attempt = 0) {
    if (token !== applyToken || !currentSettings || qualityMenuBusy) return;
    const player = getPlayer();
    const settingsButton = player?.querySelector(".ytp-settings-button");
    if (!player || !settingsButton) return;

    const userHasMenuOpen = settingsButton.getAttribute("aria-expanded") === "true";
    const adIsPlaying = player.classList.contains("ad-showing");
    if (userHasMenuOpen || adIsPlaying) {
      if (attempt < 6) {
        setTimeout(() => applyQualityViaMenu(token, attempt + 1), 800);
      }
      return;
    }

    qualityMenuBusy = true;
    let menuWasOpened = false;
    const concealStyle = document.createElement("style");
    concealStyle.textContent = "#movie_player .ytp-settings-menu{opacity:0!important;pointer-events:none!important}";
    document.documentElement.append(concealStyle);

    try {
      settingsButton.click();
      menuWasOpened = true;
      await wait(60);
      if (token !== applyToken) return;

      const menu = player.querySelector(".ytp-settings-menu");
      const mainRows = [...(menu?.querySelectorAll(".ytp-menuitem") || [])];
      const qualityEntry = mainRows.at(-1);
      if (!qualityEntry) return;
      qualityEntry.click();
      await wait(60);
      if (token !== applyToken) return;

      const qualityRows = [...(menu?.querySelectorAll(".ytp-menuitem") || [])];
      const selected = chooseMenuQuality(
        qualityRows,
        currentSettings.quality,
        currentSettings.premiumQualityEnabled === true
      );
      if (!selected) return;
      if (!selected.selected) selected.element.click();
    } catch {
      // YouTube may rebuild the menu during SPA navigation; later navigation
      // or settings changes will try again with the new player tree.
    } finally {
      if (menuWasOpened && settingsButton.getAttribute("aria-expanded") === "true") {
        settingsButton.click();
      }
      concealStyle.remove();
      qualityMenuBusy = false;
    }
  }

  function applyNow(token) {
    if (token !== applyToken || !currentSettings) return;
    const player = getPlayer();
    const video = /^\/shorts\/[^/]+/.test(location.pathname)
      ? getActiveShortVideo()
      : player?.querySelector("video.html5-main-video, video") || document.querySelector("video.html5-main-video, video");
    if (video && Number.isFinite(Number(currentSettings.speed))) {
      const speed = Number(currentSettings.speed);
      applyPlaybackRate(player, video, speed);
    }

    // Theater mode is a load-time preference. Once the initial state has been
    // applied successfully, later quality/speed retries must respect any
    // theater-mode change the viewer makes manually.
    applyTheaterModeOnce(player, currentSettings.theaterMode);

    if (!player) return;
    const available = typeof player.getAvailableQualityLevels === "function"
      ? player.getAvailableQualityLevels()
      : [];
    const quality = bestQuality(available, currentSettings.quality);
    if (!quality) return;
    const currentQuality = typeof player.getPlaybackQuality === "function"
      ? player.getPlaybackQuality()
      : null;
    if (currentQuality === quality) return;
    try {
      player.setPlaybackQualityRange?.(quality, quality);
      player.setPlaybackQuality?.(quality);
    } catch {
      // YouTube may replace the player while navigating; the next retry applies it.
    }
  }

  function applyWithRetries(settings) {
    currentSettings = settings;
    const signature = [
      currentTheaterVideoKey(),
      Number(settings?.speed),
      settings?.quality || "",
      settings?.premiumQualityEnabled === true ? "premium" : "standard",
      typeof settings?.theaterMode === "boolean" ? String(settings.theaterMode) : "theater-auto"
    ].join("|");
    if (signature === lastApplySignature) return;
    lastApplySignature = signature;
    const token = ++applyToken;
    [0, 500, 1500, 3500].forEach((delay) => setTimeout(() => applyNow(token), delay));
    setTimeout(() => applyQualityViaMenu(token), 900);
  }

  window.addEventListener("message", (event) => {
    if (event.source !== window || event.origin !== location.origin) return;
    if (event.data?.source !== "yt-quick-setting-extension") return;
    if (event.data?.type === "APPLY_SETTINGS") {
      applyWithRetries(event.data.settings);
    } else if (event.data?.type === "SET_SESSION_SPEED" && currentSettings) {
      applyWithRetries({ ...currentSettings, speed: Number(event.data.speed) });
    }
  });

  // Repeated metadata events can be caused by YouTube replacing the media
  // source after a quality change. applyWithRetries de-duplicates the same
  // video/settings signature so that replacement cannot become a reload loop.
  document.addEventListener("loadedmetadata", () => currentSettings && applyWithRetries(currentSettings), true);
})();
