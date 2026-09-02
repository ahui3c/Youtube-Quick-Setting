(() => {
  const DEFAULT_FORMAT = "yyyy-MM-dd";
  const TOKENS = /yyyy|MMM|yy|MM|dd|ww|HH|hh|ap|mm|ss/g;

  function normalizeFormat(value) {
    const format = typeof value === "string" ? value.trim().slice(0, 60) : "";
    return format || DEFAULT_FORMAT;
  }

  function parseDate(value) {
    if (value instanceof Date) return Number.isFinite(value.getTime()) ? value : null;
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    const dateOnly = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const date = dateOnly
      ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
      : new Date(trimmed);
    return Number.isFinite(date.getTime()) ? date : null;
  }

  function localeParts(language = "en") {
    const locale = language === "zh-Hant" ? "zh-TW" : language === "ja" ? "ja-JP" : "en-US";
    return {
      months: Array.from({ length: 12 }, (_, month) => new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(2024, month, 1))),
      weekdays: Array.from({ length: 7 }, (_, day) => new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(2024, 0, 7 + day)))
    };
  }

  function format(value, template = DEFAULT_FORMAT, language = "en") {
    const date = parseDate(value);
    if (!date) return "";
    const pattern = normalizeFormat(template);
    const pad = (number) => String(number).padStart(2, "0");
    const { months, weekdays } = localeParts(language);
    const hours = date.getHours();
    const values = {
      yyyy: String(date.getFullYear()),
      yy: String(date.getFullYear()).slice(-2),
      MMM: months[date.getMonth()],
      MM: pad(date.getMonth() + 1),
      dd: pad(date.getDate()),
      ww: weekdays[date.getDay()],
      HH: pad(hours),
      hh: pad(hours % 12 || 12),
      ap: hours < 12 ? "AM" : "PM",
      mm: pad(date.getMinutes()),
      ss: pad(date.getSeconds())
    };
    return pattern.replace(TOKENS, (token) => values[token]);
  }

  function extract(source) {
    const text = typeof source === "string" ? source : "";
    const match = text.match(/"(?:publishDate|uploadDate|startDate)"\s*:\s*"([^"]+)"/)
      || text.match(/itemprop=["'](?:uploadDate|datePublished)["'][^>]*content=["']([^"']+)["']/i)
      || text.match(/content=["']([^"']+)["'][^>]*itemprop=["'](?:uploadDate|datePublished)["']/i);
    return match && parseDate(match[1]) ? match[1] : "";
  }

  globalThis.YTQSDate = Object.freeze({ DEFAULT_FORMAT, normalizeFormat, parseDate, format, extract });
})();
