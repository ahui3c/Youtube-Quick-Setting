(() => {
  const SCHEMA_ID = "youtube-quick-setting-settings";
  const FORMAT_VERSION = 4;

  function createExport(settings, extensionVersion = "") {
    return {
      schema: SCHEMA_ID,
      formatVersion: FORMAT_VERSION,
      exportedAt: new Date().toISOString(),
      extensionVersion,
      settings: structuredClone(settings)
    };
  }

  function extractImport(payload) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("invalid-file");
    if (payload.schema && payload.schema !== SCHEMA_ID) throw new Error("invalid-schema");
    const formatVersion = Number(payload.formatVersion || payload.settings?.schemaVersion || payload.schemaVersion || 1);
    if (!Number.isInteger(formatVersion) || formatVersion < 1) throw new Error("invalid-version");
    if (formatVersion > FORMAT_VERSION) throw new Error("newer-version");
    const rawSettings = payload.settings && typeof payload.settings === "object" ? payload.settings : payload;
    return { formatVersion, rawSettings: structuredClone(rawSettings) };
  }

  function mergeSettings(current, imported) {
    return {
      ...current,
      ...imported,
      global: { ...current.global, ...imported.global },
      shorts: { ...current.shorts, ...imported.shorts },
      shortsControls: { ...current.shortsControls, ...imported.shortsControls },
      gridLayout: { ...current.gridLayout, ...imported.gridLayout },
      dateDisplay: { ...current.dateDisplay, ...imported.dateDisplay },
      copy: { ...current.copy, ...imported.copy },
      screenshot: { ...current.screenshot, ...imported.screenshot },
      channels: { ...current.channels, ...imported.channels }
    };
  }

  function stable(value) {
    if (Array.isArray(value)) return value.map(stable);
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
    }
    return value;
  }

  function same(left, right) {
    return JSON.stringify(stable(left)) === JSON.stringify(stable(right));
  }

  function preview(current, imported, mode = "merge") {
    const currentChannels = current.channels || {};
    const importedChannels = imported.channels || {};
    const next = mode === "replace" ? imported : mergeSettings(current, imported);
    let added = 0;
    let updated = 0;
    Object.entries(importedChannels).forEach(([id, channel]) => {
      if (!currentChannels[id]) added += 1;
      else if (!same(currentChannels[id], channel)) updated += 1;
    });
    const removed = mode === "replace"
      ? Object.keys(currentChannels).filter((id) => !Object.hasOwn(importedChannels, id)).length
      : 0;
    const sections = ["language", "global", "shorts", "shortsControls", "gridLayout", "dateDisplay", "copy", "screenshot"]
      .filter((key) => !same(current[key], next[key])).length;
    return { added, updated, removed, sections, totalChannels: Object.keys(next.channels || {}).length, next };
  }

  globalThis.YTQSSettingsTransfer = Object.freeze({ SCHEMA_ID, FORMAT_VERSION, createExport, extractImport, mergeSettings, preview });
})();
