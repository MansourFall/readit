# Record the READIT showcase

From the repository on macOS, run:

```bash
npm run demo:gif
```

Requires `npm ci`, Chrome or Playwright Chromium, and Swift from Xcode Command Line Tools. If needed, run `npx playwright install chromium` and `xcode-select --install` first. To select a different browser binary, set `READIT_CHROMIUM_EXECUTABLE`.

The recorder builds fresh offline HTML from the Little Shop fixture and current UI, checks its source evidence, and clicks real controls. It captures the full interface, zooms toward the use-case map, selects **Place an order**, and advances through every message in its success scenario. Captions, cursor click indicators, and camera movements are added for presentation; the model and application UI are unchanged. No local server or registry access is needed during capture.

Outputs:

- `docs/assets/readit-demo.gif`: a looping 1280×800 showcase.
- `docs/assets/readit-demo-poster.png`: a still overview.

Set `READIT_GIF_OUTPUT=/absolute/path/showcase.gif` to choose another destination. A rerun replaces the generated output only after successful capture and encoding. Browser failures and missing/incorrect sequence messages abort generation. The encoder verifies the GIF's frame count. Temporary frames are removed afterward.

After visually reviewing the generated GIF, embed it near the top of the README with:

```markdown
![READIT demo: explore the use-case map, choose Place an order, and follow its sequence messages.](docs/assets/readit-demo.gif)
```

The animation illustrates static source analysis of the bundled demo. It does not depict a live checkout or a runtime trace.
