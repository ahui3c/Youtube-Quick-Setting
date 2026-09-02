(() => {
  const DEFAULT_FORMAT = "title-url";
  const FORMATS = [
    "title-url",
    "timestamp-url",
    "markdown",
    "html",
    "channel-title-url"
  ];

  function timestampUrl(url, currentTime) {
    const seconds = Math.max(0, Math.floor(Number(currentTime) || 0));
    const parsed = new URL(url);
    parsed.searchParams.set("t", `${seconds}s`);
    return parsed.toString();
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function escapeMarkdown(value) {
    return String(value).replace(/([\\\[\]])/g, "\\$1");
  }

  function formatVideoInfo(info, requestedFormat = DEFAULT_FORMAT) {
    const format = FORMATS.includes(requestedFormat) ? requestedFormat : DEFAULT_FORMAT;
    const title = String(info?.title || "").trim();
    const url = String(info?.url || "").trim();
    const channelName = String(info?.channelName || "").trim();
    if (!title || !url) return "";
    if (format === "timestamp-url") return `${title}\n${timestampUrl(url, info?.currentTime)}`;
    if (format === "markdown") return `[${escapeMarkdown(title)}](${url})`;
    if (format === "html") return `<a href="${escapeHtml(url)}">${escapeHtml(title)}</a>`;
    if (format === "channel-title-url") return [channelName, title, url].filter(Boolean).join("\n");
    return `${title}\n${url}`;
  }

  function summarize(text, maxLength = 92) {
    const compact = String(text || "").replace(/\s+/g, " ").trim();
    return compact.length > maxLength ? `${compact.slice(0, maxLength - 1)}…` : compact;
  }

  function facebookShareUrl(info) {
    const title = String(info?.title || "").trim();
    const url = String(info?.url || "").trim();
    if (!title || !url) return "";
    const params = new URLSearchParams({ u: url, quote: `${title}\n${url}` });
    return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
  }

  function socialShareUrl(platform, info) {
    const title = String(info?.title || "").trim();
    const url = String(info?.url || "").trim();
    if (!title || !url) return "";
    if (platform === "facebook") return facebookShareUrl({ title, url });
    if (platform === "x") {
      const params = new URLSearchParams({ text: title, url });
      return `https://twitter.com/intent/tweet?${params.toString()}`;
    }
    if (platform === "threads") {
      const params = new URLSearchParams({ text: `${title}\n${url}` });
      return `https://www.threads.net/intent/post?${params.toString()}`;
    }
    return "";
  }

  globalThis.YTQSCopy = Object.freeze({ DEFAULT_FORMAT, FORMATS, formatVideoInfo, summarize, timestampUrl, facebookShareUrl, socialShareUrl });
})();
