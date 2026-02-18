# Stremio - Freedom to Stream

[![Build](https://github.com/Stremio/stremio-web/actions/workflows/build.yml/badge.svg)](https://github.com/Stremio/stremio-web/actions/workflows/build.yml)
[![Github Page](https://img.shields.io/website?label=Page&logo=github&up_message=online&down_message=offline&url=https%3A%2F%2Fstremio.github.io%2Fstremio-web%2F)](https://stremio.github.io/stremio-web/development)

Stremio is a modern media center that's a one-stop solution for your video entertainment. You discover, watch and organize video content from easy to install addons.

## Build

### Prerequisites

* Node.js 12 or higher
* [pnpm](https://pnpm.io/installation) 10 or higher

### Install dependencies

```bash
pnpm install
```

### Start development server

```bash
pnpm start
```

### Production build

```bash
pnpm run build
```

### Run with Docker

```bash
docker build -t stremio-web .
docker run -p 8080:8080 stremio-web
```

### Deploy to Cloudflare Pages

Build and deploy to Cloudflare Pages with an optional site-wide authentication gate.

#### Setup

1. Install [Wrangler](https://developers.cloudflare.com/workers/wrangler/) and authenticate:

```bash
npx wrangler login
```

2. Create the Pages project:

```bash
npx wrangler pages project create stremio-web --production-branch main
```

3. Set auth secrets (each command prompts for the value):

```bash
npx wrangler pages secret put AUTH_USERNAME --project-name stremio-web
npx wrangler pages secret put AUTH_PASSWORD --project-name stremio-web
npx wrangler pages secret put AUTH_SECRET --project-name stremio-web
```

> These commands set secrets for the **Production** environment. To also set them for **Preview** deployments, add `--env preview` to each command.

> If no secrets are set, the auth gate is disabled and the app loads normally.

4. Build and deploy:

```bash
pnpm build && pnpm run deploy
```

#### Development with auth

Create a `.dev.vars` file in the project root with local credentials:

```
AUTH_USERNAME=admin
AUTH_PASSWORD=changeme
AUTH_SECRET=dev-secret-change-in-production
```

Then use the Cloudflare dev proxy:

```bash
pnpm run dev:cf
```

#### Available scripts

| Script | Description |
|--------|-------------|
| `pnpm start` | Normal dev server (auth gate auto-disabled) |
| `pnpm run dev:cf` | Dev with auth via Wrangler proxy |
| `pnpm run preview` | Preview built output with auth locally |
| `pnpm run deploy` | Deploy to Cloudflare Pages |

## Screenshots

### Board

![Board](/screenshots/board.png)

### Discover

![Discover](/screenshots/discover.png)

### Meta Details

![Meta Details](/screenshots/metadetails.png)

## License

Stremio is copyright 2017-2023 Smart code and available under GPLv2 license. See the [LICENSE](/LICENSE.md) file in the project for more information.
