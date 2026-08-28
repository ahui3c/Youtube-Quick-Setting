# YouTube Quick Speed / Quality Settings

[繁體中文](README.md) · [English](README.en.md) · [日本語](README.ja.md)

![YouTube Quick Speed and Quality Settings 4K promotional image](docs/images/promo-en-4k.png)

A Chrome extension that automatically applies playback speed, video quality, and channel-specific preferences to standard YouTube videos and Shorts.

## Features

- Playback speeds: `0.7×`, `1×`, `1.25×`, `2×`, and `3×`
- Quality preferences: Highest, 4K, and 1080p
- Falls back to the highest available quality that does not exceed the target
- **Use Premium enhanced quality** is a separate opt-in switch that is off by default
- Separate profiles for standard videos and Shorts
- Adds clickable channel names to Shorts cards on the YouTube Home page
- Channel-specific profiles override the matching global profile
- Standard videos can open automatically in Theater mode, with per-channel follow-global, force-on, or force-off controls
- A two-second player notice shows the active channel speed and quality
- Press `+` or `-` to change speed, and `*` to return immediately to `1×`
- Press `S` or the main popup button to copy video info in the current default format; use the arrow for seven formats
- Supports timestamp URLs, Markdown, HTML, URL only, title only, and channel + title + URL
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

## Usage

Use the **Videos / Shorts** selector to configure each content type independently. When the popup is opened from a Short, it automatically selects the Shorts profile.

**Show channel names on Home Shorts** is enabled by default. The extension requests public channel metadata from YouTube only for cards currently being displayed, adds a clickable channel name below the title, and caches the result for the current page. No third-party server is involved.

To create a channel override, open the popup on that channel's video or Short and enable **Current channel override**. Each channel stores independent standard-video and Shorts profiles.

### Theater mode

Enable **Automatically open Theater mode** under **Videos** to switch through YouTube's native Theater mode control whenever a standard video opens. It is applied only once per video load; if you leave Theater mode manually afterward, the extension will not force it on again. Channel profiles can **Follow global**, **Force on**, or **Force off**. This setting is hidden for Shorts.

Priority order:

1. Current channel + current content type
2. Global profile for the current content type

### Keyboard shortcuts

| Key | Action |
| --- | --- |
| `+` | Select the next faster speed |
| `-` | Select the next slower speed |
| `*` | Reset the current playback session to `1×` |
| `S` | Copy video info in the current default format with a visible summary |
| `Shift` + `S` | Copy a URL for the current playback time |
| `←` / `→` | Seek backward/forward 5 seconds in Shorts |
| `0` | Return a Short to the beginning |

Shortcuts are ignored while typing in search, comment, and other text fields.
The Shorts settings let you disable the arrow keys or select a `3`, `5` (default), or `10` second seek interval. The `0` shortcut remains available when the arrow keys are disabled.
`S` is not listed in YouTube's current official keyboard shortcuts, so the native `C` caption shortcut remains available.

### Copy formats and settings backup

The main copy button uses the current default format. Choosing another format from the arrow menu copies it immediately and makes it the new default. Every copy shows a success state and a compact content preview in the popup or on the video.

“Backup and restore settings” exports a format-version `v2` JSON file. Before import, the extension previews general changes and channel additions, updates, and removals. Users can merge settings or replace everything. A local pre-import restore point is created automatically and is never sent to the developer.

## Quality behavior

When the requested resolution is unavailable, the extension selects the highest available quality that does not exceed the target. If every available option is above the target, it selects the nearest higher option.

Highest, 4K, and 1080p exclude Premium quality by default. `1080p Premium` becomes eligible only after the user explicitly enables **Use Premium enhanced quality**. Non-subscribers should leave it off to avoid the Premium trial prompt. Channel profiles store this switch independently.

The current desktop Shorts player does not expose a native quality menu or a usable quality API. The extension stores the Shorts quality preference independently and applies it whenever YouTube exposes a controllable option. Shorts playback-speed control is unaffected.

## Privacy

- No personal data is collected, transmitted, or sold.
- No external analytics are used.
- The extension runs only on `youtube.com`.
- Preferences stay in Chrome sync storage.

See the complete [Privacy Policy](PRIVACY.md).

## Development

The project uses Chrome Manifest V3. Tests under `tests/` cover quality fallback, legacy-setting migration, keyboard behavior, and localized popup rendering. Run `npm install`, `npx playwright install chromium`, and `npm test` to execute the complete suite.

The 4K Traditional Chinese, English, and Japanese promotional assets are available under `docs/images/`.
