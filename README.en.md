# YouTube Quick Settings Toolbox

[繁體中文](README.md) · [English](README.en.md) · [日本語](README.ja.md)

![YouTube Quick Speed and Quality Settings 4K promotional image](docs/images/promo-en-4k.png)

Applies playback speed, video quality, and channel-specific preferences to standard YouTube videos, with separate speed and quick controls for Shorts. Chrome remains the stable baseline, Firefox uses an isolated build, and a Safari conversion-ready output is provided.

## Features

- Playback speeds: `0.7×`, `1×`, `1.25×`, `2×`, and `3×`
- Quality preferences: Highest, 4K, and 1080p
- Falls back to the highest available quality that does not exceed the target
- **Use Premium enhanced quality** is a separate opt-in switch that is off by default
- Separate profiles for standard videos and Shorts
- Independently set 2–6 standard videos or Shorts per row on Home and Subscriptions, or follow YouTube's responsive layout by default
- Adds clickable channel names and publish times to Shorts cards on the YouTube Home page, plus publish times on Shorts playback pages
- Optionally replaces relative times such as “2 weeks ago” with a customizable absolute upload date and time
- Channel-specific profiles override the matching global profile
- Standard videos can open automatically in Theater mode, with per-channel follow-global, force-on, or force-off controls
- Can automatically disable YouTube's “autoplay next video” toggle; off by default with the last state remembered
- Can hide end-screen recommendations until the pointer hovers over the player; off by default and remembered
- A two-second player notice shows the active channel speed and quality
- Press `PgUp` to slow down, `PgDn` to speed up, and `Home` to return immediately to `1×`
- Press `S` or the main popup button to copy the title + URL; while the confirmation is visible, press `F`/`X`/`T` for Facebook/X/Threads
- Use the popup button or `Ctrl+S` to download or copy a clean PNG of the current video frame without player or page UI
- Supports title + timestamp URL, Markdown, HTML, and channel + title + URL; `Shift+S` copies title + current timestamp URL directly
- Export or import JSON settings with merge/replace preview and an automatic pre-import restore point
- Keeps YouTube's native speed and quality menus in sync whenever the player permits it
- De-duplicates identical per-video quality applications to prevent repeated loading at the beginning
- Traditional Chinese, English, and Japanese interfaces, with system or manual language selection
- Settings are stored with `chrome.storage.sync`

## Interface

| Traditional Chinese | English | Japanese |
| --- | --- | --- |
| ![Traditional Chinese UI](docs/images/popup-zh.png) | ![English UI](docs/images/popup-en.png) | ![Japanese UI](docs/images/popup-ja.png) |

## Installation

1. Download this repository, or run:

   ```bash
   git clone https://github.com/ahui3c/Youtube-Quick-Setting.git
   ```

2. Open `chrome://extensions/` in Chrome.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Choose this project folder.
6. Open a YouTube video or Short and click the extension icon to configure it.

After updating the files, click **Reload** for the extension on `chrome://extensions/`, then refresh open YouTube tabs.

### Running the Web Store and unpacked builds together

When Chrome has both a Web Store build and an unpacked build that support this coordination feature, the two instances authenticate each other on YouTube and compare versions. The newer version remains active; the older version stops all YouTube features and shows an `OLD` toolbar badge. For matching versions, the unpacked build wins and the Chrome Web Store build pauses. The paused popup identifies the preferred version and does not apply or write settings.

Both installed versions must include the coordination feature. A legacy version that predates it cannot be disabled remotely by a newer build. If the preferred version is removed or disabled, the paused version resumes automatically.

## Usage

Use the **Videos / Shorts** selector to configure each content type independently. When the popup is opened from a Short, it automatically selects the Shorts profile.

**Items per Home row** can independently follow YouTube or fix standard videos and Shorts to 2–6 items per row. It applies only to Home and Subscriptions; search, channel, playback, and other pages keep YouTube's original layout. New and upgraded installations default to following YouTube.

**Show channel names on Home Shorts** is enabled by default, while **Show Shorts publish time** is off by default on first install. When publish time is enabled, the extension shows relative time such as “2 days ago” after Home card view counts and between the channel and title on Shorts playback pages. The channel-name option independently adds a clickable channel name below Home card titles. Playback pages prefer the public publish date already loaded by YouTube; only visible Home cards request public metadata from YouTube. Results are cached only for the current page, and no third-party server is involved.

**Show absolute upload dates** is off by default. When enabled, it replaces relative dates on standard-video watch pages and video lists, and applies the same format to enabled Shorts publish-time labels. The format supports `yyyy`, `yy`, `MMM`, `MM`, `dd`, `ww`, `HH`, `hh`, `ap`, `mm`, and `ss`; both the switch and format are saved with the other settings.

To create a channel override, open the popup on that channel's video or Short and enable **Current channel override**. Each channel stores independent standard-video and Shorts profiles.

### Theater mode

Enable **Automatically open Theater mode** under **Videos** to switch through YouTube's native Theater mode control whenever a standard video opens. It is applied only once per video load; if you leave Theater mode manually afterward, the extension will not force it on again. Channel profiles can **Follow global**, **Force on**, or **Force off**. This setting is hidden for Shorts.

### Disable autoplay of the next video

This option is off on first install. When enabled, the extension turns off YouTube's native autoplay toggle when a standard video loads and turns it off again if YouTube re-enables it. Disabling the option does not force autoplay back on. The preference is saved with browser sync storage.

### Hide end-screen recommendations

This option is off on first install. When enabled, recommendation cards and the next-video area are hidden at the end of standard videos. Move the pointer over the player to reveal them temporarily; they hide again when the pointer leaves. Mid-video info cards are unaffected, and the preference is saved with browser sync storage.

Priority order:

1. Current channel + current content type
2. Global profile for the current content type

### Keyboard shortcuts

| Key | Action |
| --- | --- |
| `PgUp` | Select the next slower speed |
| `PgDn` | Select the next faster speed |
| `Home` | Reset the current playback session to `1×` |
| `S` | Copy the title + URL and briefly enable social sharing choices |
| `F`/`X`/`T` | Open Facebook/X/Threads while the copy confirmation is visible |
| `Shift` + `S` | Copy the title + URL for the current playback time |
| `Ctrl` + `S` | Download or copy the clean PNG frame according to the screenshot result setting |
| `←` / `→` | Seek backward/forward 5 seconds in Shorts |
| `0` | Return a Short to the beginning |

Shortcuts are ignored while typing in search, comment, and other text fields.
The Shorts settings let you disable the arrow keys or select a `3`, `5` (default), or `10` second seek interval. The `0` shortcut remains available when the arrow keys are disabled.
`S` is not listed in YouTube's current official keyboard shortcuts, so the native `C` caption shortcut remains available.
For 360° videos, the extension does not intercept `S` or `Shift+S`, leaving those keys available for YouTube's native spherical-view controls.
Screenshots are generated directly from the video frame, so YouTube controls, page buttons, extension notices, and web subtitle layers are excluded. Subtitles or graphics burned into the video remain visible. Choose **Download file** or **Copy to clipboard** in the popup; the selection is remembered and shared by the popup button and `Ctrl+S`.

### Copy formats and settings backup

The main copy button and `S` shortcut always copy the title + URL. While the confirmation is visible, press `F`, `X`, or `T` to open Facebook, X, or Threads. These platforms use their sharing URLs to prefill public video information. The popup arrow menu offers the same direct sharing actions.

Each platform controls the final title, thumbnail, and text layout. If the browser blocks the popup, the extension shows an error and does not retry automatically.

“Backup and restore settings” exports a format-version `v4` JSON file. Before import, the extension previews general changes and channel additions, updates, and removals. Users can merge settings or replace everything. A local pre-import restore point is created automatically and is never sent to the developer.

## Quality behavior

When the requested resolution is unavailable, the extension selects the highest available quality that does not exceed the target. If every available option is above the target, it selects the nearest higher option.

Highest, 4K, and 1080p exclude Premium quality by default. `1080p Premium` becomes eligible only after the user explicitly enables **Use Premium enhanced quality**. Non-subscribers should leave it off to avoid the Premium trial prompt. Channel profiles store this switch independently.

The current desktop Shorts player does not expose stable native quality controls. The Shorts settings page therefore omits video quality and the extension does not force a quality level in the background. Shorts playback speed and quick controls are unaffected.

When native PiP or a Document Picture-in-Picture floating player is active, the extension suspends unfinished quality, player-UI, and playback-position retries. This prevents interference when another PiP tool moves the actual video element into a floating document. Previously applied speed and quality remain in effect after the floating player closes.

## Privacy

- No personal data is collected, transmitted, or sold.
- No external analytics are used.
- The extension runs only on `youtube.com`.
- Preferences stay in the browser's sync storage.

See the complete [Privacy Policy](PRIVACY.md).

## Development

The project uses Chrome Manifest V3. Tests under `tests/` cover quality fallback, legacy-setting migration, keyboard behavior, and localized popup rendering. Run `npm install`, `npx playwright install chromium`, and `npm test` to execute the complete suite.

## Firefox and Safari builds

Run `pnpm run build:firefox` and temporarily load `dist-firefox/manifest.json` from Firefox `about:debugging`. Run `pnpm run package:firefox` for an unsigned AMO upload ZIP. See [Firefox development notes](docs/FIREFOX.md).

Run `pnpm run build:safari` to create `dist-safari/`, then convert and sign it with Xcode on macOS. This is preparation output, not a Safari-tested App Store build. See [Safari preparation notes](docs/SAFARI.md).

The 4K Traditional Chinese, English, and Japanese promotional assets are available under `docs/images/`.
