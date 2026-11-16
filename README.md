# Waymark

Waymark is an accessibility-first walking-guidance prototype for blind and
low-vision pedestrians. It is a static browser application with scripted
places around MG Road, Bengaluru.

## Run locally

No dependencies or build step are required:

```bash
python3 -m http.server 8001
```

Open <http://localhost:8001> in a browser. If port 8000 is already in use,
choose another port, for example `python3 -m http.server 8123`.

## What is included

- 45 linked prototype screens covering onboarding, search, route comparison,
  navigation, assistance, settings, and accessibility reporting.
- Keyboard, screen-reader, high-contrast, low-vision, speech, and haptic
  interaction patterns.
- Scripted simulations for weak GPS, offline maps, noisy streets, route
  deviation, arrival, and obstacle alerts.
- Responsive layout for desktop and narrow mobile screens.

## Important limitations

This is a design and interaction prototype, not a navigation device. It does
not use live GPS, maps, camera input, obstacle detection, public-transport
feeds, messaging, phone calls, or location sharing. Places, distances,
entrances, and route instructions are sample data and may be incorrect.

## Project files

- `index.html` — document shell and prototype guide
- `app.js` — screen state, scripted data, rendering, and interactions
- `styles.css` — responsive visual and accessibility styling
