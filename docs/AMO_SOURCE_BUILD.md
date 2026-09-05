# AMO source build instructions

This source archive reproduces the submitted Firefox extension without downloading dependencies or remote code.

## Requirements

- Node.js 18 or newer
- PowerShell is optional and only used for producing the final ZIP on Windows

## Build

From the extracted source archive root, run:

```text
node scripts/build-platforms.js firefox
```

The complete Firefox extension will be written to `dist-firefox/`. The build performs only these deterministic operations:

1. Copies the readable HTML, CSS, JavaScript, locale messages and icon files listed in `scripts/build-platforms.js`.
2. Writes the Firefox distribution marker to `build-info.js` in the generated output.
3. Replaces `chrome.` with `browser.` in `popup.js` and `content.js` inside the Firefox output only.
4. Adds the Firefox background script and `browser_specific_settings.gecko` to the Firefox output manifest.

There is no minification, bundling, transpilation, code generation, dependency download or remote-code loading. The root Chrome source files are never modified by the build.

## Tests

The test suite is included. If pnpm or npm is available, run:

```text
pnpm test
```

The platform build test verifies that the Chrome source remains unchanged except for its generated distribution marker, checks the Firefox manifest and background script, and confirms that only the generated Firefox files use the `browser.*` namespace.
