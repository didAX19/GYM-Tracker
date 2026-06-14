# Gym Tracker

A personal gym program tracker built with Expo and TypeScript. Track workouts, body weight, and personal records — offline-first, with all data stored locally on your device.

## Features

- **Dashboard** — today's workout, body weight trend, weekly stats, and schedule overview
- **Program** — create workout days, assign them to weekdays, and manage exercises
- **Workout sessions** — log sets with previous bests shown; automatic PR detection
- **Body weight** — log weigh-ins with week/month/year charts and stats
- **Personal records** — view and sort all PRs
- **Exercise library** — 50+ built-in exercises plus custom entries
- **Dark mode** — follows your system preference

## Getting started

**Requirements:** Node.js 18+

```bash
git clone https://github.com/didAX19/GYM-Tracker.git
cd GYM-Tracker
npm install
npx expo start --web
```

Open the URL shown in the terminal to use the app in your browser.

### Other platforms

```bash
npx expo start          # Expo Go (iOS / Android)
npx expo start --ios
npx expo start --android
```

## Install on iPhone (Home Screen app)

The web build is a Progressive Web App (PWA). You can add it to your iPhone Home Screen for a full-screen, app-like experience.

1. Host the built app over **HTTPS** (e.g. [GitHub Pages](https://pages.github.com/))
2. Open the URL in **Safari**
3. Tap **Share** → **Add to Home Screen**

To build locally:

```bash
npm run build:web
```

Output is written to `dist/`. See [Expo web publishing docs](https://docs.expo.dev/guides/publishing-websites/) for hosting options.

> **Forking?** If you deploy to GitHub Pages under a project URL (`username.github.io/repo-name/`), set `experiments.baseUrl` in [app.json](app.json) to `"/your-repo-name"` before building.

## Data & privacy

All workout data, body weight logs, and personal records are stored **locally on your device** (browser storage or AsyncStorage). Nothing is sent to a server. Clearing site data or uninstalling the app removes your data.

## Tech stack

- [Expo SDK 54](https://expo.dev/) + [Expo Router](https://docs.expo.dev/router/introduction/)
- [Zustand](https://github.com/pmndrs/zustand) with persistent local storage
- [react-native-gifted-charts](https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts) for charts
- [date-fns](https://date-fns.org/) for date handling

## License

See [LICENSE](LICENSE).
